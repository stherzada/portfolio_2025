<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { Menu, X, ArrowUp, ArrowLeft, Home } from 'lucide-vue-next'
import ThemeToggle from './ThemeToggle.vue'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const isInitialized = ref(false)

const isBlogPage = computed(() => route.path === '/blog')
const isBlogPostPage = computed(() => route.path.startsWith('/blog/') && route.path !== '/blog')

const navigateToHome = () => {
  router.push('/')
}

const navigateToBlog = () => {
  router.push('/blog')
}

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
    class="navbar sticky top-0 inset-x-0 px-4 md:px-6 py-2 md:py-3 flex justify-between items-center shadow-sm backdrop-blur supports-[backdrop-filter]:bg-base-100/60 z-50">
    <button @click="isBlogPostPage ? navigateToBlog() : isBlogPage ? navigateToHome() : (isMenuOpen = !isMenuOpen)"
      class="text-primary lg:hidden"
      :aria-label="isBlogPostPage ? 'Voltar ao blog' : isBlogPage ? 'Ir para home' : 'Toggle menu'">
      <ArrowLeft v-if="isBlogPostPage" class="h-6 w-6" aria-hidden="true" />
      <Home v-else-if="isBlogPage" class="h-6 w-6" aria-hidden="true" />
      <Menu v-else-if="!isMenuOpen" class="h-6 w-6" aria-hidden="true" />
      <X v-else class="h-6 w-6" aria-hidden="true" />
    </button>

    <div class="hidden lg:flex lg:gap-6">
      <template v-if="isBlogPostPage">
        <button @click="navigateToBlog"
          class="text-primary cursor-pointer font-medium transition duration-200 link-underline">
          <span class="flex items-center gap-2">
            <ArrowLeft class="h-4 w-4" />
            {{ t('nav.writing') }}
          </span>
        </button>
      </template>
      <template v-else-if="isBlogPage">
        <a @click="navigateToHome"
          class="text-primary cursor-pointer font-medium transition duration-200 link-underline">
          {{ t('nav.home') }}
        </a>
      </template>
      <template v-else>
        <a v-for="section in sections" :key="section.id" @click="scrollToSection(section.id)"
          class="text-primary cursor-pointer font-medium transition duration-200 link-underline">
          {{ t(section.label) }}
        </a>
      </template>
    </div>

    <div class="flex gap-2 md:gap-3 ml-auto">
      <div class="flex items-center gap-1 language-selector">
        <button @click="setLanguage('pt')"
          class="text-primary px-1 md:px-2 py-1 text-xs md:text-sm transition duration-200 link-underline cursor-pointer"
          :class="{ 'font-bold active': locale === 'pt', 'opacity-50': locale !== 'pt' }">
          PT
        </button>
        <span class="opacity-50 text-xs md:text-sm">/</span>
        <button @click="setLanguage('en')"
          class="text-primary px-1 md:px-2 py-1 text-xs md:text-sm transition duration-200 link-underline cursor-pointer"
          :class="{ 'font-bold active': locale === 'en', 'opacity-50': locale !== 'en' }">
          EN
        </button>
      </div>

      <ThemeToggle />
    </div>
  </nav>

  <div v-if="isMenuOpen && !isBlogPostPage && !isBlogPage" class="fixed inset-0 z-40 lg:hidden" @click="isMenuOpen = false" />
  <div v-if="!isBlogPostPage && !isBlogPage" :class="[
    'text-primary fixed top-0 right-0 h-full w-64 shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:hidden border-l mobile-menu',
    isMenuOpen ? 'translate-x-0' : 'translate-x-full'
  ]">
    <div class="flex flex-col gap-4 p-4 md:p-6 pt-16 md:pt-20">
      <a v-for="section in sections" :key="section.id" @click="scrollToSection(section.id)"
        class="text-primary cursor-pointer font-medium transition duration-200 text-lg md:text-2xl">
        {{ t(section.label) }}
      </a>
    </div>
  </div>

  <button v-show="showScrollTop" @click="scrollToTop"
    class="text-primary scroll-top-button fixed bottom-6 right-6 p-2 rounded-full shadow-lg transition-all duration-300 opacity-70 hover:opacity-100 z-50 cursor-pointer"
    aria-label="Voltar ao topo">
    <ArrowUp class="h-5 w-5" />
  </button>
</template>

