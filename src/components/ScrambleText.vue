<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{
    text: string
    delay?: number
}>()

const scrambledText = ref('')
const letters = 'abcdefghijklmnopqrstuvwxyz'
let interval: number | null = null

const startScramble = () => {
    let iteration = 0
    const originalText = props.text

    clearInterval(interval as number)

    interval = setInterval(() => {
        scrambledText.value = originalText
            .split('')
            .map((letter, index) => {
                if (index < iteration) {
                    return originalText[index]
                }
                return letters[Math.floor(Math.random() * 26)]
            })
            .join('')

        if (iteration >= originalText.length) {
            clearInterval(interval as number)
            scrambledText.value = originalText
        }

        iteration += 1 / 4
    }, 50)
}

const stopScramble = () => {
    clearInterval(interval as number)
    scrambledText.value = props.text
}


watch(() => props.text, (newText) => {
    scrambledText.value = newText
})

onMounted(() => {
    scrambledText.value = props.text
    if (props.delay) {
        setTimeout(startScramble, props.delay)
    }
})
</script>

<template>
    <span class="inline-block" @mouseenter="startScramble" @mouseleave="stopScramble">
        {{ scrambledText }}
    </span>
</template>