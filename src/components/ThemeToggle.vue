
<script setup lang="ts">

import { useTheme, ThemeAnimationType } from '../composables/useTheme'
import type { ComponentPublicInstance } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'

const { buttonRef, toggleSwitchTheme, isDarkMode } = useTheme({
  onDarkModeChange: (isDark: boolean) => {
    document.documentElement.classList.toggle('dark', isDark)
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light')
    } catch {
      // Private mode / blocked storage: the toggle still works for this visit.
    }
  },
  animationType: ThemeAnimationType.CIRCLE,
  duration: 500,
})

const setButtonRef = (el: Element | ComponentPublicInstance | null) => {
  buttonRef.value = el instanceof HTMLElement ? el : null
}
</script>

<template>
  <button
    :ref="setButtonRef"
    @click="toggleSwitchTheme"
    aria-label="Dark mode"
    :aria-pressed="isDarkMode"
    class="theme-toggle-button w-9 h-9 shrink-0 flex items-center justify-center rounded-full transition-all duration-300 ease-out hover:scale-110 active:scale-95 cursor-pointer relative overflow-hidden"
  >
      <div class="relative z-10 transition-transform duration-500" :class="isDarkMode ? 'rotate-0' : 'rotate-360'">
        <Sun
          v-if="isDarkMode"
          class="h-[18px] w-[18px] transition-colors duration-300"
          stroke-width="2"
        />
        <Moon
          v-else
          class="h-[18px] w-[18px] transition-colors duration-300"
          stroke-width="2"
        />
      </div>
  </button>
</template>
