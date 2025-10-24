/**
 * Calcula o número de palavras em um texto
 * @param text - Texto para contar as palavras
 * @returns Número de palavras
 */
export const getWordCount = (text: string): number => {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

/**
 * Calcula o tempo de leitura baseado no número de palavras
 * @param text - Texto para calcular o tempo de leitura
 * @param wordsPerMinute - Palavras por minuto 
 * @returns Tempo de leitura em minutos
 */
export const getReadingTime = (text: string, wordsPerMinute: number = 200): number => {
  const wordCount = getWordCount(text)
  return Math.ceil(wordCount / wordsPerMinute)
}

/**
 * Formata o tempo de leitura para exibição
 * @param text - Texto para calcular o tempo
 * @param wordsPerMinute - Palavras por minuto 
 * @returns String formatada do tempo de leitura
 */
export const formatReadingTime = (text: string, wordsPerMinute: number = 200): string => {
  const minutes = getReadingTime(text, wordsPerMinute)
  
  if (minutes === 0) return 'Menos de 1 min'
  if (minutes === 1) return '1 min'
  return `${minutes} min`
}

/**
 * Configurações de velocidade de leitura por idioma
 */
export const READING_SPEEDS = {
  portuguese: 200,
  english: 250,
  spanish: 200,
  french: 200,
  german: 200,
  italian: 200
} as const

/**
 * Calcula o tempo de leitura com configuração de idioma
 * @param text - Texto para calcular o tempo
 * @param language - Idioma para determinar a velocidade de leitura
 * @returns Tempo de leitura em minutos
 */
export const getReadingTimeByLanguage = (
  text: string, 
  language: keyof typeof READING_SPEEDS = 'portuguese'
): number => {
  const wordsPerMinute = READING_SPEEDS[language]
  return getReadingTime(text, wordsPerMinute)
}
