import { reactive } from 'vue'
import type { User } from '@supabase/supabase-js'
import type { Post } from './types'

interface Store {
  posts: Post[]
  currentUser: User | null
  isAuthenticated: boolean
  isAdmin: boolean
}

const store = reactive<Store>({
  posts: [],
  currentUser: null,
  isAuthenticated: false,
  isAdmin: false,
})

export { store }
export default store