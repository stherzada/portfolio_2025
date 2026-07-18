<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import { gsap } from 'gsap'
import {
  useElementSize,
  useMouseInElement,
  useIntersectionObserver,
  useDocumentVisibility,
  useMutationObserver,
  useRafFn,
} from '@vueuse/core'
import { particleBurstActive } from '../../composables/useParticleBurst'

const PARTICLE_COUNT_DESKTOP = 2200
const PARTICLE_COUNT_MOBILE = 900
const MOBILE_BREAKPOINT = 768

const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const { width, height } = useElementSize(containerRef)
const { elementX, elementY, isOutside } = useMouseInElement(containerRef)
const documentVisibility = useDocumentVisibility()
const isInView = ref(true)

interface FieldUniforms {
  uHalfSize: { value: THREE.Vector2 }
  uMouse: { value: THREE.Vector2 }
  uScrollParallax: { value: number }
  uBurst: { value: number }
  uPixelRatio: { value: number }
  uColor: { value: THREE.Color }
  uOpacity: { value: number }
}

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let material: THREE.ShaderMaterial | null = null
let points: THREE.Points | null = null
// Kept as a directly-typed reference alongside `material.uniforms` so we
// don't have to fight `noUncheckedIndexedAccess` on every access.
let uniforms: FieldUniforms | null = null

let mouseX = 0
let mouseY = 0
let scrollBaselineTop = 0
let scrollTarget = 0
let scrollCurrent = 0

const clampNumber = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const vertexShader = /* glsl */ `
  uniform vec2 uHalfSize;
  uniform vec2 uMouse;
  uniform float uScrollParallax;
  uniform float uBurst;
  uniform float uPixelRatio;

  attribute float aSize;
  attribute vec3 aTarget;

  void main() {
    vec3 base = vec3(position.xy * uHalfSize, position.z * 0.6);

    vec2 diff = base.xy - uMouse;
    float dist = length(diff);
    float radius = min(uHalfSize.x, uHalfSize.y) * 0.35;
    float force = smoothstep(radius, 0.0, dist);
    vec2 dir = dist > 0.0001 ? normalize(diff) : vec2(0.0);
    base.xy += dir * force * radius * 0.6;

    base.y += uScrollParallax * position.z * 40.0;

    vec3 hat = vec3(aTarget.xy * min(uHalfSize.x, uHalfSize.y) * 0.8, aTarget.z * 0.8);
    vec3 finalPos = mix(base, hat, uBurst);

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * uPixelRatio;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, d) * uOpacity;
    gl_FragColor = vec4(uColor, alpha);
  }
`

function readCssColor(varName: string): THREE.Color {
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  return new THREE.Color(value || '#888888')
}

/**
 * Procedural straw-hat silhouette (wide brim + banded crown) used as the
 * particle burst target for the Konami-code easter egg. Values are in a
 * normalized [-1, 1]-ish space, later scaled to fit the container.
 */
function buildHatTargets(count: number): Float32Array {
  const targets = new Float32Array(count * 3)
  const brimEnd = Math.floor(count * 0.55)
  const bandEnd = Math.floor(count * 0.65)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    let x: number
    let y: number
    let z: number

    if (i < brimEnd) {
      // Wide flat brim, ring-shaped.
      const angle = Math.random() * Math.PI * 2
      const r = 0.72 + Math.random() * 0.28
      x = Math.cos(angle) * r
      y = Math.sin(angle) * r * 0.34 - 0.05
      z = (Math.random() - 0.5) * 0.06
    } else if (i < bandEnd) {
      // Thin band where the crown meets the brim.
      const angle = Math.random() * Math.PI * 2
      const r = 0.46
      x = Math.cos(angle) * r
      y = Math.sin(angle) * r * 0.34 + 0.14
      z = (Math.random() - 0.5) * 0.06
    } else {
      // Rounded crown/dome.
      const angle = Math.random() * Math.PI * 2
      const t = Math.random()
      const r = 0.46 * (1 - t * 0.85)
      x = Math.cos(angle) * r
      y = 0.16 + t * 0.62
      z = Math.sin(angle) * r * 0.5
    }

    targets[i3] = x
    targets[i3 + 1] = y
    targets[i3 + 2] = z
  }

  return targets
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

