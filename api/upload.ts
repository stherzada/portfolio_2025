// Upload de imagem do /admin (capa ou no meio do post).
//
//   POST /api/upload  (corpo = o arquivo, Content-Type = o tipo da imagem) → { url }
//
// A imagem fica na tabela `images` do Neon e sai por /blog-images/<nome>.

import { randomBytes } from 'node:crypto'
import { db, json } from './_lib/db.js'
import { isAdmin, sameOrigin } from './_lib/session.js'

// Só formatos raster: SVG pode carregar script.
const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

/** A Vercel recusa corpos acima de ~4,5 MB; o erro aqui é mais claro. */
const MAX_BYTES = 4 * 1024 * 1024

export async function POST(request: Request): Promise<Response> {
  if (!sameOrigin(request)) return json(403, { error: 'Origem não permitida.' })
  if (!isAdmin(request)) return json(401, { error: 'Sessão expirada. Entre de novo.' })

  const type = (request.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
  const ext = ALLOWED[type]
  if (!ext) return json(415, { error: 'Formato de imagem não suportado (use JPG, PNG, WebP, GIF ou AVIF).' })

  const declared = Number(request.headers.get('content-length') ?? 0)
  if (declared > MAX_BYTES) return json(413, { error: 'Imagem grande demais (máximo 4 MB).' })
  const data = Buffer.from(await request.arrayBuffer())
  if (!data.length) return json(400, { error: 'Arquivo vazio.' })
  if (data.length > MAX_BYTES) return json(413, { error: 'Imagem grande demais (máximo 4 MB).' })

  const name = `${Date.now()}-${randomBytes(6).toString('hex')}.${ext}`
  // em base64 pelo SQL: não depende de como o driver manda bytes
  await db()`
    insert into images (name, content_type, data)
    values (${name}, ${type}, decode(${data.toString('base64')}, 'base64'))
  `
  return json(201, { url: `/blog-images/${name}` })
}
