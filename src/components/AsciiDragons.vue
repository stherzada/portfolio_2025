<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import {
  useElementSize,
  useIntersectionObserver,
  useDocumentVisibility,
  useMutationObserver,
  useRafFn,
} from '@vueuse/core'
import { particleBurstActive } from '../composables/useParticleBurst'
import { useReducedMotion } from '../composables/useReducedMotion'

/*
 * Every so often an eastern dragon flies across the hero section, drawn as
 * live ASCII art. The body is painted with soft shading onto a small
 * offscreen canvas (a couple of pixels per character cell), then read back
 * and converted the way an image-to-ASCII generator does: brightness picks a
 * glyph from a ramp, and edges and thin strokes get a / | \ - glyph that
 * follows them. The head is hand-drawn ASCII art laid on top, since a
 * procedurally shaded head never reads as clearly at this resolution.
 */

const props = defineProps<{
  /** Element the dragon fades out behind (the text column). */
  avoid?: HTMLElement | null
  /** The hero content; the dragon flies in the empty bands above or below it. */
  content?: HTMLElement | null
}>()

const FONT_SIZE = 12
const LINE_HEIGHT = 14
const FPS = 30
const SUPERSAMPLE = 2
const RAMP = ' .:-=+*#%@'
/** Body fill in ink mode: just a quiet texture, so the outline carries the shape. */
const INK_FILL = '..::'
const EDGE_GLYPHS = ['-', '\\', '|', '/']
const EDGE_THRESHOLD = 1.7
/** Ink mode picks up the faint outer rim too, so the silhouette gets a line. */
const INK_EDGE_THRESHOLD = 0.9
const BODY_SAMPLES = 64
const AVOID_FEATHER = 32
/** Below this size the hand-drawn head would dwarf the body; draw it procedurally. */
const SPRITE_MIN_UNIT = 40
const ROAR_SECONDS = 2.4
const FIRST_VISIT_DELAY = 3.2
const TAU = Math.PI * 2

interface Vec {
  x: number
  y: number
}

interface BodySample {
  p: Vec
  t: Vec
  n: Vec
  r: number
  s: number
}

interface Rect {
  left: number
  top: number
  right: number
  bottom: number
}

interface Band {
  top: number
  bottom: number
  /** Which side faces the content, so the lane can keep its distance. */
  side: 'above' | 'below'
}

interface Puff {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  ch: string
}

// Facing right; the neck joins at the back of the head (`anchor`).
const HEAD_ART = [
  '          _\\    _\\',
  '           \\\\_   \\\\_',
  '       ___..\\ \\___\\ \\__',
  '    _.-~                `~-.__',
  "  .'  }  }    .--.          `-._",
  ' /  }  }  }  ( @  )             `-._',
  "|  }  }  }    `--'        ,-----.__`o.",
  "|  }  }  }       ___..--''VVVVVVVVV`--'",
  " \\  }  }    __.-'      \\^^^^^^^^^^^/",
  "  `-.__.--''            `---------'",
  '                  __..--~~',
  '           __..--~~   __..--~~',
  '    __..--~~   __..--~~',
]

const ROAR_ART = [
  '          _\\    _\\',
  '           \\\\_   \\\\_',
  '       ___..\\ \\___\\ \\__',
  '    _.-~                `~-.__',
  "  .'  }  }    .--.          `-._",
  ' /  }  }  }  ( @  )             `-._',
  "|  }  }  }    `--'        ,-----.__`o.",
  "|  }  }  }       ___..--''VVVVVVVVV`--'",
  ' \\  }  }    __.-\'      \\             /',
  "  `-.__.--''            \\^^^^^^^^^^^/",
  "                         `---------'",
  '                  __..--~~',
  '           __..--~~   __..--~~',
  '    __..--~~   __..--~~',
]

const MIRROR: Record<string, string> = {
  '/': '\\', '\\': '/', '(': ')', ')': '(', '<': '>', '>': '<',
  '{': '}', '}': '{', '[': ']', ']': '[', '`': "'", "'": '`',
}
/** Mane and whisker strokes: drawn a little lighter than the outline. */
const TEXTURE_CHARS = new Set(['{', '}', '~'])

interface SpriteSide {
  rows: string[]
  /** Per row, the first and last drawn column — the solid span hides the body. */
  spans: [number, number][]
  anchor: Vec
  mouth: Vec
}

interface Sprite {
  right: SpriteSide
  left: SpriteSide
  /** Rows whose whole span is solid head (the rest only mask their own glyphs). */
  solidFrom: number
  solidTo: number
}

function makeSprite(art: string[], solidTo: number): Sprite {
  const width = Math.max(...art.map(row => row.length))
  const spansOf = (rows: string[]) =>
    rows.map(row => [row.search(/\S/), row.length - 1 - [...row].reverse().join('').search(/\S/)] as [number, number])
  const right = art.map(row => row.padEnd(width))
  const left = right.map(row => [...row].reverse().map(ch => MIRROR[ch] ?? ch).join(''))
  const anchor = { x: 1, y: 6 }
  const mouth = { x: 38, y: 7 }
  return {
    right: { rows: right, spans: spansOf(right), anchor, mouth },
    left: { rows: left, spans: spansOf(left), anchor: { x: width - 1 - anchor.x, y: anchor.y }, mouth: { x: width - 1 - mouth.x, y: mouth.y } },
    solidFrom: 3,
    solidTo,
  }
}

