<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { Menu, X, ChevronUp, ArrowLeft, Home } from 'lucide-vue-next'
import ThemeToggle from './ThemeToggle.vue'
import { clearSavedScrollPosition } from '../composables/useScrollPosition'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const isBlogPage = computed(() => route.path === '/blog')
const isBlogPostPage = computed(() => route.path.startsWith('/blog/') && route.path !== '/blog')
const isHomeRoute = computed(() => route.path === '/')

const navigateToHome = () => {
  // Otherwise Home's scroll-restoration (meant for browser back/forward)
  // would override this intentional "go to top" click.
  clearSavedScrollPosition()
  router.push('/')
}

const navigateToBlog = () => {
  router.push('/blog')
}

const setLanguage = (lang: 'en' | 'pt') => {
  locale.value = lang
  try {
    localStorage.setItem('language', lang)
  } catch {
    // Storage blocked: the choice still applies for this visit.
  }
}

const showScrollTop = ref(false)
const isScrolled = ref(false)

// "Home" doubles as "About" — the hero section they'd both point to is the
// same place, so a separate About link was redundant (and confusing: two
// items landing in virtually the same scroll position).
// Order matches the actual page layout (About → Blog → Projects).
const sections = [
  { id: 'home', label: 'nav.home' },
  { id: 'writing', label: 'nav.writing' },
  { id: 'projects', label: 'nav.projects' },
]

const activeSection = ref('home')
const NAV_OFFSET = 120

const updateScrollState = () => {
  const scrollY = window.scrollY
  showScrollTop.value = scrollY > 500
  isScrolled.value = scrollY > 40

  if (!isHomeRoute.value) return

  // "About" starts right under the fixed nav (barely past NAV_OFFSET even
  // at the very top of the page), so without this guard it would win
  // immediately and "home" would never show as active.
  if (scrollY < 20) {
    activeSection.value = 'home'
    return
  }

  // Pick whichever section's top is closest to (but past) the nav offset —
  // order-independent, so it doesn't matter that the nav's link order
  // (about/projects/writing) differs from the page's actual DOM order
  // (about/writing/projects).
  let current = 'home'
  let bestTop = -Infinity
  for (const section of sections) {
    if (section.id === 'home') continue
    const el = document.getElementById(section.id)
    if (!el) continue
    const top = el.getBoundingClientRect().top - NAV_OFFSET
    if (top <= 0 && top > bestTop) {
      bestTop = top
      current = section.id
    }
  }
  activeSection.value = current
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const isMenuOpen = ref(false)
const hasMobileMenu = computed(() => !isBlogPostPage.value && !isBlogPage.value)

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isMenuOpen.value) isMenuOpen.value = false
}

onMounted(() => {
  window.addEventListener('scroll', updateScrollState, { passive: true })
  window.addEventListener('keydown', handleKeydown)
  updateScrollState()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateScrollState)
  window.removeEventListener('keydown', handleKeydown)
})

