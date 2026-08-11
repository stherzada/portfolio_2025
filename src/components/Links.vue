<script setup lang="ts">
import { Mail, Twitter, FileText, Twitch, Github, Linkedin } from 'lucide-vue-next'
import { useTwitchLiveStatus } from '../composables/useTwitchLiveStatus'

interface Link {
    href: string
    icon: any
    alt: string
    title: string
    rel: string
}

const { twitchLiveStatus } = useTwitchLiveStatus()

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
    <nav class="flex flex-wrap justify-center lg:justify-start gap-2 mt-4" aria-label="Links de redes sociais">
        <a v-for="link in links" :key="link.href" :href="link.href"
            :title="link.alt === 'Twitch' && twitchLiveStatus.isLive ? 'Ao vivo agora na Twitch' : link.title"
            :rel="link.rel" target="_blank" v-magnetic="{ strength: 0.4 }"
            class="social-chip flex items-center gap-2 pl-2.5 pr-3 py-2 rounded-full transition-colors duration-200 border"
            :aria-label="link.alt === 'Twitch' && twitchLiveStatus.isLive ? `${link.alt}, ao vivo agora` : link.alt">
            <span class="relative inline-flex">
                <component :is="link.icon" class="w-4 h-4" aria-hidden="true" />
                <span v-if="link.alt === 'Twitch' && twitchLiveStatus.isLive" class="live-badge" aria-hidden="true" />
            </span>
            <span class="font-mono text-xs tracking-wide uppercase">{{ link.alt }}</span>
        </a>
    </nav>
</template>

<style scoped>
.social-chip {
    color: var(--color-primary);
    border-color: var(--color-base-300);
}

.social-chip:hover {
    background-color: var(--color-base-100);
    border-color: var(--color-primary);
}

.live-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background-color: #ef4444;
    animation: live-badge-pulse 1.6s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
    .live-badge {
        animation: none;
    }
}

@keyframes live-badge-pulse {

    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.5;
        transform: scale(0.85);
    }
}
</style>