<script setup lang="ts">
import { Search } from 'lucide-vue-next'

interface Props {
    modelValue: string
    placeholder: string
}

defineProps<Props>()
const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
    <div class="relative mb-8 max-w-2xl mx-auto">
        <div class="relative">
            <input :value="modelValue" @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
                type="text" :placeholder="placeholder"
                class="w-full px-4 py-3 pl-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all duration-300" />
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 dark:text-neutral-400" />
        </div>
    </div>
</template>