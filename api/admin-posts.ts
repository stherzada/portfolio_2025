// O CMS do /admin. Tudo aqui exige a sessão do admin (api/auth.ts).
//
//   GET    /api/admin-posts?page=1&per_page=10 → { posts, total }
//   GET    /api/admin-posts?id=<uuid>          → post
//   POST   /api/admin-posts { title, description, slug, content, image_path? } → post
//   PATCH  /api/admin-posts?id=<uuid> { ...só os campos que mudam } → post
//   DELETE /api/admin-posts?id=<uuid>

import { db, json, pageParams, pgCode, UUID, type PostRow } from './_lib/db.js'
import { isAdmin, sameOrigin } from './_lib/session.js'

const FIELDS = ['title', 'description', 'slug', 'content', 'image_path'] as const
type Field = (typeof FIELDS)[number]
type PostInput = Partial<Record<Field, string | null>>

const LIMITS: Record<Field, number> = {
  title: 300,
  description: 1000,
  slug: 300,
  content: 2_000_000,
  image_path: 2000,
}

/** Só os campos conhecidos, só texto, dentro do limite. Devolve a mensagem de erro, se houver. */
function readInput(raw: unknown): { input: PostInput } | { error: string } {
  if (!raw || typeof raw !== 'object') return { error: 'Pedido inválido.' }
  const input: PostInput = {}
  for (const field of FIELDS) {
    if (!(field in raw)) continue
    const value = (raw as Record<string, unknown>)[field]
    if (value === null || value === undefined) {
      if (field === 'image_path' || field === 'description') input[field] = null
      else return { error: `O campo ${field} é obrigatório.` }
      continue
    }
    if (typeof value !== 'string') return { error: `O campo ${field} precisa ser texto.` }
    if (value.length > LIMITS[field]) return { error: `O campo ${field} está grande demais.` }
    input[field] = value
  }
  return { input }
}

async function guard(request: Request, mutating: boolean): Promise<Response | null> {
  if (mutating && !sameOrigin(request)) return json(403, { error: 'Origem não permitida.' })
  if (!isAdmin(request)) return json(401, { error: 'Sessão expirada. Entre de novo.' })
  return null
}

const duplicateSlug = (error: unknown) =>
  pgCode(error) === '23505' ? json(409, { error: 'Já existe um post com esse slug.' }) : null

export async function GET(request: Request): Promise<Response> {
  const denied = await guard(request, false)
  if (denied) return denied

  const url = new URL(request.url)
  const sql = db()
  const id = url.searchParams.get('id')
  if (id !== null) {
    if (!UUID.test(id)) return json(404, { error: 'Post não encontrado.' })
    const [post] = await sql`select * from posts where id = ${id}`
    return post ? json(200, post) : json(404, { error: 'Post não encontrado.' })
  }

  const { limit, offset } = pageParams(url)
  const [posts, [{ total }]] = await Promise.all([
    sql`
      select id, title, slug, created_at, description, image_path, content
      from posts order by created_at desc limit ${limit} offset ${offset}
    `,
    sql`select count(*)::int as total from posts`,
  ])
  return json(200, { posts, total })
}

export async function POST(request: Request): Promise<Response> {
  const denied = await guard(request, true)
  if (denied) return denied

  const parsed = readInput(await request.json().catch(() => null))
  if ('error' in parsed) return json(400, { error: parsed.error })
  const { title, description = null, slug, content = '', image_path = null } = parsed.input
  if (!title?.trim() || !slug?.trim()) return json(400, { error: 'Título e slug são obrigatórios.' })

  try {
    const [post] = await db()`
      insert into posts (title, description, slug, content, image_path)
      values (${title}, ${description}, ${slug}, ${content}, ${image_path})
      returning *
    `
    return json(201, post)
  } catch (error) {
    const conflict = duplicateSlug(error)
    if (conflict) return conflict
    throw error
  }
}

export async function PATCH(request: Request): Promise<Response> {
  const denied = await guard(request, true)
  if (denied) return denied

  const id = new URL(request.url).searchParams.get('id') ?? ''
  if (!UUID.test(id)) return json(404, { error: 'Post não encontrado.' })
  const parsed = readInput(await request.json().catch(() => null))
  if ('error' in parsed) return json(400, { error: parsed.error })

  const sql = db()
  const [current] = (await sql`select * from posts where id = ${id}`) as PostRow[]
  if (!current) return json(404, { error: 'Post não encontrado.' })

  const next = { ...current, ...parsed.input } as PostRow
  if (!next.title.trim() || !next.slug.trim()) return json(400, { error: 'Título e slug são obrigatórios.' })

  try {
    const [post] = await sql`
      update posts set
        title = ${next.title},
        description = ${next.description},
        slug = ${next.slug},
        content = ${next.content},
        image_path = ${next.image_path}
      where id = ${id}
      returning *
    `
    return json(200, post)
  } catch (error) {
    const conflict = duplicateSlug(error)
    if (conflict) return conflict
    throw error
  }
}

export async function DELETE(request: Request): Promise<Response> {
  const denied = await guard(request, true)
  if (denied) return denied

  const id = new URL(request.url).searchParams.get('id') ?? ''
  if (!UUID.test(id)) return json(404, { error: 'Post não encontrado.' })
  await db()`delete from posts where id = ${id}`
  return json(200, {})
}
