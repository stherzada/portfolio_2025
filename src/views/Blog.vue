<script setup lang="ts">
import store from '../store'

const getWordCount = (text: string) => {
    return text.split(' ').length
}
</script>

<template>
  <div class="container mx-auto">
    <main class="flex flex-col items-center justify-center"> 
        <div class="my-10 text-center">
            <h1 class="text-4xl font-bold text-primary">Stherzada, blog :D </h1>
            <p class="text-lg text-primary mt-4">Here you can find my thoughts and ideas about technology, programming, and other topics.</p>
        </div>
        <div class="flex flex-col gap-4 ">
        <div v-for="post in store.blogPosts" :key="post.id" @click="$router.push(`/blog/${post.id}`)">
            <h2>{{ post.title }}</h2>
            <p>{{ getWordCount(post.description) }} words</p>
            <p>{{ post.date.toLocaleDateString() }}</p>
        </div>
        </div>
    </main>
  </div>
</template>