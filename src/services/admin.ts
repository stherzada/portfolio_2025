import supabase from '@/supabase'
import type { Post } from '@/types'

export interface PostInput {
  title: string
  description: string
  slug: string
  content: string
  image_path?: string
}

export const createPost = async (data: PostInput): Promise<Post> => {
  const { data: post, error } = await supabase
    .from('posts')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return post as Post
}

export const updatePost = async (id: string, data: Partial<PostInput>): Promise<Post> => {
  const { data: post, error } = await supabase
    .from('posts')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return post as Post
}

export const deletePost = async (id: string): Promise<void> => {
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw error
}

// Raster formats only: SVG can carry scripts and is served from a public bucket.
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}
export const IMAGE_ACCEPT = Object.keys(ALLOWED_IMAGE_TYPES).join(',')

export const uploadImage = async (file: File): Promise<string> => {
  const ext = ALLOWED_IMAGE_TYPES[file.type]
  if (!ext) throw new Error('Formato de imagem não suportado (use JPG, PNG, WebP, GIF ou AVIF).')
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('blog-images')
    .upload(filename, file, { contentType: file.type })
  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('blog-images')
    .getPublicUrl(filename)

  return publicUrl
}
