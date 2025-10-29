<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Star, GitFork, Loader2, RotateCcw } from 'lucide-vue-next'
import { fetchPinnedRepos, type Repository } from '../services/github'
import ScrambleText from './ScrambleText.vue'
import SearchBar from './SearchBar.vue'
import { useLocalStorageCache, createCacheKey } from '../utils/cache'

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
    return new URL(url).hostname
}

const fetchWithRetry = useLocalStorageCache<Repository[]>(
    createCacheKey.github('stherzada'),
    fetchPinnedRepos,
    {
        duration: 1000 * 60 * 10,
        retries: 2, 
        retryDelay: 300
    }
)

const fetchReposWithRetry = async () => {
        isLoading.value = true
        error.value = null
        const repos = await fetchWithRetry.fetchWithRetry()
        pinnedRepos.value = repos
        isLoading.value = false
    
}

onMounted(() => {
    fetchReposWithRetry()
})
</script>

<template>
    <section id="projects" class="flex items-center justify-center py-4">
        <div class="md:mx-8 mx-4 md:max-w-4xl w-full">
            <h2 class="text-3xl lg:text-4xl font-bold mb-8 text-center text-primary">
                <ScrambleText :text="t('projects.projects')" :scramble-speed="60" :iteration-speed="3" />
            </h2>

            <SearchBar v-if="!isLoading && !error" v-model="searchQuery"
                :placeholder="t('projects.searchPlaceholder')" />

            <div v-if="isLoading" class="flex justify-center">
                <div class="flex flex-col items-center gap-4">
                    <Loader2 class="w-8 h-8 animate-spin loading-icon" />
                    <span class="text-primary">{{ t('projects.loading') }}</span>
                </div>
            </div>

            <div v-else-if="filteredRepos.length === 0"
                class="text-center animate-fade-out flex flex-col items-center gap-6 mt-16">
                <span class="text-6xl" role="img" aria-label="Emoji triste">😔</span>
                <p class="text-lg text-primary">{{ searchQuery ? t('projects.noResults') : t('projects.noProjects') }}</p>
                <button v-if="searchQuery" @click="searchQuery = ''"
                    class="px-6 py-3 rounded-full transition-all duration-300 ease-in-out flex items-center gap-3 group text-primary card cursor-pointer shadow-sm shadow-shadow-primary">
                    <RotateCcw class="w-5 h-5 arrow-rotate" />
                    <span>{{ t('projects.clearSearch') }}</span>
                </button>
            </div>

            <div v-else class="grid gap-6 animate-fade-in">
                <article v-for="repo in filteredRepos" :key="repo.url"
                    class="rounded-lg p-6 transition-all duration-300 hover:shadow-lg transform card">
                    <div class="flex flex-col">
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <h3 class="text-2xl font-bold">
                                    <a :href="repo.url" target="_blank" rel="noopener noreferrer"
                                        class="link-underline text-primary">
                                        {{ repo.name }}
                                    </a>
                                </h3>
                                <p class="mt-2">
                                    {{ repo.description }}
                                </p>
                                <div v-if="repo.homepage" class="mt-2">
                                    <a :href="repo.homepage" target="_blank" rel="noopener noreferrer"
                                        class="text-sm link-underline text-primary">
                                        {{ getHostname(repo.homepage) }}
                                    </a>
                                </div>
                            </div>
                            <div class="flex items-center gap-4 text-sm text-primary">
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
                                class="px-3 py-1 text-sm rounded-full text-primary">
                                {{ tag }}
                            </span>
                        </div>
                        <div class="flex flex-wrap gap-2 mt-4">
                            <span v-for="lang in repo.languages" :key="lang"
                                class="px-3 py-1 text-sm rounded-full font-medium text-primary">
                                {{ lang }}
                            </span>
                        </div>
                        <div class="mt-4 pt-4 card-divider">
                            <a :href="repo.url" target="_blank" rel="noopener noreferrer"
                                class="text-sm link-underline text-primary">
                                {{ t('projects.viewOnGithub') }}
                            </a>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    </section>
</template>
