// Login do /admin sem serviço de fora: uma conta só, definida nas variáveis
// de ambiente da Vercel.
//
//   ADMIN_EMAIL          o e-mail do login
//   ADMIN_PASSWORD_HASH  gerado com `node scripts/hash-password.mjs` (a senha nunca fica salva)
//   SESSION_SECRET       texto aleatório longo; trocar ele derruba todas as sessões
//
// A sessão é um cookie HttpOnly assinado com HMAC: o JavaScript da página não
// lê, e sem o SESSION_SECRET ninguém fabrica um.

import { createHmac, scrypt, timingSafeEqual } from 'node:crypto'

const COOKIE = 'admin_session'
const MAX_AGE = 7 * 24 * 60 * 60 // 7 dias

const b64url = (buf: Buffer) => buf.toString('base64url')

function secret(): string {
  const value = process.env.SESSION_SECRET
  if (!value || value.length < 32) throw new Error('SESSION_SECRET ausente ou curto demais (mínimo 32 caracteres)')
  return value
}

const sign = (payload: string) => b64url(createHmac('sha256', secret()).update(payload).digest())

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie') ?? ''
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return rest.join('=')
  }
  return null
}

/** Set-Cookie de uma sessão nova. Só vai para /api: a página nunca vê. */
export function sessionCookie(): string {
  const payload = b64url(Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + MAX_AGE })))
  return `${COOKIE}=${payload}.${sign(payload)}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE}`
}

export const clearSessionCookie = () => `${COOKIE}=; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=0`

export function isAdmin(request: Request): boolean {
  const value = readCookie(request, COOKIE)
  if (!value) return false
  const [payload, signature] = value.split('.')
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return false
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { exp?: number }
    return typeof exp === 'number' && exp > Date.now() / 1000
  } catch {
    return false
  }
}

/**
 * Pedido que muda algo precisa vir do próprio site. O SameSite=Strict já
 * barra outros sites; isto é a segunda tranca.
 */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  if (!origin || !host) return false
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

// ── senha ───────────────────────────────────────────
// Formato: scrypt:<sal em base64>:<hash em base64>. Os mesmos parâmetros de
// scripts/hash-password.mjs.
const KEY_LENGTH = 64

const derive = (password: string, salt: Buffer) =>
  new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, KEY_LENGTH, (error, key) => (error ? reject(error) : resolve(key))),
  )

export async function checkCredentials(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL
  const stored = process.env.ADMIN_PASSWORD_HASH
  if (!adminEmail || !stored) throw new Error('ADMIN_EMAIL ou ADMIN_PASSWORD_HASH não configurados')

  const [scheme, saltB64, hashB64] = stored.split(':')
  if (scheme !== 'scrypt' || !saltB64 || !hashB64) throw new Error('ADMIN_PASSWORD_HASH em formato inválido')

  // calcula o hash mesmo com e-mail errado: a resposta demora igual nos dois casos
  const key = await derive(password, Buffer.from(saltB64, 'base64'))
  const expected = Buffer.from(hashB64, 'base64')
  const passwordOk = key.length === expected.length && timingSafeEqual(key, expected)
  const emailOk = email.trim().toLowerCase() === adminEmail.trim().toLowerCase()
  return passwordOk && emailOk
}
