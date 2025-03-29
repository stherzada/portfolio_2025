<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDark, useToggle } from '@vueuse/core'

const { t, locale } = useI18n()
const isDark = useDark()
const toggleDark = useToggle(isDark)
const isMenuOpen = ref(false)

const sections = [
  { id: 'home', label: 'nav.home' },
  { id: 'about', label: 'nav.about' },
  { id: 'projects', label: 'nav.projects' },
  { id: 'writing', label: 'nav.writing' }
]

const scrollToSection = (id: string) => {
  const element = document.getElementById(id)
  element?.scrollIntoView({ behavior: 'smooth' })
  isMenuOpen.value = false
}

</script>

<template>
  <nav class="sticky top-0 inset-x-0 px-6 py-3 flex justify-between items-center bg-white dark:bg-neutral-900 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-900/60 z-50">
    <button 
      @click="isMenuOpen = !isMenuOpen"
      class="lg:hidden text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="h-6 w-6" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          v-if="!isMenuOpen"
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M4 6h16M4 12h16M4 18h16"
        />
        <path 
          v-else
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>

    <div class="hidden lg:flex lg:gap-6">
      <a 
        v-for="section in sections" 
        :key="section.id"
        @click="scrollToSection(section.id)"
        class="cursor-pointer text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white font-medium transition duration-200 relative group"
      >
        {{ t(section.label) }}
        <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-neutral-900 dark:bg-white transition-all duration-300 ease-in-out group-hover:w-full"></span>
      </a>
    </div>
    
    <div class="flex gap-3 ml-auto">
      <div class="flex items-center gap-1 text-neutral-700 dark:text-neutral-300">
        <button 
          @click="locale = 'pt'"
          class="px-2 py-1 transition duration-200 hover:text-neutral-900 dark:hover:text-white relative group"
          :class="{ 'font-bold text-neutral-900 dark:text-white': locale === 'pt', 'opacity-50': locale !== 'pt' }"
        >
          PT
          <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-neutral-900 dark:bg-white transition-all duration-300 ease-in-out group-hover:w-full"></span>
        </button>
        <span class="opacity-50">/</span>
        <button 
          @click="locale = 'en'"
          class="px-2 py-1 transition duration-200 hover:text-neutral-900 dark:hover:text-white relative group"
          :class="{ 'font-bold text-neutral-900 dark:text-white': locale === 'en', 'opacity-50': locale !== 'en' }"
        >
          EN
          <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-neutral-900 dark:bg-white transition-all duration-300 ease-in-out group-hover:w-full"></span>
        </button>
      </div>
      
      <button 
        @click="toggleDark()" 
        class="p-2 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition duration-200"
        aria-label="Toggle theme"
      >
        <svg
          v-if="isDark"
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>
    </div>
  </nav>

  <div 
    v-if="isMenuOpen"
    class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
    @click="isMenuOpen = false"
  />
  <div
    :class="[
      'fixed top-0 right-0 h-full w-64 bg-white dark:bg-neutral-900 shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:hidden',
      isMenuOpen ? 'translate-x-0' : 'translate-x-full'
    ]"
  >
    <div class="flex flex-col gap-4 p-6 pt-20">
      <a 
        v-for="section in sections" 
        :key="section.id"
        @click="scrollToSection(section.id)"
        class="cursor-pointer text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white font-medium transition duration-200 relative group"
      >
        {{ t(section.label) }}
        <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-neutral-900 dark:bg-white transition-all duration-300 ease-in-out group-hover:w-full"></span>
      </a>
    </div>
  </div>
</template>