const HEAD = makeSprite(HEAD_ART, 9)
const HEAD_ROAR = makeSprite(ROAR_ART, 10)

const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const { width, height } = useElementSize(containerRef)
const documentVisibility = useDocumentVisibility()
const reducedMotion = useReducedMotion()
const isInView = ref(true)

let ctx: CanvasRenderingContext2D | null = null
let field: HTMLCanvasElement | null = null
let fctx: CanvasRenderingContext2D | null = null
let cellW = 7.2
let cols = 0
let rows = 0
let lum = new Float32Array(0)
/** Cells of the field that were actually painted this frame. */
let box = { c0: 0, c1: -1, r0: 0, r1: -1 }
let dust: { index: number; phase: number }[] = []
let glyphColor = '#272727'
/** Light theme: draw like ink — strong outlines and strokes, light fill. */
let inkMode = true

let viewW = 0
let viewH = 0
let unit = 30
let time = 0
let burst = 0
let wasBursting = false
let avoidRect: Rect | null = null
/** Empty horizontal bands (above / below the content) the dragon flies through. */
let bands: Band[] = []
let puffs: Puff[] = []
let puffClock = 0

const dragon = {
  head: { x: 0, y: 0 } as Vec,
  heading: 0,
  /** 1 facing right, -1 facing left; only flips once clearly turned round. */
  facing: 1 as 1 | -1,
  trail: [] as Vec[],
  /** Mid-section waypoint, then a point well past the far edge. */
  waypoints: [] as Vec[],
  visible: false,
  /** Flying along an empty band, so it should hold its line. */
  banded: false,
  /** How far the body may swing either side of its lane. */
  laneAmp: 0,
  /** Seconds until the next visit while the dragon is away. */
  away: 0,
  /** Whether this pass stops mid-way to roar. */
  willRoar: false,
  /** Seconds of roaring left. */
  roar: 0,
  /** Speed multiplier, eased so stopping to roar isn't abrupt. */
  pace: 1,
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const smoothstep = (a: number, b: number, v: number) => {
  const x = clamp((v - a) / (b - a), 0, 1)
  return x * x * (3 - 2 * x)
}
const gray = (b: number) => {
  const v = Math.round(clamp(b, 0, 1) * 255)
  return `rgb(${v},${v},${v})`
}
const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

function bodyLength() {
  return unit * 20
}

function useSprite() {
  return unit >= SPRITE_MIN_UNIT
}

// "Up" for spikes, mane and antlers: whichever side of the spine faces the
// top of the screen, fading through zero when the spine runs vertical so it
// never flips abruptly.
function topOf(n: Vec): Vec {
  const s = clamp(n.y * 4, -1, 1)
  return { x: -n.x * s, y: -n.y * s }
}

// Ink on paper in the light theme, phosphor on black in the dark one.
function updateColor() {
  inkMode = !document.documentElement.classList.contains('dark')
  glyphColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#272727'
}

// Where the text and content sit, relative to the canvas.
function measureLayout() {
  const container = containerRef.value?.getBoundingClientRect()
  if (!container) return
  const avoid = props.avoid?.getBoundingClientRect()
  avoidRect = avoid
    ? { left: avoid.left - container.left, top: avoid.top - container.top, right: avoid.right - container.left, bottom: avoid.bottom - container.top }
    : null
  const content = props.content?.getBoundingClientRect()
  bands = content
    ? [
        { top: 0, bottom: content.top - container.top, side: 'above' },
        { top: content.bottom - container.top, bottom: container.height, side: 'below' },
      ]
    : []
}

function bandHeight(band: Band) {
  return band.bottom - band.top
}

function setup() {
  const canvas = canvasRef.value
  const w = width.value
  const h = height.value
  if (!canvas || w === 0 || h === 0) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(w * dpr)
  canvas.height = Math.round(h * dpr)
  ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.font = `${FONT_SIZE}px 'IBM Plex Mono', ui-monospace, monospace`
  ctx.textBaseline = 'top'
  cellW = ctx.measureText('M').width || 7.2

  cols = Math.ceil(w / cellW)
  rows = Math.ceil(h / LINE_HEIGHT)
  lum = new Float32Array(cols * rows)

  field ??= document.createElement('canvas')
  field.width = cols * SUPERSAMPLE
  field.height = rows * SUPERSAMPLE
  fctx = field.getContext('2d', { willReadFrequently: true })

  dust = []
  for (let i = 0; i < cols * rows; i++) {
    if (Math.random() < 0.012) dust.push({ index: i, phase: Math.random() * TAU })
  }

  const firstRun = viewW === 0
  viewW = w
  viewH = h
  measureLayout()
  // As big as possible while still fitting inside the roomiest empty band.
  const roomiest = Math.max(0, ...bands.map(bandHeight))
  unit = clamp(Math.min(Math.min(w, h) * 0.07, roomiest ? roomiest / 3.2 : Infinity), 14, 60)
  updateColor()

  if (firstRun) {
    if (reducedMotion.value) {
      // No animation: fly the dragon to the middle once and hold that frame.
      startVisit()
      dragon.willRoar = false
      for (let i = 0; i < 900 && Math.abs(dragon.head.x - viewW / 2) > viewW * 0.1; i++) step(1 / FPS)
    } else {
      // Let the hero's own intro play first; the dragon is the surprise after.
      dragon.away = FIRST_VISIT_DELAY
    }
  }
}

// The dragon enters from the left or right edge, passes through the middle
// of the section and flies out the other side.
function startVisit() {
  const fromLeft = Math.random() < 0.5
  // Fly along an empty band so the whole dragon is in view, side-on; with no
  // band roomy enough, anywhere goes.
  const roomy = bands.filter(band => bandHeight(band) >= unit * 2.5)
  const band = roomy[Math.floor(Math.random() * roomy.length)]
  // Keep the lane on the far side of the band's middle, away from the content.
  const laneY = () => {
    if (!band) return viewH * (0.2 + Math.random() * 0.6)
    const f = band.side === 'above' ? 0.42 + Math.random() * 0.08 : 0.5 + Math.random() * 0.08
    return band.top + bandHeight(band) * f
  }
  dragon.banded = !!band
  // The S-waves may only swing as far as the band allows.
  dragon.laneAmp = band ? clamp(bandHeight(band) * 0.45 - unit * 0.7, unit * 0.5, unit * 1.3) : unit * 0.8
  dragon.head = { x: fromLeft ? -unit * 2 : viewW + unit * 2, y: laneY() }
  dragon.heading = fromLeft ? 0 : Math.PI
  dragon.facing = fromLeft ? 1 : -1
  dragon.waypoints = [
    { x: viewW * (0.35 + Math.random() * 0.3), y: laneY() },
    { x: fromLeft ? viewW + bodyLength() : -bodyLength(), y: laneY() },
  ]
  dragon.trail = []
  const stepLen = unit * 0.25
  for (let d = bodyLength() + unit * 2; d >= 0; d -= stepLen) {
    dragon.trail.push({ x: dragon.head.x - Math.cos(dragon.heading) * d, y: dragon.head.y - Math.sin(dragon.heading) * d })
  }
  // One pass in three stops to roar; a Konami summon always does.
  dragon.willRoar = burst > 0.5 || Math.random() < 1 / 3
  dragon.roar = 0
  dragon.pace = 1
  dragon.visible = true
}

function isOffscreen(p: Vec) {
  const margin = unit * 3
  return p.x < -margin || p.x > viewW + margin || p.y < -margin || p.y > viewH + margin
}

// Where the sprite's top-left cell lands for the current head position.
function placeHead() {
  const sprite = dragon.roar > 0 ? HEAD_ROAR : HEAD
  const side = dragon.facing === 1 ? sprite.right : sprite.left
  return {
    sprite,
    side,
    col: Math.round(dragon.head.x / cellW) - side.anchor.x,
    row: Math.round(dragon.head.y / LINE_HEIGHT) - side.anchor.y,
  }
}

function mouthPosition(): Vec {
  if (useSprite()) {
    const { side, col, row } = placeHead()
    return { x: (col + side.mouth.x) * cellW, y: (row + side.mouth.y) * LINE_HEIGHT }
  }
  return { x: dragon.head.x + Math.cos(dragon.heading) * unit * 2.6, y: dragon.head.y + Math.sin(dragon.heading) * unit * 2.6 }
}

function step(dt: number) {
  time += dt
  burst += ((particleBurstActive.value ? 1 : 0) - burst) * Math.min(1, dt * 3)
  const burstStarted = particleBurstActive.value && !wasBursting
  wasBursting = particleBurstActive.value

  for (const puff of puffs) {
    puff.x += puff.vx * dt
    puff.y += puff.vy * dt
    puff.life -= dt
  }
  puffs = puffs.filter(puff => puff.life > 0)

  if (!dragon.visible) {
    // The Konami-code burst summons the dragon right away.
    dragon.away -= dt * (burst > 0.5 ? 20 : 1)
    if (dragon.away <= 0) startVisit()
    return
  }
  if (burstStarted) dragon.roar = ROAR_SECONDS

  dragon.pace += ((dragon.roar > 0 ? 0.12 : 1) - dragon.pace) * Math.min(1, dt * 3)
  const speed = unit * (4.2 + burst * 5) * dragon.pace
  const maxTurn = (1.3 + burst * 1.2) * dt

  const target = dragon.waypoints[0]!
  if (dragon.waypoints.length > 1 && Math.hypot(target.x - dragon.head.x, target.y - dragon.head.y) < unit * 5) {
    dragon.waypoints.shift()
    if (dragon.willRoar) dragon.roar = ROAR_SECONDS
  }
  const desired = Math.atan2(target.y - dragon.head.y, target.x - dragon.head.x)
  dragon.heading += clamp(wrapAngle(desired - dragon.heading), -maxTurn, maxTurn)

  // Wander on top: a slowly changing turn built from out-of-step sines, so
  // no two passes follow quite the same curve.
  const wander = Math.sin(time * 0.37) * 0.6 + Math.sin(time * 0.83 + 1) * 0.35 + Math.sin(time * 1.9 + 2) * 0.15
  dragon.heading += wander * (dragon.banded ? 0.2 : 0.6) * dt
  const cos = Math.cos(dragon.heading)
  if (cos > 0.35) dragon.facing = 1
  else if (cos < -0.35) dragon.facing = -1

  dragon.head.x += cos * speed * dt
  dragon.head.y += Math.sin(dragon.heading) * speed * dt
  dragon.trail.push({ x: dragon.head.x, y: dragon.head.y })

  // Drop trail points that are further back than the tail.
  const maxTrail = bodyLength() + unit * 3
  let length = 0
  for (let i = dragon.trail.length - 1; i > 0; i--) {
    const p = dragon.trail[i]!
    const q = dragon.trail[i - 1]!
    length += Math.hypot(p.x - q.x, p.y - q.y)
    if (length > maxTrail) {
      dragon.trail.splice(0, i - 1)
      break
    }
  }

  // Roaring: puffs of smoke billow out of the open mouth.
  if (dragon.roar > 0) {
    dragon.roar -= dt
    puffClock -= dt
    while (puffClock <= 0) {
      puffClock += 0.06
      const mouth = mouthPosition()
      puffs.push({
        x: mouth.x,
        y: mouth.y + (Math.random() - 0.5) * LINE_HEIGHT,
        vx: dragon.facing * unit * (1.5 + Math.random() * 1.5),
        vy: (Math.random() - 0.6) * unit * 0.8,
        life: 1 + Math.random() * 0.6,
        ch: '~~o.*'[Math.floor(Math.random() * 5)]!,
      })
    }
  }

  // The visit ends once the whole body has left the section.
  if (dragon.waypoints.length === 1 && isOffscreen(dragon.head) && dragon.trail.every(isOffscreen)) {
    dragon.visible = false
    dragon.away = 7 + Math.random() * 6
  }
}

function radiusAt(s: number) {
  const swell = Math.max(0, Math.sin(Math.PI * Math.min(1, s * 1.15 + 0.12)))
  return unit * (0.25 + 0.5 * swell) * (1 - 0.5 * s)
}

// Points spaced evenly along the trail from head to tail, with a travelling
// wave on top so the body slithers rather than just following the head.
function sampleBody(): BodySample[] {
  const total = bodyLength()
  const spacing = total / (BODY_SAMPLES - 1)
  const trail = dragon.trail
  const samples: BodySample[] = []
  let i = trail.length - 1
  let segRemaining = 0
  let cursor: Vec = { ...trail[i]! }
  let next = cursor

  for (let k = 0; k < BODY_SAMPLES; k++) {
    let need = k === 0 ? 0 : spacing
    while (need > 0 && i > 0) {
      if (segRemaining <= 0) {
        next = trail[i - 1]!
        segRemaining = Math.hypot(next.x - cursor.x, next.y - cursor.y)
        if (segRemaining === 0) {
          i--
          continue
        }
      }
      const take = Math.min(need, segRemaining)
      const f = take / segRemaining
      cursor = { x: cursor.x + (next.x - cursor.x) * f, y: cursor.y + (next.y - cursor.y) * f }
      segRemaining -= take
      need -= take
      if (segRemaining <= 0) i--
    }
    samples.push({ p: { ...cursor }, t: { x: 0, y: 0 }, n: { x: 0, y: 0 }, r: 0, s: k / (BODY_SAMPLES - 1) })
  }

  for (let k = 0; k < samples.length; k++) {
    const a = samples[Math.max(0, k - 1)]!.p
    const b = samples[Math.min(samples.length - 1, k + 1)]!.p
    // Tangent points forward, from tail towards head.
    let tx = a.x - b.x
    let ty = a.y - b.y
    const len = Math.hypot(tx, ty) || 1
    tx /= len
    ty /= len
    const sample = samples[k]!
    sample.t = { x: tx, y: ty }
    sample.n = { x: -ty, y: tx }
    sample.r = radiusAt(sample.s)
  }

  for (const sample of samples) {
    // Deeper, longer S-waves when flying a straight lane — that serpentine
    // line is most of what makes it read as an eastern dragon.
    const amp = (dragon.banded ? dragon.laneAmp : unit * 0.8) * smoothstep(0.04, 0.3, sample.s)
    const wavelength = unit * (dragon.banded ? 9 : 6.5)
    const off = amp * Math.sin((sample.s * total) / wavelength - time * 3)
    sample.p.x += sample.n.x * off
    sample.p.y += sample.n.y * off
  }
  return samples
}

function shadedCircle(c: CanvasRenderingContext2D, x: number, y: number, r: number, b: number) {
  const g = c.createRadialGradient(x - r * 0.35, y - r * 0.45, r * 0.1, x, y, r)
  g.addColorStop(0, gray(b))
  g.addColorStop(0.6, gray(b * 0.6))
  g.addColorStop(1, gray(b * 0.3))
  c.fillStyle = g
  c.beginPath()
  c.arc(x, y, r, 0, TAU)
  c.fill()
}

function triangle(c: CanvasRenderingContext2D, a: Vec, b: Vec, tip: Vec, shade: number) {
  c.fillStyle = gray(shade)
  c.beginPath()
  c.moveTo(a.x, a.y)
  c.lineTo(tip.x, tip.y)
  c.lineTo(b.x, b.y)
  c.closePath()
  c.fill()
}

function stroke(c: CanvasRenderingContext2D, points: Vec[], lineWidth: number, shade: number) {
  c.strokeStyle = gray(shade)
  c.lineWidth = lineWidth
  c.lineCap = 'round'
  c.lineJoin = 'round'
  c.beginPath()
  c.moveTo(points[0]!.x, points[0]!.y)
  for (let i = 1; i < points.length; i++) c.lineTo(points[i]!.x, points[i]!.y)
  c.stroke()
}

/** Paints the body (and, when small, the head) and returns its bounds in px. */
function drawDragon(c: CanvasRenderingContext2D): Rect {
  const body = sampleBody()

  // Tail tuft.
  const tail = body[body.length - 1]!
  for (let j = 0; j < 5; j++) {
    const spread = (j - 2) * 0.32 + Math.sin(time * 3 + j) * 0.2
    const ang = Math.atan2(-tail.t.y, -tail.t.x) + spread
    const len = unit * (1.5 + (j % 2) * 0.4)
    const mid = { x: tail.p.x + Math.cos(ang) * len * 0.5, y: tail.p.y + Math.sin(ang) * len * 0.5 }
    const bend = ang + Math.sin(time * 4 + j) * 0.5
    const end = { x: mid.x + Math.cos(bend) * len * 0.5, y: mid.y + Math.sin(bend) * len * 0.5 }
    stroke(c, [tail.p, mid, end], unit * 0.18, 0.75)
  }

  // Dorsal spikes, behind the body.
  for (let k = 3; k < body.length * 0.85; k += 3) {
    const { p, t, n, r, s } = body[k]!
    const top = topOf(n)
    const base = { x: p.x + top.x * r * 0.7, y: p.y + top.y * r * 0.7 }
    const h = r * 0.7 + unit * 0.55 * (1 - s)
    const tip = { x: p.x + top.x * h - t.x * unit * 0.3, y: p.y + top.y * h - t.y * unit * 0.3 }
    const a = { x: base.x + t.x * unit * 0.2, y: base.y + t.y * unit * 0.2 }
    const b = { x: base.x - t.x * unit * 0.2, y: base.y - t.y * unit * 0.2 }
    triangle(c, a, b, tip, 0.75)
  }

  // Legs, paddling, with three claws each.
  for (const [k, legPhase] of [[Math.round(body.length * 0.2), 0], [Math.round(body.length * 0.5), 1.7]] as const) {
    const { p, t, n, r } = body[k]!
    const top = topOf(n)
    const down = { x: -top.x, y: -top.y }
    if (Math.hypot(down.x, down.y) < 0.2) continue
    const swing = 0.5 + Math.sin(time * 5 + legPhase) * 0.5
    const dir = { x: down.x * Math.cos(swing) - t.x * Math.sin(swing), y: down.y * Math.cos(swing) - t.y * Math.sin(swing) }
    const hip = { x: p.x + down.x * r * 0.5, y: p.y + down.y * r * 0.5 }
    const knee = { x: hip.x + dir.x * unit * 0.9, y: hip.y + dir.y * unit * 0.9 }
    const fwd = { x: down.x * 0.35 + t.x * 0.9, y: down.y * 0.35 + t.y * 0.9 }
    const foot = { x: knee.x + fwd.x * unit * 0.6, y: knee.y + fwd.y * unit * 0.6 }
    stroke(c, [hip, knee, foot], unit * 0.32, 0.7)
    const fwdAngle = Math.atan2(fwd.y, fwd.x)
    for (const spread of [-0.6, 0, 0.6]) {
      const ang = fwdAngle + spread
      stroke(c, [foot, { x: foot.x + Math.cos(ang) * unit * 0.45, y: foot.y + Math.sin(ang) * unit * 0.45 }], unit * 0.14, 0.9)
    }
  }

  // Body, tail first so each segment overlaps the one behind it like scales.
  for (let k = body.length - 1; k >= 0; k--) {
    const { p, r } = body[k]!
    shadedCircle(c, p.x, p.y, r, k % 2 ? 0.88 : 1)
  }

  if (!useSprite()) drawHead(c, body[0]!)

  // Everything above (spikes, legs, tuft, a procedural head) stays within
  // about three units of the spine.
  const margin = unit * 3
  return {
    left: Math.min(...body.map(b => b.p.x)) - margin,
    right: Math.max(...body.map(b => b.p.x)) + margin,
    top: Math.min(...body.map(b => b.p.y)) - margin,
    bottom: Math.max(...body.map(b => b.p.y)) + margin,
  }
}

function drawHead(c: CanvasRenderingContext2D, neck: BodySample) {
  const { p, t, n } = neck
  const top = topOf(n)
  // Side of the local y axis (which is n) that faces up.
  const up = -clamp(n.y * 4, -1, 1)
  const hl = unit * 2.5
  const u = unit

  // Mane, flowing back from the crown.
  for (let j = 0; j < 5; j++) {
    const wave = Math.sin(time * 4 + j * 0.9) * u * 0.2
    const base = { x: p.x - t.x * u * (0.1 + j * 0.35) + top.x * u * 0.35, y: p.y - t.y * u * (0.1 + j * 0.35) + top.y * u * 0.35 }
    const tip = {
      x: base.x + top.x * u * (0.9 - j * 0.1) - t.x * u * 0.8 + n.x * wave,
      y: base.y + top.y * u * (0.9 - j * 0.1) - t.y * u * 0.8 + n.y * wave,
    }
    triangle(c, { x: base.x + t.x * u * 0.2, y: base.y + t.y * u * 0.2 }, { x: base.x - t.x * u * 0.2, y: base.y - t.y * u * 0.2 }, tip, 0.6)
  }

  c.save()
  c.translate(p.x + t.x * hl * 0.35, p.y + t.y * hl * 0.35)
  c.rotate(Math.atan2(t.y, t.x))

  // Antlers: a swept-back curve with one forward branch.
  c.strokeStyle = gray(0.85)
  c.lineWidth = u * 0.26
  c.lineCap = 'round'
  c.beginPath()
  c.moveTo(-hl * 0.05, up * u * 0.45)
  c.quadraticCurveTo(-hl * 0.35, up * u * 1.4, -hl * 0.95, up * u * 1.55)
  c.moveTo(-hl * 0.45, up * u * 1.2)
  c.lineTo(-hl * 0.3, up * u * 1.75)
  c.stroke()

  // Lower jaw, opening wide to roar.
  const open = (0.15 + 0.12 * Math.sin(time * 1.3) + Math.max(burst, dragon.roar > 0 ? 1 : 0) * 0.35) * u
  c.fillStyle = gray(0.45)
  c.beginPath()
  c.ellipse(hl * 0.55, -up * (u * 0.3 + open), hl * 0.42, u * 0.2, 0, 0, TAU)
  c.fill()

  // Skull and snout.
  const skull = c.createRadialGradient(0, up * u * 0.3, u * 0.1, 0, 0, hl * 0.62)
  skull.addColorStop(0, gray(1))
  skull.addColorStop(1, gray(0.2))
  c.fillStyle = skull
  c.beginPath()
  c.ellipse(0, 0, hl * 0.62, u * 0.72, 0, 0, TAU)
  c.fill()
  const snout = c.createRadialGradient(hl * 0.7, up * u * 0.2, u * 0.05, hl * 0.7, 0, hl * 0.45)
  snout.addColorStop(0, gray(0.95))
  snout.addColorStop(1, gray(0.25))
  c.fillStyle = snout
  c.beginPath()
  c.ellipse(hl * 0.7, 0, hl * 0.45, u * 0.5, 0, 0, TAU)
  c.fill()
  shadedCircle(c, hl * 1.05, up * u * 0.15, u * 0.22, 1)

  // Eye: the brightest point, so it always lands on '@'.
  c.fillStyle = gray(1)
  c.beginPath()
  c.arc(hl * 0.25, up * u * 0.32, u * 0.2, 0, TAU)
  c.fill()

  // Whiskers trailing back from the upper lip.
  for (const [offset, spread] of [[0.15, 0.09], [0.35, 0.16]] as const) {
    const points: Vec[] = []
    for (let j = 0; j <= 12; j++) {
      points.push({
        x: hl * 0.95 - j * u * 0.35,
        y: -up * (u * offset + j * u * spread) + Math.sin(time * 3 + j * 0.6 + offset * 10) * u * 0.25 * (j / 12),
      })
    }
    stroke(c, points, u * 0.14, 0.85)
  }
  c.restore()
}

function paintField() {
  lum.fill(0)
  box = { c0: 0, c1: -1, r0: 0, r1: -1 }
  // Nothing to convert while the dragon is away — skip the readback entirely.
  if (!fctx || !field || !dragon.visible) return

  fctx.setTransform(1, 0, 0, 1, 0, 0)
  fctx.fillStyle = '#000'
  fctx.fillRect(0, 0, field.width, field.height)
  fctx.setTransform(SUPERSAMPLE / cellW, 0, 0, SUPERSAMPLE / LINE_HEIGHT, 0, 0)
  const bounds = drawDragon(fctx)

  // Only read back and convert the cells the dragon can cover.
  const c0 = clamp(Math.floor(bounds.left / cellW), 0, cols - 1)
  const c1 = clamp(Math.ceil(bounds.right / cellW), 0, cols - 1)
  const r0 = clamp(Math.floor(bounds.top / LINE_HEIGHT), 0, rows - 1)
  const r1 = clamp(Math.ceil(bounds.bottom / LINE_HEIGHT), 0, rows - 1)
  if (c1 < c0 || r1 < r0) return
  box = { c0, c1, r0, r1 }

  const fw = (c1 - c0 + 1) * SUPERSAMPLE
  const data = fctx.getImageData(c0 * SUPERSAMPLE, r0 * SUPERSAMPLE, fw, (r1 - r0 + 1) * SUPERSAMPLE).data
  const area = SUPERSAMPLE * SUPERSAMPLE * 255
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      let sum = 0
      for (let sy = 0; sy < SUPERSAMPLE; sy++) {
        const row = ((r - r0) * SUPERSAMPLE + sy) * fw
        for (let sx = 0; sx < SUPERSAMPLE; sx++) sum += data[(row + (c - c0) * SUPERSAMPLE + sx) * 4]!
      }
      lum[r * cols + c] = sum / area
    }
  }
}

