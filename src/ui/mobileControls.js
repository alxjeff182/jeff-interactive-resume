import { state } from '../state.js'
import {
  applyCameraZoomFactor,
  setCameraZoomDistance,
  togglePhotoMode,
} from '../game/input.js'
import { canInteractNearestBuilding, triggerNearestBuildingInteraction } from '../game/interaction.js'

const ZOOM_STEP = 1.12
const STICK_DEAD = 0.08

/** Reset stick when opening CV panel so the character doesn't keep walking. */
export function resetTouchStick() {
  state.touch.stickX = 0
  state.touch.stickY = 0
  state.touch.stickActive = false
  const knob = document.querySelector('.touch-stick-knob')
  if (knob) knob.style.transform = 'translate(-50%, -50%)'
}

/**
 * @param {HTMLCanvasElement} canvas
 */
export function setupMobileControls(canvas) {
  const stick = document.getElementById('touch-stick')
  const knob = stick?.querySelector('.touch-stick-knob')
  const zoomIn = document.getElementById('touch-zoom-in')
  const zoomOut = document.getElementById('touch-zoom-out')
  const photoBtn = document.getElementById('touch-photo-mode')
  const actionAButton = document.getElementById('touch-action-a')
  const actionBButton = document.getElementById('touch-action-b')
  const photoExitBtn = document.getElementById('photo-mode-exit')

  if (!stick || !knob) return

  let stickRect = /** @type {DOMRect | null} */ (null)
  let dragging = false
  let maxR = 56

  const syncStickRect = () => {
    stickRect = stick.getBoundingClientRect()
    maxR = Math.min(stickRect.width, stickRect.height) * 0.38
  }

  const applyStick = (clientX, clientY) => {
    if (!stickRect) syncStickRect()
    if (!stickRect) return
    const cx = stickRect.left + stickRect.width / 2
    const cy = stickRect.top + stickRect.height / 2
    let rx = (clientX - cx) / maxR
    let rz = -(clientY - cy) / maxR
    const len = Math.hypot(rx, rz)
    let nx = rx
    let nz = rz
    if (len > 1) {
      nx = rx / len
      nz = rz / len
    }
    if (len < STICK_DEAD) {
      nx = 0
      nz = 0
      state.touch.stickActive = false
    } else {
      state.touch.stickActive = true
    }
    state.touch.stickX = nx
    state.touch.stickY = nz

    const cx0 = clientX - (stickRect.left + stickRect.width / 2)
    const cy0 = clientY - (stickRect.top + stickRect.height / 2)
    const flen = Math.hypot(cx0, cy0)
    const cap = Math.min(flen, maxR)
    const ang = Math.atan2(cy0, cx0)
    const kx = Math.cos(ang) * cap
    const ky = Math.sin(ang) * cap
    knob.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`
  }

  const releaseStick = () => {
    dragging = false
    resetTouchStick()
  }

  const onStickPointerDown = (e) => {
    if (e.button !== 0) return
    e.preventDefault()
    syncStickRect()
    dragging = true
    stick.setPointerCapture(e.pointerId)
    applyStick(e.clientX, e.clientY)
  }

  const onStickPointerMove = (e) => {
    if (!dragging) return
    applyStick(e.clientX, e.clientY)
  }

  const onResize = () => {
    stickRect = null
  }

  const onZoomIn = () => applyCameraZoomFactor(ZOOM_STEP)
  const onZoomOut = () => applyCameraZoomFactor(1 / ZOOM_STEP)
  const onPhoto = () => togglePhotoMode()
  const onActionA = () => {
    if (state.cv.focusLabel) return
    if (actionAButton?.disabled) return
    triggerNearestBuildingInteraction(canvas)
  }

  const forceEndSprint = () => {
    const pid = state.input.sprintPointerId
    state.input.sprintPointerId = null
    state.input.sprintHeld = false
    if (pid === null || !actionBButton) return
    try {
      if (actionBButton.hasPointerCapture(pid)) {
        actionBButton.releasePointerCapture(pid)
      }
    } catch {
      /* ignore */
    }
  }

  const endSprintIfPointer = (e) => {
    if (
      state.input.sprintPointerId === null ||
      e.pointerId !== state.input.sprintPointerId
    ) {
      return
    }
    forceEndSprint()
  }

  const onActionBDown = (e) => {
    if (e.button !== 0) return
    if (state.cv.focusLabel) return
    if (!state.input.sprintHeld && state.input.sprintPointerId !== null) {
      forceEndSprint()
    }
    // Stale sprint from another pointer id — reset before taking this pointer.
    if (
      state.input.sprintHeld &&
      state.input.sprintPointerId !== null &&
      state.input.sprintPointerId !== e.pointerId
    ) {
      forceEndSprint()
    }
    state.input.sprintPointerId = e.pointerId
    state.input.sprintHeld = true
    try {
      actionBButton?.setPointerCapture(e.pointerId)
    } catch {
      state.input.sprintHeld = false
      state.input.sprintPointerId = null
    }
  }

  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') forceEndSprint()
  }

  const onWindowBlur = () => {
    forceEndSprint()
  }

  // pointerup often fires on document/window, not the button — catch globally.
  window.addEventListener('pointerup', endSprintIfPointer, true)
  window.addEventListener('pointercancel', endSprintIfPointer, true)
  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('blur', onWindowBlur)

  const onPhotoExit = () => {
    if (document.body.classList.contains('photo-mode')) togglePhotoMode()
  }

  stick.addEventListener('pointerdown', onStickPointerDown)
  stick.addEventListener('pointermove', onStickPointerMove)
  stick.addEventListener('pointerup', releaseStick)
  stick.addEventListener('pointercancel', releaseStick)
  stick.addEventListener('lostpointercapture', releaseStick)
  window.addEventListener('resize', onResize, { passive: true })

  zoomIn?.addEventListener('click', onZoomIn)
  zoomOut?.addEventListener('click', onZoomOut)
  actionAButton?.addEventListener('click', onActionA)
  actionBButton?.addEventListener('pointerdown', onActionBDown)
  actionBButton?.addEventListener('pointerup', endSprintIfPointer)
  actionBButton?.addEventListener('pointercancel', endSprintIfPointer)
  actionBButton?.addEventListener('lostpointercapture', endSprintIfPointer)
  photoBtn?.addEventListener('click', onPhoto)
  photoExitBtn?.addEventListener('click', onPhotoExit)

  let actionStateTimer = /** @type {number | null} */ (null)
  const syncActionState = () => {
    if (!actionAButton) return
    actionAButton.disabled = !canInteractNearestBuilding() || Boolean(state.cv.focusLabel)
  }
  syncActionState()
  actionStateTimer = window.setInterval(syncActionState, 180)

  // Pinch zoom on canvas (two-finger)
  const pinchPointers = new Map()
  let pinchStartDist = 0
  let pinchStartZoom = 1

  const distTwo = () => {
    const pts = [...pinchPointers.values()]
    if (pts.length < 2) return 0
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
  }

  const onCanvasPointerDown = (e) => {
    if (e.pointerType !== 'touch') return
    pinchPointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pinchPointers.size === 2) {
      pinchStartDist = distTwo()
      pinchStartZoom = state.cameraControl.zoom
    }
  }
  canvas.addEventListener(
    'pointerdown',
    onCanvasPointerDown,
    { passive: true },
  )

  const onCanvasPointerMove = (e) => {
    if (e.pointerType !== 'touch') return
    if (!pinchPointers.has(e.pointerId)) return
    pinchPointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pinchPointers.size >= 2 && pinchStartDist > 10) {
      e.preventDefault()
      const d = distTwo()
      if (d > 10) {
        setCameraZoomDistance(pinchStartZoom * (d / pinchStartDist))
      }
    }
  }
  canvas.addEventListener(
    'pointermove',
    onCanvasPointerMove,
    { passive: false },
  )

  const endPinchPointer = (e) => {
    if (e.pointerType !== 'touch') return
    pinchPointers.delete(e.pointerId)
    if (pinchPointers.size < 2) {
      pinchStartDist = 0
    }
  }

  canvas.addEventListener('pointerup', endPinchPointer)
  canvas.addEventListener('pointercancel', endPinchPointer)
  return () => {
    forceEndSprint()
    window.removeEventListener('pointerup', endSprintIfPointer, true)
    window.removeEventListener('pointercancel', endSprintIfPointer, true)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    window.removeEventListener('blur', onWindowBlur)
    if (actionStateTimer !== null) window.clearInterval(actionStateTimer)
    stick.removeEventListener('pointerdown', onStickPointerDown)
    stick.removeEventListener('pointermove', onStickPointerMove)
    stick.removeEventListener('pointerup', releaseStick)
    stick.removeEventListener('pointercancel', releaseStick)
    stick.removeEventListener('lostpointercapture', releaseStick)
    window.removeEventListener('resize', onResize)
    zoomIn?.removeEventListener('click', onZoomIn)
    zoomOut?.removeEventListener('click', onZoomOut)
    actionAButton?.removeEventListener('click', onActionA)
    actionBButton?.removeEventListener('pointerdown', onActionBDown)
    actionBButton?.removeEventListener('pointerup', endSprintIfPointer)
    actionBButton?.removeEventListener('pointercancel', endSprintIfPointer)
    actionBButton?.removeEventListener('lostpointercapture', endSprintIfPointer)
    photoBtn?.removeEventListener('click', onPhoto)
    photoExitBtn?.removeEventListener('click', onPhotoExit)
    canvas.removeEventListener('pointerdown', onCanvasPointerDown)
    canvas.removeEventListener('pointermove', onCanvasPointerMove)
    canvas.removeEventListener('pointerup', endPinchPointer)
    canvas.removeEventListener('pointercancel', endPinchPointer)
  }
}
