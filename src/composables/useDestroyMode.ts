import { ref } from 'vue'

export type DestroyCharacter = 'kaiju' | 'cat'

/**
 * Module-level singleton for the `sudo rm -rf /` easter egg. Intentionally
 * in-memory only: there is no way to stop it, reloading the page restores
 * the site.
 */
export const destroyCharacter = ref<DestroyCharacter | null>(null)

export function startDestroyMode(kind: DestroyCharacter) {
  // DestroyMode captures its character's DOM/physics once on mount, so
  // switching mid-rampage would leave a half-swapped sprite. First one wins.
  if (destroyCharacter.value) return
  destroyCharacter.value = kind
}
