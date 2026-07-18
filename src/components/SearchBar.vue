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
    <div class="relative">
        <div class="relative">
            <input :value="modelValue" @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
                type="text" :placeholder="placeholder"
                class="search-input w-full font-mono text-sm py-2.5 pl-10 pr-4 rounded-full" />
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        </div>
    </div>
</template>

<style scoped>
.text-muted {
    color: var(--color-neutral);
}
</style>
