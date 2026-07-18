import { ref } from 'vue'

const BURST_DURATION_MS = 3000

/**
 * Module-level singleton so any component (the Konami listener, the
 * particle field itself) can trigger/observe the easter-egg burst without
 * prop drilling.
 */
export const particleBurstActive = ref(false)

let resetTimeout: ReturnType<typeof setTimeout> | null = null

export function triggerParticleBurst() {
  particleBurstActive.value = true

  if (resetTimeout) clearTimeout(resetTimeout)
  resetTimeout = setTimeout(() => {
    particleBurstActive.value = false
    resetTimeout = null
  }, BURST_DURATION_MS)
}
