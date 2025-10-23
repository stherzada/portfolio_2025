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
                class="search-input w-full px-4 py-3 pl-12 rounded-xl transition-all duration-500 ease-in-out" />
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300" />
        </div>
    </div>
</template>
