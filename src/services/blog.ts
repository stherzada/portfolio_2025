import type { Post } from '../types'
import { api, ApiError } from './http'

/**
 * Busca um post específico por ID
 * @param id - ID do post para buscar
 * @returns Promise com dados do post
 */
export const fetchPostById = async (id: string) => {
  try {
    return await api<Post>(`/api/posts?id=${encodeURIComponent(id)}`)
  } catch (error) {
    console.error('Error fetching post:', error)
    throw new Error('Erro ao carregar o post')
  }
}

/**
 * Lista os posts, do mais novo pro mais antigo, uma página por vez
 * @returns Promise com os posts da página e o total
 */
export const fetchPostsAll = async (page: number = 1, postsPerPage: number = 10) => {
  try {
    return await api<{ posts: Post[]; total: number }>(`/api/posts?page=${page}&per_page=${postsPerPage}`)
  } catch (err) {
    console.error('Error fetching all posts:', err)
    throw new Error('Erro ao carregar posts')
  }
}

/**
 * Busca um post pelo slug
 * @param slug - Slug do post para buscar
 * @returns Promise com o post, ou null se não existir
 */
export const fetchPostBySlug = async (slug: string) => {
  try {
    return await api<Post>(`/api/posts?slug=${encodeURIComponent(slug)}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    console.error('Error fetching post by slug:', error)
    throw new Error('Erro ao carregar post')
  }
}
