const MATERIAL_MAP_KEYS = [
  'map',
  'alphaMap',
  'aoMap',
  'bumpMap',
  'displacementMap',
  'emissiveMap',
  'envMap',
  'lightMap',
  'metalnessMap',
  'normalMap',
  'roughnessMap',
  'specularMap',
]

function disposeMaterial(material) {
  if (!material) return
  for (const key of MATERIAL_MAP_KEYS) {
    const tex = material[key]
    if (tex && typeof tex.dispose === 'function') tex.dispose()
  }
  material.dispose?.()
}

/** @param {import('three').Object3D} root */
export function disposeObject3D(root) {
  root.traverse((obj) => {
    if (!obj) return
    if (obj.geometry) obj.geometry.dispose?.()
    const mat = obj.material
    if (Array.isArray(mat)) mat.forEach((m) => disposeMaterial(m))
    else disposeMaterial(mat)
    if (obj.skeleton?.dispose) obj.skeleton.dispose()
  })
}
