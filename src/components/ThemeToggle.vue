<template>
  <button
    ref="buttonRef"
    @click="toggleSwitchTheme"
    aria-label="Toggle theme"
    class="theme-toggle-button p-2 rounded transition-all duration-300 ease-out hover:scale-110 active:scale-95 cursor-pointer relative overflow-hidden"
  >
      <div class="relative z-10 transition-transform duration-500" :class="isDarkMode ? 'rotate-0' : 'rotate-360'">
        <Sun
          v-if="isDarkMode"
          class="h-6 w-6 transition-colors duration-300"
          stroke-width="2"
        />
        <Moon
          v-else
          class="h-6 w-6 transition-colors duration-300"
          stroke-width="2"
        />
      </div>
  </button>
</template>

<script setup lang="ts">

import { useTheme, ThemeAnimationType } from '../composables/useTheme'
import { onMounted } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'

const { buttonRef, toggleSwitchTheme, isDarkMode } = useTheme({
  onDarkModeChange: (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  },
  animationType: ThemeAnimationType.CIRCLE,
  duration: 500,
})

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark')
  }
})
</script>

<style scoped>
.theme-toggle-button {
  background-color: var(--color-base-200);
  color: var(--color-base-content);
}

.theme-toggle-button:hover {
  background-color: var(--color-base-300);
}

.theme-toggle-button svg {
  color: var(--color-accent);
}
</style>