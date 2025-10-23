import { reactive } from 'vue'
import type { Post } from './types'

interface Store {
  posts: Post[]
}

const store = reactive<Store>({
  posts: [],
})

export { store }
export default store