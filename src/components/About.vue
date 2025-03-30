<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Links from './Links.vue'
import { ref, onMounted } from 'vue'

const { t } = useI18n()
const firstName = ref('')
const lastName = ref('')
const isHovering = ref(false)

const letters = 'abcdefghijklmnopqrstuvwxyz'
let firstNameInterval: number | null = null
let lastNameInterval: number | null = null

const scrambleText = (text: string, iteration: number) => {
    return text
        .split('')
        .map((_, index) => {
            if (index < iteration) {
                return text[index]
            }
            return letters[Math.floor(Math.random() * 26)]
        })
        .join('')
}

const startScramble = () => {
    let firstNameIteration = 0
    let lastNameIteration = 0
    const originalFirstName = 'Sthefany'
    const originalLastName = 'Sther'

    clearInterval(firstNameInterval as number)
    clearInterval(lastNameInterval as number)

    firstNameInterval = setInterval(() => {
        firstName.value = scrambleText(originalFirstName, firstNameIteration)

        if (firstNameIteration >= originalFirstName.length) {
            clearInterval(firstNameInterval as number)
            firstName.value = originalFirstName
        }

        firstNameIteration += 1 / 4
    }, 50) as unknown as number


    setTimeout(() => {
        lastNameInterval = setInterval(() => {
            lastName.value = scrambleText(originalLastName, lastNameIteration)

            if (lastNameIteration >= originalLastName.length) {
                clearInterval(lastNameInterval as number)
                lastName.value = originalLastName
            }

            lastNameIteration += 1 / 4
        }, 50) as unknown as number
    }, 300)
}

const startHoverEffect = () => {
    isHovering.value = true
    startScramble()
}

const stopHoverEffect = () => {
    isHovering.value = false
    clearInterval(firstNameInterval as number)
    clearInterval(lastNameInterval as number)
    firstName.value = 'Sthefany'
    lastName.value = 'Sther'
}

onMounted(() => {
    firstName.value = 'Sthefany'
    lastName.value = 'Sther'
    setTimeout(() => {
        startScramble()
    }, 500)
})
</script>

<template>
    <section id="about" class="min-h-screen flex items-center justify-center">
        <div class="md:mx-8 mx-4 md:max-w-4xl w-full">
            <div class="flex flex-col lg:flex-row items-center gap-12">
                <div class="flex-1 text-center lg:text-left order-2 lg:order-1">
                    <h2 class="text-3xl lg:text-4xl font-bold mb-6 text-neutral-900 dark:text-white cursor-pointer glitch-container"
                        @mouseenter="startHoverEffect" @mouseleave="stopHoverEffect">
                        <div :class="{ 'glitch': isHovering }" class="inline-block">
                            {{ firstName }} {{ lastName }}
                            <span v-if="isHovering" aria-hidden="true">{{ firstName }} {{ lastName }}</span>
                            <span v-if="isHovering" aria-hidden="true">{{ firstName }} {{ lastName }}</span>
                        </div>
                    </h2>
                    <p class="text-lg text-neutral-700 dark:text-neutral-300 mb-4">
                        {{ t('about.description') }}
                    </p>
                    <Links />
                </div>
                <div class="relative w-64 h-64 lg:w-80 lg:h-80 rounded-full overflow-hidden group order-1 lg:order-2">
                    <img src="https://github.com/stherzada.png" alt="Sthefany Sther"
                        class="w-full h-full object-cover transition-all duration-300 ease-in-out filter grayscale hover:grayscale-0 lg:grayscale lg:hover:grayscale-0" />
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

.glitch-container {
    line-height: 1.5;
}

.glitch {
    position: relative;
    display: inline-block;
    font-weight: bold;
    letter-spacing: 0.1em;
    text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75),
        -0.025em -0.05em 0 rgba(0, 255, 0, 0.75),
        0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
    animation: glitch 500ms infinite;
}

.glitch span {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.glitch>span:first-child {
    animation: glitch 650ms infinite;
    clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
    transform: translate(-0.025em, -0.0125em);
    opacity: 0.75;
}

.glitch>span:last-child {
    animation: glitch 375ms infinite;
    clip-path: polygon(0 80%, 100% 20%, 100% 100%, 0 100%);
    transform: translate(0.0125em, 0.025em);
}

@keyframes glitch {
    0% {
        text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75),
            -0.05em -0.025em 0 rgba(0, 255, 0, 0.75),
            -0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
    }

    14% {
        text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75),
            -0.05em -0.025em 0 rgba(0, 255, 0, 0.75),
            -0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
    }

    15% {
        text-shadow: -0.05em -0.025em 0 rgba(255, 0, 0, 0.75),
            0.025em 0.025em 0 rgba(0, 255, 0, 0.75),
            -0.05em -0.05em 0 rgba(0, 0, 255, 0.75);
    }

    49% {
        text-shadow: -0.05em -0.025em 0 rgba(255, 0, 0, 0.75),
            0.025em 0.025em 0 rgba(0, 255, 0, 0.75),
            -0.05em -0.05em 0 rgba(0, 0, 255, 0.75);
    }

    50% {
        text-shadow: 0.025em 0.05em 0 rgba(255, 0, 0, 0.75),
            0.05em 0 0 rgba(0, 255, 0, 0.75),
            0 -0.05em 0 rgba(0, 0, 255, 0.75);
    }

    99% {
        text-shadow: 0.025em 0.05em 0 rgba(255, 0, 0, 0.75),
            0.05em 0 0 rgba(0, 255, 0, 0.75),
            0 -0.05em 0 rgba(0, 0, 255, 0.75);
    }

    100% {
        text-shadow: -0.025em 0 0 rgba(255, 0, 0, 0.75),
            -0.025em -0.025em 0 rgba(0, 255, 0, 0.75),
            -0.025em -0.05em 0 rgba(0, 0, 255, 0.75);
    }
}

@media (prefers-reduced-motion: reduce) {

    .glitch,
    .glitch>span {
        animation: none;
        text-shadow: none;
    }
}
</style>
