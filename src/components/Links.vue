<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
interface Link {
    href: string
    text: string
}
const links: Link[] = [
    { href: 'mailto:contatostherzada@gmail.com', text: t('about.links.email') },
    { href: 'https://twitter.com/stherzada', text: t('about.links.twitter') },
    { href: 'https://beacons.ai/stherzada/mediakit?origin=lib', text: t('about.links.midiaKit') },
    { href: 'https://twitch.tv/stherzada', text: t('about.links.twitch') },
    { href: 'https://github.com/stherzada', text: t('about.links.github') },
    { href: 'https://www.linkedin.com/in/sthefany-sther/', text: t('about.links.linkedin') },
]
</script>

<template>
    <div class="flex flex-wrap justify-center lg:justify-start gap-4 mt-6">
        <a v-for="link in links" :href="link.href" target="_blank"
            class="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200 relative group">
            {{ link.text }}
            <span
                class="absolute -bottom-1 left-0 w-0 h-0.5 bg-neutral-900 dark:bg-white transition-all duration-300 ease-in-out group-hover:w-full"></span>
        </a>
      
    </div>
</template>