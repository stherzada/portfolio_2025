<script setup lang="ts">
import { Mail, Twitter, FileText, Twitch, Github, Linkedin } from 'lucide-vue-next'


interface Link {
    href: string
    icon: any
    alt: string
}

const links: Link[] = [
    {
        href: 'mailto:contatostherzada@gmail.com',
        icon: Mail,
        alt: 'Ícone de email'
    },
    {
        href: 'https://twitter.com/stherzada',
        icon: Twitter,
        alt: 'Ícone do Twitter'
    },
    {
        href: 'https://beacons.ai/stherzada/mediakit?origin=lib',
        icon: FileText,
        alt: 'Ícone de documento para Mídia Kit'
    },
    {
        href: 'https://twitch.tv/stherzada',
        icon: Twitch,
        alt: 'Ícone da Twitch'
    },
    {
        href: 'https://github.com/stherzada',
        icon: Github,
        alt: 'Ícone do GitHub'
    },
    {
        href: 'https://www.linkedin.com/in/sthefany-sther/',
        icon: Linkedin,
        alt: 'Ícone do LinkedIn'
    }
]
</script>

<template>
    <div class="flex flex-wrap justify-center lg:justify-start gap-4 mt-6">
        <a v-for="link in links" :key="link.href" :href="link.href" target="_blank"
            class="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200 relative group"
            :aria-label="link.alt">
            <component :is="link.icon" class="w-5 h-5" />
            <span
                class="absolute -bottom-1 left-0 w-0 h-0.5 bg-neutral-900 dark:bg-white transition-all duration-300 ease-in-out group-hover:w-full" />
        </a>
    </div>
</template>