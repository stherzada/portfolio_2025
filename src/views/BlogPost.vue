<script setup lang="ts">
import store from '../store'
import { useRoute } from 'vue-router'
import type { Post } from '../types'
import supabase from '../supabase'
import { ref } from 'vue'

const route = useRoute()

const post = ref<Post | null>(null)

const fetchPost = async (id: string) => {
  const found = store.posts.find((post: Post) => post.id === parseInt(id))
  if (found) {
    return found
  }
  const { data, error } = await supabase
    .from('posts')
    .select("*")
    .eq('id', id)
    .single()

   
  if (error) {
    console.error('Error fetching post:', error)
    return
  }

  post.value = data
}

fetchPost(route.params.id as string)
</script>

<template>
  <div>
    <main class=" flex  flex-col items-center justify-center">
      <h1 class="text-4xl font-bold text-primary">{{ post?.title }}</h1>
      <p class="text-lg text-primary">{{ post?.description }}</p>
      <p class="text-lg text-primary">{{ post?.created_at ? new Date(post.created_at).toLocaleDateString() : '' }}</p>
      <p class="text-lg text-primary">{{ post?.content }}</p>
    </main>
  </div>
</template>