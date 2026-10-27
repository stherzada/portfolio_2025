<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useElementSize, useDocumentVisibility, useMutationObserver, useRafFn } from '@vueuse/core'
import { useReducedMotion } from '../composables/useReducedMotion'

/*
 * A slow ASCII "static" field for the 404 page: a few overlapping sine waves
 * give each character cell a brightness, which picks a glyph from a ramp.
 * The centre is kept quiet so the content on top stays readable, and now and
 * then a short run of a row glitches into noise, like a bad signal.
 */

const FONT_SIZE = 14
const LINE_HEIGHT = 16
const FPS = 24
const RAMP = ' .:-=+*#%@'
const GLITCH_GLYPHS = '#@%&$!?/\\|<>01'
/** Light theme: only the thin end of the ramp, so it reads as pencil, not smudges. */
const INK_RAMP = ' ..::--=+'
const INK_GLITCH_GLYPHS = '/\\|<>-_=+:'
const GLITCH_CHANCE = 0.05
const MAX_GLITCHES = 4

interface Glitch {
  row: number
  col: number
  len: number
  life: number
}

const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const { width, height } = useElementSize(containerRef)
const documentVisibility = useDocumentVisibility()
const reducedMotion = useReducedMotion()

let ctx: CanvasRenderingContext2D | null = null
let cellW = 8.4
let cols = 0
let rows = 0
let glyphColor = '#272727'
let inkMode = true
let glitches: Glitch[] = []
let time = 0
let lastFrame = 0

// Pencil on paper in the light theme, phosphor on black in the dark one.
function updateColor() {
  inkMode = !document.documentElement.classList.contains('dark')
  glyphColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#272727'
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
  cellW = ctx.measureText('M').width || 8.4

  cols = Math.ceil(w / cellW)
  rows = Math.ceil(h / LINE_HEIGHT)
  glitches = []
  updateColor()
  render()
}

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// Brightness in [0, 1] for one cell: interfering waves, dimmed towards the centre.
function sample(c: number, r: number, t: number) {
  // Cells are taller than wide; scale y so the waves aren't squashed.
  const x = c
  const y = r * (LINE_HEIGHT / cellW)
  const cx = cols / 2
  const cy = (rows / 2) * (LINE_HEIGHT / cellW)
  const dx = x - cx
  const dy = y - cy

  let v =
    Math.sin(x * 0.07 + t * 0.6) +
    Math.sin(y * 0.09 - t * 0.45) +
    Math.sin((x + y) * 0.04 + t * 0.3) +
    Math.sin(Math.sqrt(dx * dx + dy * dy) * 0.12 - t * 0.8)
  v = (v + 4) / 8

  const d = Math.sqrt((dx / cx) ** 2 + (dy / cy) ** 2)
  return v * (0.15 + 0.85 * smoothstep(0.35, 1.05, d))
}

function stepGlitches() {
  glitches = glitches.filter((g) => --g.life > 0)
  if (glitches.length < MAX_GLITCHES && Math.random() < GLITCH_CHANCE) {
    const len = 4 + Math.floor(Math.random() * Math.min(24, cols / 3))
    glitches.push({
      row: Math.floor(Math.random() * rows),
      col: Math.floor(Math.random() * Math.max(1, cols - len)),
      len,
      life: 3 + Math.floor(Math.random() * 6),
    })
  }
}

function render() {
  if (!ctx) return
  ctx.clearRect(0, 0, width.value, height.value)
  ctx.fillStyle = glyphColor
  const ramp = inkMode ? INK_RAMP : RAMP
  const glitchGlyphs = inkMode ? INK_GLITCH_GLYPHS : GLITCH_GLYPHS

  for (let r = 0; r < rows; r++) {
    let line = ''
    for (let c = 0; c < cols; c++) {
      const v = sample(c, r, time)
      line += ramp[Math.min(ramp.length - 1, Math.floor(v * ramp.length))]
    }
    for (const g of glitches) {
      if (g.row !== r) continue
      let noise = ''
      for (let i = 0; i < g.len; i++) noise += glitchGlyphs[Math.floor(Math.random() * glitchGlyphs.length)]
      line = line.slice(0, g.col) + noise + line.slice(g.col + g.len)
    }
    // Monospace, so one fillText per row keeps every column aligned.
    ctx.fillText(line, 0, r * LINE_HEIGHT)
  }
}

const { pause, resume } = useRafFn(
  ({ timestamp }) => {
    if (timestamp - lastFrame < 1000 / FPS) return
    time += (timestamp - (lastFrame || timestamp)) / 1000
    lastFrame = timestamp
    stepGlitches()
    render()
  },
  { immediate: false }
)

function syncLoop() {
  if (reducedMotion.value || documentVisibility.value === 'hidden') {
    pause()
    lastFrame = 0
    glitches = []
    render()
  } else {
    resume()
  }
}

watch([width, height], setup)
watch([documentVisibility, reducedMotion], syncLoop)

useMutationObserver(
  () => document.documentElement,
  () => {
    updateColor()
    render()
  },
  { attributes: true, attributeFilter: ['class'] }
)

onMounted(() => {
  setup()
  syncLoop()
  // Glyph width depends on IBM Plex Mono; re-measure once it has loaded.
  document.fonts?.ready.then(setup)
})

onBeforeUnmount(() => {
  pause()
  ctx = null
})
</script>

<template>
  <div ref="containerRef" class="ascii-field absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    <canvas ref="canvasRef" class="block h-full w-full" />
  </div>
</template>

<style scoped>
.ascii-field {
  opacity: 0.3;
}

:global(.dark .ascii-field) {
  opacity: 0.3;
}

:global(.dark .ascii-field canvas) {
  filter: drop-shadow(0 0 3px rgb(255 255 255 / 0.3));
}
</style>
