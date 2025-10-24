<script setup lang="ts">

import { defineAsyncComponent } from 'vue'
import About from '../components/About.vue'
import { useScrollPosition } from '../composables/useScrollPosition'

const Projects = defineAsyncComponent(() => import('../components/Projects.vue'))


useScrollPosition()
</script>

<template>
    <main>
      <About />
      <Blog />
      <Projects />
     
    </main>
</template>
