export interface Post {
  id: number
  title: string
  description: string
  content: string
  created_at: string
  updated_at?: string
  author?: string
  tags?: string[]
}
