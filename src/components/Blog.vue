<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Loader2 } from 'lucide-vue-next'
import BlogPost from './BlogPost.vue'
import { fetchArticles, type Article } from '../services/devto'
import ScrambleText from './ScrambleText.vue'

const { t } = useI18n()

const articles = ref<Article[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }
    return new Date(date).toLocaleDateString('en-US', options)
}

// Cache dos artigos
const CACHE_KEY = 'blog_articles'
const CACHE_DURATION = 1000 * 60 * 5 // 5 minutos

const getCachedArticles = () => {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY)
        return null
    }

    return data
}

const cacheArticles = (data: Article[]) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
    }))
}

const fetchArticlesWithRetry = async (retries = 3) => {
    // Tenta usar cache primeiro
    const cached = getCachedArticles()
    if (cached) {
        articles.value = cached.map((article: Article) => ({
            ...article,
            readable_publish_date: formatDate(article.published_at)
        }))
        return
    }

    // Se não tem cache, faz a requisição
    for (let i = 0; i < retries; i++) {
        try {
            const fetchedArticles = await fetchArticles()
            const formattedArticles = fetchedArticles.map((article: Article) => ({
                ...article,
                readable_publish_date: formatDate(article.published_at)
            }))
            articles.value = formattedArticles
            cacheArticles(formattedArticles)
            return
        } catch (e) {
            if (i === retries - 1) throw e
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        }
    }
}

onMounted(async () => {
    try {
        await fetchArticlesWithRetry()
    } catch (e) {
        error.value = e instanceof Error ? e.message : 'Erro desconhecido'
    } finally {
        isLoading.value = false
    }
})
</script>

<template>
    <section id="writing" class="flex items-center justify-center py-16">
        <div class="md:mx-8 mx-4 md:max-w-4xl w-full">
            <h2 class="text-3xl lg:text-4xl font-bold mb-8 text-neutral-900 dark:text-white text-center">
                <ScrambleText :text="t('blog.title')" :scramble-speed="60" :iteration-speed="3" />
            </h2>

            <div v-if="isLoading" class="flex justify-center">
                <Loader2 class="w-8 h-8 text-neutral-700 dark:text-neutral-300 animate-spin" />
            </div>

            <div v-else-if="error" class="text-center text-red-500 animate-fade-in">
                {{ error }}
                <button @click="() => fetchArticlesWithRetry()"
                    class="mt-4 text-sm text-neutral-700 dark:text-neutral-300 hover:underline">
                    {{ t('blog.tryAgain') }}
                </button>
            </div>

            <div v-else-if="articles.length === 0"
                class="text-center text-neutral-700 dark:text-neutral-300 animate-fade-in">
                {{ t('blog.noArticles') }}
            </div>

            <div v-else class="grid gap-6 animate-fade-in">
                <BlogPost v-for="(article, index) in articles" :key="article.canonical_url" :title="article.title"
                    :description="article.description" :canonical_url="article.canonical_url"
                    :reading_time_minutes="article.reading_time_minutes"
                    :readable_publish_date="article.readable_publish_date" :cover_image="article.cover_image"
                    :style="{ animationDelay: `${index * 100}ms` }" />
            </div>
        </div>
    </section>
</template>

<style scoped>
.animate-fade-in {
    opacity: 0;
    animation: fadeIn 0.5s ease-in-out forwards;
}

article {
    opacity: 0;
    animation: fadeIn 0.5s ease-in-out forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (prefers-reduced-motion: reduce) {

    .animate-fade-in,
    article {
        animation: none;
        opacity: 1;
    }
}
</style>