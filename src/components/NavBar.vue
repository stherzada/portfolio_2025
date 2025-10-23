<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Menu, X, ArrowUp } from 'lucide-vue-next'
import ThemeToggle from './ThemeToggle.vue'

const { t, locale } = useI18n()
const isInitialized = ref(false)

const setLanguage = (lang: 'en' | 'pt') => {
  if (!isInitialized.value) return
  locale.value = lang
  localStorage.setItem('language', lang)
}

const showScrollTop = ref(false)

const checkScroll = () => {
  showScrollTop.value = window.scrollY > 500
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  const savedLanguage = localStorage.getItem('language')
  locale.value = savedLanguage ? (savedLanguage as 'en' | 'pt') : 'en'

  window.addEventListener('scroll', checkScroll)
  isInitialized.value = true
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
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
    class="navbar sticky top-0 inset-x-0 px-6 py-3 flex justify-between items-center shadow-sm backdrop-blur supports-[backdrop-filter]:bg-base-100/60 z-50">
    <button @click="isMenuOpen = !isMenuOpen"
      class="text-primary lg:hidden"
      aria-label="Toggle menu">
      <Menu v-if="!isMenuOpen" class="h-6 w-6" aria-hidden="true" />
      <X v-else class="h-6 w-6" aria-hidden="true" />
    </button>

    <div class="hidden lg:flex lg:gap-6">
      <a v-for="section in sections" :key="section.id" @click="scrollToSection(section.id)"
        class="text-primary cursor-pointer font-medium transition duration-200 link-underline">
        {{ t(section.label) }}
      </a>
    </div>

    <div class="flex gap-3 ml-auto">
      <div class="flex items-center gap-1 language-selector">
        <button @click="setLanguage('pt')"
          class="text-primary px-2 py-1 transition duration-200 link-underline cursor-pointer"
          :class="{ 'font-bold active': locale === 'pt', 'opacity-50': locale !== 'pt' }">
          PT
        </button>
        <span class="opacity-50">/</span>
        <button @click="setLanguage('en')"
          class="text-primary px-2 py-1 transition duration-200 link-underline cursor-pointer"
          :class="{ 'font-bold active': locale === 'en', 'opacity-50': locale !== 'en' }">
          EN
        </button>
      </div>

      <ThemeToggle />
    </div>
  </nav>

  <div v-if="isMenuOpen" class="fixed inset-0 z-40 lg:hidden" @click="isMenuOpen = false" />
  <div :class="[
    'text-primary fixed top-0 right-0 h-full w-64 shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:hidden border-l mobile-menu',
    isMenuOpen ? 'translate-x-0' : 'translate-x-full'
  ]">
    <div class="flex flex-col gap-4 p-6 pt-20">
      <a v-for="section in sections" :key="section.id" @click="scrollToSection(section.id)"
        class="text-primary cursor-pointer font-medium transition duration-200 md:text-lg text-2xl">
        {{ t(section.label) }}
      </a>
    </div>
  </div>

  <button v-show="showScrollTop" @click="scrollToTop"
    class="text-primary scroll-top-button fixed bottom-6 right-6 p-2 rounded-full shadow-lg transition-all duration-300 opacity-70 hover:opacity-100 z-50"
    aria-label="Voltar ao topo">
    <ArrowUp class="h-5 w-5" />
  </button>
</template>

