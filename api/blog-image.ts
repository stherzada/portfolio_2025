// Serve as imagens do blog guardadas no Neon.
//
//   GET /blog-images/<nome>  (vercel.json reescreve para /api/blog-image?name=<nome>)
//
// Um nome nunca muda de conteúdo (cada upload ganha um nome novo), então a
// resposta fica em cache por um ano: o banco só é consultado na primeira vez.

import { db } from './_lib/db.js'

const NAME = /^[A-Za-z0-9._-]{1,200}$/

export async function GET(request: Request): Promise<Response> {
  const name = new URL(request.url).searchParams.get('name') ?? ''
  if (!NAME.test(name)) return new Response('Not found', { status: 404 })

  const [image] = await db()`
    select content_type, encode(data, 'base64') as data from images where name = ${name}
  `
  if (!image) {
    return new Response('Not found', { status: 404, headers: { 'cache-control': 'public, s-maxage=60' } })
  }

  return new Response(Buffer.from(image.data as string, 'base64'), {
    headers: {
      'content-type': image.content_type as string,
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff',
      'content-security-policy': "default-src 'none'; sandbox",
    },
  })
}
