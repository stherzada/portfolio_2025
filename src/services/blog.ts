import supabase from '../supabase'
import type { Post } from '../types'
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

/**
 * Lista todos os posts para debug
 * @returns Promise com lista de todos os posts
 */
export const fetchPostsAll = async (page: number = 1, postsPerPage: number = 10) => {
  try {
    const { data, error, count } = await supabase
      .from('posts')
      .select("id, title, slug, created_at, description, image_path, content", { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * postsPerPage, (page - 1) * postsPerPage + postsPerPage - 1)

    if (error) throw error

    return { posts: data as Post[], total: count }
  } catch (err) {
    console.error('Error fetching all posts:', err)
    throw new Error('Erro ao carregar posts')
  }
}

/**
 * Busca um post por slug ou por título (fallback)
 * @param slug - Slug do post para buscar
 * @returns Promise com dados do post
 */

/** TODO: Refatorar para melhorar a busca por slug */
export const fetchPostBySlug = async (slug: string) => {
  try {
    const { data: allPosts, error: allPostsError } = await supabase
      .from('posts')
      .select("*")
      .eq('slug', slug)
      .single()

    if (allPostsError) throw allPostsError
    if (!allPosts) throw new Error('Nenhum post encontrado no banco de dados')

    return allPosts as Post
  } catch (err) {
    console.error('Error fetching post by slug:', err)
    throw new Error('Erro ao carregar post')
  }
}
