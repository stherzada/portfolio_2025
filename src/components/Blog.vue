<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Loader2 } from 'lucide-vue-next'
import BlogPost from './BlogPost.vue'
import { fetchArticles, type Article } from '../services/devto'
import ScrambleText from './ScrambleText.vue'
import { useLocalStorageCache, createCacheKey } from '../utils/cache'

const { t } = useI18n()

const articles = ref<Article[]>([])
const isLoading = ref(true)


const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }
    return new Date(date).toLocaleDateString('en-US', options)
}
const { fetchWithRetry } = useLocalStorageCache<Article[]>(
    createCacheKey.blog('stherzada'),
    fetchArticles,
    {
        duration: 1000 * 60 * 5, 
        retries: 2, 
        retryDelay: 300
    }
)
const fetchArticlesWithRetry = async () => {
        isLoading.value = true
        const fetchedArticles = await fetchWithRetry()
        const formattedArticles = fetchedArticles.map((article: Article) => ({
            ...article,
            readable_publish_date: formatDate(article.published_at)
        }))
        articles.value = formattedArticles
        isLoading.value = false
}

onMounted(() => {
    fetchArticlesWithRetry()
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
