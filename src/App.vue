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
// The 404 is a standalone full-viewport screen: no nav (its section links
// only work on the home page) and no footer; `$ cd ~` is the way back.
const isNotFound = computed(() => route.name === 'NotFound')
const hideChrome = computed(() => isAdminRoute.value || isNotFound.value)

useKonami()
useTerminalTrigger()
</script>

<template>
  <div :class="hideChrome ? 'min-h-screen' : 'mx-auto pt-20 md:pt-24'">
    <NavBar v-if="!hideChrome" />
    <RouterView />
    <Footer v-if="!hideChrome" />
    <TerminalOverlay v-if="isTerminalOpen" />
    <DestroyMode v-if="destroyCharacter" :character="destroyCharacter" />
  </div>
</template>