const scrollToSection = (id: string) => {
  isMenuOpen.value = false
  if (id === 'home') {
    clearSavedScrollPosition()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  const element = document.getElementById(id)
  element?.scrollIntoView({ behavior: 'smooth' })
}
</script>


<template>
  <div class="fixed top-0 inset-x-0 z-50 flex justify-center px-3 pt-3 md:pt-4 pointer-events-none">
    <nav
      class="nav-pill pointer-events-auto flex items-center gap-1 rounded-full border backdrop-blur-xl transition-all duration-500 ease-out"
      :class="isScrolled ? 'px-2 py-1.5 gap-1 shadow-lg' : 'px-3 py-2 gap-2 shadow-sm'">
      <button
        @click="isBlogPostPage ? navigateToBlog() : isBlogPage ? navigateToHome() : (isMenuOpen = !isMenuOpen)"
        class="text-primary flex items-center justify-center rounded-full w-9 h-9 shrink-0 lg:hidden"
        :aria-label="isBlogPostPage ? t('nav.backToBlog') : isBlogPage ? t('nav.home') : t('nav.menu')"
        :aria-expanded="hasMobileMenu ? isMenuOpen : undefined"
        :aria-controls="hasMobileMenu ? 'mobile-menu' : undefined">
        <ArrowLeft v-if="isBlogPostPage" class="h-5 w-5" aria-hidden="true" />
        <Home v-else-if="isBlogPage" class="h-5 w-5" aria-hidden="true" />
        <Menu v-else-if="!isMenuOpen" class="h-5 w-5" aria-hidden="true" />
        <X v-else class="h-5 w-5" aria-hidden="true" />
      </button>


      <div class="hidden lg:flex lg:items-center lg:gap-1">
        <template v-if="isBlogPostPage">
          <button @click="navigateToBlog"
            class="nav-link flex items-center gap-1.5 font-mono text-xs tracking-wider uppercase px-3 py-1.5 rounded-full cursor-pointer text-primary">
            <ArrowLeft class="h-3.5 w-3.5" aria-hidden="true" />
            {{ t('nav.writing') }}
          </button>
        </template>
        <template v-else-if="isBlogPage">
          <router-link to="/" @click="clearSavedScrollPosition"
            class="nav-link flex items-center gap-1.5 font-mono text-xs tracking-wider uppercase px-3 py-1.5 rounded-full cursor-pointer text-primary">
            {{ t('nav.home') }}
          </router-link>
        </template>
        <template v-else>
          <button v-for="section in sections" :key="section.id" type="button" @click="scrollToSection(section.id)"
            :aria-current="activeSection === section.id ? 'location' : undefined"
            class="nav-link flex items-center gap-1.5 font-mono text-xs tracking-wider uppercase px-3 py-1.5 rounded-full cursor-pointer text-primary">
            <span class="nav-dot rounded-full transition-all duration-300"
              :class="activeSection === section.id ? 'nav-dot-active' : ''" aria-hidden="true" />
            {{ t(section.label) }}
          </button>
        </template>
      </div>

      <div class="flex items-center gap-1 md:gap-2 ml-auto lg:ml-2">
          <span class="hidden lg:inline text-primary opacity-30 font-mono" aria-hidden="true">|</span>

        <template v-if="!isMenuOpen">
          <div class="hidden sm:flex items-center gap-1 font-mono text-xs">
            <button @click="setLanguage('pt')" class="px-1.5 py-1 rounded-full cursor-pointer transition-opacity"
              lang="pt-BR" aria-label="Português" :aria-pressed="locale === 'pt'"
              :class="locale === 'pt' ? 'text-primary opacity-100 font-semibold' : 'text-primary opacity-60 hover:opacity-80'">
              PT
            </button>
            <span class="opacity-30 text-primary" aria-hidden="true">/</span>
            <button @click="setLanguage('en')" class="px-1.5 py-1 rounded-full cursor-pointer transition-opacity"
              lang="en" aria-label="English" :aria-pressed="locale === 'en'"
              :class="locale === 'en' ? 'text-primary opacity-100 font-semibold' : 'text-primary opacity-60 hover:opacity-80'">
              EN
            </button>
          </div>

          <span class="hidden sm:inline text-primary opacity-30 font-mono" aria-hidden="true">|</span>
        </template>

        <ThemeToggle />
      </div>
    </nav>
  </div>

  <div v-if="isMenuOpen && hasMobileMenu" class="fixed inset-0 z-40 lg:hidden bg-black/20 backdrop-blur-sm"
    @click="isMenuOpen = false" />
  <!-- inert while closed: it's only translated off-screen, so its controls would still be tabbable. -->
  <div v-if="hasMobileMenu" id="mobile-menu" :inert="!isMenuOpen" :aria-hidden="!isMenuOpen" :class="[
    'mobile-menu text-primary fixed top-0 right-0 h-full w-72 shadow-2xl transform transition-transform duration-500 ease-out z-50 lg:hidden border-l',
    isMenuOpen ? 'translate-x-0' : 'translate-x-full'
  ]">
    <div class="flex flex-col gap-2 p-6 pt-24">
      <button v-for="section in sections" :key="section.id" type="button" @click="scrollToSection(section.id)"
        :aria-current="activeSection === section.id ? 'location' : undefined"
        class="flex items-center gap-3 cursor-pointer group py-2 text-left">
        <span class="nav-dot rounded-full transition-all duration-300 shrink-0"
          :class="activeSection === section.id ? 'nav-dot-active' : ''" aria-hidden="true" />
        <span class="font-mono text-2xl tracking-tight">{{ t(section.label) }}</span>
      </button>

      <div class="mt-8 pt-6 card-divider flex items-center gap-4 font-mono text-sm">
        <button @click="setLanguage('pt')" class="cursor-pointer transition-opacity"
          lang="pt-BR" aria-label="Português" :aria-pressed="locale === 'pt'"
          :class="locale === 'pt' ? 'opacity-100 font-semibold' : 'opacity-60'">PT</button>
        <span class="opacity-30" aria-hidden="true">/</span>
        <button @click="setLanguage('en')" class="cursor-pointer transition-opacity"
          lang="en" aria-label="English" :aria-pressed="locale === 'en'"
          :class="locale === 'en' ? 'opacity-100 font-semibold' : 'opacity-60'">EN</button>
      </div>
    </div>
  </div>

  <button v-show="showScrollTop" @click="scrollToTop"
    class="text-primary scroll-top-button fixed bottom-6 right-6 w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 opacity-70 hover:opacity-100 z-50 cursor-pointer"
    :aria-label="t('nav.backToTop')">
    <ChevronUp class="h-5 w-5" aria-hidden="true" />
  </button>
</template>

<style scoped>
.nav-pill {
  background-color: color-mix(in srgb, var(--color-base-100) 72%, transparent);
  border-color: var(--color-base-300);
  flex-direction: row;
  flex-wrap: nowrap;
  width: max-content;
  max-width: 100%;
  flex-shrink: 0;
}

.nav-pill > * {
  flex-shrink: 0;
}

.nav-link {
  transition: background-color 0.25s ease;
}

.nav-link:hover {
  background-color: var(--color-base-200);
}

.nav-dot {
  width: 4px;
  height: 4px;
  background-color: var(--color-neutral);
  opacity: 0;
}

.nav-dot-active {
  opacity: 1;
  background-color: var(--color-primary);
}

</style>
