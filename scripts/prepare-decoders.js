import fs from 'node:fs'
import path from 'node:path'

const COPIES = [
  {
    from: 'node_modules/three/examples/jsm/libs/draco',
    to: 'public/decoders/draco',
  },
  {
    from: 'node_modules/three/examples/jsm/libs/basis',
    to: 'public/decoders/basis',
  },
  {
    from: 'node_modules/three/examples/jsm/libs/meshopt_decoder.module.js',
    to: 'public/decoders/meshopt_decoder.module.js',
  },
]

function copyRecursive(src, dest) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true })
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name))
    }
    return
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
}

for (const item of COPIES) {
  const srcPath = path.resolve(item.from)
  const destPath = path.resolve(item.to)
  if (!fs.existsSync(srcPath)) {
    console.warn(`Skipping missing decoder source: ${item.from}`)
    continue
  }
  copyRecursive(srcPath, destPath)
  console.log(`Copied ${item.from} -> ${item.to}`)
}
