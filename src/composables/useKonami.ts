import { onMounted, onUnmounted } from 'vue'
import { triggerParticleBurst } from './useParticleBurst'

// ↑ ↑ ↓ ↓ ← → ← → B A
const KONAMI_SEQUENCE = [
  'arrowup',
  'arrowup',
  'arrowdown',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowleft',
  'arrowright',
  'b',
  'a',
]

/**
 * Listens for the Konami code anywhere on the page and, when completed,
 * triggers the straw-hat particle burst easter egg (see useParticleBurst).
 */
export function useKonami() {
  let position = 0

  const handleKeydown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase()
    const expected = KONAMI_SEQUENCE[position]

    if (key === expected) {
      position += 1
      if (position === KONAMI_SEQUENCE.length) {
        position = 0
        triggerParticleBurst()
      }
    } else {
      position = key === KONAMI_SEQUENCE[0] ? 1 : 0
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
}
