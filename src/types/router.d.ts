export {}


declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
  }
}
