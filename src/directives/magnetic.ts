import type { Directive } from 'vue'
import { gsap } from 'gsap'
import { prefersReducedMotion } from '../composables/useReducedMotion'

export interface MagneticOptions {
  /** How strongly the element follows the cursor (0-1). */
  strength?: number
}

const cleanups = new WeakMap<HTMLElement, () => void>()

function supportsHover(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches
}

/**
 * `v-magnetic` — subtle magnetic pull toward the cursor, used on small
 * interactive targets (social links, buttons) for an Apple-like tactile feel.
 */
export const magnetic: Directive<HTMLElement, MagneticOptions | undefined> = {
  mounted(el, binding) {
    if (prefersReducedMotion() || !supportsHover()) return

    const { strength = 0.35 } = binding.value ?? {}

    const onMove = (event: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const relX = event.clientX - (rect.left + rect.width / 2)
      const relY = event.clientY - (rect.top + rect.height / 2)

      gsap.to(el, {
        x: relX * strength,
        y: relY * strength,
        duration: 0.4,
        ease: 'power2.out',
      })
    }

    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' })
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
