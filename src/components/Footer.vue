<script setup lang="ts">
import Links from './Links.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const currentYear = computed(() => new Date().getFullYear())
</script>

<template>
    <footer class="py-12 mt-8 border-t footer-border">
        <div class="flex flex-col items-center justify-center gap-6 text-center">
            <p class="text-sm text-muted">© {{ currentYear }} <span class="rainbow-text">Sthefany Sther</span>. {{
                t('footer.rights') }}</p>
            <Links />
        </div>
    </footer>
</template>

<style scoped>
.footer-border {
    border-color: var(--color-base-300);
}

.text-muted {
    color: var(--color-neutral);
}
</style>
