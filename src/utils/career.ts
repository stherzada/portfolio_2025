import type { Experience } from '../data/experience'

/** 'YYYY-MM' → { year, month } (month is 1-based). */
export const parseMonth = (value: string) => {
  const [year, month] = value.split('-').map(Number) as [number, number]
  return { year, month }
}

/** 'YYYY-MM' → "ago 2025" / "Aug 2025". */
export const formatMonth = (value: string, lang: 'pt' | 'en') => {
  const { year, month } = parseMonth(value)
  const name = new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : 'en-US', { month: 'short' })
    .format(new Date(year, month - 1, 1))
    .replace('.', '')
  return `${name} ${year}`
}

/** Stable fake commit hash so each role reads like an entry in `git log`. */
export const commitHash = (xp: Experience) => {
  let hash = 0x811c9dc5
  for (const char of `${xp.company}${xp.start}`) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0').slice(0, 7)
}

/** Most recent role first. */
export const sortedExperiences = (list: Experience[]) => [...list].sort((a, b) => b.start.localeCompare(a.start))
