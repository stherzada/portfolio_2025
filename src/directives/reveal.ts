import type { Directive } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../composables/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

export interface RevealOptions {
  /** Extra delay in seconds, e.g. for staggering a list. */
  delay?: number
  /** Starting vertical offset in pixels. */
  y?: number
  duration?: number
  /** ScrollTrigger `start` value. */
  start?: string
  /** Reveal the element's children one after another (seconds between each). */
  stagger?: number
}

type RevealValue = RevealOptions | number | undefined

function resolveOptions(value: RevealValue): RevealOptions {
  if (typeof value === 'number') return { delay: value }
  return value ?? {}
}

const triggers = new WeakMap<HTMLElement, ScrollTrigger>()

// Async content (posts, projects) mounting later shifts the layout under
// triggers that were already measured; re-measure once per batch of mounts.
let refreshScheduled = false
function scheduleRefresh() {
  if (refreshScheduled) return
  refreshScheduled = true
  requestAnimationFrame(() => {
    refreshScheduled = false
    ScrollTrigger.refresh()
  })
}

/**
 * `v-reveal` — Apple-style scroll reveal (fade + rise) driven by
 * GSAP ScrollTrigger, matching the codebase's existing `fadeIn` easing.
 * Honors `prefers-reduced-motion` and cancels the global `.animate-fade-in`
 * / `article` CSS keyframe so the two don't fight over `opacity`.
 */
export const reveal: Directive<HTMLElement, RevealValue> = {
  mounted(el, binding) {
    const { delay = 0, y = 24, duration = 0.8, start = 'top 85%', stagger } = resolveOptions(binding.value)
    const targets = stagger ? Array.from(el.children) : el

    // Prevent the global CSS `fadeIn` keyframe (see style.css) from also
    // driving opacity on this element.
    el.style.animation = 'none'

    if (prefersReducedMotion()) {
      el.style.opacity = '1'
      el.style.transform = 'none'
      return
    }

    gsap.set(targets, { opacity: 0, y })

    const trigger = ScrollTrigger.create({
      trigger: el,
      start,
      once: true,
      onEnter: () => {
        gsap.to(targets, {
          opacity: 1,
          y: 0,
          duration,
          delay,
          stagger,
          ease: 'power3.out',
        })
      },
    })

    triggers.set(el, trigger)
    scheduleRefresh()
  },
  unmounted(el) {
    triggers.get(el)?.kill()
    triggers.delete(el)
  },
}
