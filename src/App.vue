<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import { useKonami } from './composables/useKonami'

const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))

// Easter egg: Konami code triggers a particle burst on the home hero.
useKonami()
</script>

<template>
  <div :class="isAdminRoute ? 'min-h-screen' : 'container mx-auto pt-20 md:pt-24'">
    <NavBar v-if="!isAdminRoute" />
    <RouterView />
    <Footer v-if="!isAdminRoute" />
  </div>
</template>
