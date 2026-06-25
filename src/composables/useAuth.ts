import { ref, readonly } from 'vue'
import supabase from '@/supabase'
import type { User } from '@supabase/supabase-js'
import store from '@/store'

const _user = ref<User | null>(null)
const _isAuthenticated = ref(false)
let _initialized = false

export function useAuth() {
  const initAuth = async () => {
    if (_initialized) return
    _initialized = true

    const { data: { session } } = await supabase.auth.getSession()
    _user.value = session?.user ?? null
    _isAuthenticated.value = !!session
    store.currentUser = session?.user ?? null
    store.isAuthenticated = !!session

    supabase.auth.onAuthStateChange((_event, session) => {
      _user.value = session?.user ?? null
      _isAuthenticated.value = !!session
      store.currentUser = session?.user ?? null
      store.isAuthenticated = !!session
    })
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }

  return {
    user: readonly(_user),
    isAuthenticated: readonly(_isAuthenticated),
    signIn,
    signOut,
    getSession,
    initAuth,
  }
}
