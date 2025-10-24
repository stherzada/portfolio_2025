import supabase from '../supabase'
import type { Post } from '../types'

export const fetchPosts = async (page: number = 1, postsPerPage: number = 5) => {
  const from = (page - 1) * postsPerPage
  const to = from + postsPerPage - 1
  
  const { data: posts, error, count } = await supabase
    .from('posts')
    .select("*", { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching posts:', error)
    throw new Error('Erro ao carregar posts')
  }

  return {
    posts: (posts as Post[]) || [],
    total: count || 0,
    error: null
  }
}

/**
 * Busca um post específico por título
 * @param title - Título do post para buscar
 * @returns Promise com dados do post
 */
export const fetchPostByTitle = async (title: string) => {
  const { data, error } = await supabase
    .from('posts')
    .select("*")
    .ilike('title', title)
    .single()

  if (error) {
    console.error('Error fetching post:', error)
    throw new Error('Erro ao carregar o post')
  }

  return data as Post
}

/**
 * Busca um post específico por ID
 * @param id - ID do post para buscar
 * @returns Promise com dados do post
 */
export const fetchPostById = async (id: string) => {
  const { data, error } = await supabase
    .from('posts')
    .select("*")
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching post:', error)
    throw new Error('Erro ao carregar o post')
  }

  return data as Post
}
