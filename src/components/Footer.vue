<script setup lang="ts">
import Links from './Links.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const currentYear = computed(() => new Date().getFullYear())
</script>

<template>
    <footer class="bg-white dark:bg-neutral-900 text-neutral-700 dark:text-white py-8">
        <div class="flex flex-col items-center justify-center">
            <p class="text-center">© {{ currentYear }} <span class="rainbow-text">Sthefany Sther</span>. {{
                t('footer.rights') }}</p>
            <Links />
        </div>
    </footer>
</template>

<style scoped>
.rainbow-text {
    transition: all 0.3s ease;
    color: inherit;
}

.rainbow-text:hover {
    background: linear-gradient(to right,
            #ff0000 0%,
            #ff00ff 17%,
            #0000ff 33%,
            #00ffff 50%,
            #00ff00 67%,
            #ffff00 83%,
            #ff0000 100%);
    background-size: 200% auto;
    color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
    background-position: 0% center;
    animation: rainbow-move 2s linear infinite;
}

@keyframes rainbow-move {
    to {
        background-position: 200% center;
    }
}
</style>