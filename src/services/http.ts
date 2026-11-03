/** Erro de uma rota /api, com o status HTTP (404, 401…). */
export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

/** fetch para as funções da pasta api/: devolve o JSON ou lança ApiError com a mensagem do servidor. */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, { credentials: 'same-origin', ...init })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    const message = (body as { error?: string } | null)?.error ?? `Erro ${response.status}`
    throw new ApiError(message, response.status)
  }
  return body as T
}

export const sendJson = (method: string, data?: unknown): RequestInit => ({
  method,
  headers: { 'content-type': 'application/json' },
  body: data === undefined ? undefined : JSON.stringify(data),
})
