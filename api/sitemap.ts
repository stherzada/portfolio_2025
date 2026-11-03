// Vercel serverless function. Generates sitemap.xml on request so posts
// published through the admin CMS get indexed without a manual rebuild —
// see vercel.json for the /sitemap.xml -> /api/sitemap rewrite, and
// public/robots.txt for the Sitemap: directive pointing at it.

import { db } from './_lib/db.js'

interface VercelRequest {
  method?: string
}

interface VercelResponse {
  status(code: number): VercelResponse
  setHeader(name: string, value: string): VercelResponse
  send(body: string): void
}

const SITE_URL = 'https://www.stherzada.com'

interface PostRow {
  slug: string
  created_at: Date | string | null
}

async function fetchPostSlugs(): Promise<PostRow[]> {
  return (await db()`select slug, created_at from posts order by created_at desc`) as PostRow[]
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: string): string {
  return [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n')
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  // Cached at the edge; a new post shows up within the hour instead of
  // hitting the database on every crawler request.
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')

  const today = new Date().toISOString().slice(0, 10)

  const entries = [
    urlEntry(`${SITE_URL}/`, today, 'weekly', '1.0'),
    urlEntry(`${SITE_URL}/blog`, today, 'daily', '0.9'),
  ]

  let posts: PostRow[] = []
  try {
    posts = await fetchPostSlugs()
  } catch (error) {
    // Still serve the static pages rather than a 500 for the whole sitemap.
    console.error('sitemap: failed to fetch posts', error)
  }
  for (const post of posts) {
    if (!post.slug) continue
    const lastmod = post.created_at ? new Date(post.created_at).toISOString().slice(0, 10) : today
    entries.push(urlEntry(`${SITE_URL}/blog/${post.slug}`, lastmod, 'monthly', '0.7'))
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`

  res.status(200).send(xml)
}
