<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
    title: string
    description: string
    canonical_url: string
    reading_time_minutes: number
    readable_publish_date: string
}>()
</script>

<template>
    <article>
        <a :href="canonical_url" target="_blank" rel="noopener noreferrer"
            class="block p-6 bg-white dark:bg-neutral-800 rounded-lg transition-all duration-300 hover:shadow-lg border border-neutral-200 dark:border-neutral-700">
            <h2 class="text-2xl font-bold mb-2 relative inline-block group">
                <span
                    class="text-neutral-900 dark:text-white hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                    {{ title }}
                </span>
                <span
                    class="absolute -bottom-1 left-0 w-0 h-0.5 bg-neutral-900 dark:bg-white transition-all duration-300 ease-in-out group-hover:w-full"></span>
            </h2>
            <p class="text-neutral-700 dark:text-neutral-300 line-clamp-2 mb-4">
                {{ description }}
            </p>
            <div class="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
                <div class="flex items-center gap-2">
                    <span>{{ readable_publish_date }}</span>
                    <span>-</span>
                    <span>{{ reading_time_minutes }} {{ t('blog.minRead') }}</span>
                </div>
                <ArrowUpRight class="w-5 h-5 opacity-0 hover:opacity-100 transition-opacity" />
            </div>
        </a>
    </article>
</template>