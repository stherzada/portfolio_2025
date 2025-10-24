<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ArrowRight, Calendar, Star, Clock } from 'lucide-vue-next'
import { ref, onMounted } from 'vue'
import { fetchPosts } from '../services/blog'
import type { Post } from '../types/Post';
import { formatReadingTime } from '../utils/readingTime'
import { formatDateWithI18n } from '../utils/dateFormat'

const { t, locale } = useI18n()
const featuredPost = ref<Post | undefined>(undefined)

onMounted(async () => {
  try {
    const { posts } = await fetchPosts(1, 1)
    if (posts.length > 0) {
      featuredPost.value = posts[0]
    }
  } catch (error) {
    console.error('Erro ao carregar post em destaque:', error)
  }
})
</script>

<template>
    <section id="writing" class="flex items-center justify-center py-16">
        <div class="md:mx-8 mx-4 md:max-w-4xl w-full">
            <router-link to="/blog" class="flex items-center justify-center">
                <h2 class="text-3xl lg:text-4xl font-bold mb-8 text-center text-primary flex items-center justify-center gap-2">
                    <span class="text-primary flex items-center gap-2">
                    <span class="link-underline">{{ t('blog.visitMyBlog') }}</span>
                    <ArrowRight class="h-6 w-6 align-middle mt-3 rainbow-icon" />
                    </span>
                </h2>
            </router-link>

            <div v-if="featuredPost" class="mt-12">
                <div class=" card rounded-2xl p-8 border transition-all duration-300 hover:shadow-lg">
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-2 h-2 bg-primary rounded-full"></div>
                        <Star class="h-4 w-4 rainbow-icon" />
                        <span class="text-sm font-medium text-primary">{{ t('blog.featuredPost') }}
                
                        </span>
                    </div>
                    <img :src="featuredPost.image_path" :alt="featuredPost.title" class="w-full h-48 object-cover rounded-lg" />
                    <h3 class="text-2xl lg:text-3xl font-bold text-primary my-4 hover:text-secondary">
                        <span class="link-underline">{{ featuredPost.title }}</span>
                    </h3>
                    
                    <p class="text-primary mb-6 leading-relaxed">
                        {{ featuredPost.description }}
                    </p>
                    
                    <div class="flex items-center justify-between card-divider pt-4">
                        <div class="flex items-center gap-4 text-sm text-primary">
                            <div class="flex items-center gap-1">
                                <Calendar class="h-4 w-4" />
                                {{ formatDateWithI18n(featuredPost.created_at, locale) }}
                            </div>
                            <div class="flex items-center gap-1">
                                <Clock class="h-4 w-4" />
                                {{ formatReadingTime(featuredPost.content || '') }}
                            </div>
                        </div>
                        
                        <router-link 
                            :to="`/blog/${featuredPost.slug}`" 
                            class="link-underline flex items-center gap-2"
                        >
                            {{ t('blog.readMore') }} <ArrowRight class="h-4 w-4" />
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
