<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Links from './Links.vue'
import AnimatedCircle from './AnimatedCircle.vue'
import ScrambleText from './ScrambleText.vue'

const { t } = useI18n()
</script>

<template>
    <section id="about" class="min-h-screen flex items-center justify-center">
        <div class="md:mx-8 mx-4 md:max-w-4xl w-full">
            <div class="flex flex-col lg:flex-row items-center gap-12">
                <div class="flex-1 text-center lg:text-left order-2 lg:order-1">
                    <h2 class="text-3xl lg:text-4xl font-bold mb-6 text-neutral-900 dark:text-white">
                        <ScrambleText text="Sthefany Sther" :delay="500" />
                    </h2>
                    <p class="text-lg text-neutral-700 dark:text-neutral-300 mb-4">
                        {{ t('about.description') }}
                    </p>
                    <Links />
                </div>
                <div class="relative w-64 h-64 lg:w-80 lg:h-80 rounded-3xl overflow-hidden group order-1 lg:order-2">
                    <AnimatedCircle />
                    <img src="../assets/photo-no-bg.png" alt="Sthefany Sther"
                        class="w-full h-full object-cover transition-all duration-300 ease-in-out filter grayscale hover:grayscale-0 lg:grayscale lg:hover:grayscale-0 relative z-20" />
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.group:hover img {
    filter: grayscale(0);
}

@media (max-width: 1024px) {
    img {
        filter: grayscale(0) !important;
    }
}
</style>
