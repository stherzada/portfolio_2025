// Login do /admin.
//
//   GET    /api/auth → { admin: boolean }
//   POST   /api/auth { email, password } → entra (cookie de sessão)
//   DELETE /api/auth → sai

import { db, json } from './_lib/db.js'
import { checkCredentials, clearSessionCookie, isAdmin, sameOrigin, sessionCookie } from './_lib/session.js'

/** Erros seguidos por IP antes de esperar 15 minutos. */
const MAX_PER_IP = 5
/** Teto somando todos os IPs: segura quem tenta de muitos lugares ao mesmo tempo. */
const MAX_TOTAL = 30

const clientIp = (request: Request) =>
  request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'desconhecido'

export async function GET(request: Request): Promise<Response> {
  return json(200, { admin: isAdmin(request) })
}

export async function POST(request: Request): Promise<Response> {
  if (!sameOrigin(request)) return json(403, { error: 'Origem não permitida.' })

  let body: { email?: unknown; password?: unknown }
  try {
    body = await request.json()
  } catch {
    return json(400, { error: 'Pedido inválido.' })
  }
  const email = typeof body.email === 'string' ? body.email : ''
  const password = typeof body.password === 'string' ? body.password : ''
  if (!email || !password || password.length > 512) return json(400, { error: 'Preencha e-mail e senha.' })

  const sql = db()
  const ip = clientIp(request)
  const [counts] = await sql`
    select
      count(*) filter (where ip = ${ip})::int as mine,
      count(*)::int as total
    from login_attempts
    where at > now() - interval '15 minutes'
  `
  if (counts.mine >= MAX_PER_IP || counts.total >= MAX_TOTAL) {
    return json(429, { error: 'Muitas tentativas. Espere uns minutos e tente de novo.' })
  }

  if (!(await checkCredentials(email, password))) {
    await sql`insert into login_attempts (ip) values (${ip})`
    await sql`delete from login_attempts where at < now() - interval '1 day'`
    return json(401, { error: 'E-mail ou senha incorretos.' })
  }

  await sql`delete from login_attempts where ip = ${ip}`
  return json(200, { admin: true }, { 'set-cookie': sessionCookie() })
}

export async function DELETE(request: Request): Promise<Response> {
  if (!sameOrigin(request)) return json(403, { error: 'Origem não permitida.' })
  return json(200, { admin: false }, { 'set-cookie': clearSessionCookie() })
}
