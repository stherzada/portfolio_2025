<script setup lang="ts">
import store from '../store';
import { useRoute } from 'vue-router';

const route = useRoute()
const post = store.blogPosts.find((post) => post.id === parseInt(route.params.id as string))
</script>

<template>
  <div>
    <main class=" flex  flex-col items-center justify-center">
      <h1 class="text-4xl font-bold text-primary">{{ post?.title }}</h1>
      <p class="text-lg text-primary">{{ post?.description }}</p>
      <p class="text-lg text-primary">{{ post?.date.toLocaleDateString() }}</p>
    </main>
  </div>
</template>