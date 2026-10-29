<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTwitchLiveStatus } from '../composables/useTwitchLiveStatus'
import { useReducedMotion } from '../composables/useReducedMotion'

const { twitchLiveStatus } = useTwitchLiveStatus()
const prefersReducedMotion = useReducedMotion()
const { t } = useI18n()
</script>

<template>
    <a v-if="twitchLiveStatus.isLive" :href="twitchLiveStatus.streamUrl" target="_blank" rel="noopener"
        class="flex items-center gap-2 w-fit px-3 py-2.5 rounded-2xl border transition-colors duration-200 twitch-card"
        :title="t('about.twitchLiveTitle')">
        <span class="live-dot" :class="{ 'live-dot-paused': prefersReducedMotion }" aria-hidden="true" />
        <span class="font-mono text-xs font-bold tracking-wide text-primary">{{ t('about.twitchLiveBadge') }}</span>
    </a>
</template>

<style scoped>
.twitch-card {
    border-color: var(--color-base-300);
}

.live-dot {
    width: 8px;
    height: 8px;
    border-radius: 9999px;
    background-color: #ef4444;
    animation: live-dot-pulse 1.6s ease-in-out infinite;
}

.live-dot-paused {
    animation: none;
}

@keyframes live-dot-pulse {

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
