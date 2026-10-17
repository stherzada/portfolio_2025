<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useReducedMotion } from '../composables/useReducedMotion'

interface Props {
    text: string
    delay?: number
    scrambleSpeed?: number
    iterationSpeed?: number
    preserveCase?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    delay: 0,
    scrambleSpeed: 50,
    iterationSpeed: 4,
    preserveCase: true
})

const scrambledText = ref('')
const isHovering = ref(false)
const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
let interval: number | null = null
let delayTimeout: number | null = null
const prefersReducedMotion = useReducedMotion()

const getRandomLetter = (originalLetter: string) => {
    if (props.preserveCase) {
        const isUpperCase = originalLetter === originalLetter.toUpperCase()
        const randomLetter = letters[Math.floor(Math.random() * (isUpperCase ? letters.length : 26))] as string
        return isUpperCase ? randomLetter.toUpperCase() : randomLetter.toLowerCase()
    }
    return letters[Math.floor(Math.random() * letters.length)]
}

const startScramble = () => {
    if (prefersReducedMotion.value) return
    isHovering.value = true
    let iteration = 0
    const originalText = props.text

    clearInterval(interval as number)

    interval = window.setInterval(() => {
        scrambledText.value = originalText
            .split('')
            .map((letter, index) => {
                if (letter === ' ') return ' '
                if (index < iteration) return letter
                return getRandomLetter(letter)
            })
            .join('')

        if (iteration >= originalText.length) {
            clearInterval(interval as number)
            scrambledText.value = originalText
        }

        iteration += 1 / props.iterationSpeed
    }, props.scrambleSpeed)
}



onUnmounted(() => {
    if (interval) clearInterval(interval)
    if (delayTimeout) clearTimeout(delayTimeout)
})

watch(() => props.text, (newText) => {
    scrambledText.value = newText
    if (isHovering.value) startScramble()
})

onMounted(() => {
    scrambledText.value = props.text
    if (props.delay > 0) {
        delayTimeout = window.setTimeout(startScramble, props.delay)
    }
})
</script>

<template>
    <!-- Screen readers get the real text; the scrambling span is visual only. -->
    <span class="text-primary inline-block cursor-pointer select-none transition-colors duration-300"
        :class="{ 'hover:text-primary': !isHovering }" @mouseenter="startScramble">
        <span class="sr-only">{{ text }}</span>
        <span aria-hidden="true">{{ scrambledText }}</span>
    </span>
</template>
