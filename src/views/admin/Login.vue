<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const { signIn } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (loading.value) return
  error.value = ''
  loading.value = true
  try {
    await signIn(email.value, password.value)
    router.push({ name: 'AdminDashboard' })
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Erro ao fazer login'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-sm p-8 rounded-xl border border-[var(--color-base-300)] bg-[var(--color-base-100)]">
      <h1 class="text-2xl font-bold text-primary mb-6 text-center">Admin</h1>
      <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
        <div>
          <label class="block text-sm font-medium text-primary mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-3 py-2 border border-[var(--color-base-300)] rounded-lg
                   bg-[var(--color-base-200)] text-primary focus:outline-none
                   focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-primary mb-1">Senha</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-3 py-2 border border-[var(--color-base-300)] rounded-lg
                   bg-[var(--color-base-200)] text-primary focus:outline-none
                   focus:border-primary transition-colors"
          />
        </div>
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2 bg-[var(--color-primary)] text-[var(--color-base-100)] rounded-lg
                 font-medium transition-opacity disabled:opacity-60 cursor-pointer mt-2"
        >
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>
