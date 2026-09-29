<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import TerminalOverlay from './components/TerminalOverlay.vue'
import { useKonami } from './composables/useKonami'
import { isTerminalOpen, useTerminalTrigger } from './composables/useTerminal'
import { destroyCharacter } from './composables/useDestroyMode'

// Easter egg (`sudo rm -rf /` in the terminal): only downloaded when triggered.
const DestroyMode = defineAsyncComponent(() => import('./components/DestroyMode.vue'))

const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))

useKonami()
useTerminalTrigger()
</script>

<template>
  <div :class="isAdminRoute ? 'min-h-screen' : 'mx-auto pt-20 md:pt-24'">
    <NavBar v-if="!isAdminRoute" />
    <RouterView />
    <Footer v-if="!isAdminRoute" />
    <TerminalOverlay v-if="isTerminalOpen" />
    <DestroyMode v-if="destroyCharacter" :character="destroyCharacter" />
  </div>
</template>
