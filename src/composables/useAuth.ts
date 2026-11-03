import { api, sendJson } from '@/services/http'

// A sessão é um cookie HttpOnly que só o servidor lê (api/auth.ts), então
// quem diz se a pessoa é admin é sempre o servidor, nunca o navegador.
const checkIsAdmin = async (): Promise<boolean> => {
  try {
    const { admin } = await api<{ admin: boolean }>('/api/auth')
    return admin
  } catch {
    return false
  }
}

export function useAuth() {
  const signIn = async (email: string, password: string) => {
    await api('/api/auth', sendJson('POST', { email, password }))
  }

  const signOut = async () => {
    await api('/api/auth', { method: 'DELETE' })
  }

  return {
    signIn,
    signOut,
    checkIsAdmin,
  }
}
