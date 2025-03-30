<script setup lang="ts">
import NavBar from './components/NavBar.vue'
import About from './components/About.vue'
import Projects from './components/Projects.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div class=" bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">
    <NavBar />
    <main class="px-4 ">
      <About />
      <Projects />
    </main>
    <Footer />
  </div>
</template>
