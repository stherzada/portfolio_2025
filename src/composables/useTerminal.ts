import { onMounted, onUnmounted, ref } from 'vue'
export const isTerminalOpen = ref(false)

export function openTerminal() {
  isTerminalOpen.value = true
}

export function closeTerminal() {
  isTerminalOpen.value = false
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
}


export function useTerminalTrigger() {
  const handleKeydown = (event: KeyboardEvent) => {
    if (isTerminalOpen.value) return
    if (event.key !== '/' || isTypingTarget(event.target)) return
    event.preventDefault()
    openTerminal()
  }

  onMounted(() => window.addEventListener('keydown', handleKeydown))
  onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
}
