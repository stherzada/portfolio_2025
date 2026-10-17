<script setup lang="ts">
import store from '../store'
import { useRoute } from 'vue-router'
import type { Post } from '../types'
import { ref, computed, watch } from 'vue'
import { fetchPostBySlug } from '../services/blog'
import { useI18n } from 'vue-i18n'
import { formatDateWithI18n } from '../utils/dateFormat'
import { formatReadingTime } from '../utils/readingTime'
import { Clock, Calendar, RotateCcw } from 'lucide-vue-next'
import DOMPurify from 'dompurify'
import { useMeta } from '../composables/useMeta'
import { SITE_URL, DEFAULT_OG_IMAGE } from '../config'

const route = useRoute()
const { t, locale } = useI18n()
const { setMeta, setNoIndex } = useMeta()
const post = ref<Post | null>(null)
const error = ref<string | null>(null)
const loading = ref(false)

const sanitizedContent = computed(() =>
  post.value?.content ? DOMPurify.sanitize(post.value.content) : ''
)

const applyPostMeta = (data: Post) => {
  const title = `${data.title} - Sthefany Sther`
  const description = data.description || 'Leia mais sobre este post no blog da Sthefany Sther'
  const canonical = `${SITE_URL}/blog/${data.slug}`
  const image = data.image_path || DEFAULT_OG_IMAGE

  setMeta({
    title,
    description,
    canonical,
    ogType: 'article',
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    ogUrl: canonical,
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
  })
}

const fetchPost = async (slug: string) => {
  try {
    loading.value = true
    error.value = null
    post.value = null

    const data = store.posts.find((p: Post) => p.slug === slug) ?? await fetchPostBySlug(slug)
    // Ignore a stale response if the user already navigated to another post.
    if (route.params.slug !== slug) return

    post.value = data
    if (data) {
      applyPostMeta(data)
    } else {
      document.title = `${t('blog.postNotFound')} - Sthefany Sther`
      setNoIndex(true)
    }
  } catch (err) {
    console.error('Error fetching post:', err)
    error.value = t('blog.errorLoading')
  } finally {
    loading.value = false
  }
}

// immediate: also covers /blog/a -> /blog/b, where the component is reused.
watch(() => route.params.slug, (slug) => {
  if (typeof slug === 'string') fetchPost(slug)
}, { immediate: true })

</script>

<template>
  <div class="px-4 py-8 md:py-12">
    <main class="flex flex-col items-center justify-center">
      <div v-if="loading" class="text-center py-16">
        <span class="font-mono text-sm text-muted">{{ t('blog.loading') }}</span>
      </div>

      <div v-else-if="error" class="text-center py-16 flex flex-col items-center gap-4">
        <p class="eyebrow">{{ t('blog.errorTitle') }}</p>
        <p class="text-lg text-primary">{{ error }}</p>
        <button @click="fetchPost(route.params.slug as string)"
          class="retry-chip px-4 py-2 rounded-full border transition-colors flex items-center gap-2 cursor-pointer group">
          <RotateCcw class="w-3.5 h-3.5 arrow-rotate" />
          <span class="font-mono text-xs uppercase tracking-wide">{{ t('blog.retry') }}</span>
        </button>
      </div>

      <div v-else-if="post" class="w-full max-w-3xl">
        <div v-if="post.image_path" class="mb-8 overflow-hidden rounded-2xl">
          <img :src="post.image_path" :alt="post.title" class="w-full h-48 md:h-72 object-cover" />
        </div>
        <div class="mb-10">
          <p class="eyebrow mb-3">/{{ t('nav.writing') }}</p>
          <h1 class="font-mono font-semibold text-2xl md:text-4xl tracking-tight text-primary leading-tight mb-4">
            {{ post.title }}
          </h1>
          <div class="flex items-center gap-4 font-mono text-xs text-muted">
            <span class="flex items-center gap-1">
              <Calendar class="h-3.5 w-3.5" />
              {{ formatDateWithI18n(post.created_at, locale) }}
            </span>
            <span class="flex items-center gap-1">
              <Clock class="h-3.5 w-3.5" />
              {{ formatReadingTime(post.content || '') }}
            </span>
          </div>
        </div>
        <article v-html="sanitizedContent" class="prose prose-sm md:prose-lg max-w-none"></article>
      </div>

      <div v-else class="text-center py-16">
        <span class="text-lg text-primary">{{ t('blog.postNotFound') }}</span>
      </div>
    </main>
  </div>
</template>

<style scoped>
.text-muted {
    color: var(--color-neutral);
}

.retry-chip {
    color: var(--color-primary);
    border-color: var(--color-base-300);
}

.retry-chip:hover {
    border-color: var(--color-primary);
    background-color: var(--color-base-100);
}
</style>
