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

onMounted(async () => {
    try {
        const fetchedArticles = await fetchArticles()
        console.log('Artigos buscados:', fetchedArticles) // Debug
        articles.value = fetchedArticles.map(article => ({
            ...article,
            readable_publish_date: formatDate(article.published_at)
        }))
    } catch (e) {
        console.error('Erro ao buscar artigos:', e) // Debug
        error.value = e instanceof Error ? e.message : 'Erro desconhecido'
    } finally {
        isLoading.value = false
    }
})
</script>

<template>
    <section id="writing" class=" flex items-center justify-center py-10">
        <div class="md:mx-8 mx-4 md:max-w-4xl w-full">
            <h2 class="text-3xl lg:text-4xl font-bold mb-8 text-neutral-900 dark:text-white text-center">
                <ScrambleText :text="t('blog.title')" />
            </h2>

            <div v-if="isLoading" class="flex justify-center">
                <Loader2 class="w-8 h-8 text-neutral-700 dark:text-neutral-300 animate-spin" />
            </div>

            <div v-else-if="error" class="text-center text-red-500">
                {{ error }}
            </div>

            <div v-else-if="articles.length === 0" class="text-center text-neutral-700 dark:text-neutral-300">
                {{ t('blog.noArticles') }}
            </div>

            <div v-else class="space-y-6">
                <BlogPost v-for="article in articles" :key="article.canonical_url" :title="article.title"
                    :description="article.description" :canonical_url="article.canonical_url"
                    :reading_time_minutes="article.reading_time_minutes"
                    :readable_publish_date="article.readable_publish_date" :cover_image="article.cover_image" />
            </div>
        </div>
    </section>
</template>

<style scoped>
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
</style>