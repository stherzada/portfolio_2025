// Vercel serverless function. Injects the real post title/description/OG/
// canonical/JSON-LD into the raw HTML for /blog/:slug BEFORE any client JS
// runs, so crawlers and link-unfurlers that don't execute JS (and the first
// crawl wave of ones that do) see the actual post, not the generic homepage
// title baked into index.html. See vercel.json for the /blog/:slug rewrite
// and the "functions" entry that bundles dist/index.html for readFileSync.

import { readFileSync } from 'fs'
import { join } from 'path'

interface VercelRequest {
  query: { slug?: string | string[] }
}

interface VercelResponse {
  status(code: number): VercelResponse
  setHeader(name: string, value: string): VercelResponse
  send(body: string): void
}

const SITE_URL = 'https://stherzada.com'
const FALLBACK_IMAGE = `${SITE_URL}/Logo.png`

interface PostRow {
  title: string
  description: string | null
  slug: string
  image_path: string | null
  created_at: string
  updated_at: string | null
}

async function fetchPostBySlug(slug: string): Promise<PostRow | null> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars for blog-meta injection')
    return null
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/posts?select=title,description,slug,image_path,created_at,updated_at&slug=eq.${encodeURIComponent(slug)}&limit=1`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    },
  )

  if (!response.ok) {
    console.error('Failed to fetch post for blog-meta', response.status, await response.text())
    return null
  }

  const rows = (await response.json()) as PostRow[]
  return rows[0] ?? null
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = Array.isArray(req.query.slug) ? req.query.slug[0] : req.query.slug
  const indexHtml = readFileSync(join(process.cwd(), 'dist', 'index.html'), 'utf-8')

  res.setHeader('Content-Type', 'text/html; charset=utf-8')

  if (!slug) {
    res.status(200).send(indexHtml)
    return
  }

  const post = await fetchPostBySlug(slug)
  if (!post) {
    // Untouched passthrough — the client-side router's catch-all route
    // (NotFound.vue) still handles the 404 UX normally once JS runs.
    res.status(200).send(indexHtml)
    return
  }

  const title = `${post.title} - Sthefany Sther`
  const description = post.description || 'Leia mais sobre este post no blog da Sthefany Sther'
  const canonical = `${SITE_URL}/blog/${post.slug}`
  const image = post.image_path || FALLBACK_IMAGE

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description,
    image,
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: { '@type': 'Person', name: 'Sthefany Sther', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Sthefany Sther',
      logo: { '@type': 'ImageObject', url: FALLBACK_IMAGE },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
  }

  const html = indexHtml
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta name="description"[^>]*>/,
      `<meta name="description" content="${escapeHtml(description)}">`,
    )
    .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${escapeHtml(canonical)}">`)

  const injected = `
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
  <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
</head>`

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600')
  res.status(200).send(html.replace('</head>', injected))
}
