<script setup lang="ts">
import store from '../store'
import { useRoute, useRouter } from 'vue-router'
import type { Post } from '../types'
import { ref, onMounted, watch } from 'vue'
import { createSlug } from '../utils/slug'
import { fetchPostByTitle } from '../services/blog'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const post = ref<Post | null>(null)
const error = ref<string | null>(null)
const loading = ref(false)

const fetchPost = async (slug: string) => {
  try {
    loading.value = true
    error.value = null

    const decodedSlug = decodeURIComponent(slug)

    if (decodedSlug.includes(' ')) {
      const newSlug = createSlug(decodedSlug)
      router.replace(`/blog/${newSlug}`)
      return
    }

    const normalizedTitle = decodedSlug.replace(/-/g, ' ')

    const found = store.posts.find((post: Post) =>
      post.title.toLowerCase() === normalizedTitle.toLowerCase()
    )
    if (found) {
      post.value = found
      return found
    }

    const data = await fetchPostByTitle(normalizedTitle)
    post.value = data
  } catch (err) {
    console.error('Unexpected error:', err)
    error.value = 'Erro inesperado ao carregar o post.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPost(route.params.title as string)
})

watch(() => route.params.title, (newTitle) => {
  if (newTitle) {
    fetchPost(newTitle as string)
  }
})
</script>

<template>
  <div class="container mx-auto">
    <main class="flex flex-col items-center justify-center">
      <div v-if="loading" class="text-center">
        <p class="text-lg text-primary">{{ t('blog.loadingPost') }}</p>
      </div>

      <div v-else-if="error" class="text-center">
        <h1 class="text-2xl font-bold text-red-500 mb-4">Erro</h1>
        <p class="text-lg text-red-500 mb-4">{{ error }}</p>
        <button @click="fetchPost(route.params.title as string)"
          class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors">
          Tentar Novamente
        </button>
      </div>

      <div v-else-if="post" class="text-center m">
        <div v-if="post.image_path" class="mb-4 overflow-hidden rounded-lg">
          <img :src="post.image_path" :alt="post.title" class="w-full h-48 object-cover rounded-lg" />
        </div>
        <h1 class="text-4xl font-bold text-primary">{{ post.title }}</h1>
        <p class="text-lg text-primary">{{ post.description }}</p>
        <p class="text-lg text-primary">{{ post.created_at ? new Date(post.created_at).toLocaleDateString() : '' }}</p>
        <article v-html="post.content"
          class="prose prose-lg prose-gray max-w-none prose-headings:text-primary prose-a:text-blue-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
        </article>
      </div>

      <div v-else class="text-center">
        <p class="text-lg text-primary">Post não encontrado.</p>
      </div>
    </main>
  </div>
</template>