<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { X } from 'lucide-vue-next'
import { closeTerminal } from '@/composables/useTerminal'
import { triggerParticleBurst } from '@/composables/useParticleBurst'
import { startDestroyMode } from '@/composables/useDestroyMode'
import { clearSavedScrollPosition } from '@/composables/useScrollPosition'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const PROMPT = 'guest@stherzada.com:~$'

const SOCIAL_LINKS = [
  { label: 'email', href: 'mailto:contatostherzada@gmail.com' },
  { label: 'github', href: 'https://github.com/stherzada' },
  { label: 'twitter', href: 'https://twitter.com/stherzada' },
  { label: 'twitch', href: 'https://twitch.tv/stherzada' },
  { label: 'linkedin', href: 'https://www.linkedin.com/in/sthefany-sther/' },
]

interface Line {
  type: 'input' | 'output' | 'error'
  text: string
}

const lines = ref<Line[]>([])
const currentInput = ref('')
const commandHistory = ref<string[]>([])
const historyIndex = ref(0)
const inputEl = ref<HTMLInputElement | null>(null)
const outputEl = ref<HTMLDivElement | null>(null)

const windowTitle = computed(() => t('terminal.windowTitle'))

function pushLine(type: Line['type'], text: string) {
  lines.value.push({ type, text })
  nextTick(() => {
    if (outputEl.value) outputEl.value.scrollTop = outputEl.value.scrollHeight
  })
}

// Sections like #projects are async components, so after navigating home
// they may not exist yet; wait (briefly) for them to mount.
async function waitForElement(id: string, timeoutMs = 3000): Promise<HTMLElement | null> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const el = document.getElementById(id)
    if (el) return el
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  return null
}

function goToSection(id: string, announceKey: string) {
  pushLine('output', t(announceKey))
  setTimeout(async () => {
    closeTerminal()
    if (route.path !== '/') {
      // Otherwise Home's scroll restoration would override this jump.
      clearSavedScrollPosition()
      await router.push('/')
    }
    const el = await waitForElement(id)
    el?.scrollIntoView({ behavior: 'smooth' })
  }, 300)
}

function goToBlog() {
  pushLine('output', t('terminal.navigatingBlog'))
  setTimeout(() => {
    router.push('/blog')
    closeTerminal()
  }, 300)
}

function runCommand(raw: string) {
  const trimmed = raw.trim()
  if (!trimmed) return

  pushLine('input', trimmed)
  commandHistory.value.push(trimmed)
  historyIndex.value = commandHistory.value.length

  const [cmd, ...rest] = trimmed.toLowerCase().split(/\s+/)
  const argLine = rest.join(' ')

  if (cmd === 'help') {
    pushLine('output', t('terminal.help'))
  } else if (cmd === 'whoami') {
    pushLine('output', `${t('about.title')} — ${t('about.role')}`)
    pushLine('output', t('about.description'))
  } else if (cmd === 'about') {
    goToSection('about', 'terminal.navigatingAbout')
  } else if (cmd === 'projects' || cmd === 'ls') {
    goToSection('projects', 'terminal.navigatingProjects')
  } else if (cmd === 'blog' || cmd === 'writing' || (cmd === 'cat' && argLine === 'blog')) {
    goToBlog()
  } else if (cmd === 'links' || cmd === 'contact') {
    pushLine('output', t('terminal.linksIntro'))
    for (const link of SOCIAL_LINKS) {
      pushLine('output', `  ${link.label.padEnd(10)} ${link.href}`)
    }
  } else if (cmd === 'clear') {
    lines.value = []
  } else if (cmd === 'sudo' && argLine.startsWith('rm -rf /')) {
    pushLine('error', t('terminal.rmrf.removing'))
    pushLine('error', t('terminal.rmrf.deleted'))
    pushLine('output', t('terminal.rmrf.awake'))
    setTimeout(() => {
      closeTerminal()
      startDestroyMode(argLine.includes('--cat') ? 'cat' : 'kaiju')
    }, 900)
  } else if (cmd === 'rm') {
    pushLine('error', t('terminal.permissionDenied'))
  } else if (cmd === 'sudo' && argLine === 'hire-me') {
    pushLine('output', t('terminal.hireMe'))
    triggerParticleBurst()
    setTimeout(() => {
      window.location.href = 'mailto:contatostherzada@gmail.com'
    }, 900)
  } else if (cmd === 'exit' || cmd === 'quit') {
    closeTerminal()
  } else {
    pushLine('error', t('terminal.unknownCommand', { cmd: trimmed }))
  }

  currentInput.value = ''
}

function historyUp() {
  if (commandHistory.value.length === 0) return
  historyIndex.value = Math.max(0, historyIndex.value - 1)
  currentInput.value = commandHistory.value[historyIndex.value] ?? ''
}

function historyDown() {
  if (commandHistory.value.length === 0) return
  historyIndex.value = Math.min(commandHistory.value.length, historyIndex.value + 1)
  currentInput.value = commandHistory.value[historyIndex.value] ?? ''
}

// Esc should close the dialog even when focus isn't in the input.
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeTerminal()
}

let previouslyFocused: HTMLElement | null = null

onMounted(() => {
  previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
  window.addEventListener('keydown', handleKeydown)
  pushLine('output', t('terminal.hint'))
  pushLine('output', t('terminal.closeHint'))
  nextTick(() => inputEl.value?.focus())
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  previouslyFocused?.focus()
})
</script>

<template>
  <div
    class="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 pt-20 md:pt-4 bg-black/60 backdrop-blur-sm"
    @click.self="closeTerminal"
  >
    <div role="dialog" aria-modal="true" :aria-label="windowTitle" class="w-full max-w-2xl rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#0b0b0d] text-[#e5e5e5] font-mono text-sm flex flex-col max-h-[70vh]">
      <div class="flex items-center gap-2 px-4 py-2.5 bg-white/5 border-b border-white/10 shrink-0">
        <span class="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" aria-hidden="true"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" aria-hidden="true"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-[#27c93f]" aria-hidden="true"></span>
        <span class="flex-1 text-center text-xs text-white/60 truncate">{{ windowTitle }}</span>
        <button
          type="button"
          @click="closeTerminal"
          class="text-white/60 hover:text-white transition-colors cursor-pointer"
          :aria-label="t('terminal.close')"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <div ref="outputEl" role="log" aria-live="polite" class="flex-1 overflow-y-auto p-4 space-y-1">
        <template v-for="(line, i) in lines" :key="i">
          <p v-if="line.type === 'input'" class="text-white/90">
            <span class="text-[#27c93f]">{{ PROMPT }}</span> {{ line.text }}
          </p>
          <p v-else-if="line.type === 'error'" class="text-[#ff6b6b] whitespace-pre-wrap">{{ line.text }}</p>
          <p v-else class="text-white/70 whitespace-pre-wrap">{{ line.text }}</p>
        </template>
      </div>

      <div class="flex items-center gap-2 px-4 py-3 border-t border-white/10 shrink-0">
        <span class="text-[#27c93f] shrink-0">{{ PROMPT }}</span>
        <input
          ref="inputEl"
          v-model="currentInput"
          type="text"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          :aria-label="t('terminal.inputLabel')"
          class="flex-1 bg-transparent outline-none text-[#e5e5e5] min-w-0"
          @keydown.enter="runCommand(currentInput)"
          @keydown.up.prevent="historyUp"
          @keydown.down.prevent="historyDown"
        />
      </div>
    </div>
  </div>
</template>
