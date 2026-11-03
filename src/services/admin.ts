import type { Post } from '@/types'
import { api, sendJson } from './http'

export interface PostInput {
  title: string
  description: string
  slug: string
  content: string
  image_path?: string
}

// O /admin lê pelo api/admin-posts (sem cache), pra ver na hora o que acabou de salvar.
export const fetchAdminPosts = (page: number, perPage: number) =>
  api<{ posts: Post[]; total: number }>(`/api/admin-posts?page=${page}&per_page=${perPage}`)

export const fetchAdminPost = (id: string) => api<Post>(`/api/admin-posts?id=${encodeURIComponent(id)}`)

export const createPost = (data: PostInput) => api<Post>('/api/admin-posts', sendJson('POST', data))

export const updatePost = (id: string, data: Partial<PostInput>) =>
  api<Post>(`/api/admin-posts?id=${encodeURIComponent(id)}`, sendJson('PATCH', data))

export const deletePost = async (id: string): Promise<void> => {
  await api(`/api/admin-posts?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
}

// Raster formats only: SVG can carry scripts.
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}
export const IMAGE_ACCEPT = Object.keys(ALLOWED_IMAGE_TYPES).join(',')

/** Limite do servidor (api/upload.ts): a Vercel não aceita corpos muito maiores. */
const MAX_IMAGE_BYTES = 4 * 1024 * 1024

/** Sobe a imagem e devolve o endereço dela no site (/blog-images/<nome>). */
export const uploadImage = async (file: File): Promise<string> => {
  if (!ALLOWED_IMAGE_TYPES[file.type]) {
    throw new Error('Formato de imagem não suportado (use JPG, PNG, WebP, GIF ou AVIF).')
  }
  if (file.size > MAX_IMAGE_BYTES) throw new Error('Imagem grande demais (máximo 4 MB).')
  const { url } = await api<{ url: string }>('/api/upload', {
    method: 'POST',
    headers: { 'content-type': file.type },
    body: file,
  })
  return url
}
