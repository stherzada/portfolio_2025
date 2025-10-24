<script setup lang="ts">
import { store } from '../store'
import { onMounted, ref, computed } from 'vue'
import { fetchPosts } from '../services/blog'
import { useI18n } from 'vue-i18n'
import { formatReadingTime } from '../utils/readingTime'
import { formatDateWithI18n } from '../utils/dateFormat'
import { Clock, Calendar } from 'lucide-vue-next'

const currentPage = ref(1)
const postsPerPage = ref(5)
const totalPosts = ref(0)
const isLoading = ref(false)
const { t, locale } = useI18n()

const fetchPostsData = async (page: number = 1) => {
    isLoading.value = true
    try {
        const { posts, total } = await fetchPosts(page, postsPerPage.value)
        store.posts = posts
        totalPosts.value = total
    } catch (error) {
        console.error('Error fetching posts:', error)
        store.posts = []
        totalPosts.value = 0
    } finally {
        isLoading.value = false
    }
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
    <div class="container mx-auto px-4">
        <main class="flex flex-col items-center justify-center">
            <div class="my-8 md:my-10 text-center">
                <h1 class="text-2xl md:text-4xl font-bold text-primary">Stherzada Blog ( •̀ ω •́ )✧</h1>
                <p class="text-sm md:text-lg text-primary mt-2 md:mt-4">{{ t('blog.description') }}</p>
            </div>
            
            <div v-if="isLoading" class="text-center py-8">
                <p class="text-primary">{{ t('blog.loading') }}</p>
            </div>
            
     
            <div v-else class="flex flex-col gap-4 md:gap-6 w-full max-w-2xl">
                <div v-for="post in store.posts" :key="post.id" 
                     @click="$router.push(`/blog/${post.slug}`)"
                     class="card rounded-lg p-3 md:p-4 cursor-pointer transition-colors hover:shadow-lg">
                     <div v-if="post.image_path" class="mb-3 md:mb-4 overflow-hidden rounded-lg">
                        <img :src="post.image_path" :alt="post.title" class="w-full h-40 md:h-48 object-cover rounded-lg" />
                    </div>
                    <h2 class="text-lg md:text-xl font-semibold text-primary mb-2"> <span class="link-underline">{{ post.title }}</span></h2>
                    <p class="text-sm md:text-base text-primary mb-4 md:mb-5">{{ post.description }}</p>
                
                    <div class="flex justify-between text-xs md:text-sm text-primary card-divider pt-3 md:pt-4">
                        <div class="flex items-center gap-1">
                                <Clock class="h-3 w-3 md:h-4 md:w-4" />
                                {{ formatReadingTime(post.content || '') }}
                            </div>
                            <div class="flex items-center gap-1">
                                <Calendar class="h-3 w-3 md:h-4 md:w-4" />
                                {{ formatDateWithI18n(post.created_at, locale) }}
                            </div>
                    </div>
                </div>
            </div>
            
            <div v-if="totalPages > 1" class="mt-6 md:mt-8 flex flex-col md:flex-row items-center gap-3 md:gap-2">
                <button 
                    @click="goToPage(currentPage - 1)"
                    :disabled="currentPage === 1"
                    class="px-4 py-2 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
                    Anterior
                </button>
                
                <span class="px-4 py-2 text-sm text-gray-600">
                    Página {{ currentPage }} de {{ totalPages }}
                </span>
                
                <button 
                    @click="goToPage(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    class="px-4 py-2 text-sm border border-primary rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary transition-colors">
                    Próxima
                </button>
            </div>
            
        </main>
    </div>
</template>