// 0 well clear of the text column, rising to 1 inside it.
function avoidance(x: number, y: number) {
  if (!avoidRect) return 0
  const dx = Math.max(avoidRect.left - x, 0, x - avoidRect.right)
  const dy = Math.max(avoidRect.top - y, 0, y - avoidRect.bottom)
  return 1 - smoothstep(0, AVOID_FEATHER, Math.hypot(dx, dy))
}

const ALPHAS = [0.35, 0.6, 0.9]
/** Behind the text the dragon stays visible, just a little softer. */
const AVOID_DIM = 0.8

function drawGlyphs() {
  if (!ctx) return
  ctx.clearRect(0, 0, viewW, viewH)
  ctx.fillStyle = glyphColor

  const at = (c: number, r: number) => lum[clamp(r, 0, rows - 1) * cols + clamp(c, 0, cols - 1)]!
  // Three brightness buckets, then the same three again for cells behind the text.
  const buckets: [string, number, number][][] = [[], [], [], [], [], []]
  const push = (ch: string, x: number, y: number, brightness: number) => {
    const behindText = avoidance(x + cellW / 2, y + LINE_HEIGHT / 2) > 0.5
    buckets[brightness + (behindText ? 3 : 0)]!.push([ch, x, y])
  }

  // The hand-drawn head hides whatever body glyphs fall under it.
  const head = dragon.visible && useSprite() ? placeHead() : null
  const underHead = (c: number, r: number) => {
    if (!head) return false
    const i = r - head.row
    if (i < 0 || i >= head.side.rows.length) return false
    const [first, last] = head.side.spans[i]!
    const j = c - head.col
    if (i >= head.sprite.solidFrom && i <= head.sprite.solidTo) return j >= first && j <= last
    return head.side.rows[i]![j] !== undefined && head.side.rows[i]![j] !== ' '
  }

  for (let r = box.r0; r <= box.r1; r++) {
    for (let c = box.c0; c <= box.c1; c++) {
      const l = lum[r * cols + c]!
      if (l < 0.04 || underHead(c, r)) continue

      const gx = (at(c + 1, r - 1) + 2 * at(c + 1, r) + at(c + 1, r + 1)) - (at(c - 1, r - 1) + 2 * at(c - 1, r) + at(c - 1, r + 1))
      const gy = (at(c - 1, r + 1) + 2 * at(c, r + 1) + at(c + 1, r + 1)) - (at(c - 1, r - 1) + 2 * at(c, r - 1) + at(c + 1, r - 1))

      // Thin strokes (whiskers, claws, antlers) are about one cell wide, so
      // the gradient across them cancels out; instead find the direction
      // whose two neighbours are brightest — that is the way the stroke runs.
      const pairs = [
        at(c - 1, r) + at(c + 1, r),
        at(c - 1, r - 1) + at(c + 1, r + 1),
        at(c, r - 1) + at(c, r + 1),
        at(c + 1, r - 1) + at(c - 1, r + 1),
      ]
      const best = pairs.indexOf(Math.max(...pairs))
      const across = pairs[(best + 2) % 4]!
      const isRidge = l < 0.6 && pairs[best]! - across > 0.3 * Math.max(l, 0.2) && across < l * 0.9

      // Edges facing empty sky are the silhouette. In ink mode those (and
      // only those) are traced, even faint ones; edges inside the body are
      // just scale texture and stay light.
      const touchesSky = Math.min(
        at(c - 1, r - 1), at(c, r - 1), at(c + 1, r - 1),
        at(c - 1, r), at(c + 1, r),
        at(c - 1, r + 1), at(c, r + 1), at(c + 1, r + 1),
      ) < 0.04
      const gradient = Math.hypot(gx, gy)
      const isEdge = l < 0.75 && (gradient > EDGE_THRESHOLD || (inkMode && touchesSky && gradient > INK_EDGE_THRESHOLD))

      let ch: string
      let isLine = true
      if (isRidge) {
        ch = EDGE_GLYPHS[best]!
      } else if (isEdge && (!inkMode || touchesSky)) {
        // Edge direction is perpendicular to the gradient; correct for the
        // cells being taller than they are wide.
        const edge = Math.atan2(gy / LINE_HEIGHT, gx / cellW) + Math.PI / 2
        const a = ((edge % Math.PI) + Math.PI) % Math.PI
        ch = EDGE_GLYPHS[Math.round(a / (Math.PI / 4)) % 4]!
      } else if (inkMode) {
        isLine = false
        ch = l > 0.9 ? '@' : INK_FILL[Math.min(INK_FILL.length - 1, Math.floor(l * INK_FILL.length))]!
      } else {
        isLine = false
        ch = RAMP[Math.min(RAMP.length - 1, Math.floor(Math.pow(l, 0.85) * RAMP.length))]!
        if (ch === ' ') continue
      }

      // On dark, brighter cells glow stronger. On light, a bright cell would
      // become the heaviest ink and bury the outline, so lines get the strong
      // ink and the fill stays a light texture (bar the eye).
      const brightness = inkMode
        ? (isLine || l > 0.9 ? 2 : 0)
        : (l < 0.3 ? 0 : l < 0.6 ? 1 : 2)
      push(ch, c * cellW, r * LINE_HEIGHT, brightness)
    }
  }

  if (head) {
    // Blink every few seconds.
    const blinking = time % 4.3 < 0.15
    head.side.rows.forEach((line, i) => {
      for (let j = 0; j < line.length; j++) {
        let ch = line[j]!
        if (ch === ' ') continue
        if (ch === '@' && blinking) ch = '-'
        push(ch, (head.col + j) * cellW, (head.row + i) * LINE_HEIGHT, TEXTURE_CHARS.has(ch) ? 1 : 2)
      }
    })
  }

  buckets.forEach((cells, b) => {
    ctx!.globalAlpha = b < 3 ? ALPHAS[b]! : ALPHAS[b - 3]! * AVOID_DIM
    for (const [ch, x, y] of cells) ctx!.fillText(ch, x, y)
  })

  for (const puff of puffs) {
    ctx.globalAlpha = 0.85 * clamp(puff.life, 0, 1) * (avoidance(puff.x, puff.y) > 0.5 ? AVOID_DIM : 1)
    ctx.fillText(puff.ch, puff.x, puff.y)
  }

  // Faint twinkling dust in the empty sky.
  ctx.globalAlpha = 0.3
  for (const { index, phase } of dust) {
    if (lum[index]! >= 0.04 || Math.sin(time * 1.5 + phase) < 0.3) continue
    ctx.fillText('.', (index % cols) * cellW, Math.floor(index / cols) * LINE_HEIGHT)
  }
  ctx.globalAlpha = 1
}

