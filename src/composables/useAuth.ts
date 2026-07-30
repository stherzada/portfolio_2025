import { ref, readonly } from 'vue'
import supabase from '@/supabase'
import type { User } from '@supabase/supabase-js'
import store from '@/store'

const _user = ref<User | null>(null)
const _isAuthenticated = ref(false)
const _isAdmin = ref(false)
let _initialized = false

const checkIsAdmin = async (): Promise<boolean> => {
  const { data, error } = await supabase.rpc('is_admin')
  if (error) return false
  return data === true
}

export function useAuth() {
  const initAuth = async () => {
    if (_initialized) return
    _initialized = true

    const { data: { session } } = await supabase.auth.getSession()
    _user.value = session?.user ?? null
    _isAuthenticated.value = !!session
    _isAdmin.value = session ? await checkIsAdmin() : false
    store.currentUser = session?.user ?? null
    store.isAuthenticated = !!session
    store.isAdmin = _isAdmin.value

    supabase.auth.onAuthStateChange(async (_event, session) => {
      _user.value = session?.user ?? null
      _isAuthenticated.value = !!session
      _isAdmin.value = session ? await checkIsAdmin() : false
      store.currentUser = session?.user ?? null
      store.isAuthenticated = !!session
      store.isAdmin = _isAdmin.value
    })
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    const isAdmin = await checkIsAdmin()
    if (!isAdmin) {
      await supabase.auth.signOut()
      throw new Error('Esta conta não tem permissão de administrador.')
    }

    _isAdmin.value = true
    store.isAdmin = true
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
    isAdmin: readonly(_isAdmin),
    signIn,
    signOut,
    getSession,
    checkIsAdmin,
    initAuth,
  }
}
