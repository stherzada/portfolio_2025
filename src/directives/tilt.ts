import type { Directive } from 'vue'
import { gsap } from 'gsap'
import { prefersReducedMotion } from '../composables/useReducedMotion'

export interface TiltOptions {
  /** Max rotation in degrees. */
  max?: number
  scale?: number
}

const cleanups = new WeakMap<HTMLElement, () => void>()

function supportsHover(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
}

/**
 * `v-tilt` — subtle 3D pointer-follow tilt for cards, in the vein of
 * Apple product pages. No-op on touch devices or reduced-motion.
 */
export const tilt: Directive<HTMLElement, TiltOptions | undefined> = {
  mounted(el, binding) {
    if (prefersReducedMotion() || !supportsHover()) return

    const { max = 6, scale = 1.02 } = binding.value ?? {}

    el.style.transformStyle = 'preserve-3d'
    el.style.willChange = 'transform'

    const onMove = (event: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const px = (event.clientX - rect.left) / rect.width
      const py = (event.clientY - rect.top) / rect.height
      const rotateY = (px - 0.5) * max * 2
      const rotateX = (0.5 - py) * max * 2

      gsap.to(el, {
        rotateX,
        rotateY,
        scale,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 600,
      })
    }

    const onLeave = () => {
      gsap.to(el, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.6, ease: 'power3.out' })
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)

    cleanups.set(el, () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      gsap.killTweensOf(el)
    })
  },
  unmounted(el) {
    cleanups.get(el)?.()
    cleanups.delete(el)
  },
}
