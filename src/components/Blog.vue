<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ArrowRight, Calendar, Clock } from 'lucide-vue-next'
import { ref, onMounted } from 'vue'
import { fetchPostsAll  } from '../services/blog'
import type { Post } from '../types/Post';
import { formatReadingTime } from '../utils/readingTime'
import { formatDateWithI18n } from '../utils/dateFormat'

const { t, locale } = useI18n()
const featuredPost = ref<Post | undefined>(undefined)

onMounted(async () => {
    const { posts } = await fetchPostsAll(1, 1)
    featuredPost.value = posts[0]
})
</script>

<template>
    <section id="writing" class="flex items-center justify-center py-16 scroll-mt-24">
        <div class="md:mx-8 mx-4 md:max-w-4xl w-full">
            <div class="mb-10">
                <p class="eyebrow mb-3">/{{ t('nav.writing') }}</p>
                <router-link to="/blog" class="inline-flex items-center gap-2">
                    <h2 class="link-hover font-mono font-semibold text-3xl lg:text-4xl tracking-tight text-primary">
                        {{ t('blog.visitMyBlog') }}
                    </h2>
                </router-link>
            </div>

            <div v-if="featuredPost" v-reveal class="featured-post rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div class="flex flex-col lg:flex-row">
                    <router-link :to="`/blog/${featuredPost.slug}`" class="lg:w-2/5 shrink-0 block overflow-hidden">
                        <img :src="featuredPost.image_path" :alt="featuredPost.title"
                            class="w-full h-56 lg:h-full object-cover transition-transform duration-500 hover:scale-105" />
                    </router-link>

                    <div class="flex-1 p-6 lg:p-8 flex flex-col">
                        <span class="featured-tag self-start font-mono text-[0.65rem] tracking-widest uppercase px-2.5 py-1 rounded-full mb-4">
                            {{ t('blog.featuredPost') }}
                        </span>

                        <h3 class="text-2xl font-bold text-primary mb-3">
                            <router-link :to="`/blog/${featuredPost.slug}`" class="link-hover">
                                {{ featuredPost.title }}
                            </router-link>
                        </h3>

                        <p class="text-primary leading-relaxed mb-6">
                            {{ featuredPost.description }}
                        </p>

                        <div class="mt-auto flex items-center justify-between pt-4 card-divider font-mono text-xs text-muted">
                            <div class="flex items-center gap-4">
                                <span class="flex items-center gap-1">
                                    <Calendar class="h-3.5 w-3.5" />
                                    {{ formatDateWithI18n(featuredPost.created_at, locale) }}
                                </span>
                                <span class="flex items-center gap-1">
                                    <Clock class="h-3.5 w-3.5" />
                                    {{ formatReadingTime(featuredPost.content || '') }}
                                </span>
                            </div>

                            <router-link :to="`/blog/${featuredPost.slug}`" class="link-fade flex items-center gap-1.5 text-primary">
                                {{ t('blog.readMore') }} <ArrowRight class="h-3.5 w-3.5" />
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.text-muted {
    color: var(--color-neutral);
}

.featured-post {
    background-color: var(--color-base-100);
    border-color: var(--color-base-300);
}

.featured-tag {
    background-color: var(--color-base-200);
    color: var(--color-neutral);
}
</style>
