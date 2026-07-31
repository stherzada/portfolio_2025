// Vercel serverless function. Generates sitemap.xml on request so posts
// published through the admin CMS get indexed without a manual rebuild —
// see vercel.json for the /sitemap.xml -> /api/sitemap rewrite, and
// public/robots.txt for the Sitemap: directive pointing at it.

interface VercelRequest {
  method?: string
}

interface VercelResponse {
  status(code: number): VercelResponse
  setHeader(name: string, value: string): VercelResponse
  send(body: string): void
}

const SITE_URL = 'https://stherzada.dev'

interface PostRow {
  slug: string
  created_at: string
  updated_at?: string | null
}

async function fetchPostSlugs(): Promise<PostRow[]> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars for sitemap generation')
    return []
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/posts?select=slug,created_at,updated_at&order=created_at.desc`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    },
  )

  if (!response.ok) {
    console.error('Failed to fetch posts for sitemap', response.status, await response.text())
    return []
  }

  return (await response.json()) as PostRow[]
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
  // hitting Supabase on every crawler request.
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')

  const today = new Date().toISOString().slice(0, 10)

  const entries = [
    urlEntry(`${SITE_URL}/`, today, 'weekly', '1.0'),
    urlEntry(`${SITE_URL}/blog`, today, 'daily', '0.9'),
  ]

  const posts = await fetchPostSlugs()
  for (const post of posts) {
    if (!post.slug) continue
    const lastmod = (post.updated_at || post.created_at || today).slice(0, 10)
    entries.push(urlEntry(`${SITE_URL}/blog/${post.slug}`, lastmod, 'monthly', '0.7'))
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`

  res.status(200).send(xml)
}
