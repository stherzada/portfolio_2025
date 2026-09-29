import { ref } from 'vue'

export type DestroyCharacter = 'kaiju' | 'cat'

/**
 * Module-level singleton for the `sudo rm -rf /` easter egg. Intentionally
 * in-memory only: there is no way to stop it, reloading the page restores
 * the site.
 */
export const destroyCharacter = ref<DestroyCharacter | null>(null)

export function startDestroyMode(kind: DestroyCharacter) {
  destroyCharacter.value = kind
}
