import * as THREE from 'three'
import { state } from '../state.js'
import { log } from '../core/logger.js'

export function normalizeAnimName(s) {
  return String(s).trim().toLowerCase().replace(/\s+/g, ' ')
}

/** @param {import('three').AnimationClip[]} clips */
export function pickClipByName(clips, name) {
  const needle = normalizeAnimName(name)
  return clips.find((c) => normalizeAnimName(c?.name || '') === needle) || null
}

/** @param {import('three').AnimationClip[]} clips */
export function pickFirstMatchingClip(clips, pattern) {
  return clips.find((c) => pattern.test(normalizeAnimName(c?.name || ''))) || null
}

/** @param {import('three').AnimationClip[]} clips */
export function pickWalkForwardClip(clips) {
  const bad = /(back|backward|sit|doze|idle|run|clap)/
  return (
    clips.find((c) => {
      const n = normalizeAnimName(c?.name || '')
      return /\bwalk(ing)?\b/.test(n) && !bad.test(n)
    }) || null
  )
}

/** @param {string} name */
export function switchAction(name) {
  if (!state.characterMixer) return
  const next = state.characterActions[name]
  if (!next) return

  if (state.currentActionName === name) {
    next.paused = false
    next.enabled = true
    next.setEffectiveTimeScale(1)
    next.setEffectiveWeight(1)
    next.play()
    return
  }

  const prevName = state.currentActionName
  const prev = prevName ? state.characterActions[prevName] : null

  state.currentActionName = name
  log('anim', 'Switch animation ->', name, '| clip:', next.getClip()?.name)

  Object.entries(state.characterActions).forEach(([k, a]) => {
    if (k !== name) a.stop()
  })

  next.reset()
  next.paused = false
  next.enabled = true
  next.setLoop(THREE.LoopRepeat, Infinity)
  // When running/walking share the same source clip, keep run visually distinct.
  next.setEffectiveTimeScale(name === 'running' ? 1.35 : 1)
  next.setEffectiveWeight(1)
  next.fadeIn(0.2).play()
  state.characterMixer.update(0)

  if (prev && prev !== next) prev.fadeOut(0.2)
}

export function setIdlePose() {
  if (!state.characterMixer) return
  const a = state.characterActions.walking
  if (!a) return
  if (state.currentActionName !== 'walking') {
    switchAction('walking')
  }
  a.setEffectiveTimeScale(0)
  state.characterMixer.update(0)
}