function render() {
  measureLayout()
  paintField()
  drawGlyphs()
}

let lastFrame = 0
const { pause, resume } = useRafFn(
  ({ timestamp }) => {
    if (timestamp - lastFrame < 1000 / FPS - 1) return
    const dt = lastFrame ? Math.min(0.05, (timestamp - lastFrame) / 1000) : 1 / FPS
    lastFrame = timestamp
    step(dt)
    render()
  },
  { immediate: false }
)

function syncLoop() {
  if (!ctx) return
  if (!reducedMotion.value && isInView.value && documentVisibility.value === 'visible') {
    lastFrame = 0
    resume()
  } else {
    pause()
    render()
  }
}

watch([width, height], () => {
  setup()
  syncLoop()
})

watch([isInView, documentVisibility, reducedMotion], syncLoop)

useIntersectionObserver(
  containerRef,
  ([entry]) => {
    isInView.value = entry?.isIntersecting ?? false
  },
  { threshold: 0.05 }
)

useMutationObserver(
  () => document.documentElement,
  () => {
    updateColor()
    if (reducedMotion.value) render()
  },
  { attributes: true, attributeFilter: ['class'] }
)

onMounted(() => {
  setup()
  syncLoop()
  // Glyph width depends on IBM Plex Mono; re-measure once it has loaded.
  document.fonts?.ready.then(() => {
    setup()
    syncLoop()
  })
})

onBeforeUnmount(() => {
  pause()
  ctx = null
  fctx = null
  field = null
})
</script>

<template>
  <div ref="containerRef" class="ascii-dragons absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    <canvas ref="canvasRef" class="block h-full w-full" />
  </div>
</template>

<style scoped>
.ascii-dragons {
  opacity: 0.85;
}

/* A soft bloom, like phosphor on an old monitor — dark theme only, where
   light glyphs glow; in the light theme a dark halo would just look smudged. */
:global(.dark .ascii-dragons) {
  opacity: 0.55;
}

:global(.dark .ascii-dragons canvas) {
  filter: drop-shadow(0 0 3px rgb(255 255 255 / 0.3));
}
</style>
