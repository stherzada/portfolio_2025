<script setup lang="ts">
import { store } from '../store'
import { onMounted, ref, computed } from 'vue'
import { createSlug } from '../utils/slug'
import { fetchPosts } from '../services/blog'
import { useI18n } from 'vue-i18n'

const currentPage = ref(1)
const postsPerPage = ref(5)
const totalPosts = ref(0)
const isLoading = ref(false)
const { t } = useI18n()

const fetchPostsData = async (page: number = 1) => {
    isLoading.value = true
    try {
        const { posts, total } = await fetchPosts(page, postsPerPage.value)
        store.posts = posts
        totalPosts.value = total
        console.log(posts)
    } catch (error) {
        console.error('Error fetching posts:', error)
        store.posts = []
        totalPosts.value = 0
    } finally {
        isLoading.value = false
    }
}

const getWordCount = (text: string): number => {
    return text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}

const goToPage = (page: number) => {
    currentPage.value = page
    fetchPostsData(page)
}

const totalPages = computed(() => {
    return Math.ceil(totalPosts.value / postsPerPage.value)
})

onMounted(async () => {
    await fetchPostsData(1)
})
</script>

<template>
    <div class="container mx-auto">
        <main class="flex flex-col items-center justify-center">
            <div class="my-10 text-center">
                <h1 class="text-4xl font-bold text-primary">Stherzada Blog ( •̀ ω •́ )✧</h1>
                <p class="text-lg text-primary mt-4">{{ t('blog.description') }}</p>
            </div>
            
            <div v-if="isLoading" class="text-center py-8">
                <p class="text-primary">{{ t('blog.loading') }}</p>
            </div>
            
     
            <div v-else class="flex flex-col gap-4 w-full max-w-2xl">
                <div v-for="post in store.posts" :key="post.id" 
                     @click="$router.push(`/blog/${createSlug(post.title)}`)"
                     class="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <h2 class="text-xl font-semibold text-primary mb-2">{{ post.title }}</h2>
                    <p class="text-gray-600 mb-2">{{ post.description }}</p>
                    <div v-if="post.image_path" class="mb-4 overflow-hidden rounded-lg">
                        <img :src="post.image_path" :alt="post.title" class="w-full h-48 object-cover rounded-lg" />
                    </div>
                    <div class="flex justify-between text-sm text-gray-500">
                        <span>{{ getWordCount(post.content || '') }} words</span>
                        <span>{{ new Date(post.created_at).toLocaleDateString() }}</span>
                    </div>
                </div>
            </div>
            
            <div v-if="totalPages > 1" class="mt-8 flex items-center gap-2">
                <button 
                    @click="goToPage(currentPage - 1)"
                    :disabled="currentPage === 1"
                    class="px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                    Anterior
                </button>
                
                <span class="px-4 py-2 text-sm text-gray-600">
                    Página {{ currentPage }} de {{ totalPages }}
                </span>
                
                <button 
                    @click="goToPage(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    class="px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                    Próxima
                </button>
            </div>
            
            <div class="mt-4 text-sm text-gray-500">
                Total: {{ totalPosts }} posts
            </div>
        </main>
    </div>
</template>