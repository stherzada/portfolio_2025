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

// Throws on missing config / network / non-2xx so the caller can tell
// "post doesn't exist" (null) apart from "couldn't check".
async function fetchPostBySlug(slug: string): Promise<PostRow | null> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase env vars for blog-meta injection')
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/posts?select=title,description,slug,image_path,created_at,updated_at&slug=eq.${encodeURIComponent(slug)}&limit=1`,
    {
      signal: AbortSignal.timeout(5000),
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch post for blog-meta: ${response.status} ${await response.text()}`)
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

  let post: PostRow | null
  try {
    post = await fetchPostBySlug(slug)
  } catch (error) {
    // Couldn't reach Supabase: serve the plain SPA shell (the client shows
    // its own error/retry UI) and don't let the edge cache this response.
    console.error('blog-meta: falling back to plain index.html', error)
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).send(indexHtml)
    return
  }

  if (!post) {
    // Real 404 status so crawlers don't index a soft-404; the SPA still
    // boots from this HTML and renders its own "post not found" UI.
    res.status(404).send(
      indexHtml.replace('</head>', () => '  <meta name="robots" content="noindex">\n</head>'),
    )
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

  const meta: Record<string, string> = {
    'og:type': 'article',
    'og:title': title,
    'og:description': description,
    'og:image': image,
    'og:url': canonical,
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image,
  }

  // Every replacement goes through a function: a string replacement would
  // interpret `$&`, `$'` etc. inside post titles/descriptions.
  let html = indexHtml
    .replace(/<title>.*?<\/title>/, () => `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta\s+name="description"[^>]*>/, () => `<meta name="description" content="${escapeHtml(description)}">`)
    .replace(/<link rel="canonical"[^>]*>/, () => `<link rel="canonical" href="${escapeHtml(canonical)}">`)

  // index.html ships site-wide og:/twitter: defaults; overwrite them in place
  // (or append if missing) so there's exactly one of each.
  const appended: string[] = []
  for (const [key, value] of Object.entries(meta)) {
    const attr = key.startsWith('og:') ? 'property' : 'name'
    const tag = `<meta ${attr}="${key}" content="${escapeHtml(value)}">`
    const pattern = new RegExp(`<meta\\s+${attr}="${key}"[^>]*>`)
    if (pattern.test(html)) {
      html = html.replace(pattern, () => tag)
    } else {
      appended.push(`  ${tag}`)
    }
  }
  appended.push(`  <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`)

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600')
  res.status(200).send(html.replace('</head>', () => `${appended.join('\n')}\n</head>`))
}
