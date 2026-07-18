<script setup lang="ts">
import { store } from '../store'
import { onMounted, ref, computed } from 'vue'
import { fetchPostsAll } from '../services/blog'
import { useI18n } from 'vue-i18n'
import { formatReadingTime } from '../utils/readingTime'
import { formatDateWithI18n } from '../utils/dateFormat'
import { Clock, Calendar, ArrowLeft, ArrowRight } from 'lucide-vue-next'

const currentPage = ref(1)
const postsPerPage = ref(10)
const totalPosts = ref(0)
const isLoading = ref(true)
const { t, locale } = useI18n()

const totalPages = computed(() => Math.ceil(totalPosts.value / postsPerPage.value))

const fetchPostsData = async (page: number = 1, postsPerPage: number = 10) => {
    const posts = await fetchPostsAll(page, postsPerPage)
    store.posts = posts.posts
    totalPosts.value = posts.total || 0
    currentPage.value = page
    isLoading.value = false
}

onMounted(async () => {
    await fetchPostsData(currentPage.value, postsPerPage.value)
})
</script>

<template>
    <div class="px-4">
        <main class="mx-auto  w-full pb-16">
            <div class="mb-10">
                <p class="eyebrow mb-3">/{{ t('nav.writing') }}</p>
                <h1 class="font-mono font-semibold text-3xl lg:text-4xl tracking-tight text-primary mb-3">
                    {{ t('blog.title') }}
                </h1>
                <p class="text-lg text-primary max-w-xl">{{ t('blog.description') }}</p>
            </div>

            <div v-if="isLoading" class="flex justify-center py-16">
                <span class="font-mono text-sm text-muted">{{ t('blog.loading') }}</span>
            </div>

            <div v-else class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <article v-for="(post, index) in store.posts" :key="post.id"
                    v-reveal="{ delay: Math.min(index, 8) * 0.05 }"
                    @click="$router.push(`/blog/${post.slug}`)"
                    class="post-card rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg flex flex-col">
                    <div v-if="post.image_path" class="overflow-hidden">
                        <img :src="post.image_path" :alt="post.title"
                            class="w-full h-40 md:h-48 object-cover transition-transform duration-500 hover:scale-105" />
                    </div>
                    <div class="p-5 flex flex-col flex-1">
                        <h2 class="text-lg md:text-xl font-semibold text-primary mb-2">
                            <span class="link-hover">{{ post.title }}</span>
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

            <div v-if="totalPages > 1" class="mt-10 flex items-center justify-center gap-4">
                <button @click="fetchPostsData(currentPage - 1, postsPerPage)" :disabled="currentPage - 1 < 1"
                    class="page-chip w-9 h-9 flex items-center justify-center rounded-full border transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    :aria-label="t('blog.previous')">
                    <ArrowLeft class="w-4 h-4" />
                </button>

                <span class="font-mono text-xs text-muted">
                    {{ t('blog.page', { current: currentPage, total: totalPages }) }}
                </span>

                <button @click="fetchPostsData(currentPage + 1, postsPerPage)" :disabled="currentPage + 1 > totalPages"
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

.page-chip {
    color: var(--color-primary);
    border-color: var(--color-base-300);
}

.page-chip:not(:disabled):hover {
    border-color: var(--color-primary);
    background-color: var(--color-base-100);
}
</style>
