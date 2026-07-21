<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useReducedMotion } from '../composables/useReducedMotion'

interface NowPlaying {
    isPlaying: boolean
    title?: string
    artist?: string
    albumImageUrl?: string
    songUrl?: string
}

const POLL_INTERVAL_MS = 30_000

const nowPlaying = ref<NowPlaying>({ isPlaying: false })
const prefersReducedMotion = useReducedMotion()
let pollId: ReturnType<typeof setInterval> | undefined

async function fetchNowPlaying() {
    try {
        const response = await fetch('/api/spotify-now-playing')
        if (!response.ok) throw new Error(`Unexpected status ${response.status}`)
        nowPlaying.value = await response.json()
    } catch {
        // Network hiccup or the endpoint isn't available (e.g. local `vite dev`
        // without `vercel dev`) — just fall back to the offline state.
        nowPlaying.value = { isPlaying: false }
    }
}

onMounted(() => {
    fetchNowPlaying()
    pollId = setInterval(fetchNowPlaying, POLL_INTERVAL_MS)
})

onUnmounted(() => {
    if (pollId) clearInterval(pollId)
})
</script>

<template>
    <a v-if="nowPlaying.isPlaying" :href="nowPlaying.songUrl" target="_blank" rel="noopener"
        class="spotify-card flex items-center gap-3 w-full max-w-xs px-3 py-2.5 rounded-2xl border transition-colors duration-200"
        title="Ouvindo agora no Spotify">
        <img v-if="nowPlaying.albumImageUrl" :src="nowPlaying.albumImageUrl" :alt="nowPlaying.title"
            class="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
        <div class="min-w-0 flex-1 text-left">
            <p class="font-mono text-xs truncate text-primary">{{ nowPlaying.title }}</p>
            <p class="font-mono text-[11px] truncate text-muted">{{ nowPlaying.artist }}</p>
        </div>
        <div class="equalizer flex-shrink-0" :class="{ 'equalizer-paused': prefersReducedMotion }" aria-hidden="true">
            <span /><span /><span />
        </div>
    </a>

    <div v-else
        class="spotify-card flex items-center gap-2.5 w-full max-w-xs px-3 py-2.5 rounded-2xl border text-muted">
        <svg viewBox="0 0 24 24" class="w-5 h-5 flex-shrink-0" fill="currentColor" aria-hidden="true">
            <path
                d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.021zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.72 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
        <span class="font-mono text-xs">Não estou ouvindo nada agora</span>
    </div>
</template>

<style scoped>
.spotify-card {
    background-color: var(--color-base-100);
    border-color: var(--color-base-300);
}

a.spotify-card:hover {
    border-color: var(--color-primary);
}

.text-muted {
    color: var(--color-neutral);
}

.equalizer {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 14px;
}

.equalizer span {
    width: 3px;
    border-radius: 2px;
    background-color: var(--color-primary);
    animation: equalizer-bounce 1s ease-in-out infinite;
}

.equalizer span:nth-child(1) {
    animation-delay: -0.4s;
}

.equalizer span:nth-child(2) {
    animation-delay: -0.2s;
}

.equalizer span:nth-child(3) {
    animation-delay: 0s;
}

.equalizer-paused span {
    animation: none;
    height: 40%;
}

@keyframes equalizer-bounce {

    0%,
    100% {
        height: 30%;
    }

    50% {
        height: 100%;
    }
}
</style>
