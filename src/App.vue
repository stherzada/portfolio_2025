<script setup lang="ts">
import NavBar from './components/NavBar.vue'
import About from './components/About.vue'
import Projects from './components/Projects.vue'
import Footer from './components/Footer.vue'
import Blog from './components/Blog.vue'
</script>

<template>
  <div class=" bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300">
    <NavBar />
    <main>
      <About />
      <Projects />
      <Blog />
    </main>
    <Footer />
  </div>
</template>
