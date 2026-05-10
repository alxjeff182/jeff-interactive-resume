import * as THREE from 'three'
import { state } from '../state.js'

/**
 * Sims plumbob = hexagonal bipyramid (two 6-sided cones base-to-base), not an octahedron.
 * Phong shading + emissive reads as 3D crystal under the scene directional light.
 *
 * Color: Shopee-style orange (#EE4D2D) — high contrast on green grass.
 */
function createSimsPlumbobMesh() {
  const H = 0.46
  const R = 0.178

  const mat = new THREE.MeshPhongMaterial({
    color: 0xee4d2d,
    emissive: 0xa02818,
    emissiveIntensity: 0.68,
    shininess: 82,
    specular: 0xffdcc8,
    flatShading: true,
  })

  const upper = new THREE.Mesh(new THREE.ConeGeometry(R, H, 6), mat)
  upper.position.y = H / 2

  const lower = new THREE.Mesh(new THREE.ConeGeometry(R, H, 6), mat)
  lower.rotation.x = Math.PI
  lower.position.y = -H / 2

  const crystal = new THREE.Group()
  crystal.name = 'plumbob-crystal'
  crystal.add(upper, lower)
  crystal.position.y = 0.58

  return crystal
}

/**
 * Sims-style hex plumbob above the pond.
 * @param {THREE.Object3D} pondRoot
 */
export function attachPondMarker(pondRoot) {
  pondRoot.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(pondRoot)
  const centerWorld = box.getCenter(new THREE.Vector3())
  const topWorld = new THREE.Vector3(centerWorld.x, box.max.y, centerWorld.z)
  const anchor = topWorld.clone()
  pondRoot.worldToLocal(anchor)

  const root = new THREE.Group()
  root.name = 'pond-marker'

  const plumbob = createSimsPlumbobMesh()
  root.add(plumbob)

  root.position.copy(anchor)
  root.position.y += 0.06

  root.userData.pondRoot = pondRoot
  root.userData.bobBaseY = root.position.y
  root.userData.plumbob = plumbob
  root.userData.smoothScale = 1

  pondRoot.add(root)
  return root
}

/**
 * Bob + spin on Y (classic Sims idle motion).
 * @param {number} dt
 */
export function updatePondMarker(dt) {
  const pm = state.pondMarker
  if (!pm?.userData.pondRoot || typeof pm.userData.bobBaseY !== 'number') return

  const pondRoot = pm.userData.pondRoot
  const hover = state.cv.hovered === pondRoot
  const focus = state.cv.focusLabel === 'Pond'
  const target = focus ? 1.12 : hover ? 1.08 : 1

  let s = pm.userData.smoothScale
  s += (target - s) * (1 - Math.exp(-10 * dt))
  pm.userData.smoothScale = s
  pm.scale.setScalar(s)

  const t = state.clock.elapsedTime
  pm.position.y = pm.userData.bobBaseY + Math.sin(t * 2) * 0.035

  const plumbob = pm.userData.plumbob
  if (plumbob) {
    plumbob.rotation.y += dt * (focus ? 1.35 : hover ? 1.05 : 0.85)
  }
}
