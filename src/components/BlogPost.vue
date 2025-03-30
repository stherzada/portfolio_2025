<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
    title: string
    description: string
    canonical_url: string
    reading_time_minutes: number
    readable_publish_date: string
    cover_image: string | null
}

defineProps<Props>()
</script>

<template>
    <article class="group">
        <a :href="canonical_url" target="_blank" rel="noopener noreferrer"
            class="block p-6 bg-white dark:bg-neutral-800 rounded-lg transition-all duration-300 hover:shadow-lg border border-neutral-200 dark:border-neutral-700">
            <div v-if="cover_image" class="mb-4 overflow-hidden rounded-lg">
                <img :src="cover_image" :alt="title" class="w-full h-48 object-cover" />
            </div>
            <h2 class="text-2xl font-bold mb-2">
                <span
                    class="text-neutral-900 dark:text-white hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors hover-underline">
                    {{ title }}
                </span>
            </h2>
            <p class="text-neutral-700 dark:text-neutral-300 line-clamp-2 mb-4">
                {{ description }}
            </p>

            <div class="flex flex-col gap-4">
                <div class="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
                    <div class="flex items-center gap-2">
                        <span>{{ readable_publish_date }}</span>
                        <span>-</span>
                        <span>{{ reading_time_minutes }} {{ t('blog.minRead') }}</span>
                    </div>
                </div>
                <div class="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                    <span
                        class="text-sm text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors hover-underline">
                        {{ t('blog.readMore') }} →
                    </span>
                </div>
            </div>
        </a>
    </article>
</template>