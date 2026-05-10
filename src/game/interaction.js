import * as THREE from 'three'
import { getMessages } from '../i18n/locale.js'
import { getResumeData } from '../resumeData.js'
import { state } from '../state.js'
import {
  cvClosePanel,
  cvHighlightOff,
  cvOpenPanel,
} from '../ui/cvPanel.js'
import { pickEditable } from '../interaction/InteractionSystem.js'
import { showAppToast } from '../ui/toast.js'

const _nearestPos = new THREE.Vector3()
const _playerPos = new THREE.Vector3()
const _rootPos = new THREE.Vector3()
const mobileGlowOriginalByMat = new WeakMap()
const MOBILE_GLOW_DIST_SQ = 8 * 8

function getNearestInteractable() {
  const player = state.character
  if (!player || !state.editables.length) return { root: null, distSq: Infinity }
  player.getWorldPosition(_playerPos)
  let nearestRoot = null
  let nearestDistSq = Infinity

  state.editables.forEach((root) => {
    const label = root?.userData?.editorLabel
    if (!label || !Object.hasOwn(getResumeData(state.locale), label)) return
    root.getWorldPosition(_rootPos)
    const distSq = _rootPos.distanceToSquared(_playerPos)
    if (distSq < nearestDistSq) {
      nearestDistSq = distSq
      nearestRoot = root
    }
  })

  return { root: nearestRoot, distSq: nearestDistSq }
}

export function canInteractNearestBuilding() {
  const { root, distSq } = getNearestInteractable()
  return Boolean(root && distSq <= MOBILE_GLOW_DIST_SQ)
}

function applyMobileInteractableGlow(root, label) {
  const resume = getResumeData(state.locale)
  const accent = resume[/** @type {keyof typeof resume} */ (label)]?.accent || '#00ffcc'
  root.traverse((child) => {
    if (!child?.isMesh) return
    const mats = Array.isArray(child.material) ? child.material : [child.material]
    mats.forEach((mat) => {
      if (!mat || !('emissive' in mat)) return
      if (!mobileGlowOriginalByMat.has(mat)) {
        mobileGlowOriginalByMat.set(mat, {
          color: mat.emissive.clone(),
          intensity: mat.emissiveIntensity ?? 0,
        })
      }
      // Match desktop highlight style: per-building accent and stronger emissive cue.
      mat.emissive.set(accent)
      mat.emissiveIntensity = Math.max(mat.emissiveIntensity ?? 0, 0.45)
    })
  })
}

function clearMobileInteractableGlow(root) {
  root.traverse((child) => {
    if (!child?.isMesh) return
    const mats = Array.isArray(child.material) ? child.material : [child.material]
    mats.forEach((mat) => {
      if (!mat || !('emissive' in mat)) return
      const saved = mobileGlowOriginalByMat.get(mat)
      if (!saved) return
      mat.emissive.copy(saved.color)
      mat.emissiveIntensity = saved.intensity
      mobileGlowOriginalByMat.delete(mat)
    })
  })
}

/**
 * @param {HTMLCanvasElement} targetCanvas
 * @param {number} clientX
 * @param {number} clientY
 */
function doBuildingPick(targetCanvas, clientX, clientY) {
  const root = pickEditable(clientX, clientY)
  if (!root) {
    if (state.cv.focusLabel) cvClosePanel()
    return
  }

  const label = root.userData.editorLabel
  if (label && Object.hasOwn(getResumeData(state.locale), label)) {
    cvHighlightOff(state.cv.hovered)
    state.cv.hovered = null
    targetCanvas.style.cursor = ''
    cvOpenPanel(label, root)
  } else if (state.cv.focusLabel) {
    cvClosePanel()
  }
}

/**
 * @param {HTMLCanvasElement} targetCanvas
 */
