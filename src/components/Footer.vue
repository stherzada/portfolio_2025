<script setup lang="ts">
import Links from './Links.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { openTerminal } from '../composables/useTerminal'

const { t } = useI18n()
const currentYear = computed(() => new Date().getFullYear())
</script>

<template>
    <footer class=" p-7 md:py-12 mt-8 border-t footer-border">
        <div class="flex flex-col items-center justify-center gap-6 text-center">
            <p class="text-sm text-muted">© {{ currentYear }} <span class="rainbow-text">Sthefany Sther</span>. {{
                t('footer.rights') }}</p>
            <Links />
            <!-- The terminal is otherwise only reachable with the "/" key, which touch devices don't have. -->
            <button type="button" @click="openTerminal" :aria-label="t('terminal.open')"
                class="font-mono text-xs text-muted link-fade cursor-pointer">~$_</button>
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
