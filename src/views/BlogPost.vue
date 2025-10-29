<script setup lang="ts">
import store from '../store'
import { useRoute } from 'vue-router'
import type { Post } from '../types'
import { ref, onMounted } from 'vue'
import { fetchPostBySlug } from '../services/blog'
import { useI18n } from 'vue-i18n'
import { formatDateWithI18n } from '../utils/dateFormat'
import { formatReadingTime } from '../utils/readingTime'
import { Clock } from 'lucide-vue-next'

const route = useRoute()
const { t, locale } = useI18n()
const post = ref<Post | null>(null)
const error = ref<string | null>(null)
const loading = ref(false)


const fetchPost = async (slug: string) => {
  try {
    loading.value = true
    error.value = null

    if (store.posts.length > 0) {
      const found = store.posts.find((post: Post) => post.slug === slug)
      if (found) {
        post.value = found
        return found
      }
    }

    const data = await fetchPostBySlug(slug)
    post.value = data
  } catch (err) {
    console.error('Error fetching post:', err)
    error.value = 'Post não encontrado ou erro ao carregar.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!post.value) {
    fetchPost(route.params.slug as string)
  }
})

</script>

<template>
  <div class="container mx-auto px-4 py-8 md:py-16">
    <main class="flex flex-col items-center justify-center">
      <div v-if="loading" class="text-center">
        <p class="text-lg text-primary">{{ t('blog.loading') }}</p>
      </div>

      <div v-else-if="error" class="text-center">
        <h1 class="text-2xl font-bold text-red-500">Erro</h1>
        <p class="text-lg text-red-500 mb-4">{{ error }}</p>
        <button @click="fetchPost(route.params.slug as string)"
          class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors">
          Tentar Novamente
        </button>
      </div>

      <div v-else-if="post" class="w-full max-w-4xl">
        <div v-if="post.image_path" class="mb-6 overflow-hidden rounded-lg">
          <img :src="post.image_path" :alt="post.title" class="w-full h-48 md:h-64 object-cover rounded-lg" />
        </div>
        <div class="text-center mb-8 flex items-center gap-2 flex-col">
          <h1 class="text-2xl md:text-4xl font-bold text-primary leading-tight">{{ post.title }}</h1>
          <p class="text-sm md:text-lg text-primary opacity-75">{{ formatDateWithI18n(post.created_at, locale) }}</p>
          <div class="flex items-center gap-1 text-sm md:text-lg text-primary opacity-75">
            <Clock class="h-4 w-4" />
            {{ formatReadingTime(post.content || '') }}
          </div>
        </div>
        <article v-html="post.content"
          class="prose prose-sm md:prose-lg prose-gray max-w-none prose-headings:text-primary prose-a:text-blue-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-p:leading-relaxed prose-li:leading-relaxed">
        </article>
      </div>

      <div v-else class="text-center">
        <p class="text-lg text-primary">Post não encontrado.</p>
      </div>
    </main>
  </div>
</template>