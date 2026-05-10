export function faceToward(obj, target, extraYaw = 0) {
  const dx = target.x - obj.position.x
  const dz = target.z - obj.position.z
  obj.rotation.y = Math.atan2(dx, dz) + extraYaw
}

/** @param {import('three').Object3D | null | undefined} obj @param {import('three').Object3D} root */
export function isDescendantOf(obj, root) {
  let cur = obj
  while (cur) {
    if (cur === root) return true
    cur = cur.parent
  }
  return false
}
