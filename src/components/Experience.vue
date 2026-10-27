<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowUpRight, MapPin } from 'lucide-vue-next'
import ScrambleText from './ScrambleText.vue'
import { experiences, type Experience } from '../data/experience'
import { commitHash, formatMonth, parseMonth, sortedExperiences } from '../utils/career'
import { prefersReducedMotion } from '../composables/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

const { t, locale } = useI18n()

const lang = computed(() => (locale.value === 'pt' ? 'pt' : 'en'))

// Inclusive month count, the same way LinkedIn shows tenure.
function formatDuration(start: string, end?: string) {
    const from = parseMonth(start)
    const now = new Date()
    const to = end ? parseMonth(end) : { year: now.getFullYear(), month: now.getMonth() + 1 }
    const total = Math.max(1, (to.year - from.year) * 12 + (to.month - from.month) + 1)
    const years = Math.floor(total / 12)
    const months = total % 12
    return [
        years ? t('experience.years', years) : '',
        months ? t('experience.months', months) : ''
    ].filter(Boolean).join(' ')
}

const items = computed(() =>
    sortedExperiences(experiences)
        .map((xp: Experience) => ({
            ...xp,
            key: `${xp.company}-${xp.start}`,
            hash: commitHash(xp),
            current: !xp.end,
            period: `${formatMonth(xp.start, lang.value)} — ${xp.end ? formatMonth(xp.end, lang.value) : t('experience.present')}`,
            duration: formatDuration(xp.start, xp.end)
        }))
)

const listEl = ref<HTMLElement | null>(null)
const isStatic = ref(false)
let ctx: gsap.Context | undefined

onMounted(() => {
    const list = listEl.value
    if (!list) return

    if (prefersReducedMotion()) {
        isStatic.value = true
        return
    }

    ctx = gsap.context(() => {
        // The rail draws itself as the list scrolls past, with a glowing
        // head riding its tip.
        gsap.timeline({
            scrollTrigger: { trigger: list, start: 'top 65%', end: 'bottom 65%', scrub: 0.6 }
        })
            .fromTo('.rail-fill', { scaleY: 0 }, { scaleY: 1, ease: 'none' }, 0)
            .fromTo('.rail-head', { top: '0%' }, { top: '100%', ease: 'none' }, 0)

        // Each node lights up when the tip of the rail reaches it.
        gsap.utils.toArray<HTMLElement>('.xp-item').forEach(item => {
            ScrollTrigger.create({
                trigger: item,
                start: 'top 65%',
                onEnter: () => item.classList.add('is-active'),
                onLeaveBack: () => item.classList.remove('is-active')
            })
        })
    }, list)
})

onUnmounted(() => ctx?.revert())

// Soft spotlight that follows the pointer across a card.
function trackPointer(event: PointerEvent) {
    const card = event.currentTarget as HTMLElement
    const rect = card.getBoundingClientRect()
    card.style.setProperty('--mx', `${event.clientX - rect.left}px`)
    card.style.setProperty('--my', `${event.clientY - rect.top}px`)
}
</script>

<template>
    <section id="experience" class="flex items-center justify-center py-16 scroll-mt-24">
        <div class="m-6 md:mx-8 md:max-w-4xl w-full">
            <div class="mb-12">
                <p class="eyebrow mb-3">/{{ t('nav.experience') }}</p>
                <h2 class="font-mono font-semibold text-3xl lg:text-4xl tracking-tight text-primary">
                    <ScrambleText :text="t('experience.title')" :scramble-speed="60" :iteration-speed="3" />
                </h2>
                <p class="mt-3 font-mono text-sm text-muted">
                    <span class="opacity-50">$</span> git log --career
                </p>
            </div>

            <div ref="listEl" class="xp-list relative" :class="{ 'is-static': isStatic }">
                <div class="rail absolute top-5 bottom-0 left-3 sm:left-[11.75rem] w-px -translate-x-1/2" aria-hidden="true">
                    <div class="rail-fill absolute inset-0 origin-top" />
                    <div class="rail-head absolute left-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full" />
                </div>

                <ol>
                    <li v-for="xp in items" :key="xp.key"
                        class="xp-item relative grid grid-cols-[1.5rem_1fr] sm:grid-cols-[9.5rem_1.5rem_1fr] gap-x-4 sm:gap-x-6 pb-10 last:pb-0"
                        :class="{ 'is-current': xp.current }">
                        <div class="xp-fade hidden sm:block text-right pt-3 font-mono text-xs leading-5 text-muted whitespace-nowrap">
                            <div class="text-primary">{{ xp.period }}</div>
                            <div>{{ xp.duration }}</div>
                        </div>

                        <div class="relative flex justify-center" aria-hidden="true">
                            <span class="xp-node relative mt-[1.05rem] w-2.5 h-2.5 rounded-full" />
                        </div>

                        <div class="xp-card relative -mx-3 sm:-mx-4 px-3 sm:px-4 py-3 rounded-xl"
                            @pointermove="trackPointer">
                            <div class="xp-fade flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs leading-5">
                                <span class="xp-hash">{{ xp.hash }}</span>
                                <span v-if="xp.current" class="head-tag flex items-center gap-1.5">
                                    <span class="head-dot w-1.5 h-1.5 rounded-full" aria-hidden="true" />
                                    (HEAD → {{ t('experience.present') }})
                                </span>
                                <span class="sm:hidden text-muted">· {{ xp.period }} · {{ xp.duration }}</span>
                            </div>

                            <h3 class="mt-2 flex items-center gap-1.5 font-mono text-lg font-semibold text-primary group/link">
                                <component :is="xp.url ? 'a' : 'span'"
                                    v-bind="xp.url ? { href: xp.url, target: '_blank', rel: 'noopener noreferrer', class: 'link-fade' } : {}">
                                    <span class="sr-only">{{ xp.company }}</span>
                                    <span aria-hidden="true">
                                        <span v-for="(char, i) in xp.company" :key="i" class="xp-char"
                                            :style="{ '--c': i }">{{ char === ' ' ? ' ' : char }}</span>
                                    </span>
                                </component>
                                <ArrowUpRight v-if="xp.url"
                                    class="w-4 h-4 shrink-0 opacity-0 -translate-x-1 group-hover/link:opacity-70 group-hover/link:translate-x-0 transition-all duration-300" />
                            </h3>
                            <p class="xp-fade text-primary font-medium" style="--d: 150">{{ xp.role[lang] }}</p>
                            <p v-if="xp.location" class="xp-fade mt-1 flex items-center gap-1 font-mono text-xs text-muted" style="--d: 200">
                                <MapPin class="w-3 h-3" aria-hidden="true" />
                                {{ xp.location[lang] }}
                            </p>

                            <p v-if="xp.description" class="xp-fade mt-3 text-primary max-w-xl" style="--d: 250">{{ xp.description[lang] }}</p>

                            <ul v-if="xp.highlights?.length" class="mt-3 flex flex-col gap-1.5 max-w-xl">
                                <li v-for="(highlight, i) in xp.highlights" :key="i"
                                    class="xp-stagger flex gap-2 text-primary" :style="{ '--i': i }">
                                    <span class="font-mono text-muted shrink-0" aria-hidden="true">+</span>
                                    <span>{{ highlight[lang] }}</span>
                                </li>
                            </ul>

                            <div v-if="xp.stack?.length" class="flex flex-wrap gap-1.5 mt-4">
                                <span v-for="(tech, i) in xp.stack" :key="tech" class="xp-stagger stack-chip"
                                    :style="{ '--i': i + (xp.highlights?.length ?? 0) }">{{ tech }}</span>
                            </div>
                        </div>
                    </li>
                </ol>
            </div>
        </div>
    </section>
