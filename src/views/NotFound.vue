<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useEventListener } from '@vueuse/core'
import { useMeta } from '../composables/useMeta'
import AsciiField from '../components/AsciiField.vue'

const { t } = useI18n()
const router = useRouter()
const { setNoIndex, updateTitle } = useMeta()

onMounted(() => {
  updateTitle(`${t('notFound.title')} - Sthefany Sther`)
  setNoIndex(true)
})

// `$ cd ~` behaves like a prompt: Enter anywhere on the page runs it, as long
// as nothing else (the terminal overlay, a focused link) is taking the key.
useEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key !== 'Enter' || e.defaultPrevented) return
  if (document.activeElement && document.activeElement !== document.body) return
  router.push('/')
})
</script>

<template>
  <main class="not-found relative flex flex-col items-center min-h-svh overflow-hidden px-5">
    <AsciiField />

    <p class="nf-logo relative z-10 font-mono text-primary">
      sthefany sther<span class="hero-cursor" aria-hidden="true">_</span>
    </p>

    <div class="relative z-10 flex flex-1 items-center justify-center w-full py-12">
      <div class="nf-content flex flex-col items-center text-center">
        <h1 class="nf-code font-mono">
          <span aria-hidden="true">404</span>
          <span class="sr-only">404 - {{ t('notFound.title') }}</span>
        </h1>
        <div class="nf-divider" aria-hidden="true" />
        <p class="nf-message font-mono text-primary">{{ t('notFound.message') }}</p>
        <router-link to="/" class="nf-prompt font-mono" :aria-label="t('notFound.backHome')">
          <span class="nf-dim">$</span> cd ~
          <span class="nf-dim">#&nbsp;{{ t('notFound.comment') }}</span>
          <kbd class="nf-enter" aria-hidden="true">↵</kbd>
        </router-link>
      </div>
    </div>
  </main>
</template>

<style scoped>
.nf-logo {
  margin-top: 80px;
  font-size: 22px;
  font-weight: 600;
  line-height: 40px;
  letter-spacing: -0.04em;
}

.nf-content {
  width: 483px;
  gap: 44px;
}

.nf-code {
  font-size: clamp(200px, 30vw, 295.751px);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.0833em;
  /* Mono glyphs carry their tracking on the right; pull it back so 404 stays centred. */
  margin-right: -0.0833em;
  /* Room below the baseline so background-clip never crops the numerals;
     digits have no descenders, so pull the empty part back out of the gap. */
  padding-bottom: 0.06em;
  margin-bottom: -0.14em;
  color: var(--color-primary);
}

/* The fading gradient glows on black but turns muddy grey on paper, so the
   light theme keeps the numerals solid ink. */
:global(.dark .nf-code) {
  background-image: linear-gradient(
    247.33deg,
    var(--color-primary) 2.53%,
    color-mix(in srgb, var(--color-primary) 40%, transparent) 93.61%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.nf-divider {
  width: 425px;
  height: 1px;
  background: var(--color-primary);
}

.nf-message {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -2px;
}

/* A terminal line framed as a button; hover inverts it like a selection. */
.nf-prompt {
  display: inline-flex;
  align-items: center;
  gap: 0.6em;
  padding: 10px 16px;
  border: 1px solid var(--color-primary);
  background: var(--color-base-200);
  color: var(--color-primary);
  font-size: 15px;
  line-height: 1.2;
  white-space: nowrap;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.nf-prompt:hover,
.nf-prompt:focus-visible {
  background: var(--color-primary);
  color: var(--color-base-200);
}

.nf-dim {
  opacity: 0.55;
}

.nf-enter {
  font-family: inherit;
  font-size: 0.85em;
  padding: 1px 6px;
  border: 1px solid currentColor;
  border-radius: 3px;
  opacity: 0.7;
}

/* Touch screens have no Enter key to hint at. */
@media (hover: none) {
  .nf-enter {
    display: none;
  }
}

/* Short desktop windows: shrink the numerals before the group overflows. */
@media (min-width: 641px) and (max-height: 820px) {
  .nf-code {
    font-size: clamp(160px, 26svh, 295.751px);
  }

  .nf-content {
    gap: 32px;
  }
}

@media (max-width: 640px) {
  .nf-logo {
    margin-top: 32px;
    transform: scale(0.75);
  }

  .nf-content {
    width: min(100% - 40px, 360px);
    gap: 28px;
  }

  /* !important: style.css forces every mobile h1 down to blog-title size. */
  .nf-code {
    font-size: clamp(140px, 52vw, 200px) !important;
    line-height: 1.1 !important;
    margin-bottom: -0.14em !important;
    letter-spacing: -0.09em;
    margin-right: -0.09em;
    height: auto;
    min-height: 0;
    padding-bottom: 0.08em;
  }

  .nf-divider {
    width: 100%;
  }

  .nf-message {
    font-size: clamp(16px, 4.5vw, 20px);
    letter-spacing: -1.3px;
  }
}
</style>
