<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMediaQuery } from '@vueuse/core'
import { gsap } from 'gsap'
import { isTerminalOpen } from '@/composables/useTerminal'
import { prefersReducedMotion } from '@/composables/useReducedMotion'
import type { DestroyCharacter } from '@/composables/useDestroyMode'

const props = defineProps<{ character: DestroyCharacter }>()

const { t } = useI18n()
const isTouch = useMediaQuery('(pointer: coarse)')

type Dir = 'up' | 'down' | 'left' | 'right'
type Point = [number, number]

const STATS = {
  kaiju: { size: 112, beamRange: 380, beamPierce: 3, speed: 5, accel: 0.14, stepRate: 0.05, jump: 15, gravity: 0.9, radius: 85, stepShake: 1.5, shake: 7 },
  cat: { size: 96, beamRange: 240, beamPierce: 2, speed: 7.5, accel: 0.25, stepRate: 0.09, jump: 19, gravity: 1, radius: 60, stepShake: 0, shake: 3 },
} as const

const EDGE_SCROLL_ZONE = 160
// Lowest feet position: lets the sprite (~88px tall) reach the fixed navbar.
const MIN_FEET_Y = 96
// Sprites are drawn facing right in a 120×100 viewBox with the feet at y=100.
const VIEWBOX_W = 120
const VIEWBOX_H = 100
const MOUTH = { kaiju: [112, 46], cat: [104, 60] } as const
const EDGE_SCROLL_MAX = 28
const BREATH_COOLDOWN_MS = 700
const MAX_ACTIVE_SHARDS = 160
// Anything covering more than this fraction of the viewport is a layout
// container (section, main...) — smashing those would wipe the page at once.
const MAX_TARGET_AREA = 0.35
const SVG_NS = 'http://www.w3.org/2000/svg'
const NO_CRACK_TAGS = new Set(['IMG', 'INPUT', 'TEXTAREA', 'SELECT', 'VIDEO', 'CANVAS', 'IFRAME', 'BR', 'HR'])
const POP_WORDS = {
  kaiju: ['CRASH!', 'BOOM!', 'KABOOM!', 'SMASH!', 'RAWR!'],
  cat: ['MEOW!', 'NYAA!', 'CRASH!', 'PAW!', 'MRRP!'],
}

const PAD_LAYOUT: Array<Dir | null> = [null, 'up', null, 'left', null, 'right', null, 'down', null]
const PAD_ARROWS: Record<Dir, string> = { up: '▲', down: '▼', left: '◀', right: '▶' }

const MOVE_KEYS: Record<string, Dir> = {
  arrowup: 'up',
  w: 'up',
  arrowdown: 'down',
  s: 'down',
  arrowleft: 'left',
  a: 'left',
  arrowright: 'right',
  d: 'right',
}

const layerEl = ref<HTMLDivElement | null>(null)
const charEl = ref<HTMLDivElement | null>(null)
const flipEl = ref<HTMLDivElement | null>(null)
const spriteEl = ref<HTMLDivElement | null>(null)
const isRoaring = ref(false)
const shadowEl = ref<HTMLDivElement | null>(null)
const destroyedCount = ref(0)

const stats = STATS[props.character]

// Physics state lives outside Vue reactivity; the RAF loop writes styles directly.
// x/y are the feet on the "ground" (viewport coords), z is the jump height.
const body = {
  x: window.innerWidth * 0.3,
  y: window.innerHeight - 90,
  vx: 0,
  vy: 0,
  z: window.innerHeight * 0.8,
  vz: 0,
  facing: 1 as 1 | -1,
  phase: 0,
  airborne: true,
  pounding: true,
  crouching: false,
}
// Squash & stretch, animated by gsap and composed in render().
const pose = { sx: 1, sy: 1, tilt: 0 }

const held = new Set<Dir>()
const hits = new WeakMap<Element, number>()
const destroyed = new WeakSet<Element>()
let rafId = 0
let lastBreath = 0
let activeShards = 0
let edgeScroll = 0
// Elements already headbutted during the current jump.
let bonked = new Set<Element>()
let shakeTween: gsap.core.Tween | null = null

let legsA: SVGGElement[] = []
let legsB: SVGGElement[] = []
let tailEl: SVGGElement | null = null
let clippedRoot: HTMLElement | null = null

const taunt = computed(() => {
  const n = destroyedCount.value
  if (n >= 60) return t('destroy.taunts.t60')
  if (n >= 30) return t('destroy.taunts.t30')
  if (n >= 15) return t('destroy.taunts.t15')
  if (n >= 5) return t('destroy.taunts.t5')
  return ''
})

const rand = (min: number, max: number) => min + Math.random() * (max - min)
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
}

// ---------------------------------------------------------------- targeting

function toTarget(el: Element): Element | null {
  // Smash whole icons rather than individual <path>s.
  const target = el instanceof SVGElement ? (el.ownerSVGElement ?? el) : el
  if (target === document.documentElement || target === document.body) return null
  if (target.id === 'app' || layerEl.value?.contains(target)) return null
  if (target.classList.contains('destroy-crack') || destroyed.has(target)) return null

  const rect = target.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) return null
  const viewportArea = window.innerWidth * window.innerHeight
  if ((rect.width * rect.height) / viewportArea > MAX_TARGET_AREA) return null
  return target
}

