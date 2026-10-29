<script setup lang="ts">
import { store } from '../store'
import { onMounted, ref, computed } from 'vue'
import { fetchPostsAll } from '../services/blog'
import { useI18n } from 'vue-i18n'
import { formatReadingTime } from '../utils/readingTime'
import { formatDateWithI18n } from '../utils/dateFormat'
import { Clock, Calendar, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-vue-next'

const currentPage = ref(1)
const postsPerPage = ref(10)
const totalPosts = ref(0)
const isLoading = ref(true)
const hasError = ref(false)
const { t, locale } = useI18n()

const totalPages = computed(() => Math.ceil(totalPosts.value / postsPerPage.value))

const fetchPostsData = async (page: number = 1, postsPerPage: number = 10) => {
    isLoading.value = true
    hasError.value = false
    try {
        const posts = await fetchPostsAll(page, postsPerPage)
        store.posts = posts.posts
        totalPosts.value = posts.total || 0
        currentPage.value = page
    } catch {
        hasError.value = true
    } finally {
        isLoading.value = false
    }
}

const goToPage = async (page: number) => {
    await fetchPostsData(page, postsPerPage.value)
    window.scrollTo({ top: 0 })
}

onMounted(async () => {
    await fetchPostsData(currentPage.value, postsPerPage.value)
})
</script>

<template>
    <div class="px-4 md:px-8">
        <main class="mx-auto w-full max-w-5xl pb-16">
            <div class="mb-10" v-reveal="{ stagger: 0.08 }">
                <p class="eyebrow mb-3">/{{ t('nav.writing') }}</p>
                <h1 class="font-mono font-semibold text-3xl lg:text-4xl tracking-tight text-primary mb-3">
                    {{ t('blog.title') }}
                </h1>
                <p class="text-lg text-primary max-w-xl">{{ t('blog.description') }}</p>
            </div>

            <div v-if="isLoading" class="flex justify-center py-16">
                <span class="font-mono text-sm text-muted">{{ t('blog.loadingPosts') }}</span>
            </div>

            <div v-else-if="hasError" role="alert" class="text-center py-16 flex flex-col items-center gap-4">
                <p class="eyebrow">{{ t('blog.errorTitle') }}</p>
                <p class="text-lg text-primary">{{ t('blog.errorLoadingPosts') }}</p>
                <button @click="fetchPostsData(currentPage, postsPerPage)"
                    class="page-chip px-4 py-2 rounded-full border transition-colors flex items-center gap-2 cursor-pointer">
                    <RotateCcw class="w-3.5 h-3.5" />
                    <span class="font-mono text-xs uppercase tracking-wide">{{ t('blog.retry') }}</span>
                </button>
            </div>

            <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <article v-for="(post, index) in store.posts" :key="post.id"
                    v-reveal="{ delay: Math.min(index, 8) * 0.05 }"
                    class="post-card relative rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col">
                    <div v-if="post.image_path" class="overflow-hidden">
                        <img :src="post.image_path" :alt="post.title"
                            loading="lazy" decoding="async"
                            class="w-full h-40 md:h-48 object-cover transition-transform duration-500 hover:scale-105" />
                    </div>
                    <div class="p-5 flex flex-col flex-1">
                        <h2 class="text-lg md:text-xl font-semibold text-primary mb-2">
                            <!-- Stretched link: the whole card is clickable, but it's a real <a> for keyboard, new-tab and crawlers. -->
                            <router-link :to="`/blog/${post.slug}`" class="link-hover card-link">{{ post.title }}</router-link>
                        </h2>
                        <p class="text-sm md:text-base text-primary mb-4 line-clamp-2">{{ post.description }}</p>

                        <div class="mt-auto flex items-center gap-4 font-mono text-xs text-muted pt-3 card-divider">
                            <span class="flex items-center gap-1">
                                <Clock class="h-3.5 w-3.5" />
                                {{ formatReadingTime(post.content || '') }}
                            </span>
                            <span class="flex items-center gap-1">
                                <Calendar class="h-3.5 w-3.5" />
                                {{ formatDateWithI18n(post.created_at, locale) }}
                            </span>
                        </div>
                    </div>
                </article>
            </div>

            <div v-if="totalPages > 1 && !hasError" class="mt-10 flex items-center justify-center gap-4">
                <button @click="goToPage(currentPage - 1)" :disabled="currentPage - 1 < 1"
                    class="page-chip w-9 h-9 flex items-center justify-center rounded-full border transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    :aria-label="t('blog.previous')">
                    <ArrowLeft class="w-4 h-4" />
                </button>

                <span class="font-mono text-xs text-muted">
                    {{ t('blog.page', { current: currentPage, total: totalPages }) }}
                </span>

                <button @click="goToPage(currentPage + 1)" :disabled="currentPage + 1 > totalPages"
                    class="page-chip w-9 h-9 flex items-center justify-center rounded-full border transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    :aria-label="t('blog.next')">
                    <ArrowRight class="w-4 h-4" />
                </button>
            </div>
        </main>
    </div>
</template>

<style scoped>
.text-muted {
    color: var(--color-neutral);
}

.post-card {
    background-color: var(--color-base-100);
    border-color: var(--color-base-300);
}

.card-link::after {
    content: '';
    position: absolute;
    inset: 0;
}

.page-chip {
    color: var(--color-primary);
    border-color: var(--color-base-300);
}

.page-chip:not(:disabled):hover {
    border-color: var(--color-primary);
    background-color: var(--color-base-100);
}
</style>
