import { state } from '../state.js'

export function pickEditable(clientX, clientY) {
  if (!state.camera || !state.editables.length) return null

  state.pointerNdc.x = (clientX / window.innerWidth) * 2 - 1
  state.pointerNdc.y = -(clientY / window.innerHeight) * 2 + 1
  state.raycaster.setFromCamera(state.pointerNdc, state.camera)

  const hits = state.raycaster.intersectObjects(state.editables, true)
  if (!hits.length) return null

  let cur = hits[0].object
  while (cur) {
    if (state.editables.includes(cur)) return cur
    cur = cur.parent
  }
  return null
}