export function triggerNearestBuildingInteraction(targetCanvas) {
  const { root: nearest, distSq: nearestDistSq } = getNearestInteractable()

  if (!nearest) return false
  const maxInteractDistSq = 7 * 7
  if (nearestDistSq > maxInteractDistSq) {
    showAppToast(getMessages().toast.moveCloser)
    return false
  }

  const label = nearest.userData.editorLabel
  cvHighlightOff(state.cv.hovered)
  state.cv.hovered = null
  targetCanvas.style.cursor = ''
  cvOpenPanel(label, nearest)
  return true
}

/** @param {HTMLCanvasElement} targetCanvas */
export function setupInteraction(targetCanvas) {
  let multitouchSeen = false
  /** @type {{ x: number; y: number; pointerId: number } | null} */
  let touchPickCandidate = null
  const isTouchUi = window.matchMedia('(pointer: coarse)').matches
  const glowedRoots = new Set()
  let glowTimer = /** @type {number | null} */ (null)

  const syncMobileGlow = () => {
    if (!isTouchUi) return
    const { root: nearestRoot, distSq: nearestDistSq } = getNearestInteractable()
    if (!nearestRoot) {
      glowedRoots.forEach((root) => clearMobileInteractableGlow(root))
      glowedRoots.clear()
      return
    }

    const shouldGlow = nearestRoot && nearestDistSq <= MOBILE_GLOW_DIST_SQ

    state.editables.forEach((root) => {
      const label = root?.userData?.editorLabel
      if (!label || !Object.hasOwn(getResumeData(state.locale), label)) return
      const inRange = shouldGlow && root === nearestRoot
      if (inRange && !glowedRoots.has(root)) {
        applyMobileInteractableGlow(root, label)
        glowedRoots.add(root)
      } else if (!inRange && glowedRoots.has(root)) {
        clearMobileInteractableGlow(root)
        glowedRoots.delete(root)
      }
    })
  }

  syncMobileGlow()
  if (isTouchUi) {
    glowTimer = window.setInterval(syncMobileGlow, 800)
  }

  const onPointerdown = (e) => {
    if (e.pointerType === 'touch') {
      state.touch.canvasPointerCount += 1
      if (state.touch.canvasPointerCount > 1) {
        multitouchSeen = true
        touchPickCandidate = null
      } else {
        multitouchSeen = false
        touchPickCandidate = { x: e.clientX, y: e.clientY, pointerId: e.pointerId }
      }
      return
    }

    if (e.button !== 0) return
    doBuildingPick(targetCanvas, e.clientX, e.clientY)
  }

  const onPointermove = (e) => {
    if (!touchPickCandidate || e.pointerId !== touchPickCandidate.pointerId) return
    const d = Math.hypot(e.clientX - touchPickCandidate.x, e.clientY - touchPickCandidate.y)
    if (d > 24) touchPickCandidate = null
  }

  const endTouchOnCanvas = (e) => {
    if (e.pointerType !== 'touch') return
    state.touch.canvasPointerCount = Math.max(0, state.touch.canvasPointerCount - 1)
    if (state.touch.canvasPointerCount === 0) {
      if (
        touchPickCandidate &&
        e.pointerId === touchPickCandidate.pointerId &&
        !multitouchSeen
      ) {
        doBuildingPick(targetCanvas, e.clientX, e.clientY)
      }
      touchPickCandidate = null
      multitouchSeen = false
    }
  }

  targetCanvas.addEventListener('pointerdown', onPointerdown)
  targetCanvas.addEventListener('pointermove', onPointermove)
  targetCanvas.addEventListener('pointerup', endTouchOnCanvas)
  targetCanvas.addEventListener('pointercancel', endTouchOnCanvas)
  return () => {
    if (glowTimer !== null) {
      window.clearInterval(glowTimer)
    }
    glowedRoots.forEach((root) => clearMobileInteractableGlow(root))
    glowedRoots.clear()
    targetCanvas.removeEventListener('pointerdown', onPointerdown)
    targetCanvas.removeEventListener('pointermove', onPointermove)
    targetCanvas.removeEventListener('pointerup', endTouchOnCanvas)
    targetCanvas.removeEventListener('pointercancel', endTouchOnCanvas)
  }
}
