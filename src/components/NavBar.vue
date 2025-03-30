<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDark, useToggle } from '@vueuse/core'
import { Sun, Moon, Menu, X } from 'lucide-vue-next'

const { t, locale } = useI18n()
const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: 'light',
  storageKey: 'theme',
  storage: localStorage,
})
const toggleDark = useToggle(isDark)
const isInitialized = ref(false)

const setLanguage = (lang: 'en' | 'pt') => {
  if (!isInitialized.value) return
  locale.value = lang
  localStorage.setItem('language', lang)
}

onMounted(() => {
  // Define inglês como padrão se não houver linguagem salva
  const savedLanguage = localStorage.getItem('language')
  locale.value = savedLanguage ? (savedLanguage as 'en' | 'pt') : 'en'

  // Verifica o tema
  const savedTheme = localStorage.getItem('theme')
  if (!savedTheme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = prefersDark
  }

  // Marca como inicializado após definir os valores iniciais
  isInitialized.value = true
})

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
  <nav v-show="isInitialized"
    class="sticky top-0 inset-x-0 px-6 py-3 flex justify-between items-center bg-white dark:bg-neutral-900 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-900/60 z-50">
    <button @click="isMenuOpen = !isMenuOpen"
      class="lg:hidden text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
      aria-label="Toggle menu">
      <Menu v-if="!isMenuOpen" class="h-6 w-6" aria-hidden="true" />
      <X v-else class="h-6 w-6" aria-hidden="true" />
    </button>

    <div class="hidden lg:flex lg:gap-6">
      <a v-for="section in sections" :key="section.id" @click="scrollToSection(section.id)"
        class="cursor-pointer text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white font-medium transition duration-200 hover-underline">
        {{ t(section.label) }}
      </a>
    </div>

    <div class="flex gap-3 ml-auto">
      <div class="flex items-center gap-1 text-neutral-700 dark:text-neutral-300">
        <button @click="setLanguage('pt')"
          class="px-2 py-1 transition duration-200 hover:text-neutral-900 dark:hover:text-white hover-underline"
          :class="{ 'font-bold text-neutral-900 dark:text-white': locale === 'pt', 'opacity-50': locale !== 'pt' }">
          PT
        </button>
        <span class="opacity-50">/</span>
        <button @click="setLanguage('en')"
          class="px-2 py-1 transition duration-200 hover:text-neutral-900 dark:hover:text-white hover-underline"
          :class="{ 'font-bold text-neutral-900 dark:text-white': locale === 'en', 'opacity-50': locale !== 'en' }">
          EN
        </button>
      </div>

      <button @click="toggleDark()"
        class="p-2 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition duration-200"
        aria-label="Toggle theme">
        <Moon v-if="isDark" class="h-5 w-5" aria-hidden="true" />
        <Sun v-else class="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  </nav>

  <div v-if="isMenuOpen" class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" @click="isMenuOpen = false" />
  <div :class="[
    'fixed top-0 right-0 h-full w-64 bg-white dark:bg-neutral-900 shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:hidden',
    isMenuOpen ? 'translate-x-0' : 'translate-x-full'
  ]">
    <div class="flex flex-col gap-4 p-6 pt-20">
      <a v-for="section in sections" :key="section.id" @click="scrollToSection(section.id)"
        class="cursor-pointer text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white font-medium transition duration-200 hover-underline md:text-lg text-2xl">
        {{ t(section.label) }}
      </a>
    </div>
  </div>
</template>
