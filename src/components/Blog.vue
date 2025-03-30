<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Loader2 } from 'lucide-vue-next'
import BlogPost from './BlogPost.vue'
import { fetchArticles } from '../services/devto'

const { t } = useI18n()

const articles = ref([])
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
        articles.value = fetchedArticles.map(article => ({
            ...article,
            readable_publish_date: formatDate(article.readable_publish_date)
        }))
    } catch (e) {
        error.value = e instanceof Error ? e.message : 'Erro desconhecido'
    } finally {
        isLoading.value = false
    }
})
</script>

<template>
    <section id="writing" class="my-10">
        <div class="max-w-4xl mx-auto px-4">
            <h2 class="md:text-left text-center text-3xl lg:text-4xl font-bold mb-8 text-neutral-900 dark:text-white">
                {{ t('nav.writing') }}
            </h2>

            <div v-if="isLoading" class="flex justify-center">
                <Loader2 class="w-8 h-8 text-neutral-700 dark:text-neutral-300 animate-spin" />
            </div>

            <div v-else-if="error" class="text-center text-red-500">
                {{ error }}
            </div>

            <div v-else class="space-y-6">
                <BlogPost v-for="article in articles" :key="article.canonical_url" v-bind="article" />
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