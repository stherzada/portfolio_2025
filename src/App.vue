<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import TerminalOverlay from './components/TerminalOverlay.vue'
import { useKonami } from './composables/useKonami'
import { isTerminalOpen, useTerminalTrigger } from './composables/useTerminal'

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
  </div>
</template>
