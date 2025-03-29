<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
    <div class="flex flex-wrap justify-center lg:justify-start gap-4 mt-6">
        <a href="#"
            class="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200 relative group">
            {{ t('about.links.email') }}
            <span
                class="absolute -bottom-1 left-0 w-0 h-0.5 bg-neutral-900 dark:bg-white transition-all duration-300 ease-in-out group-hover:w-full"></span>
        </a>
        <a href="#"
            class="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200 relative group">
            {{ t('about.links.twitter') }}
            <span
                class="absolute -bottom-1 left-0 w-0 h-0.5 bg-neutral-900 dark:bg-white transition-all duration-300 ease-in-out group-hover:w-full"></span>
        </a>
        <a href="#"
            class="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200 relative group">
            {{ t('about.links.midiaKit') }}
            <span
                class="absolute -bottom-1 left-0 w-0 h-0.5 bg-neutral-900 dark:bg-white transition-all duration-300 ease-in-out group-hover:w-full"></span>
        </a>
        <a href="#"
            class="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200 relative group">
            {{ t('about.links.twitch') }}
            <span
                class="absolute -bottom-1 left-0 w-0 h-0.5 bg-neutral-900 dark:bg-white transition-all duration-300 ease-in-out group-hover:w-full"></span>
        </a>
        <a href="#"
            class="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200 relative group">
            {{ t('about.links.github') }}
            <span
                class="absolute -bottom-1 left-0 w-0 h-0.5 bg-neutral-900 dark:bg-white transition-all duration-300 ease-in-out group-hover:w-full"></span>
        </a>
        <a href="#"
            class="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200 relative group">
            {{ t('about.links.linkedin') }}
            <span
                class="absolute -bottom-1 left-0 w-0 h-0.5 bg-neutral-900 dark:bg-white transition-all duration-300 ease-in-out group-hover:w-full"></span>
        </a>
    </div>
</template>