<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Star, GitFork, Loader2, RotateCcw } from 'lucide-vue-next'
import { fetchPinnedRepos, type Repository } from '../services/github'
import ScrambleText from './ScrambleText.vue'
import SearchBar from './SearchBar.vue'

const { t } = useI18n()

const pinnedRepos = ref<Repository[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')

const filteredRepos = computed(() => {
    if (!searchQuery.value) return pinnedRepos.value

    const query = searchQuery.value.toLowerCase()
    return pinnedRepos.value.filter(repo => {
        const searchableText = [
            repo.name,
            repo.description || '',
            ...(repo.languages || []),
            ...(repo.topics || [])
        ].join(' ').toLowerCase()

        return searchableText.includes(query)
    })
})

const getHostname = (url: string): string => {
    try {
        return new URL(url).hostname
    } catch {
        return url
    }
}

const fetchReposWithRetry = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const repos = await fetchPinnedRepos()
            pinnedRepos.value = repos
            return
        } catch (e) {
            if (i === retries - 1) throw e
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        }
    }
}

onMounted(async () => {
    try {
        await fetchReposWithRetry()
    } catch (e) {
        error.value = e instanceof Error ? e.message : 'Erro desconhecido'
    } finally {
        isLoading.value = false
    }
})
</script>

<template>
    <section id="projects" class="flex items-center justify-center py-16">
        <div class="md:mx-8 mx-4 md:max-w-4xl w-full">
            <h2 class="text-3xl lg:text-4xl font-bold mb-8 text-neutral-900 dark:text-white text-center">
                <ScrambleText :text="t('projects.projects')" :scramble-speed="60" :iteration-speed="3" />
            </h2>

            <SearchBar v-if="!isLoading && !error" v-model="searchQuery"
                :placeholder="t('projects.searchPlaceholder')" />

            <div v-if="isLoading" class="flex justify-center">
                <div class="flex flex-col items-center gap-4">
                    <Loader2 class="w-8 h-8 text-neutral-700 dark:text-neutral-300 animate-spin" />
                    <span class="text-neutral-700 dark:text-neutral-300">{{ t('projects.loading') }}</span>
                </div>
            </div>

            <div v-else-if="error" class="text-center text-red-500 animate-fade-in">
                {{ error }}
                <button type="button" @click="() => fetchReposWithRetry()"
                    class="mt-4 text-sm text-neutral-700 dark:text-neutral-300 hover:underline">
                    {{ t('projects.tryAgain') }}
                </button>
            </div>

            <div v-else-if="filteredRepos.length === 0"
                class="text-center text-neutral-700 dark:text-neutral-300 animate-fade-in flex flex-col items-center gap-6 mt-16">
                <span class="text-6xl" role="img" aria-label="Emoji triste">😔</span>
                <p class="text-lg">{{ searchQuery ? t('projects.noResults') : t('projects.noProjects') }}</p>
                <button v-if="searchQuery" @click="searchQuery = ''"
                    class="px-6 py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full text-neutral-900 dark:text-white transition-all duration-300 transform hover:scale-105 flex items-center gap-3 group border border-neutral-200 dark:border-neutral-700">
                    <RotateCcw class="w-5 h-5 transition-transform duration-300 group-hover:rotate-180" />
                    <span>{{ t('projects.clearSearch') }}</span>
                </button>
            </div>

            <div v-else class="grid gap-6 animate-fade-in">
                <article v-for="(repo, index) in filteredRepos" :key="repo.url"
                    class="bg-white dark:bg-neutral-800 rounded-lg p-6 transition-all duration-300 hover:shadow-lg border border-neutral-200 dark:border-neutral-700 transform hover:-translate-y-1"
                    :style="{ animationDelay: `${index * 100}ms` }">
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
                                        {{ getHostname(repo.homepage) }}
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

/* Adiciona smooth scroll */
html {
    scroll-behavior: smooth;
}

/* Melhora a acessibilidade do foco */
:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
}

/* Adiciona prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {

    .animate-fade-in,
    article {
        animation: none;
        opacity: 1;
    }
}
</style>
