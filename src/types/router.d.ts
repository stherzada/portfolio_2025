import type { Post } from './index'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    postData?: Post
  }
}
