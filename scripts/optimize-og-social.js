/**
 * JPEG ringan + rasio 1.91:1 untuk crawler (WA / FB / LinkedIn).
 * Jalankan setelah mengganti public/og-cover.png: node scripts/optimize-og-social.js
 */
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const src = resolve(root, 'public/og-cover.png')
const out = resolve(root, 'public/og-cover-social.jpg')

await sharp(src)
  .resize(1200, 630, { fit: 'cover', position: 'center' })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(out)

console.log(`Wrote ${out}`)