</template>

<style scoped>
.text-muted {
    color: var(--color-neutral);
}

.rail {
    background-color: var(--color-base-300);
    mask-image: linear-gradient(to bottom, #000 85%, transparent);
}

.rail-fill {
    background-color: var(--color-primary);
    transform: scaleY(0);
}

.rail-head {
    top: 0;
    background-color: var(--color-primary);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-primary) 15%, transparent),
        0 0 14px 2px color-mix(in srgb, var(--color-primary) 35%, transparent);
}

.xp-node {
    background-color: var(--color-base-200);
    border: 1.5px solid var(--color-neutral);
    transition: background-color 0.4s ease, border-color 0.4s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.xp-node::after {
    content: '';
    position: absolute;
    inset: -1.5px;
    border-radius: 9999px;
    border: 1.5px solid var(--color-primary);
    opacity: 0;
}

.is-active .xp-node {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
    transform: scale(1.2);
}

.is-active .xp-node::after {
    animation: node-ping 0.9s cubic-bezier(0, 0, 0.2, 1);
}

.is-current.is-active .xp-node::after {
    animation: node-ping 2.4s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes node-ping {
    0% {
        transform: scale(1);
        opacity: 0.8;
    }

    100% {
        transform: scale(3);
        opacity: 0;
    }
}

.xp-card {
    transition: background-color 0.25s ease;
}

.xp-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
    background: radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%),
            color-mix(in srgb, var(--color-primary) 7%, transparent), transparent 70%);
    transition: opacity 0.3s ease;
}

.xp-card:hover {
    background-color: var(--color-base-100);
}

.xp-card:hover::before {
    opacity: 1;
}

.xp-hash {
    color: var(--color-neutral);
    transition: color 0.25s ease;
}

.xp-card:hover .xp-hash {
    color: var(--color-primary);
}

.head-tag {
    color: var(--color-primary);
}

.head-dot {
    background-color: var(--color-primary);
    animation: head-pulse 1.6s ease-in-out infinite;
}

@keyframes head-pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.25;
    }
}

/* Nothing of a role shows until the rail reaches it; then it builds up in
   order: date and hash, the name letter by letter out of a blur, role and
   location, and finally highlights and stack chips. */
.xp-fade {
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: calc(var(--d, 0) * 1ms);
}

.is-active .xp-fade {
    opacity: 1;
    transform: none;
}

.xp-list:not(.is-static) .xp-item:not(.is-active) .xp-card {
    pointer-events: none;
}

.xp-char {
    display: inline-block;
    opacity: 0;
    filter: blur(6px);
    transform: translateY(0.4em);
    transition: opacity 0.5s ease, filter 0.5s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: calc(var(--c, 0) * 35ms);
}

.is-active .xp-char {
    opacity: 1;
    filter: none;
    transform: none;
}

.xp-stagger {
    opacity: 0;
    transform: translateX(-8px);
    transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: calc(var(--i, 0) * 60ms + 300ms);
}

.is-active .xp-stagger {
    opacity: 1;
    transform: none;
}

.stack-chip {
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
    font-size: 0.7rem;
    letter-spacing: 0.02em;
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
    border: 1px solid var(--color-base-300);
    color: var(--color-neutral);
    background-color: var(--color-base-100);
}

/* Reduced motion: everything drawn and lit from the start. */
.is-static .rail-fill {
    transform: none;
}

.is-static .rail-head {
    display: none;
}

.is-static .xp-node {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
}

.is-static .xp-fade,
.is-static .xp-stagger,
.is-static .xp-char {
    opacity: 1;
    filter: none;
    transform: none;
}

@media (prefers-reduced-motion: reduce) {

    .xp-node::after,
    .head-dot {
        animation: none !important;
    }
}
</style>
