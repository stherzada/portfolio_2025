/**
 * Remove acentos de uma string
 * @param str - String para remover acentos
 * @returns String sem acentos
 */
export const removeAccents = (str: string): string => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Converte um título em um slug amigável para URLs
 * @param title - O título a ser convertido
 * @returns Slug amigável para URL
 * 
 */
export const createSlug = (title: string): string => {
  return removeAccents(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') 
    .replace(/\s+/g, '-') 
    .replace(/-+/g, '-')
    .trim()
}
