<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMeta } from '../composables/useMeta'

const { t } = useI18n()
const { setNoIndex, updateTitle } = useMeta()

onMounted(() => {
  updateTitle(`${t('notFound.title')} - Sthefany Sther`)
  setNoIndex(true)
})
</script>

<template>
  <div>
    <main class="min-h-[60svh] flex flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 class="text-4xl font-bold text-primary">404 - {{ t('notFound.title') }}</h1>
      <router-link to="/" class="link-hover font-mono text-sm text-primary">{{ t('notFound.backHome') }}</router-link>
    </main>
  </div>
</template>
