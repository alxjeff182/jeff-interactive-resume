import * as THREE from 'three'
import {
  CAM_ISO_DISTANCE_MAX,
  CAM_ISO_DISTANCE_MIN,
  CAM_ISO_ZOOM_MIN_COARSE_POINTER,
} from '../constants.js'
import { getMessages } from '../i18n/locale.js'
import { state } from '../state.js'
import { showAppToast } from '../ui/toast.js'
import { log } from '../core/logger.js'

function orthoZoomLimits() {
  const coarse =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(pointer: coarse)').matches
  const min = coarse
    ? Math.max(CAM_ISO_DISTANCE_MIN, CAM_ISO_ZOOM_MIN_COARSE_POINTER)
    : CAM_ISO_DISTANCE_MIN
  return { min, max: CAM_ISO_DISTANCE_MAX }
}

/** Zoom in/out (wheel, pinch, ± buttons share this). */
export function applyCameraZoomFactor(factor) {
  const { min, max } = orthoZoomLimits()
  const next = THREE.MathUtils.clamp(state.cameraControl.zoom * factor, min, max)
  setCameraZoom(next)
}

/** Absolute orthographic zoom (clamped). */
export function setCameraZoom(distance) {
  const { min, max } = orthoZoomLimits()
  const next = THREE.MathUtils.clamp(distance, min, max)
  if (Math.abs(next - state.cameraControl.zoom) < 1e-5) return

  state.cameraControl.zoom = next
  // Backward-compat for modules not migrated yet.
  state.cameraControl.distance = next
  state.render.lastZoomChangeAt = performance.now()

  const camera = state.camera
  if (camera) {
    camera.zoom = next
    camera.updateProjectionMatrix()
  }
}

/** Backward-compatible alias. Prefer setCameraZoom(). */
export const setCameraZoomDistance = setCameraZoom

/** Same as the <kbd>F</kbd> shortcut (also used by the mobile photo button). */
export function togglePhotoMode() {
  if (state.cv.focusLabel) return
  document.body.classList.toggle('photo-mode')
  const on = document.body.classList.contains('photo-mode')
  const m = getMessages().toast
  showAppToast(on ? m.photoOn : m.photoOff)
}

/** @param {HTMLCanvasElement} canvas */
export function setupKeyboardInput(canvas) {
  void canvas

  const isMoveKey = (k) =>
    k === 'w' || k === 'W' || k === 'a' || k === 'A' ||
    k === 's' || k === 'S' || k === 'd' || k === 'D' ||
    k === 'ArrowUp' || k === 'ArrowDown' || k === 'ArrowLeft' || k === 'ArrowRight'

  const toTapKey = (key) => {
    if (key === 'w' || key === 'W') return 'up'
    if (key === 's' || key === 'S') return 'down'
    if (key === 'a' || key === 'A') return 'left'
    if (key === 'd' || key === 'D') return 'right'
    if (key === 'ArrowUp') return 'up'
    if (key === 'ArrowDown') return 'down'
    if (key === 'ArrowLeft') return 'left'
    if (key === 'ArrowRight') return 'right'
    return key.toLowerCase()
  }

  const setKey = (key, isDown) => {
    switch (key) {
      case 'w':
      case 'W':
      case 'ArrowUp':
        state.keys.up = isDown
        return true
      case 's':
      case 'S':
      case 'ArrowDown':
        state.keys.down = isDown
        return true
      case 'a':
      case 'A':
      case 'ArrowLeft':
        state.keys.left = isDown
        return true
      case 'd':
      case 'D':
      case 'ArrowRight':
        state.keys.right = isDown
        return true
      default:
        return false
    }
  }

  const onKeydown = (e) => {
    if (e.key === 'f' || e.key === 'F') {
      if (e.repeat) return
      togglePhotoMode()
      return
    }

    if (e.repeat) return

    const handled = setKey(e.key, true)
    if (handled && e.key.startsWith('Arrow')) e.preventDefault()

    if (handled && isMoveKey(e.key)) {
      const now = performance.now()
      const tapKey = toTapKey(e.key)
      const prev = state.input.lastTapMs[tapKey] ?? 0
      const doubleTapWindowMs = 320
      if (now - prev > 0 && now - prev < doubleTapWindowMs) {
        state.input.runUntilMs = now + 1500
      }
      state.input.lastTapMs[tapKey] = now
    }

    if (/^[1-9]$/.test(e.key) && state.characterMixer) {
      const idx = Number(e.key) - 1
      const names = Object.keys(state.clipActionsByName)
      const pick = names[idx]
      if (pick) {
        Object.values(state.clipActionsByName).forEach((a) => a.stop())
        const a = state.clipActionsByName[pick]
        a.reset().setLoop(THREE.LoopRepeat, Infinity).play()
        state.characterMixer.update(0)
        log('input', 'Manual clip select', pick)
      }
    }
  }

  const onKeyup = (e) => {
    const handled = setKey(e.key, false)
    if (handled && e.key.startsWith('Arrow')) e.preventDefault()
  }
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('keyup', onKeyup)
  return () => {
    window.removeEventListener('keydown', onKeydown)
    window.removeEventListener('keyup', onKeyup)
  }
}

/** @param {HTMLCanvasElement} targetCanvas */
export function setupMouseCameraControls(targetCanvas) {
  const onWheel = (e) => {
    e.preventDefault()
    const factor = e.deltaY > 0 ? 0.9 : 1.1
    applyCameraZoomFactor(factor)
  }
  targetCanvas.addEventListener(
    'wheel',
    onWheel,
    { passive: false },
  )
  return () => {
    targetCanvas.removeEventListener('wheel', onWheel)
  }
}
