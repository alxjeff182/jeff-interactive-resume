import fs from 'node:fs'
import path from 'node:path'

const budgetPath = path.resolve('perf-budget.json')
const distDir = path.resolve('dist/assets')
const modelsDir = path.resolve('public/models')

function fail(msg) {
  console.error(msg)
  process.exit(1)
}

function getFileSizeKb(filePath) {
  return fs.statSync(filePath).size / 1024
}

function getModelSizes(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) getModelSizes(full, out)
    else if (entry.isFile() && full.endsWith('.glb')) out.push(fs.statSync(full).size / (1024 * 1024))
  }
  return out
}

if (!fs.existsSync(budgetPath)) fail('Missing perf-budget.json')
if (!fs.existsSync(distDir)) fail('Missing dist/assets. Run npm run build first.')
if (!fs.existsSync(modelsDir)) fail('Missing public/models directory.')

const budget = JSON.parse(fs.readFileSync(budgetPath, 'utf8'))
const distFiles = fs.readdirSync(distDir)

const appChunk = distFiles.find((f) => /^index-.*\.js$/.test(f))
const coreChunk = distFiles.find((f) => /^three-core-.*\.js$/.test(f))
const loaderChunk = distFiles.find((f) => /^three-loaders-.*\.js$/.test(f))

if (!appChunk || !coreChunk || !loaderChunk) fail('Expected chunk files were not found in dist/assets.')

const appKb = getFileSizeKb(path.join(distDir, appChunk))
const coreKb = getFileSizeKb(path.join(distDir, coreChunk))
const loadersKb = getFileSizeKb(path.join(distDir, loaderChunk))

const modelSizes = getModelSizes(modelsDir)
const totalModelsMb = modelSizes.reduce((sum, size) => sum + size, 0)
const maxModelMb = Math.max(...modelSizes)

const checks = [
  ['app chunk', appKb, budget.build.maxAppChunkKb],
  ['three-core chunk', coreKb, budget.build.maxThreeCoreChunkKb],
  ['three-loaders chunk', loadersKb, budget.build.maxThreeLoadersChunkKb],
  ['total model size', totalModelsMb, budget.assets.maxTotalModelsMb],
  ['largest model size', maxModelMb, budget.assets.maxSingleModelMb],
]

let hasFailure = false
for (const [name, actual, limit] of checks) {
  if (actual > limit) {
    console.error(`Budget failed for ${name}: actual=${actual.toFixed(2)} limit=${limit.toFixed(2)}`)
    hasFailure = true
  } else {
    console.log(`Budget ok for ${name}: actual=${actual.toFixed(2)} limit=${limit.toFixed(2)}`)
  }
}

if (hasFailure) process.exit(1)
