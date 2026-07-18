<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { defineAsyncComponent, ref, onMounted } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import Links from './Links.vue'
import AnimatedCircle from './AnimatedCircle.vue'
import ScrambleText from './ScrambleText.vue'
import { useReducedMotion } from '../composables/useReducedMotion'

const { t } = useI18n()

const ParticleField = defineAsyncComponent(() => import('./three/ParticleField.vue'))
const prefersReducedMotion = useReducedMotion()
const showParticleField = ref(false)

function hasWebGL(): boolean {
    try {
        const canvas = document.createElement('canvas')
        return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
    } catch {
        return false
    }
}

// Only pay the Three.js bundle/runtime cost when it'll actually render
// something worthwhile: motion allowed, WebGL available, screen big enough.
onMounted(() => {
    showParticleField.value = !prefersReducedMotion.value && window.innerWidth >= 480 && hasWebGL()
})

const scrollToNext = () => {
    document.getElementById('writing')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
    <section id="about" class="relative flex items-center justify-center min-h-[calc(100vh-6rem)] py-16 overflow-hidden">
        <ParticleField v-if="showParticleField" />
        <div class="relative z-10 md:mx-8 mx-4 md:max-w-4xl w-full">
            <div class="flex flex-col lg:flex-row items-center gap-12">
                <div class="flex-1 text-center lg:text-left order-2 lg:order-1" v-reveal>
                    <h1 class="font-mono font-semibold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight mb-4 text-primary">
                        <ScrambleText text="Sthefany Sther" :delay="500" /><span class="hero-cursor" aria-hidden="true">_</span>
                    </h1>
                    <p class="font-mono text-sm sm:text-base text-muted mb-6">
                        <span class="opacity-50">$</span> {{ t('about.role') }}
                    </p>
                    <p class="text-lg leading-relaxed mb-6 text-primary max-w-xl mx-auto lg:mx-0">
                        {{ t('about.description') }}
                    </p>
                    <Links />
                </div>
                <div class="relative w-56 h-56 lg:w-72 lg:h-72 rounded-3xl overflow-hidden group order-1 lg:order-2"
                    v-reveal="{ delay: 0.15 }">
                    <AnimatedCircle />
                    <img src="/src/assets/photo-no-bg.png" alt="Sthefany Sther"
                        class="w-full h-full object-cover transition-all duration-300 ease-in-out filter grayscale hover:grayscale-0 lg:grayscale lg:hover:grayscale-0 relative z-20" />
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
