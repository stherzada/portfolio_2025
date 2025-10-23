<script setup lang="ts">
import store from '../store'
import { useRoute } from 'vue-router'
import type { Post } from '../types'
import supabase from '../supabase'
import { ref, onMounted, watch } from 'vue'

const route = useRoute()

const post = ref<Post | null>(null)
const error = ref<string | null>(null)
const loading = ref(false)

const fetchPost = async (id: string) => {
  try {
    loading.value = true
    error.value = null
    
    const found = store.posts.find((post: Post) => post.id === id)
    if (found) {
      post.value = found
      return found
    }
    
    const { data, error: supabaseError } = await supabase
      .from('posts')
      .select("*")
      .eq('id', id)
      .single()

    if (supabaseError) {
      console.error('Error fetching post:', supabaseError)
      error.value = 'Erro ao carregar o post. Tente novamente.'
      return
    }

    post.value = data
  } catch (err) {
    console.error('Unexpected error:', err)
    error.value = 'Erro inesperado ao carregar o post.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPost(route.params.id as string)
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchPost(newId as string)
  }
})
</script>

<template>
  <div>
    <main class="flex flex-col items-center justify-center">
      <div v-if="loading" class="text-center">
        <p class="text-lg text-primary">Carregando post...</p>
      </div>
      
      <div v-else-if="error" class="text-center">
        <h1 class="text-2xl font-bold text-red-500 mb-4">Erro</h1>
        <p class="text-lg text-red-500 mb-4">{{ error }}</p>
        <button 
          @click="fetchPost(route.params.id as string)"
          class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
      
      <div v-else-if="post" class="text-center">
        <h1 class="text-4xl font-bold text-primary">{{ post.title }}</h1>
        <p class="text-lg text-primary">{{ post.description }}</p>
        <p class="text-lg text-primary">{{ post.created_at ? new Date(post.created_at).toLocaleDateString() : '' }}</p>
        <p class="text-lg text-primary">{{ post.content }}</p>
      </div>
      
      <div v-else class="text-center">
        <p class="text-lg text-primary">Post não encontrado.</p>
      </div>
    </main>
  </div>
</template>