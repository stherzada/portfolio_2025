<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'

const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
</script>

<template>
  <div :class="isAdminRoute ? 'min-h-screen' : 'container mx-auto'">
    <NavBar v-if="!isAdminRoute" />
    <RouterView />
    <Footer v-if="!isAdminRoute" />
  </div>
</template>
