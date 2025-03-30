<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Star, GitFork, Loader2 } from 'lucide-vue-next'
import { fetchPinnedRepos, type Repository } from '../services/github'

const { t } = useI18n()

const pinnedRepos = ref<Repository[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

onMounted(async () => {
    try {
        pinnedRepos.value = await fetchPinnedRepos()
    } catch (e) {
        error.value = e instanceof Error ? e.message : 'Erro desconhecido'
    } finally {
        isLoading.value = false
    }
})
</script>

<template>
    <section id="projects" class="min-h-screen">
        <div class="max-w-4xl mx-auto px-4">
            <h2 class="text-3xl lg:text-4xl font-bold mb-8 text-neutral-900 dark:text-white">
                {{ t('nav.projects') }}
            </h2>

            <div v-if="isLoading" class="flex justify-center">
                <Loader2 class="w-8 h-8 text-neutral-700 dark:text-neutral-300 animate-spin" />
            </div>

            <div v-else-if="error" class="text-center text-red-500">
                {{ error }}
            </div>

            <div v-else class="space-y-6">
                <article v-for="repo in pinnedRepos" :key="repo.url"
                    class="bg-white dark:bg-neutral-800 rounded-lg p-6 transition-all duration-300 hover:shadow-lg border border-neutral-200 dark:border-neutral-700">
                    <div class="flex flex-col">
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <h3 class="text-2xl font-bold">
                                    <a :href="repo.url" target="_blank" rel="noopener noreferrer"
                                        class="text-neutral-900 dark:text-white hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors hover-underline">
                                        {{ repo.name }}
                                    </a>
                                </h3>
                                <p class="mt-2 text-neutral-700 dark:text-neutral-300">
                                    {{ repo.description }}
                                </p>
                                <div v-if="repo.homepage" class="mt-2">
                                    <a :href="repo.homepage" target="_blank" rel="noopener noreferrer"
                                        class="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                                        {{ new URL(repo.homepage).hostname }}
                                    </a>
                                </div>
                            </div>
                            <div class="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                                <span class="flex items-center gap-1" :title="t('projects.stars')">
                                    <Star class="w-4 h-4" />
                                    {{ repo.stars }}
                                </span>
                                <span class="flex items-center gap-1" :title="t('projects.forks')">
                                    <GitFork class="w-4 h-4" />
                                    {{ repo.forks }}
                                </span>
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-2 mt-4">
                            <span v-for="tag in repo.tags" :key="tag"
                                class="px-3 py-1 text-sm bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-full">
                                {{ tag }}
                            </span>
                        </div>
                        <div class="flex flex-wrap gap-2 mt-4">
                            <span v-for="lang in repo.languages" :key="lang"
                                class="px-3 py-1 text-sm bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 rounded-full border border-neutral-200 dark:border-neutral-700 font-medium">
                                {{ lang }}
                            </span>
                        </div>
                        <div class="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                            <a :href="repo.url" target="_blank" rel="noopener noreferrer"
                                class="text-sm text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors hover-underline">
                                {{ t('projects.viewOnGithub') }}
                            </a>
                        </div>
                    </div>
                </article>
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