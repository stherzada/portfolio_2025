import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue'),
    },
    {
      path: '/blog',
      name: 'Blog',
      component: () => import('@/views/Blog.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue'),
    },
    {
      path: '/blog/:id',
      name: 'BlogPost',
      component: () => import('@/views/BlogPost.vue'),
    },
  ],
})

export default router