function targetsAt(points: Point[]): Element[] {
  const found = new Set<Element>()
  for (const [px, py] of points) {
    if (px < 0 || py < 0 || px >= window.innerWidth || py >= window.innerHeight) continue
    for (const el of document.elementsFromPoint(px, py)) {
      const target = toTarget(el)
      if (target) {
        found.add(target)
        break
      }
    }
  }
  return [...found]
}

// Flattened ellipse: the ground is seen at an angle.
function groundPoints(cx: number, cy: number, r: number): Point[] {
  const points: Point[] = [[cx, cy]]
  for (let ring = 1; ring <= 3; ring++) {
    const rr = (r * ring) / 3
    const n = ring * 6
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      points.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.6])
    }
  }
  return points
}

// ---------------------------------------------------------------- effects

function shakeScreen(intensity: number) {
  if (prefersReducedMotion() || intensity <= 0) return
  // `translate` composes with the `transform` gsap sets on falling elements,
  // and skipping fixed children keeps the navbar in place.
  const targets = [...document.querySelectorAll<HTMLElement>('#app > div > *')].filter(
    (el) => getComputedStyle(el).position !== 'fixed',
  )
  shakeTween?.kill()
  const proxy = { k: 1 }
  shakeTween = gsap.to(proxy, {
    k: 0,
    duration: 0.2 + intensity * 0.03,
    ease: 'power2.out',
    onUpdate: () => {
      const m = intensity * proxy.k
      const offset = `${rand(-m, m)}px ${rand(-m, m) * 0.6}px`
      targets.forEach((el) => (el.style.translate = offset))
    },
    onComplete: () => targets.forEach((el) => (el.style.translate = '')),
  })
}

function spawn(className: string, x: number, y: number): HTMLDivElement | null {
  const layer = layerEl.value
  if (!layer) return null
  const el = document.createElement('div')
  el.className = className
  el.style.left = `${x}px`
  el.style.top = `${y}px`
  layer.appendChild(el)
  return el
}

function spawnPuff(x: number, y: number, size: number) {
  const puff = spawn('destroy-puff', x, y)
  if (!puff) return
  puff.style.width = puff.style.height = `${size}px`
  gsap.fromTo(
    puff,
    { xPercent: -50, yPercent: -50, scale: 0.3, opacity: 0.7 },
    {
      scale: 1.4,
      opacity: 0,
      x: -body.facing * rand(8, 20),
      y: -rand(6, 14),
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => puff.remove(),
    },
  )
}

function spawnShockwave(x: number, y: number, radius: number) {
  const ring = spawn('destroy-shockwave', x, y)
  if (!ring) return
  ring.style.width = `${radius * 2}px`
  ring.style.height = `${radius * 1.2}px`
  gsap.fromTo(
    ring,
    { xPercent: -50, yPercent: -50, scale: 0.15, opacity: 0.9 },
    { scale: 1, opacity: 0, duration: 0.55, ease: 'power3.out', onComplete: () => ring.remove() },
  )
  for (let i = 0; i < 6; i++) {
    const a = rand(Math.PI * 0.9, Math.PI * 2.1)
    spawnPuff(x + Math.cos(a) * radius * 0.5, y + Math.sin(a) * radius * 0.25, rand(22, 40))
  }
}

function spawnDebris(rect: DOMRect, color: string, ix: number, iy: number) {
  const count = Math.round(clamp(Math.sqrt(rect.width * rect.height) / 12, 6, 14))
  for (let i = 0; i < count; i++) {
    const bit = spawn('destroy-debris', ix + rand(-10, 10), iy + rand(-10, 10))
    if (!bit) return
    bit.style.background = color
    const size = rand(3, 9)
    bit.style.width = bit.style.height = `${size}px`
    gsap
      .timeline({ onComplete: () => bit.remove() })
      .to(bit, { x: rand(-160, 160), y: rand(-120, -30), rotation: rand(-360, 360), duration: 0.3, ease: 'power2.out' })
      .to(bit, { y: `+=${rand(180, 320)}`, opacity: 0, duration: rand(0.6, 1), ease: 'power2.in' })
  }
}

function popText(x: number, y: number) {
  const words = POP_WORDS[props.character]
  const pop = spawn('destroy-pop', x, y)
  if (!pop) return
  pop.textContent = words[Math.floor(Math.random() * words.length)] ?? ''
  gsap
    .timeline({ onComplete: () => pop.remove() })
    .fromTo(
      pop,
      { xPercent: -50, yPercent: -50, scale: 0, rotation: rand(-25, 25) },
      { scale: 1.25, duration: 0.18, ease: 'back.out(3)' },
    )
    .to(pop, { scale: 1, duration: 0.1 })
    .to(pop, { y: -50, opacity: 0, duration: 0.5, delay: 0.25, ease: 'power1.in' })
}

// ---------------------------------------------------------------- breaking

function hitPoints(rect: DOMRect): number {
  const area = rect.width * rect.height
  if (area < 4000) return 1
  if (area < 40000) return 2
  return 3
}

function wobble(el: Element, ix: number, rect: DOMRect) {
  const away = ix < rect.left + rect.width / 2 ? 1 : -1
  gsap.to(el, {
    rotation: `+=${away * rand(3, 9)}`,
    keyframes: [{ x: `+=${away * 8}` }, { x: `-=${away * 12}` }, { x: `+=${away * 4}` }],
    duration: 0.3,
  })
}

