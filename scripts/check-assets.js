import fs from 'node:fs'
import path from 'node:path'

const MODELS_DIR = path.resolve('public/models')
const WARN_FILE_MB = 8

function collectFiles(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) collectFiles(fullPath, out)
    else if (entry.isFile() && fullPath.endsWith('.glb')) out.push(fullPath)
  }
  return out
}

function toMb(bytes) {
  return bytes / (1024 * 1024)
}

if (!fs.existsSync(MODELS_DIR)) {
  console.error(`Models directory not found: ${MODELS_DIR}`)
  process.exit(1)
}

const files = collectFiles(MODELS_DIR)
if (files.length === 0) {
  console.log('No GLB assets found.')
  process.exit(0)
}

const rows = files.map((file) => {
  const size = fs.statSync(file).size
  return { file: path.relative(process.cwd(), file), size }
})

rows.sort((a, b) => b.size - a.size)
const total = rows.reduce((sum, row) => sum + row.size, 0)
const largeFiles = rows.filter((row) => toMb(row.size) >= WARN_FILE_MB)

console.log(`GLB files: ${rows.length}`)
console.log(`Total size: ${toMb(total).toFixed(2)} MB`)
console.log(`Largest files:`)
for (const row of rows.slice(0, 10)) {
  console.log(`- ${row.file}: ${toMb(row.size).toFixed(2)} MB`)
}

if (largeFiles.length > 0) {
  console.log(`\nFiles larger than ${WARN_FILE_MB}MB:`)
  for (const row of largeFiles) {
    console.log(`- ${row.file}: ${toMb(row.size).toFixed(2)} MB`)
  }
}
