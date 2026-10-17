import supabase from '@/supabase'

// Auth state isn't mirrored into the app: the router guard asks Supabase
// directly (getSession + is_admin RPC) on admin routes, so public pages
// don't wait on auth before mounting.
const checkIsAdmin = async (): Promise<boolean> => {
  const { data, error } = await supabase.rpc('is_admin')
  if (error) return false
  return data === true
}

export function useAuth() {
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    const isAdmin = await checkIsAdmin()
    if (!isAdmin) {
      await supabase.auth.signOut()
      throw new Error('Esta conta não tem permissão de administrador.')
    }

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
    signIn,
    signOut,
    getSession,
    checkIsAdmin,
  }
}
