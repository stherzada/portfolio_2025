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