function updateHalfSize() {
  if (!camera || !uniforms) return
  const vFov = THREE.MathUtils.degToRad(camera.fov)
  const visibleHeight = 2 * Math.tan(vFov / 2) * camera.position.z
  const visibleWidth = visibleHeight * camera.aspect
  uniforms.uHalfSize.value.set(visibleWidth / 2, visibleHeight / 2)
}

function initScene() {
  const container = containerRef.value
  const canvas = canvasRef.value
  if (!container || !canvas) return

  const count = window.innerWidth < MOBILE_BREAKPOINT ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP

  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    positions[i3] = (Math.random() - 0.5) * 2
    positions[i3 + 1] = (Math.random() - 0.5) * 2
    positions[i3 + 2] = (Math.random() - 0.5) * 2
    sizes[i] = 1.2 + Math.random() * 2.2
  }
  const targets = buildHatTargets(count)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geometry.setAttribute('aTarget', new THREE.BufferAttribute(targets, 3))

  uniforms = {
    uHalfSize: { value: new THREE.Vector2(1, 1) },
    uMouse: { value: new THREE.Vector2(9999, 9999) },
    uScrollParallax: { value: 0 },
    uBurst: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uColor: { value: readCssColor('--color-neutral') },
    uOpacity: { value: 0.55 },
  }

  material = new THREE.ShaderMaterial({
    // ShaderMaterial's constructor type wants a plain string-indexed uniform
    // map; `FieldUniforms` is intentionally narrower everywhere else so we
    // don't lose type safety on every `uniforms.xyz` access.
    uniforms: uniforms as unknown as Record<string, THREE.IUniform>,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  })

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  camera.position.z = 6

  points = new THREE.Points(geometry, material)
  scene.add(points)

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const rect = container.getBoundingClientRect()
  const w = rect.width || 1
  const h = rect.height || 1
  renderer.setSize(w, h, false)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  updateHalfSize()

  scrollBaselineTop = rect.top + window.scrollY

  resumeRaf()
}

function disposeScene() {
  pauseRaf()
  points?.geometry.dispose()
  material?.dispose()
  renderer?.dispose()
  scene = null
  camera = null
  points = null
  material = null
  uniforms = null
  renderer = null
}

const { pause: pauseRaf, resume: resumeRaf } = useRafFn(
  () => {
    if (!renderer || !scene || !camera || !uniforms) return

    const halfSize = uniforms.uHalfSize.value
    const targetX = !isOutside.value && width.value ? (elementX.value / width.value - 0.5) * 2 * halfSize.x : 0
    const targetY = !isOutside.value && height.value ? -(elementY.value / height.value - 0.5) * 2 * halfSize.y : 0
    mouseX += (targetX - mouseX) * 0.08
    mouseY += (targetY - mouseY) * 0.08
    uniforms.uMouse.value.set(mouseX, mouseY)

    scrollTarget = clampNumber((scrollBaselineTop - window.scrollY) / (window.innerHeight || 800), -1, 1)
    scrollCurrent += (scrollTarget - scrollCurrent) * 0.06
    uniforms.uScrollParallax.value = scrollCurrent

    renderer.render(scene, camera)
  },
  { immediate: false }
)

watch([width, height], ([w, h]) => {
  if (!renderer || !camera || w === 0 || h === 0) return
  renderer.setSize(w, h, false)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  updateHalfSize()
})

watch([isInView, documentVisibility], ([inView, docVisibility]) => {
  if (!renderer) return
  if (inView && docVisibility === 'visible') {
    resumeRaf()
  } else {
    pauseRaf()
  }
})

watch(particleBurstActive, (active) => {
  if (!uniforms) return
  const uBurst = uniforms.uBurst
  gsap.killTweensOf(uBurst)
  gsap.to(uBurst, {
    value: active ? 1 : 0,
    duration: active ? 1.1 : 1.4,
    ease: active ? 'power3.out' : 'power2.inOut',
  })
})

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
    uniforms?.uColor.value.set(readCssColor('--color-neutral'))
  },
  { attributes: true, attributeFilter: ['class'] }
)

onMounted(() => {
  if (!hasWebGL()) return
  try {
    initScene()
  } catch (error) {
    console.error('[ParticleField] failed to initialize WebGL scene, disposing:', error)
    disposeScene()
  }
})

onBeforeUnmount(() => {
  disposeScene()
})
</script>

<template>
  <div ref="containerRef" class="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    <canvas ref="canvasRef" class="block h-full w-full" />
  </div>
</template>
