<script setup lang="ts">
import supabase from '../supabase'
import { store } from '../store'
import type { Post } from '../types'

const fetchPosts = async () => {
    const { data: posts, error } = await supabase
        .from('posts')
        .select("*")

    if (error) {
        console.error('Error fetching posts:', error)
        store.posts = []
        return
    }
    store.posts = (posts as Post[]) || []
}

const getWordCount = (text: string): number => {
    return text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}

fetchPosts()
</script>

<template>
    <div class="container mx-auto">
        <main class="flex flex-col items-center justify-center">
            <div class="my-10 text-center">
                <h1 class="text-4xl font-bold text-primary">Stherzada, blog :D </h1>
                <p class="text-lg text-primary mt-4">Here you can find my thoughts and ideas about technology,
                    programming, and other topics.</p>
            </div>
            <div class="flex flex-col gap-4 ">
                 <div v-for="post in store.posts" :key="post.id" @click="$router.push(`/blog/${post.id}`)">
                    <h2>{{ post.title }}</h2>
                    <p>{{ getWordCount(post.content) }} words</p>
                    <p>{{ post.description }}</p>
                    <p>{{ new Date(post.created_at).toLocaleDateString() }}</p>
                </div>
            </div>
        </main>
    </div>
</template>