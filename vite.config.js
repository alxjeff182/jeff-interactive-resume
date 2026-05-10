import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** Default production URL — override with VITE_SITE_URL (e.g. custom domain). */
const DEFAULT_SITE_URL = 'https://jeff-interactive-resume.vercel.app'

function manualChunks(id) {
  if (!id.includes('node_modules')) return undefined

  if (id.includes('/node_modules/three/examples/jsm/')) {
    return 'three-loaders'
  }

  if (id.includes('/node_modules/three/')) {
    return 'three-core'
  }

  return 'vendor'
}

function resolveSiteUrl(env) {
  const trimSlash = (s) => s.replace(/\/$/, '')
  const withHttps = (hostOrUrl) => {
    const s = trimSlash(hostOrUrl.trim())
    if (!s) return ''
    return /^https?:\/\//i.test(s) ? trimSlash(s) : `https://${s}`
  }

  const fromVite = env.VITE_SITE_URL?.trim()
  if (fromVite) return withHttps(fromVite)

  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (prod) return withHttps(prod)

  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) return `https://${trimSlash(vercel)}`

  return trimSlash(DEFAULT_SITE_URL)
}

function seoPlugin(siteUrl) {
  return {
    name: 'seo-site-url-and-static-files',
    transformIndexHtml(html) {
      return html.replaceAll('__SITE_URL__', siteUrl)
    },
    closeBundle() {
      const outDir = resolve(__dirname, 'dist')
      const lastmod = new Date().toISOString().slice(0, 10)

      const robots = `# Jeff — Interactive 3D Resume (public portfolio SPA)
User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`

      writeFileSync(resolve(outDir, 'robots.txt'), robots, 'utf8')
      writeFileSync(resolve(outDir, 'sitemap.xml'), sitemap, 'utf8')
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = resolveSiteUrl(env)

  return {
    assetsInclude: ['**/*.ktx2'],
    plugins: [seoPlugin(siteUrl)],
    build: {
      rollupOptions: {
        output: {
          manualChunks,
        },
      },
    },
  }
})
