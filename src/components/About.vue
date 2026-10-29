<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { defineAsyncComponent, ref, onMounted } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import Links from './Links.vue'
import AnimatedCircle from './AnimatedCircle.vue'
import ScrambleText from './ScrambleText.vue'
import SpotifyNowPlaying from './SpotifyNowPlaying.vue'
import TwitchLiveStatus from './TwitchLiveStatus.vue'

const { t } = useI18n()

const AsciiDragons = defineAsyncComponent(() => import('./AsciiDragons.vue'))
const showDragons = ref(false)
const textRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)

// Mount after first paint so the canvas sizing never holds up the hero.
onMounted(() => {
    showDragons.value = true
})

// The photo is a PNG with a transparent background, so hovering the square box
// isn't enough: only color it in when the cursor is over an opaque pixel.
const photoColored = ref(false)
let photoAlpha: { data: Uint8ClampedArray; w: number; h: number } | null = null

const loadPhotoAlpha = (e: Event) => {
    const img = e.target as HTMLImageElement
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    ctx.drawImage(img, 0, 0)
    photoAlpha = { data: ctx.getImageData(0, 0, canvas.width, canvas.height).data, w: canvas.width, h: canvas.height }
}

const onPhotoMove = (e: MouseEvent) => {
    if (!photoAlpha) {
        photoColored.value = true
        return
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = Math.min(photoAlpha.w - 1, Math.floor(((e.clientX - rect.left) / rect.width) * photoAlpha.w))
    const y = Math.min(photoAlpha.h - 1, Math.floor(((e.clientY - rect.top) / rect.height) * photoAlpha.h))
    photoColored.value = (photoAlpha.data[(y * photoAlpha.w + x) * 4 + 3] ?? 0) > 32
}

const scrollToNext = () => {
    document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
    <section id="about" class="relative flex items-center justify-center min-h-[calc(100svh-6rem)] py-16 overflow-hidden">
        <AsciiDragons v-if="showDragons" :avoid="textRef" :content="contentRef" />
        <div ref="contentRef" class="relative z-10 m-6 md:mx-8 md:max-w-4xl w-full">
            <div class="flex flex-col lg:flex-row items-center gap-12">
                <div ref="textRef" class="flex-1 text-center lg:text-left order-2 lg:order-1" v-reveal="{ stagger: 0.1 }">
                    <h1 class="font-mono font-semibold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight mb-4 text-primary">
                        <ScrambleText text="Sthefany Sther" :delay="500" /><span class="hero-cursor" aria-hidden="true">_</span>
                    </h1>
                    <p class="font-mono text-sm sm:text-base text-muted mb-6">
                        <span class="opacity-50">$</span> {{ t('about.role') }}
                    </p>
                    <p class="text-lg p-1 leading-relaxed mb-6 text-primary max-w-xl mx-auto lg:mx-0">
                        {{ t('about.description') }}
                    </p>
                    <Links />
                </div>
                <div class="flex flex-col items-center gap-5 order-1 lg:order-2" v-reveal="{ delay: 0.2 }">
                    <div class="relative w-56 h-56 lg:w-72 lg:h-72 rounded-3xl overflow-hidden">
                        <AnimatedCircle />
                        <img src="/src/assets/photo-no-bg.png" alt="Sthefany Sther" fetchpriority="high" width="288" height="288"
                            @load="loadPhotoAlpha" @mousemove="onPhotoMove" @mouseleave="photoColored = false"
                            class="w-full h-full object-cover transition-all duration-300 ease-in-out filter relative z-20"
                            :class="photoColored ? 'grayscale-0' : 'grayscale'" />
                    </div>
                    <SpotifyNowPlaying />
                    <TwitchLiveStatus />
                </div>
            </div>
        </div>

        <button @click="scrollToNext"
            class="scroll-cue hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 items-center justify-center w-10 h-10 rounded-full text-muted hover:text-primary transition-colors cursor-pointer"
            aria-label="Scroll">
            <ChevronDown class="w-5 h-5" />
        </button>
    </section>
</template>

<style scoped>
.text-muted {
    color: var(--color-neutral);
}

@keyframes scroll-cue-bounce {
    0%, 100% { transform: translate(-50%, 0); }
    50% { transform: translate(-50%, 6px); }
}

.scroll-cue {
    animation: scroll-cue-bounce 2.2s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
    .scroll-cue {
        animation: none;
    }
}
</style>
