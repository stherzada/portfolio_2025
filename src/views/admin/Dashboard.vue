<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { PenLine, Trash2, Plus, LogOut } from 'lucide-vue-next'
import { fetchPostsAll } from '@/services/blog'
import { deletePost } from '@/services/admin'
import { useAuth } from '@/composables/useAuth'
import { useI18n } from 'vue-i18n'
import store from '@/store'
import type { Post } from '@/types'

const { t } = useI18n()
const { signOut } = useAuth()
const router = useRouter()
const route = useRoute()

const posts = ref<Post[]>([])
const total = ref(0)
const page = ref(1)
const PAGE_SIZE = 20
const totalPages = computed(() => Math.ceil(total.value / PAGE_SIZE))
const loading = ref(true)
const showSavedToast = ref(route.query.saved === '1')

let toastTimer: ReturnType<typeof setTimeout> | null = null

const loadPosts = async () => {
  loading.value = true
  const result = await fetchPostsAll(page.value, PAGE_SIZE)
  posts.value = result.posts
  total.value = result.total ?? 0
  if (posts.value.length === 0 && page.value > 1) page.value--
  loading.value = false
}

const handleDelete = async (id: string, title: string) => {
  if (!window.confirm(`Excluir "${title}"?`)) return
  await deletePost(id)
  store.posts = []
  await loadPosts()
}

const handleSignOut = async () => {
  await signOut()
  router.push({ name: 'AdminLogin' })
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

watch(page, loadPosts)

onMounted(() => {
  loadPosts()
  if (showSavedToast.value) {
    toastTimer = setTimeout(() => {
      showSavedToast.value = false
    }, 3000)
  }
})

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer)
})
</script>

<template>
  <div class="min-h-screen p-6 max-w-4xl mx-auto">
    <header class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-bold text-primary">Posts</h1>
      <div class="flex items-center gap-3">
        <router-link
          :to="{ name: 'AdminPostNew' }"
          class="flex items-center gap-2 px-4 py-2 bg-primary text-[var(--color-base-100)]
                 rounded-lg font-medium text-sm transition-opacity hover:opacity-90 cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          Novo post
        </router-link>
        <button
          @click="handleSignOut"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                 border border-[var(--color-base-300)] text-primary
                 hover:bg-[var(--color-base-200)] transition-colors cursor-pointer"
        >
          <LogOut class="w-4 h-4" />
          Sair
        </button>
      </div>
    </header>

    <div
      v-if="showSavedToast"
      class="mb-6 px-4 py-3 bg-green-100 dark:bg-green-900/30 text-green-800
             dark:text-green-300 rounded-lg text-sm font-medium"
    >
      Post salvo com sucesso!
    </div>

    <div v-if="loading" class="text-center py-16 text-[var(--color-base-content-secondary)]">
      {{ t('blog.loading') }}
    </div>

    <div v-else-if="posts.length === 0" class="text-center py-16 text-[var(--color-base-content-secondary)]">
      Nenhum post ainda. Crie o primeiro!
    </div>

    <div v-else class="flex flex-col gap-3">
      <div
        v-for="post in posts"
        :key="post.id"
        class="flex items-center justify-between p-4 rounded-xl
               border border-[var(--color-base-300)] bg-[var(--color-base-100)]"
      >
        <div class="flex-1 min-w-0 mr-4">
          <p class="font-medium text-primary truncate">{{ post.title }}</p>
          <p class="text-xs text-[var(--color-base-content-secondary)] mt-0.5">
            {{ formatDate(post.created_at) }}
          </p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <router-link
            :to="{ name: 'AdminPostEdit', params: { id: post.id } }"
            class="p-2 rounded-lg hover:bg-[var(--color-base-200)] transition-colors
                   text-primary cursor-pointer"
            title="Editar"
          >
            <PenLine class="w-4 h-4" />
          </router-link>
          <button
            @click="handleDelete(post.id, post.title)"
            class="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30
                   text-red-500 transition-colors cursor-pointer"
            title="Excluir"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="flex items-center justify-center gap-3 mt-8">
      <button
        @click="page--"
        :disabled="page === 1"
        class="px-3 py-1.5 rounded-lg text-sm border border-[var(--color-base-300)]
               text-primary hover:bg-[var(--color-base-200)] transition-colors
               disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        ← Anterior
      </button>
      <span class="text-sm text-[var(--color-base-content-secondary)]">
        {{ page }} / {{ totalPages }}
      </span>
      <button
        @click="page++"
        :disabled="page === totalPages"
        class="px-3 py-1.5 rounded-lg text-sm border border-[var(--color-base-300)]
               text-primary hover:bg-[var(--color-base-200)] transition-colors
               disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        Próxima →
      </button>
    </div>
  </div>
</template>
