import { defineConfig, loadEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function twitchLiveStatusDevProxy(): Plugin {
  return {
    name: 'twitch-live-status-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/twitch-live-status', async (_req, res) => {
        const mod = await server.ssrLoadModule('/api/twitch-live-status.ts')
        const devRes = {
          status: () => devRes,
          setHeader: () => devRes,
          json: (body: unknown) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(body))
          },
        }
        await mod.default({}, devRes)
      })
    },
  }
}

// No `vite` de dev, a pasta api/ não roda sozinha (só no `vercel dev`). Isto
// liga as funções do blog no próprio servidor do Vite, com as variáveis do
// .env.local (DATABASE_URL, ADMIN_*, SESSION_SECRET), pra o blog e o /admin
// funcionarem no `bun run dev`.
const BLOG_API: Record<string, string> = {
  '/api/posts': '/api/posts.ts',
  '/api/admin-posts': '/api/admin-posts.ts',
  '/api/auth': '/api/auth.ts',
  '/api/upload': '/api/upload.ts',
  '/api/blog-image': '/api/blog-image.ts',
}

function blogApiDevProxy(): Plugin {
  return {
    name: 'blog-api-dev-proxy',
    configureServer(server) {
      Object.assign(process.env, loadEnv(server.config.mode, process.cwd(), ''))

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
        // igual ao rewrite do vercel.json
        const image = url.pathname.match(/^\/blog-images\/([^/]+)$/)
        if (image) {
          url.pathname = '/api/blog-image'
          url.searchParams.set('name', decodeURIComponent(image[1]))
        }
        const file = BLOG_API[url.pathname]
        if (!file) return next()

        try {
          const mod = await server.ssrLoadModule(file)
          const method = (req.method ?? 'GET').toUpperCase()
          const handler = mod[method] as ((r: Request) => Promise<Response>) | undefined
          if (!handler) {
            res.statusCode = 405
            res.end()
            return
          }
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)
          const headers = new Headers()
          for (const [key, value] of Object.entries(req.headers)) {
            if (typeof value === 'string') headers.set(key, value)
            else if (Array.isArray(value)) headers.set(key, value.join(', '))
          }
          const body = chunks.length && method !== 'GET' && method !== 'HEAD' ? Buffer.concat(chunks) : undefined
          const response = await handler(new Request(url, { method, headers, body }))

          res.statusCode = response.status
          response.headers.forEach((value, key) => {
            if (key !== 'set-cookie') res.setHeader(key, value)
          })
          const cookies = response.headers.getSetCookie()
          if (cookies.length) res.setHeader('set-cookie', cookies)
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (error) {
          server.config.logger.error(`[blog-api] ${url.pathname}: ${String(error)}`)
          res.statusCode = 500
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: 'Erro no servidor de dev (veja o terminal).' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    twitchLiveStatusDevProxy(),
    blogApiDevProxy(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'vue-i18n'],
          'utils': ['@vueuse/core'],
          'icons': ['lucide-vue-next'],
          'tiptap-vendor': ['@tiptap/vue-3', '@tiptap/starter-kit', '@tiptap/extension-image'],
          'gsap-vendor': ['gsap'],
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name ?? ''
          const extType = info.split('.').at(1) ?? ''
          if (extType === 'css') {
            return 'assets/css/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      }
    },
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        // Strip debug logging but keep console.error/warn for production diagnostics.
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        drop_debugger: true
      }
    },
    reportCompressedSize: true,
    assetsInlineLimit: 4096
  }
})
