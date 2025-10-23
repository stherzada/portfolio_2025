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
            class="block p-6 rounded-lg transition-all duration-300 hover:shadow-lg card">
            <div v-if="cover_image" class="mb-4 overflow-hidden rounded-lg">
                <img :src="cover_image" :alt="title" class="w-full h-48 object-cover" />
            </div>
            <h2 class="text-2xl font-bold mb-2">
                <span class="text-primary link-underline">
                    {{ title }}
                </span>
            </h2>
            <p class="line-clamp-2 mb-4 text-base-content dark:text-base-content-dark">
                {{ description }}
            </p>

            <div class="flex flex-col gap-3">
                <div class="flex items-center justify-between text-sm text-primary">
                    <div class="flex items-center gap-2">
                        <span>{{ readable_publish_date }}</span>
                        <span>-</span>
                        <span>{{ reading_time_minutes }} {{ t('blog.minRead') }}</span>
                    </div>
                </div>
                <div class="border-t card-divider pt-4">
                    <span class="text-sm text-base-content dark:text-base-content-dark hover:text-primary dark:hover:text-primary-dark transition-colors link-underline">
                        {{ t('blog.readMore') }} →
                    </span>
                </div>
            </div>
        </a>
    </article>
</template>

