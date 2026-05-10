import * as THREE from 'three'
import {
  GROUND_FIELD_CENTER_X,
  GROUND_FIELD_CENTER_Z,
  GROUND_FIELD_HALF_EXTENT_X,
  GROUND_FIELD_HALF_EXTENT_Z,
  PLAYER_COLLIDER_HALF,
} from './constants.js'
import { state } from './state.js'

const FOOTPRINT_COLLISION_EXTRA = 0.24
const FOOTPRINT_BLOCK_HEIGHT = 2.4

/**
 * @typedef {object} StaticCollider
 * @property {string} name
 * @property {THREE.Object3D} object
 * @property {THREE.Box3} box
 * @property {'aabb'|'footprint'} kind
 * @property {number} [padding]
 * @property {number} [insetX]
 * @property {number} [insetY]
 * @property {number} [insetZ]
 * @property {number | null} [footprintHalfX]
 * @property {number | null} [footprintHalfZ]
 * @property {number} [footprintOffsetX]
 * @property {number} [footprintOffsetZ]
 * @property {number} [footprintYawOffset]
 * @property {number} centerX
 * @property {number} centerZ
 * @property {number} yaw
 * @property {number} minY
 * @property {number} maxY
 */

/**
 * @param {string} name
 * @param {THREE.Object3D} object
 * @param {object} [options]
 */
export function addStaticCollider(name, object, options = {}) {
  const {
    padding = 0.05,
    insetX = 0,
    insetY = 0,
    insetZ = 0,
    useFootprint = false,
    footprintHalfX = null,
    footprintHalfZ = null,
    footprintOffsetX = 0,
    footprintOffsetZ = 0,
    footprintYawOffset = 0,
  } = options

  /** @type {StaticCollider} */
  const collider = {
    name,
    object,
    box: new THREE.Box3(),
    kind: useFootprint ? 'footprint' : 'aabb',
    padding,
    insetX,
    insetY,
    insetZ,
    footprintHalfX,
    footprintHalfZ,
    footprintOffsetX,
    footprintOffsetZ,
    footprintYawOffset,
    centerX: 0,
    centerZ: 0,
    yaw: 0,
    minY: -Infinity,
    maxY: Infinity,
  }
  refreshStaticCollider(collider)
  state.staticColliders.push(collider)
}

/** @param {StaticCollider} collider */
export function refreshStaticCollider(collider) {
  const obj = collider.object
  obj.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(obj)

  if (collider.kind === 'footprint') {
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    collider.yaw = obj.rotation.y + (collider.footprintYawOffset ?? 0)
    // Apply footprint offsets in the collider's local space, then rotate
    // into world space so tuned offsets keep working on rotated buildings.
    const ox = collider.footprintOffsetX ?? 0
    const oz = collider.footprintOffsetZ ?? 0
    const cos = Math.cos(collider.yaw)
    const sin = Math.sin(collider.yaw)
    collider.centerX = center.x + (ox * cos - oz * sin)
    collider.centerZ = center.z + (ox * sin + oz * cos)
    collider.footprintHalfX = collider.footprintHalfX ?? Math.max(0.4, size.x * 0.24)
    collider.footprintHalfZ = collider.footprintHalfZ ?? Math.max(0.4, size.z * 0.24)
    collider.minY = box.min.y - 0.05
    // Footprint colliders only need to block player-height volume, not roofs.
    collider.maxY = Math.min(box.max.y + 0.05, collider.minY + FOOTPRINT_BLOCK_HEIGHT)
    collider.box.min.set(
      collider.centerX - collider.footprintHalfX,
      collider.minY,
      collider.centerZ - collider.footprintHalfZ,
    )
    collider.box.max.set(
      collider.centerX + collider.footprintHalfX,
      collider.maxY,
      collider.centerZ + collider.footprintHalfZ,
    )
    return
  }

  collider.box.copy(box)
  collider.box.expandByScalar(collider.padding ?? 0.05)
  const insetX = collider.insetX ?? 0
  const insetY = collider.insetY ?? 0
  const insetZ = collider.insetZ ?? 0
  if (insetX !== 0 || insetY !== 0 || insetZ !== 0) {
    collider.box.min.x += insetX
    collider.box.max.x -= insetX
    collider.box.min.y += insetY
    collider.box.max.y -= insetY
    collider.box.min.z += insetZ
    collider.box.max.z -= insetZ
  }
}

/** @param {THREE.Object3D} player */
export function intersectsAnyStatic(player) {
  const px = player.position.x
  const pz = player.position.z
  state.playerBox.min.set(px - PLAYER_COLLIDER_HALF, -0.2, pz - PLAYER_COLLIDER_HALF)
  state.playerBox.max.set(px + PLAYER_COLLIDER_HALF, 1.9, pz + PLAYER_COLLIDER_HALF)

  for (const c of state.staticColliders) {
    if (c.kind === 'footprint') {
      if (state.playerBox.max.y < c.minY || state.playerBox.min.y > c.maxY) continue
      const cos = Math.cos(-c.yaw)
      const sin = Math.sin(-c.yaw)
      const lx = (px - c.centerX) * cos - (pz - c.centerZ) * sin
      const lz = (px - c.centerX) * sin + (pz - c.centerZ) * cos
      const qx = Math.max(Math.abs(lx) - (c.footprintHalfX ?? 0), 0)
      const qz = Math.max(Math.abs(lz) - (c.footprintHalfZ ?? 0), 0)
      const collisionR = PLAYER_COLLIDER_HALF + FOOTPRINT_COLLISION_EXTRA
      if ((qx * qx + qz * qz) <= (collisionR * collisionR)) return true
      continue
    }
    if (state.playerBox.intersectsBox(c.box)) return true
  }
  return false
}

/** Keep the player capsule inside the grass plane (same footprint as the mesh). */
export function clampPlayerToGroundField(player) {
  const inset = PLAYER_COLLIDER_HALF + 0.18
  const minX = GROUND_FIELD_CENTER_X - GROUND_FIELD_HALF_EXTENT_X + inset
  const maxX = GROUND_FIELD_CENTER_X + GROUND_FIELD_HALF_EXTENT_X - inset
  const minZ = GROUND_FIELD_CENTER_Z - GROUND_FIELD_HALF_EXTENT_Z + inset
  const maxZ = GROUND_FIELD_CENTER_Z + GROUND_FIELD_HALF_EXTENT_Z - inset
  player.position.x = Math.min(maxX, Math.max(minX, player.position.x))
  player.position.z = Math.min(maxZ, Math.max(minZ, player.position.z))
}
