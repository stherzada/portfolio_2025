import supabase from '../supabase'
import type { Post } from '../types'

/** TODO: Refatorar para melhorar cache e performance */
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
export const fetchAllPosts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select("id, title, slug")

  if (error) {
    console.error('Error fetching all posts:', error)
    throw new Error('Erro ao carregar posts')
  }

  return data
}

/**
 * Busca um post por slug ou por título (fallback)
 * @param slug - Slug do post para buscar
 * @returns Promise com dados do post
 */


/** TODO: Refatorar para melhorar a busca por slug */
export const fetchPostBySlug = async (slug: string) => {  
    const { data: allPosts, error: allPostsError } = await supabase
      .from('posts')
      .select("*")

    if (allPostsError) {
      throw new Error(`Post não encontrado: ${allPostsError.message}`)
    }

    if (!allPosts || allPosts.length === 0) {
      throw new Error('Nenhum post encontrado no banco de dados')
    }

    
    const searchTitle = slug.replace(/-/g, ' ').toLowerCase()

    const matchingPost = allPosts.find(post => {
      const postTitle = post.title.toLowerCase()
      const postSlug = (post.slug || '').toLowerCase()
      
      
      return postTitle.includes(searchTitle) || 
             postSlug.includes(searchTitle) ||
             searchTitle.includes(postTitle.replace(/[^a-z0-9\s]/g, ''))
    })

    if (matchingPost) {
      return matchingPost as Post
    }

    throw new Error(`Post não encontrado com slug ou título: ${slug}`)
  }