function addCracks(el: HTMLElement, rect: DOMRect, ix: number, iy: number, severity: number) {
  let svg = el.querySelector<SVGSVGElement>(':scope > svg.destroy-crack')
  if (!svg) {
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
    svg = document.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('class', 'destroy-crack')
    svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`)
    svg.setAttribute('preserveAspectRatio', 'none')
    el.appendChild(svg)
  }

  const ox = clamp(ix - rect.left, rect.width * 0.1, rect.width * 0.9)
  const oy = clamp(iy - rect.top, rect.height * 0.1, rect.height * 0.9)
  const size = Math.max(rect.width, rect.height)
  const rays = 4 + Math.floor(Math.random() * 3)

  for (let i = 0; i < rays; i++) {
    let angle = (i / rays) * Math.PI * 2 + rand(-0.4, 0.4)
    const length = size * (0.25 + severity * 0.5) * rand(0.5, 1)
    const segments = 4 + Math.floor(Math.random() * 3)
    let px = ox
    let py = oy
    let d = `M${px.toFixed(1)} ${py.toFixed(1)}`
    for (let s = 0; s < segments; s++) {
      angle += rand(-0.5, 0.5)
      px += (Math.cos(angle) * length) / segments
      py += (Math.sin(angle) * length) / segments
      d += ` L${px.toFixed(1)} ${py.toFixed(1)}`
    }
    const path = document.createElementNS(SVG_NS, 'path')
    path.setAttribute('d', d)
    path.setAttribute('pathLength', '1')
    svg.appendChild(path)
    gsap.fromTo(path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: rand(0.15, 0.35), ease: 'power2.out' })
  }
}

function crack(el: Element, rect: DOMRect, ix: number, iy: number, severity: number) {
  el.classList.add('destroy-cracked')
  wobble(el, ix, rect)
  if (el instanceof HTMLElement && !NO_CRACK_TAGS.has(el.tagName)) addCracks(el, rect, ix, iy, severity)
  spawnDebris(rect, getComputedStyle(el).color || '#888', ix, iy)
}

function snapshotStyle(el: Element, rect: DOMRect): string {
  const cs = getComputedStyle(el)
  let css = ''
  for (let i = 0; i < cs.length; i++) {
    const prop = cs.item(i)
    css += `${prop}:${cs.getPropertyValue(prop)};`
  }
  return (
    css +
    `position:absolute;left:0;top:0;margin:0;transform:none;translate:none;rotate:none;scale:none;` +
    `width:${rect.width}px;height:${rect.height}px;box-sizing:border-box;visibility:visible;` +
    `animation:none;transition:none;pointer-events:none;`
  )
}

function shatter(el: Element, rect: DOMRect, ix: number, iy: number) {
  const layer = layerEl.value
  if (!layer) return
  const w = rect.width
  const h = rect.height
  const ox = clamp(ix - rect.left, w * 0.15, w * 0.85)
  const oy = clamp(iy - rect.top, h * 0.15, h * 0.85)

  // Fan of triangles from the impact point to points around the border.
  const border: Point[] = [[0, 0], [w, 0], [w, h], [0, h]]
  const extra = Math.round(clamp(Math.sqrt(w * h) / 45, 2, activeShards > MAX_ACTIVE_SHARDS / 2 ? 2 : 6))
  for (let i = 0; i < extra; i++) {
    const t = Math.random()
    const edge = Math.floor(Math.random() * 4)
    border.push(edge === 0 ? [t * w, 0] : edge === 1 ? [w, t * h] : edge === 2 ? [t * w, h] : [0, t * h])
  }
  border.sort((a, b) => Math.atan2(a[1] - oy, a[0] - ox) - Math.atan2(b[1] - oy, b[0] - ox))

  const source = el.cloneNode(true) as Element
  source.setAttribute('style', snapshotStyle(el, rect))
  source.removeAttribute('id')

  border.forEach((a, i) => {
    const b = border[(i + 1) % border.length]!
    const shard = document.createElement('div')
    shard.className = 'destroy-shard'
    shard.style.left = `${rect.left}px`
    shard.style.top = `${rect.top}px`
    shard.style.width = `${w}px`
    shard.style.height = `${h}px`
    shard.style.clipPath = `polygon(${ox}px ${oy}px, ${a[0]}px ${a[1]}px, ${b[0]}px ${b[1]}px)`
    shard.appendChild(i === border.length - 1 ? source : source.cloneNode(true))
    layer.appendChild(shard)
    activeShards++

    const cx = (ox + a[0] + b[0]) / 3
    const cy = (oy + a[1] + b[1]) / 3
    const len = Math.hypot(cx - ox, cy - oy) || 1
    const dx = (cx - ox) / len
    const dy = (cy - oy) / len
    const force = rand(40, 130) * (props.character === 'cat' ? 0.7 : 1)
    const floor = Math.max(window.innerHeight - rect.top - cy - rand(5, 30), 20)

    gsap.set(shard, { transformOrigin: `${cx}px ${cy}px` })
    gsap
      .timeline({
        onComplete: () => {
          shard.remove()
          activeShards--
        },
      })
      .to(shard, {
        x: dx * force,
        y: dy * force * 0.5 - rand(30, 90),
        rotation: rand(-120, 120),
        duration: 0.3,
        ease: 'power2.out',
      })
      .to(shard, {
        y: floor,
        x: `+=${dx * rand(20, 60)}`,
        rotation: `+=${rand(-160, 160)}`,
        duration: rand(0.55, 0.85),
        ease: 'power2.in',
      })
      .to(shard, { y: floor - rand(8, 22), duration: 0.14, ease: 'power1.out' })
      .to(shard, { y: floor, duration: 0.14, ease: 'power1.in' })
      .to(shard, { opacity: 0, duration: 0.6, delay: rand(1, 2) })
  })
}

// Elements that can't be cloned faithfully (media, canvases) just fall over.
function topple(el: Element, rect: DOMRect) {
  gsap.to(el, {
    y: `+=${Math.max(window.innerHeight - rect.bottom - rand(0, 30), 0)}`,
    x: `+=${rand(-60, 60)}`,
    rotation: `+=${rand(-80, 80)}`,
    duration: rand(1, 1.5),
    ease: 'bounce.out',
  })
}

function damage(el: Element, power: number, ix: number, iy: number): boolean {
  // Transforms don't apply to plain inline boxes.
  if (el instanceof HTMLElement && getComputedStyle(el).display === 'inline') {
    el.style.display = 'inline-block'
  }
  // CSS transitions (e.g. the navbar's `transition-all`) would smear gsap's transforms.
  if (el instanceof HTMLElement || el instanceof SVGElement) el.style.transition = 'none'
  const rect = el.getBoundingClientRect()
  const hp = hitPoints(rect)
  const dealt = (hits.get(el) ?? 0) + power
  hits.set(el, dealt)

  if (dealt < hp) {
    crack(el, rect, ix, iy, dealt / hp)
    return false
  }

  destroyed.add(el)
  destroyedCount.value += 1
  spawnDebris(rect, getComputedStyle(el).color || '#888', ix, iy)
  const unclonable = /^(IFRAME|VIDEO|CANVAS)$/.test(el.tagName) || el.querySelector('iframe, video, canvas')
  if (unclonable || activeShards > MAX_ACTIVE_SHARDS) {
    topple(el, rect)
  } else {
    shatter(el, rect, ix, iy)
    ;(el as HTMLElement).style.visibility = 'hidden'
  }
  el.classList.add('destroy-fallen')
  return true
}

function smash(targets: Element[], power: number, ix: number, iy: number): number {
  let count = 0
  for (const el of targets) if (damage(el, power, ix, iy)) count++
  return count
}

function bounceNearby(cx: number, cy: number, r: number, height: number) {
  for (const el of targetsAt(groundPoints(cx, cy, r))) {
    if (gsap.isTweening(el)) continue
    gsap.to(el, { y: `-=${height}`, duration: 0.1, yoyo: true, repeat: 1, ease: 'power1.out' })
  }
}

// ---------------------------------------------------------------- actions

// Rising through something above hits it with the head, like a Mario block.
function headbutt() {
  const headY = body.y - body.z - stats.size * (VIEWBOX_H / VIEWBOX_W) * 0.78
  const targets = targetsAt([
    [body.x - 22, headY + 10],
    [body.x, headY],
    [body.x + 22, headY + 10],
  ]).filter((el) => !bonked.has(el))
  if (targets.length === 0) return

  targets.forEach((el) => bonked.add(el))
  const destroyedNow = smash(targets, 1, body.x, headY)
  // Bonk: stop rising and squash against it.
  body.vz = Math.min(body.vz, 1)
  gsap.killTweensOf(pose)
  gsap.fromTo(pose, { sx: 1.2, sy: 0.8 }, { sx: 1, sy: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' })
  spawnPuff(body.x, headY, 30)
  shakeScreen(stats.shake * 0.5)
  if (destroyedNow > 0) popText(body.x, headY - 30)
}

function jump() {
  if (body.airborne) {
    // Second press mid-air: ground pound.
    if (body.pounding) return
    body.pounding = true
    body.vz = Math.min(body.vz, -stats.jump * 0.8)
    gsap.killTweensOf(pose)
    gsap.to(pose, { sx: 0.8, sy: 1.25, tilt: 0, duration: 0.12 })
    return
  }
  if (body.crouching) return
  body.crouching = true
  gsap.killTweensOf(pose)
  gsap.to(pose, {
    sx: 1.25,
    sy: 0.72,
    duration: 0.09,
    ease: 'power2.out',
    onComplete: () => {
      body.crouching = false
      body.airborne = true
      body.vz = stats.jump
      bonked = new Set()
      spawnPuff(body.x, body.y, 36)
      gsap
        .timeline()
        .to(pose, { sx: 0.8, sy: 1.25, duration: 0.12, ease: 'power2.out' })
        .to(pose, { sx: 1, sy: 1, duration: 0.35, ease: 'sine.inOut' })
    },
  })
}

function land(impactSpeed: number) {
  const pounded = body.pounding
  body.airborne = false
  body.pounding = false
  body.z = 0
  body.vz = 0

  const strength = clamp(impactSpeed / stats.jump, 0.6, 2.4) * (pounded ? 1.3 : 1)
  gsap.killTweensOf(pose)
  gsap.fromTo(
    pose,
    { sx: 1 + 0.25 * strength, sy: 1 - 0.2 * strength, tilt: 0 },
    { sx: 1, sy: 1, duration: 0.7, ease: 'elastic.out(1, 0.35)' },
  )

  const radius = stats.radius * (0.6 + strength * 0.45)
  const destroyedNow = smash(targetsAt(groundPoints(body.x, body.y - 10, radius)), pounded ? 2 : 1, body.x, body.y)
  bounceNearby(body.x, body.y, radius * 1.8, 6 + strength * 4)
  spawnShockwave(body.x, body.y, radius * 1.4)
  shakeScreen(stats.shake * strength)
  if (destroyedNow > 0 || pounded) popText(body.x, body.y - 130)
}

function mouthPosition(): Point {
  const scale = stats.size / VIEWBOX_W
  const [mx, my] = MOUTH[props.character]
  return [body.x + body.facing * (mx - VIEWBOX_W / 2) * scale, body.y - body.z - (VIEWBOX_H - my) * scale]
}

function breath() {
  const now = performance.now()
  if (now - lastBreath < BREATH_COOLDOWN_MS) return
  lastBreath = now

  // Rear back with the mouth open, then fire.
  isRoaring.value = true
  gsap.killTweensOf(pose, 'tilt')
  gsap.to(pose, { tilt: -9, duration: 0.14, ease: 'power2.out' })
  setTimeout(fireBeam, 150)
}

function fireBeam() {
  const dir = body.facing
  const [startX, beamY] = mouthPosition()
  const maxWidth = Math.abs(clamp(startX + dir * stats.beamRange, 0, window.innerWidth) - startX)

  // March outwards from the mouth; the beam punches through a few elements
  // and stops at the last one instead of reaching across the whole screen.
  const hitsAlong: Array<[Element, number]> = []
  let width = maxWidth
  for (let d = 0; d <= maxWidth; d += 16) {
    const px = startX + dir * d
    for (const el of targetsAt([[px, beamY - 10], [px, beamY + 10]])) {
      if (!hitsAlong.some(([hit]) => hit === el)) hitsAlong.push([el, px])
    }
    if (hitsAlong.length >= stats.beamPierce) {
      width = d + 24
      break
    }
  }
  // A breath is strong enough to shatter anything in one go.
  let destroyedNow = 0
  for (const [el, px] of hitsAlong) if (damage(el, 99, px, beamY)) destroyedNow++
  const endX = startX + dir * width

  const beam = spawn(`destroy-beam${props.character === 'cat' ? ' destroy-beam--cat' : ''}`, Math.min(startX, endX), beamY)
  if (beam) {
    beam.style.width = `${width}px`
    beam.style.transformOrigin = dir === 1 ? 'left center' : 'right center'
    beam.style.maskImage = `linear-gradient(to ${dir === 1 ? 'right' : 'left'}, #000 75%, transparent)`
    gsap
      .timeline({ onComplete: () => beam.remove() })
      .fromTo(beam, { scaleX: 0, scaleY: 0.4 }, { scaleX: 1, scaleY: 1.2, duration: 0.12, ease: 'power2.out' })
      .to(beam, { scaleY: 0, opacity: 0, duration: 0.25, delay: 0.15 })
  }
  // Recoil forward, then close the mouth once the beam fades.
  gsap.killTweensOf(pose, 'tilt')
  gsap.timeline().to(pose, { tilt: 5, duration: 0.08 }).to(pose, { tilt: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' })
  setTimeout(() => (isRoaring.value = false), 420)
  shakeScreen(stats.shake * 0.6)
  if (destroyedNow > 0) popText(endX, beamY - 40)
}

function footstep() {
  spawnPuff(body.x - body.facing * 14, body.y, props.character === 'cat' ? 14 : 26)
  if (stats.stepShake > 0) {
    shakeScreen(stats.stepShake)
    bounceNearby(body.x, body.y, 30, 4)
  }
}

// ---------------------------------------------------------------- loop

function render(now: number) {
  const speed = Math.hypot(body.vx, body.vy)
  const walk = body.airborne ? 0 : clamp(speed / stats.speed, 0, 1)
  const bob = -Math.abs(Math.sin(body.phase)) * 10 * walk
  const idle = body.airborne || walk > 0.1 ? 0 : Math.sin(now / 350) * 0.03
  // Lean into the jump arc: forward while rising, back while falling.
  const airTilt = body.airborne && !body.pounding ? clamp(-body.vz * 0.8, -12, 12) : 0
  const tilt = Math.sin(body.phase) * 10 * walk + pose.tilt + airTilt

  charEl.value!.style.transform = `translate3d(${body.x}px, ${body.y - body.z + bob}px, 0)`
  flipEl.value!.style.transform = `scaleX(${body.facing})`
  spriteEl.value!.style.transform = `rotate(${tilt}deg) scale(${pose.sx * (1 - idle)}, ${pose.sy * (1 + idle)})`

  // Legs swing in opposite pairs while walking and tuck in mid-air.
  const swing = body.airborne ? 18 : Math.sin(body.phase) * 28 * walk
  legsA.forEach((leg) => (leg.style.transform = `rotate(${body.airborne ? -swing : swing}deg)`))
  legsB.forEach((leg) => (leg.style.transform = `rotate(${-swing}deg)`))
  if (tailEl) {
    const wag = props.character === 'cat' ? Math.sin(now / 280) * 10 : Math.sin(body.phase * 0.5) * 8 * walk + Math.sin(now / 600) * 3
    tailEl.style.transform = `rotate(${wag}deg)`
  }

  const shadowScale = clamp(1 - body.z / 500, 0.3, 1) * (1 + Math.abs(bob) / 60)
  shadowEl.value!.style.transform = `translate3d(${body.x}px, ${body.y}px, 0) translate(-50%, -50%) scale(${shadowScale})`
  shadowEl.value!.style.opacity = String(clamp(0.45 - body.z / 1200, 0.12, 0.45))
}

function tick(now: number) {
  let ix = 0
  let iy = 0
  if (held.has('left')) ix -= 1
  if (held.has('right')) ix += 1
  if (held.has('up')) iy -= 1
  if (held.has('down')) iy += 1
  const norm = ix && iy ? Math.SQRT1_2 : 1
  const control = body.airborne ? 0.4 : 1

  body.vx += (ix * norm * stats.speed - body.vx) * stats.accel * control
  body.vy += (iy * norm * stats.speed - body.vy) * stats.accel * control
  if (ix !== 0) body.facing = ix > 0 ? 1 : -1

  body.x = clamp(body.x + body.vx, 40, window.innerWidth - 40)
  body.y = clamp(body.y + body.vy, MIN_FEET_Y, window.innerHeight - 20)

  if (body.airborne) {
    body.vz -= stats.gravity * (body.pounding ? 2.2 : 1)
    body.z += body.vz
    if (body.vz > 0) headbutt()
    if (body.z <= 0) land(-body.vz)
  } else {
    const speed = Math.hypot(body.vx, body.vy)
    if (speed > 0.6) {
      const before = Math.floor(body.phase / Math.PI)
      body.phase += speed * stats.stepRate
      if (Math.floor(body.phase / Math.PI) !== before) footstep()
    } else {
      // Settle back to a neutral stance.
      body.phase = Math.round(body.phase / Math.PI) * Math.PI
    }
  }

  // Walking into the top/bottom edge scrolls so the whole page is reachable,
  // speeding up the longer you keep pushing.
  const pushingEdge =
    (iy < 0 && body.y < EDGE_SCROLL_ZONE + 60) || (iy > 0 && body.y > window.innerHeight - EDGE_SCROLL_ZONE)
  edgeScroll = pushingEdge ? Math.min(Math.max(edgeScroll, stats.speed * 1.5) + 0.5, EDGE_SCROLL_MAX) : 0
  // `behavior: 'instant'` overrides the site's `scroll-behavior: smooth`,
  // which would otherwise restart a smooth scroll every frame and crawl.
  if (edgeScroll) window.scrollBy({ top: iy * edgeScroll, behavior: 'instant' })

  render(now)
  rafId = requestAnimationFrame(tick)
}

// ---------------------------------------------------------------- input

function handleKeydown(event: KeyboardEvent) {
  if (isTerminalOpen.value || isTypingTarget(event.target)) return
  const key = event.key.toLowerCase()
  const dir = MOVE_KEYS[key]
  if (dir) {
    event.preventDefault()
    held.add(dir)
  } else if (key === ' ') {
    event.preventDefault()
    if (!event.repeat) jump()
  } else if (key === 'f' || key === 'k') {
    event.preventDefault()
    breath()
  }
}

function handleKeyup(event: KeyboardEvent) {
  const dir = MOVE_KEYS[event.key.toLowerCase()]
  if (dir) held.delete(dir)
}

function releaseAll() {
  held.clear()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('keyup', handleKeyup)
  window.addEventListener('blur', releaseAll)
  // Shaking, wobbling and falling elements (and cracks) poke past the page
  // edges; without clipping, scrollbars flicker in and out on every hit.
  // `clip` (unlike `hidden`) doesn't create a scroll container, and the fixed
  // navbar escapes it.
  clippedRoot = document.querySelector<HTMLElement>('#app > div')
  if (clippedRoot) clippedRoot.style.overflow = 'clip'

  const sprite = spriteEl.value
  if (sprite) {
    legsA = [...sprite.querySelectorAll<SVGGElement>('.leg-a')]
    legsB = [...sprite.querySelectorAll<SVGGElement>('.leg-b')]
    tailEl = sprite.querySelector<SVGGElement>('.tail')
  }
  // Entrance: drops from the sky straight into a ground pound.
  body.vz = -4
  rafId = requestAnimationFrame(tick)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('keyup', handleKeyup)
  window.removeEventListener('blur', releaseAll)
  cancelAnimationFrame(rafId)
  shakeTween?.kill()
  if (clippedRoot) clippedRoot.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div ref="layerEl" class="fixed inset-0 z-[90] pointer-events-none select-none overflow-hidden" aria-hidden="true">
      <div ref="shadowEl" class="destroy-shadow" :class="character === 'cat' ? 'destroy-shadow--cat' : ''"></div>

      <div ref="charEl" class="destroy-character">
        <div class="destroy-anchor">
          <div ref="flipEl">
            <div
              ref="spriteEl"
              class="destroy-sprite"
              :class="{ 'is-roaring': isRoaring }"
              :style="{ width: `${stats.size}px`, height: `${(stats.size * VIEWBOX_H) / VIEWBOX_W}px` }"
            >
              <svg v-if="character === 'kaiju'" viewBox="0 0 120 100" class="destroy-kaiju">
                <g class="tail" style="transform-origin: 36px 62px">
                  <path d="M38 54 Q18 56 4 74 Q2 79 7 78 Q22 70 38 72 Z" fill="#3fa34d" />
                </g>
                <path d="M34 46 L38 33 L44 41 L49 29 L55 39 L60 28 L65 38 L70 31 L72 44 Z" fill="#2f8a3c" />
                <g class="leg-b" style="transform-origin: 50px 70px">
                  <path d="M44 66 H56 V92 H62 Q65 92 65 95 V98 H44 Z" fill="#2f8a3c" />
                </g>
                <path d="M30 58 Q30 38 54 38 Q76 38 78 58 Q78 80 54 80 Q30 80 30 58 Z" fill="#3fa34d" />
                <ellipse cx="62" cy="66" rx="13" ry="10" fill="#a8e06a" />
                <g class="leg-a" style="transform-origin: 66px 70px">
                  <path d="M60 66 H72 V92 H79 Q82 92 82 95 V98 H60 Z" fill="#3fa34d" />
                </g>
                <path d="M74 56 Q84 56 86 64 L82 66 Q80 61 74 62 Z" fill="#2f8a3c" />
                <path d="M64 46 Q72 34 86 36 L88 50 Q80 52 74 60 Z" fill="#3fa34d" />
                <g class="mouth-inside">
                  <path d="M86 43 L110 36 L106 52 Z" fill="#6b1522" />
                  <ellipse cx="97" cy="46.5" rx="6.5" ry="2.4" fill="#e0607a" />
                </g>
                <g class="jaw-lower" style="transform-origin: 86px 43px">
                  <path d="M84 42 L108 43 Q114 44 112 49 Q109 53 100 53 L86 53 Z" fill="#3fa34d" />
                  <path d="M92 43 L94 40 L96 43 Z M99 43 L101 40 L103 43 Z M105 43 L107 40.5 L109 43.5 Z" fill="#fff" />
                </g>
                <g class="jaw-upper" style="transform-origin: 86px 43px">
                  <path d="M80 28 Q90 18 106 22 Q116 26 115 36 Q114 42 110 43 L84 43 Q76 38 80 28 Z" fill="#3fa34d" />
                  <path d="M90 43 L92 46.5 L94 43 Z M97 43 L99 46.5 L101 43 Z M104 43 L106 46.5 L108 43 Z" fill="#fff" />
                  <circle cx="95" cy="30" r="3.6" fill="#fff" />
                  <circle cx="96.2" cy="30.4" r="1.9" fill="#111" />
                  <path d="M89 25 L100 27.5" stroke="#1f5e28" stroke-width="2.2" stroke-linecap="round" />
                  <circle cx="111" cy="30" r="1.1" fill="#1f5e28" />
                </g>
              </svg>

              <svg v-else viewBox="0 0 120 100" class="destroy-cat">
                <g class="tail" style="transform-origin: 26px 70px">
                  <path d="M28 70 Q10 66 10 48 Q10 38 17 35" fill="none" stroke="#f4a340" stroke-width="7" stroke-linecap="round" />
                </g>
                <g class="leg-b" style="transform-origin: 35px 76px">
                  <rect x="31" y="74" width="9" height="24" rx="4" fill="#d9822b" />
                </g>
                <g class="leg-a" style="transform-origin: 67px 76px">
                  <rect x="63" y="74" width="9" height="24" rx="4" fill="#d9822b" />
                </g>
                <ellipse cx="52" cy="72" rx="30" ry="15" fill="#f4a340" />
                <path d="M42 58 q3 7 0 12 M52 57 q3 7 0 12 M62 58 q3 6 0 11" stroke="#d9822b" stroke-width="3" fill="none" stroke-linecap="round" />
                <ellipse cx="58" cy="81" rx="16" ry="5" fill="#ffe3bf" />
                <g class="leg-a" style="transform-origin: 42px 78px">
                  <rect x="37" y="76" width="10" height="22" rx="4" fill="#f4a340" />
                </g>
                <g class="leg-b" style="transform-origin: 74px 78px">
                  <rect x="69" y="76" width="10" height="22" rx="4" fill="#f4a340" />
                </g>
                <g class="jaw-upper" style="transform-origin: 80px 64px">
                  <path d="M75 42 L77 25 L88 35 Z M94 35 L105 25 L106 42 Z" fill="#f4a340" />
                  <path d="M78 38 L79 30 L85 35 Z M97 35 L103 30 L103.5 39 Z" fill="#ffb3c1" />
                  <circle cx="90" cy="50" r="17" fill="#f4a340" />
                  <ellipse cx="97" cy="56" rx="9" ry="6" fill="#ffe3bf" />
                  <ellipse cx="86" cy="47" rx="2.6" ry="3.6" fill="#1a1a1a" />
                  <ellipse cx="97" cy="46" rx="2.6" ry="3.6" fill="#1a1a1a" />
                  <circle cx="87" cy="45.5" r="0.9" fill="#fff" />
                  <circle cx="98" cy="44.5" r="0.9" fill="#fff" />
                  <path d="M98 51.5 L102 51.5 L100 54 Z" fill="#e0607a" />
                  <path d="M105 55 L115 53 M105 57.5 L115 58.5" stroke="#8a5a2b" stroke-width="1" />
                  <path class="mouth-closed" d="M96 55.5 q2 2 4 0 q2 2 4 0" stroke="#8a5a2b" stroke-width="1.2" fill="none" />
                  <g class="mouth-open" style="transform-origin: 100px 56px">
                    <ellipse cx="100" cy="60" rx="5" ry="6" fill="#6b1522" />
                    <ellipse cx="100" cy="63" rx="3.2" ry="2.4" fill="#e0607a" />
                    <path d="M96.5 55.5 L97.5 58.5 L98.5 55.5 Z M101.5 55.5 L102.5 58.5 L103.5 55.5 Z" fill="#fff" />
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div
        class="absolute top-20 md:top-24 left-1/2 -translate-x-1/2 max-w-[calc(100%-2rem)] rounded-lg border border-white/10 bg-[#0b0b0d]/90 px-4 py-2 text-center font-mono text-xs text-[#e5e5e5] shadow-xl"
      >
        <p class="text-[#ff6b6b]">💥 {{ t('destroy.destroyed', { n: destroyedCount }) }}<span v-if="taunt"> · {{ taunt }}</span></p>
        <p v-if="!isTouch" class="text-white/60">{{ t('destroy.controls') }}</p>
        <p class="text-white/40">{{ t('destroy.restore') }}</p>
      </div>

      <template v-if="isTouch">
        <div class="absolute bottom-6 left-4 grid grid-cols-3 gap-1 pointer-events-auto touch-none" :aria-label="t('destroy.move')">
          <template v-for="(cell, i) in PAD_LAYOUT" :key="i">
            <span v-if="!cell"></span>
            <button
              v-else
              type="button"
              class="destroy-pad"
              @pointerdown.prevent="held.add(cell)"
              @pointerup="held.delete(cell)"
              @pointerleave="held.delete(cell)"
              @pointercancel="held.delete(cell)"
            >
              {{ PAD_ARROWS[cell] }}
            </button>
          </template>
        </div>
        <div class="absolute bottom-6 right-4 flex flex-col gap-2 pointer-events-auto touch-none">
          <button type="button" class="destroy-pad destroy-pad--action" @pointerdown.prevent="breath">{{ t('destroy.breath') }}</button>
          <button type="button" class="destroy-pad destroy-pad--action" @pointerdown.prevent="jump">{{ t('destroy.jump') }}</button>
        </div>
      </template>
    </div>
  </Teleport>
</template>

<style>
/* Unscoped on purpose: these classes land on elements all over the page. */
.destroy-cracked {
  filter: grayscale(0.35) contrast(1.15) drop-shadow(2px 2px 0 rgba(0, 0, 0, 0.3));
}

.destroy-fallen {
  pointer-events: none !important;
}

.destroy-crack {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
  z-index: 5;
}

.destroy-crack path {
  fill: none;
  stroke: rgba(15, 15, 15, 0.8);
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1;
  vector-effect: non-scaling-stroke;
  filter: drop-shadow(0.5px 0.5px 0 rgba(255, 255, 255, 0.7));
}

.destroy-character {
  position: absolute;
  left: 0;
  top: 0;
  will-change: transform;
}

.destroy-anchor {
  transform: translate(-50%, -100%);
}

.destroy-sprite {
  transform-origin: 50% 100%;
  filter: drop-shadow(0 0 1.5px rgba(0, 0, 0, 0.55)) drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3));
}

.destroy-sprite svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.destroy-sprite g {
  transform-box: view-box;
}

.destroy-sprite .jaw-upper,
.destroy-sprite .jaw-lower,
.destroy-sprite .mouth-open {
  transition: transform 0.12s cubic-bezier(0.3, 1.6, 0.5, 1);
}

.destroy-sprite .mouth-open {
  transform: scale(0.1);
}

.destroy-kaiju .jaw-upper {
  transform: rotate(0deg);
}

.is-roaring .destroy-kaiju .jaw-upper {
  transform: rotate(-16deg);
}

.is-roaring .destroy-kaiju .jaw-lower {
  transform: rotate(24deg);
}

.is-roaring .destroy-cat .jaw-upper {
  transform: rotate(-10deg);
}

.is-roaring .destroy-cat .mouth-open {
  transform: scale(1);
}

.destroy-kaiju .mouth-inside {
  opacity: 0;
  transition: opacity 0.08s;
}

.is-roaring .destroy-kaiju .mouth-inside {
  opacity: 1;
}

.is-roaring .destroy-cat .mouth-closed {
  opacity: 0;
}

.destroy-shadow {
  position: absolute;
  left: 0;
  top: 0;
  width: 90px;
  height: 22px;
  border-radius: 50%;
  background: radial-gradient(closest-side, rgba(0, 0, 0, 0.7), transparent);
  will-change: transform;
}

.destroy-shadow--cat {
  width: 64px;
  height: 16px;
}

.destroy-shard {
  position: absolute;
  overflow: visible;
  will-change: transform;
}

.destroy-debris,
.destroy-puff,
.destroy-shockwave,
.destroy-pop,
.destroy-beam {
  position: absolute;
}

.destroy-debris {
  border-radius: 1px;
}

.destroy-puff {
  border-radius: 50%;
  background: radial-gradient(closest-side, rgba(190, 170, 140, 0.8), rgba(190, 170, 140, 0));
}

.destroy-shockwave {
  border-radius: 50%;
  border: 3px solid rgba(190, 170, 140, 0.8);
  box-shadow: 0 0 12px rgba(190, 170, 140, 0.5);
}

.destroy-pop {
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 800;
  font-size: 32px;
  color: #ffd23f;
  white-space: nowrap;
  -webkit-text-stroke: 2px #1a1a1a;
  paint-order: stroke fill;
  text-shadow: 3px 3px 0 #ff5f56;
}

.destroy-beam {
  height: 28px;
  margin-top: -14px;
  border-radius: 999px;
  background: linear-gradient(90deg, #7df9ff, #2b6bff, #7df9ff);
  box-shadow: 0 0 24px 8px rgba(80, 160, 255, 0.6);
}

.destroy-beam--cat {
  background: linear-gradient(90deg, #ffd1f0, #ff6bd6, #ffd1f0);
  box-shadow: 0 0 20px 6px rgba(255, 107, 214, 0.5);
}

.destroy-pad {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: rgba(11, 11, 13, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #e5e5e5;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
}

.destroy-pad--action {
  width: 88px;
  background: rgba(255, 95, 86, 0.85);
}
</style>
