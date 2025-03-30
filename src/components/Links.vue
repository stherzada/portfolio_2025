<script setup lang="ts">
import { Mail, Twitter, FileText, Twitch, Github, Linkedin } from 'lucide-vue-next'

interface Link {
    href: string
    icon: any
    alt: string
    title: string
    rel: string
}

const links: Link[] = [
    {
        href: 'mailto:contatostherzada@gmail.com',
        icon: Mail,
        alt: 'Email',
        title: 'Entre em contato por email',
        rel: 'nofollow'
    },
    {
        href: 'https://twitter.com/stherzada',
        icon: Twitter,
        alt: 'Twitter',
        title: 'Siga-me no Twitter',
        rel: 'me noopener'
    },
    {
        href: 'https://beacons.ai/stherzada/mediakit?origin=lib',
        icon: FileText,
        alt: 'Media Kit',
        title: 'Acesse meu Media Kit',
        rel: 'noopener'
    },
    {
        href: 'https://twitch.tv/stherzada',
        icon: Twitch,
        alt: 'Twitch',
        title: 'Assista minhas lives na Twitch',
        rel: 'me noopener'
    },
    {
        href: 'https://github.com/stherzada',
        icon: Github,
        alt: 'GitHub',
        title: 'Veja meus projetos no GitHub',
        rel: 'me noopener'
    },
    {
        href: 'https://www.linkedin.com/in/sthefany-sther/',
        icon: Linkedin,
        alt: 'LinkedIn',
        title: 'Conecte-se comigo no LinkedIn',
        rel: 'me noopener'
    }
]
</script>

<template>
    <nav class="flex flex-wrap justify-center lg:justify-start gap-4 mt-4" aria-label="Links de redes sociais">
        <a v-for="link in links" :key="link.href" :href="link.href" :title="link.title" :rel="link.rel" target="_blank"
            class="flex items-center gap-2 p-2 rounded-lg transition-all duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
            :aria-label="link.alt">
            <component :is="link.icon" class="w-5 h-5" aria-hidden="true" />
            <span class="sr-only">{{ link.alt }}</span>
        </a>
    </nav>
</template>

<style scoped>
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
</style>