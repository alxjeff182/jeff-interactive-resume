import * as THREE from 'three'
import {
  _camDesired,
  _camLook,
  _camOffset,
  _targetQuat,
  _yAxis,
  CAM_BASE_HALF,
  CAM_ISO_OFFSET_DIR,
  CHARACTER_YAW_OFFSET,
  ISO_ARM,
} from '../constants.js'
import { clampPlayerToGroundField, intersectsAnyStatic } from '../collision.js'
import { state } from '../state.js'
import { setIdlePose, switchAction } from './animations.js'
import { recordFrameTime } from '../perf/metrics.js'
import { updatePondMarker } from '../world/pondMarker.js'

const _fallbackLook = new THREE.Vector3(0, 0, 0)

function lerpAngle(a, b, t) {
  let diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI
  return a + diff * t
}

/**
 * Move player with sub-stepped collision checks to avoid tunneling.
 * @param {THREE.Object3D} player
 * @param {number} moveX
 * @param {number} moveZ
 */
function movePlayerWithCollision(player, moveX, moveZ) {
  const totalDist = Math.hypot(moveX, moveZ)
  if (totalDist <= 0) return

  // Keep each step small so we do not skip thin collider boundaries on low FPS.
  const maxStepDist = 0.12
  const steps = Math.max(1, Math.ceil(totalDist / maxStepDist))
  const stepX = moveX / steps
  const stepZ = moveZ / steps

  for (let i = 0; i < steps; i += 1) {
    const prevX = player.position.x
    const prevZ = player.position.z

    player.position.x = prevX + stepX
    player.position.z = prevZ + stepZ

    if (intersectsAnyStatic(player)) {
      // Conservative response: stop on first hit to prevent seam tunneling.
      player.position.x = prevX
      player.position.z = prevZ
      break
    }
  }
}

export function resize() {
  const renderer = state.renderer
  const camera = state.camera
  if (!renderer || !camera) return
  renderer.setSize(window.innerWidth, window.innerHeight, false)

  const aspect = window.innerWidth / window.innerHeight
  camera.left = -CAM_BASE_HALF * aspect
  camera.right = CAM_BASE_HALF * aspect
  camera.top = CAM_BASE_HALF
  camera.bottom = -CAM_BASE_HALF
  camera.zoom = state.cameraControl.zoom
  camera.updateProjectionMatrix()
}

export function render() {
  const renderer = state.renderer
  const scene = state.scene
  const camera = state.camera
  if (!renderer || !scene || !camera) return

  const dt = Math.min(state.clock.getDelta(), 0.05)
  const dtMs = dt * 1000
  recordFrameTime(dtMs)
  const player = state.character

  let isActiveFrame = false

  if (player) {
    const walkSpeed = 4.0
    const runSpeed = 6.2
    const turnSharpness = 12.0

    let dx = 0
    let dz = 0
    const stickMag = Math.hypot(state.touch.stickX, state.touch.stickY)
    const stickDead = 0.06
    if (state.touch.stickActive && stickMag > stickDead) {
      // Horizontal already matches world X; invert only vertical for forward/back.
      dx = state.touch.stickX
      dz = -state.touch.stickY
    } else {
      if (state.keys.left) dx -= 1
      if (state.keys.right) dx += 1
      if (state.keys.up) dz -= 1
      if (state.keys.down) dz += 1
    }

    const len = Math.hypot(dx, dz)
    if (len > 0) {
      isActiveFrame = true
      const now = performance.now()
      const wantsRun =
        now < state.input.runUntilMs || state.input.sprintHeld
      const speed = wantsRun ? runSpeed : walkSpeed

      dx /= len
      dz /= len
      const moveX = dx * speed * dt
      const moveZ = dz * speed * dt

      movePlayerWithCollision(player, moveX, moveZ)

      const yaw = Math.atan2(-dx, -dz) + CHARACTER_YAW_OFFSET
      _targetQuat.setFromAxisAngle(_yAxis, yaw)
      const alpha = 1 - Math.exp(-turnSharpness * dt)
      player.quaternion.slerp(_targetQuat, alpha)

      const moveBehindYaw = Math.atan2(-dx, -dz)
      const alphaYaw = 1 - Math.exp(-12 * dt)
      state.cameraControl.behindYaw = lerpAngle(state.cameraControl.behindYaw, moveBehindYaw, alphaYaw)
    }

    const moving = len > 0
    if (!moving) {
      setIdlePose()
      state.input.runUntilMs = 0
    } else {
      const now = performance.now()
      const wantsRun =
        now < state.input.runUntilMs || state.input.sprintHeld
      if (wantsRun && state.characterActions.running) switchAction('running')
      else if (state.characterActions.walking) switchAction('walking')
    }

    clampPlayerToGroundField(player)
  }

  if (state.characterMixer) state.characterMixer.update(dt)
  if (state.characterMixer) isActiveFrame = true

  {
    const camFollowSharpness = 8.0
    const alphaCam = 1 - Math.exp(-camFollowSharpness * dt)

    const lookTarget = state.cv.isFocusing
      ? state.cv.focusPoint
      : (player ? player.position : _fallbackLook)

    _camOffset.copy(CAM_ISO_OFFSET_DIR).multiplyScalar(ISO_ARM)
    _camDesired.copy(lookTarget).add(_camOffset)
    camera.position.lerp(_camDesired, alphaCam)

    _camLook.copy(lookTarget)
    _camLook.y += 0.8
    camera.lookAt(_camLook)
  }

  if (state.cv.isFocusing || state.load.criticalPending > 0 || state.touch.stickActive) {
    isActiveFrame = true
  }

  const now = performance.now()
  const quality = state.render.quality
  if (now - quality.lastAdjustAt > quality.adjustCooldownMs) {
    if (dtMs > quality.lowFrameThresholdMs && quality.currentPixelRatio > quality.minPixelRatio) {
      quality.currentPixelRatio = Math.max(quality.minPixelRatio, quality.currentPixelRatio - 0.1)
      renderer.setPixelRatio(quality.currentPixelRatio)
      renderer.setSize(window.innerWidth, window.innerHeight, false)
      quality.lastAdjustAt = now
    } else if (dtMs < quality.highFrameThresholdMs && quality.currentPixelRatio < quality.maxPixelRatio) {
      quality.currentPixelRatio = Math.min(quality.maxPixelRatio, quality.currentPixelRatio + 0.05)
      renderer.setPixelRatio(quality.currentPixelRatio)
      renderer.setSize(window.innerWidth, window.innerHeight, false)
      quality.lastAdjustAt = now
    }
  }

  updatePondMarker(dt)

  state.render.needsFrame = isActiveFrame
  renderer.render(scene, camera)
  return isActiveFrame
}
