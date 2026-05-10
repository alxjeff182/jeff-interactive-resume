import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const SOURCE_DIR = path.resolve('public/models')
const OUTPUT_DIR = path.resolve('public/models-optimized')

function collectGlbFiles(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) collectGlbFiles(fullPath, out)
    else if (entry.isFile() && fullPath.endsWith('.glb')) out.push(fullPath)
  }
  return out
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

if (!fs.existsSync(SOURCE_DIR)) {
  console.error(`Source directory not found: ${SOURCE_DIR}`)
  process.exit(1)
}

ensureDir(OUTPUT_DIR)
const files = collectGlbFiles(SOURCE_DIR)

if (files.length === 0) {
  console.log('No GLB files found, skipping.')
  process.exit(0)
}

for (const sourceFile of files) {
  const relativePath = path.relative(SOURCE_DIR, sourceFile)
  const outFile = path.join(OUTPUT_DIR, relativePath)
  ensureDir(path.dirname(outFile))

  console.log(`Optimizing ${relativePath}`)
  const result = spawnSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    [
      '@gltf-transform/cli',
      'optimize',
      sourceFile,
      outFile,
      '--compress',
      'draco',
      '--texture-compress',
      'webp',
      '--texture-size',
      '1024',
    ],
    { stdio: 'inherit' },
  )

  if (result.status !== 0) {
    console.error(`Failed to optimize ${relativePath}`)
    process.exit(result.status ?? 1)
  }
}

console.log(`\nOptimized models written to: ${path.relative(process.cwd(), OUTPUT_DIR)}`)
