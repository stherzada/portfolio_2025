import { useMediaQuery } from '@vueuse/core'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Non-reactive check for use outside setup() (e.g. custom directives),
 * mirroring the reactive `useReducedMotion` below.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

/**
 * Reactive `prefers-reduced-motion` flag for use inside components/composables.
 */
export function useReducedMotion() {
  return useMediaQuery(REDUCED_MOTION_QUERY)
}
