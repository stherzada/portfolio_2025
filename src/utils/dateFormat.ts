/**
 * Formata uma data baseada no idioma atual do i18n
 * @param dateString - String da data ou objeto Date
 * @param locale - Idioma ('pt' ou 'en')
 * @returns Data formatada no idioma especificado
 */
export const formatDate = (
  dateString: string | Date, 
  locale: 'pt' | 'en' = 'pt',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  const localeMap = {
    pt: 'pt-BR',
    en: 'en-US'
  }
  return date.toLocaleDateString(localeMap[locale], options)
}

/**
 * Formata uma data para o padrão brasileiro (compatibilidade)
 * @param dateString - String da data ou objeto Date
 * @param options - Opções de formatação do Intl.DateTimeFormat
 * @returns Data formatada em português brasileiro
 */
export const formatDateBR = (
  dateString: string | Date, 
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string => {
  return formatDate(dateString, 'pt', options)
}

/**
 * Formata uma data para exibição curta (dd/mm/yyyy)
 * @param dateString - String da data ou objeto Date
 * @returns Data formatada em formato curto
 */
export const formatDateShort = (dateString: string | Date): string => {
  return formatDateBR(dateString, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * Formata uma data para exibição completa com hora
 * @param dateString - String da data ou objeto Date
 * @returns Data e hora formatadas
 */
export const formatDateTime = (dateString: string | Date): string => {
  return formatDateBR(dateString, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Formata uma data relativa (ex: "há 2 dias", "ontem")
 * @param dateString - String da data ou objeto Date
 * @param locale - Idioma ('pt' ou 'en')
 * @returns Data relativa formatada
 */

export const formatRelativeDate = (dateString: string | Date, locale: 'pt' | 'en' = 'pt'): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  const translations = {
    pt: {
      today: 'Hoje',
      yesterday: 'Ontem',
      daysAgo: (days: number) => `Há ${days} dias`,
      weeksAgo: (weeks: number) => `Há ${weeks} semanas`,
      monthsAgo: (months: number) => `Há ${months} meses`,
      yearsAgo: (years: number) => `Há ${years} anos`
    },
    en: {
      today: 'Today',
      yesterday: 'Yesterday',
      daysAgo: (days: number) => `${days} days ago`,
      weeksAgo: (weeks: number) => `${weeks} weeks ago`,
      monthsAgo: (months: number) => `${months} months ago`,
      yearsAgo: (years: number) => `${years} years ago`
    }
  }
  
  const t = translations[locale]
  
  if (diffInDays === 0) return t.today
  if (diffInDays === 1) return t.yesterday
  if (diffInDays < 7) return t.daysAgo(diffInDays)
  if (diffInDays < 30) return t.weeksAgo(Math.floor(diffInDays / 7))
  if (diffInDays < 365) return t.monthsAgo(Math.floor(diffInDays / 30))
  
  return t.yearsAgo(Math.floor(diffInDays / 365))
}

/**
 * Formata uma data para diferentes idiomas
 * @param dateString - String da data ou objeto Date
 * @param locale - Idioma (padrão: 'pt-BR')
 * @param options - Opções de formatação
 * @returns Data formatada no idioma especificado
 */

export const formatDateByLocale = (
  dateString: string | Date,
  locale: string = 'pt-BR',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return date.toLocaleDateString(locale, options)
}

/**
 * Formata uma data usando o idioma atual do i18n
 * Esta função deve ser usada dentro de componentes Vue com acesso ao i18n
 * @param dateString - String da data ou objeto Date
 * @param currentLocale - Idioma atual do i18n
 * @param options - Opções de formatação
 * @returns Data formatada no idioma atual
 */
export const formatDateWithI18n = (
  dateString: string | Date,
  currentLocale: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string => {
  const locale = currentLocale === 'pt' ? 'pt' : 'en'
  return formatDate(dateString, locale, options)
}

