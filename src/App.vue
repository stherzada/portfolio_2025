<script setup lang="ts">

import { defineAsyncComponent } from 'vue'
import NavBar from './components/NavBar.vue'
import About from './components/About.vue'
import Footer from './components/Footer.vue'
import { useScrollPosition } from './composables/useScrollPosition'

const Projects = defineAsyncComponent(() => import('./components/Projects.vue'))
const Blog = defineAsyncComponent(() => import('./components/Blog.vue'))

useScrollPosition()
</script>

<template>
  <div>
    <NavBar />
    <main>
      <About />
      <Projects />
      <Blog />
    </main>
    <Footer />
  </div>
</template>
