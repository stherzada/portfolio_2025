import posthog from 'posthog-js'
import { api, sendJson } from '@/services/http'

type AuthResponse = {
  admin: boolean
  adminId?: string
}

const posthogConfigured = Boolean(
  import.meta.env.VITE_POSTHOG_PROJECT_TOKEN && import.meta.env.VITE_POSTHOG_HOST,
)

const identifyAdmin = ({ admin, adminId }: AuthResponse) => {
  if (!posthogConfigured || !admin || !adminId || posthog.get_distinct_id() === adminId) return
  posthog.identify(adminId)
}

let authenticationCheck: Promise<boolean> | undefined

// A sessão é um cookie HttpOnly que só o servidor lê (api/auth.ts), então
// quem diz se a pessoa é admin é sempre o servidor, nunca o navegador.
const checkIsAdmin = (): Promise<boolean> => {
  if (authenticationCheck) return authenticationCheck

  const request = api<AuthResponse>('/api/auth')
    .then((response) => {
      identifyAdmin(response)
      return response.admin
    })
    .catch(() => false)

  authenticationCheck = request
  void request.finally(() => {
    if (authenticationCheck === request) authenticationCheck = undefined
  })
  return request
}

// Restores the browser identity when an existing HttpOnly session survives a refresh.
export const restoreAuthenticatedAdminIdentity = checkIsAdmin

export function useAuth() {
  const signIn = async (email: string, password: string) => {
    const response = await api<AuthResponse>('/api/auth', sendJson('POST', { email, password }))
    identifyAdmin(response)
  }

  const signOut = async () => {
    await api('/api/auth', { method: 'DELETE' })
    if (posthogConfigured) posthog.reset()
  }

  return {
    signIn,
    signOut,
    checkIsAdmin,
  }
}
