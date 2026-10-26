<script setup lang="ts">

import { defineAsyncComponent } from 'vue'
import About from '../components/About.vue'
import Experience from '../components/Experience.vue'
import Blog from '../components/Blog.vue'
import { useScrollPosition } from '../composables/useScrollPosition'

const Projects = defineAsyncComponent(() => import('../components/Projects.vue'))

useScrollPosition()
</script>

<template>
    <main>
      <About />
      <Experience />
      <Blog />
      <Projects />
    </main>
</template>
