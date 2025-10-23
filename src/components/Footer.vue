<script setup lang="ts">
import Links from './Links.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const currentYear = computed(() => new Date().getFullYear())
</script>

<template>
    <footer class="py-8">
        <div class="flex flex-col items-center justify-center">
            <p class="text-center">© {{ currentYear }} <span class="rainbow-text">Sthefany Sther</span>. {{
                t('footer.rights') }}</p>
            <Links />
        </div>
    </footer>
</template>
