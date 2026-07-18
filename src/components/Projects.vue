<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Star, GitFork, Loader2, RotateCcw, ArrowUpRight, SearchX } from 'lucide-vue-next'
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
    <section id="projects" class="flex items-center justify-center py-16 scroll-mt-24">
        <div class="md:mx-8 mx-4 md:max-w-4xl w-full">
            <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
                <div>
                    <p class="eyebrow mb-3">/{{ t('nav.projects') }}</p>
                    <h2 class="font-mono font-semibold text-3xl lg:text-4xl tracking-tight text-primary">
                        <ScrambleText :text="t('projects.projects')" :scramble-speed="60" :iteration-speed="3" />
                    </h2>
                </div>
                <SearchBar v-if="!isLoading && !error" v-model="searchQuery"
                    :placeholder="t('projects.searchPlaceholder')" class="sm:max-w-sm w-full" />
            </div>

            <div v-if="isLoading" class="flex justify-center py-16">
                <div class="flex flex-col items-center gap-4">
                    <Loader2 class="w-6 h-6 animate-spin loading-icon" />
                    <span class="font-mono text-sm text-muted">{{ t('projects.loading') }}</span>
                </div>
            </div>

            <div v-else-if="filteredRepos.length === 0"
                class="empty-state text-center flex flex-col items-center gap-5 py-20 border rounded-2xl">
                <SearchX class="w-6 h-6 text-muted" stroke-width="1.5" />
                <p class="font-mono text-sm text-primary">
                    <span class="opacity-50">$</span>
                    {{ searchQuery ? t('projects.noResults', { query: searchQuery }) : t('projects.noProjects') }}
                </p>
                <button v-if="searchQuery" @click="searchQuery = ''"
                    class="clear-chip text-primary px-4 py-2 rounded-full transition-colors duration-200 flex items-center gap-2 group cursor-pointer border">
                    <RotateCcw class="w-3.5 h-3.5 arrow-rotate" />
                    <span class="font-mono text-xs uppercase tracking-wide">{{ t('projects.clearSearch') }}</span>
                </button>
            </div>

            <div v-else class="project-list border-t">
                <article v-for="(repo, index) in filteredRepos" :key="repo.url"
                    v-reveal="{ delay: Math.min(index, 8) * 0.05 }"
                    class="project-row group border-b -mx-3 sm:-mx-4 px-3 sm:px-4 py-8 rounded-xl">
                    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div class="min-w-0">
                            <h3 class="flex items-center gap-1.5 font-mono text-lg font-semibold text-primary">
                                <a :href="repo.url" target="_blank" rel="noopener noreferrer"
                                    class="link-fade">
                                    {{ repo.name }}
                                </a>
                                <ArrowUpRight class="w-4 h-4 shrink-0 opacity-0 -translate-x-1 group-hover:opacity-70 group-hover:translate-x-0 transition-all duration-300" />
                            </h3>
                            <p class="mt-1.5 text-primary max-w-lg line-clamp-2">
                                {{ repo.description }}
                            </p>
                            <div v-if="repo.homepage" class="mt-1.5">
                                <a :href="repo.homepage" target="_blank" rel="noopener noreferrer"
                                    class="font-mono text-xs link-fade text-muted">
                                    {{ repo.homepage.replace(/^https?:\/\//, '') }}
                                </a>
                            </div>
                            <div v-if="repo.languages?.length" class="flex flex-wrap gap-1.5 mt-3">
                                <span v-for="lang in repo.languages" :key="lang" class="lang-chip">{{ lang }}</span>
                            </div>
                        </div>
                        <div class="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-1.5 font-mono text-xs text-muted shrink-0">
                            <span class="flex items-center gap-1" :title="t('projects.stars')">
                                <Star class="w-3.5 h-3.5" />
                                {{ repo.stars }}
                            </span>
                            <span class="flex items-center gap-1" :title="t('projects.forks')">
                                <GitFork class="w-3.5 h-3.5" />
                                {{ repo.forks }}
                            </span>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    </section>
</template>

<style scoped>
.text-muted {
    color: var(--color-neutral);
}

.project-list,
.project-row,
.empty-state {
    border-color: var(--color-base-300);
}

.project-row {
    transition: background-color 0.25s ease;
}

.project-row:hover {
    background-color: var(--color-base-100);
}

.lang-chip {
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
    font-size: 0.7rem;
    letter-spacing: 0.02em;
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
    border: 1px solid var(--color-base-300);
    color: var(--color-neutral);
    background-color: var(--color-base-100);
}

.clear-chip {
    border-color: var(--color-base-300);
}

.clear-chip:hover {
    background-color: var(--color-base-100);
    border-color: var(--color-primary);
}
</style>
