import * as THREE from 'three'
import { state } from '../state.js'

function clearHelpers() {
  const scene = state.scene
  if (!scene) return
  for (const h of state.debug.colliderHelpers) {
    scene.remove(h)
  }
  state.debug.colliderHelpers = []
}

/** Toggle AABB helpers for static colliders (dev / portfolio demo). */
export function setColliderDebugVisible(visible) {
  state.debug.showColliders = visible
  clearHelpers()
  if (!visible || !state.scene) return

  for (const c of state.staticColliders) {
    /** @type {THREE.Object3D} */
    let helper
    if (c.kind === 'footprint') {
      const width = Math.max((c.footprintHalfX ?? 0.5) * 2, 0.05)
      const depth = Math.max((c.footprintHalfZ ?? 0.5) * 2, 0.05)
      const height = Math.max(c.maxY - c.minY, 0.2)
      const geom = new THREE.BoxGeometry(width, height, depth)
      const mat = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        wireframe: true,
        transparent: true,
        opacity: 0.85,
        depthTest: false,
      })
      const mesh = new THREE.Mesh(geom, mat)
      mesh.position.set(c.centerX, c.minY + (height * 0.5), c.centerZ)
      mesh.rotation.y = c.yaw
      mesh.renderOrder = 999
      helper = mesh
    } else {
      helper = new THREE.Box3Helper(c.box, 0xff00ff)
    }
    state.scene.add(helper)
    state.debug.colliderHelpers.push(helper)
  }
}
