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

