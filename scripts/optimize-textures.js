import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const SOURCE_DIR = path.resolve('public/models')
const OUTPUT_DIR = path.resolve('public/models-texture-optimized')

function hasKtxCli() {
  const probe = spawnSync(process.platform === 'win32' ? 'where' : 'command', process.platform === 'win32' ? ['ktx'] : ['-v', 'ktx'], {
    shell: process.platform !== 'win32',
    stdio: 'ignore',
  })
  return probe.status === 0
}

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
const textureMode = hasKtxCli() ? 'etc1s' : 'webp'
console.log(`Texture compression mode: ${textureMode}`)

for (const sourceFile of files) {
  const relativePath = path.relative(SOURCE_DIR, sourceFile)
  const outFile = path.join(OUTPUT_DIR, relativePath)
  ensureDir(path.dirname(outFile))

  console.log(`Texture-optimizing ${relativePath}`)
  const args = textureMode === 'etc1s'
    ? [
        '@gltf-transform/cli',
        'etc1s',
        sourceFile,
        outFile,
        '--quality',
        '128',
        '--slots',
        'map,normal,metallicRoughness,emissive,occlusion',
      ]
    : [
        '@gltf-transform/cli',
        'webp',
        sourceFile,
        outFile,
        '--quality',
        '80',
      ]

  const result = spawnSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    args,
    { stdio: 'inherit' },
  )

  if (result.status !== 0) {
    console.error(`Failed to optimize textures for ${relativePath}`)
    process.exit(result.status ?? 1)
  }
}

console.log(`\nTexture-optimized models written to: ${path.relative(process.cwd(), OUTPUT_DIR)}`)
