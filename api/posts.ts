// Leitura pública do blog.
//
//   GET /api/posts?page=1&per_page=10 → { posts, total }
//   GET /api/posts?slug=<slug>        → post (404 se não existir)
//   GET /api/posts?id=<uuid>          → post (404 se não existir)
//
// Fica 1 minuto no cache da Vercel: um post novo ou editado aparece logo, e o
// banco não recebe uma consulta por visita. O /admin lê pelo api/admin-posts,
// que nunca vem do cache.

import { db, json, pageParams, UUID, type PostRow } from './_lib/db.js'

const CACHE = { 'cache-control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=600' }

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const sql = db()

  const id = url.searchParams.get('id')
  const slug = url.searchParams.get('slug')
  if (id !== null || slug !== null) {
    if (id !== null && !UUID.test(id)) return json(404, { error: 'Post não encontrado.' })
    const rows = id !== null
      ? await sql`select * from posts where id = ${id}`
      : await sql`select * from posts where slug = ${slug}`
    const post = rows[0] as PostRow | undefined
    return post ? json(200, post, CACHE) : json(404, { error: 'Post não encontrado.' }, CACHE)
  }

  const { limit, offset } = pageParams(url)
  const [posts, [{ total }]] = await Promise.all([
    sql`
      select id, title, slug, created_at, description, image_path, content
      from posts order by created_at desc limit ${limit} offset ${offset}
    `,
    sql`select count(*)::int as total from posts`,
  ])
  return json(200, { posts, total }, CACHE)
}
