import * as THREE from 'three'
import {
  CLIP_NAME_RUNNING,
  CLIP_NAME_WALKING,
  ENV_SCALE,
} from '../constants.js'
import { addStaticCollider, intersectsAnyStatic } from '../collision.js'
import { disposeObject3D } from '../dispose.js'
import { normalizeAnimName, setIdlePose } from '../game/animations.js'
import { faceToward } from '../game/orient.js'
import { applyStartupLayout, STARTUP_LAYOUT_BY_NAME } from '../layoutStorage.js'
import { state } from '../state.js'
import { getMessages } from '../i18n/locale.js'
import { beginCriticalLoad, endCriticalLoad, setLoadingStage, showLoadError } from '../ui/loading.js'
import { error, log, warn } from '../core/logger.js'
import { AssetManager } from '../assets/AssetManager.js'
import { getLoadPhase, scheduleLoadByPhase } from '../perf/loadingPlan.js'
import { STATIC_MODEL_ENTRIES } from '../config/buildings.config.js'
import { attachPondMarker } from '../world/pondMarker.js'
import { WorldManager } from '../world/WorldManager.js'
import { recordModelLoad } from '../perf/metrics.js'

const MODEL_SOURCE_POLICY = /** @type {'optimized' | 'original'} */ (
  import.meta.env.VITE_MODEL_SOURCE_POLICY === 'original' ? 'original' : 'optimized'
)

// ─── MODEL REGISTRY ──────────────────────────────────────────────────────────
const MODEL_REGISTRY = {
  Farmhouse: { url: '/models/farmhouse.glb', targetWidth: 6, scaleMul: 1, opts: {} },
  Barn: {
    url: '/models/barn.glb',
    targetWidth: 8,
    scaleMul: 1,
    opts: {
      colliderName: 'Barn',
      colliderUseFootprint: true,
      colliderFootprintHalfX: 3.02,
      colliderFootprintHalfZ: 1.82,
      colliderFootprintOffsetX: -0.12,
      colliderFootprintOffsetZ: 0.18,
      colliderFootprintYawOffset: 0,
      colliderSafetyAabbPadding: 0,
      colliderSafetyUseFootprint: false,
      colliderSafetyFootprintExpand: 0.08,
      extraAabbs: [
        {
          // Small door blocker (purple AABB) only at front door.
          halfX: 0.34,
          halfY: 0.92,
          halfZ: 0.14,
          offsetX: -1.08,
          offsetY: 0.92,
          offsetZ: 1.62,
          worldSpace: true,
        },
      ],
    },
  },
  Coop: {
    url: '/models/coop.glb',
    targetWidth: 5,
    scaleMul: 1,
    opts: {
      colliderUseFootprint: true,
      colliderFootprintHalfX: 1.35,
      colliderFootprintHalfZ: 0.95,
      colliderFootprintOffsetZ: -0.55,
      colliderFootprintYawOffset: -0.72,
      colliderSafetyAabbPadding: 0.12,
    },
  },
  'Shipping bin': { url: '/models/shipping_bin.glb', targetWidth: 2.8, scaleMul: 0.4, opts: {} },
  Well: { url: '/models/well.glb', targetWidth: 2.5, scaleMul: 0.75, opts: {} },
  University: {
    url: '/models/university.glb',
    targetWidth: 7,
    scaleMul: 1,
    opts: {
      colliderUseFootprint: true,
      colliderFootprintHalfX: 2.9,
      colliderFootprintHalfZ: 2.1,
      colliderFootprintOffsetZ: -0.15,
      colliderSafetyAabbPadding: 0.14,
    },
  },
  Pond: { url: '/models/pond.glb', targetWidth: 4, scaleMul: 1, opts: {} },
  Fence: { url: '/models/props/fence.glb', targetWidth: 10, scaleMul: 0.25, opts: {} },
  Mailbox: { url: '/models/props/mailbox.glb', targetWidth: 1.2, scaleMul: 0.5, opts: {} },
  Stump: { url: '/models/props/whorlstump.glb', targetWidth: 2.5, scaleMul: 0.5, opts: {} },
  'Tree E1': { url: '/models/props/emerald_canopy_1.glb', targetWidth: 4.0, scaleMul: 0.5, opts: {} },
  'Tree E2': { url: '/models/props/emerald_canopy_2.glb', targetWidth: 4.0, scaleMul: 0.5, opts: {} },
  'Tree E3': { url: '/models/props/emerald_canopy_1.glb', targetWidth: 4.0, scaleMul: 0.5, opts: {} },
  'Tree E4': { url: '/models/props/emerald_canopy_2.glb', targetWidth: 4.0, scaleMul: 0.5, opts: {} },
  'Pine NW1': { url: '/models/props/midnight_evergreen.glb', targetWidth: 3.5, scaleMul: 0.5, opts: {} },
  'Pine NW2': { url: '/models/props/midnight_evergreen.glb', targetWidth: 3.5, scaleMul: 0.5, opts: {} },
  Topiary: { url: '/models/props/topiary_star.glb', targetWidth: 2.2, scaleMul: 0.5, opts: {} },
  Weeds: { url: '/models/props/weeds.glb', targetWidth: 1.8, scaleMul: 0.5, opts: { collidable: false } },
  'Tall Grass': { url: '/models/props/tall_grass.glb', targetWidth: 2.0, scaleMul: 0.5, opts: { collidable: false } },
  'Wild Grass': { url: '/models/props/wild_grass_patch.glb', targetWidth: 2.2, scaleMul: 0.5, opts: { collidable: false } },
  'Rocks A': { url: '/models/props/small_rocks.glb', targetWidth: 2.0, scaleMul: 0.5, opts: { collidable: false } },
  'Rocks B': { url: '/models/props/small_rocks.glb', targetWidth: 2.0, scaleMul: 0.5, opts: { collidable: false } },
  'Corn 1': { url: '/models/props/corn.glb', targetWidth: 1.8, scaleMul: 0.5, opts: {} },
  'Corn 2': { url: '/models/props/corn.glb', targetWidth: 1.8, scaleMul: 0.5, opts: {} },
  'Corn 3': { url: '/models/props/corn.glb', targetWidth: 1.8, scaleMul: 0.5, opts: {} },
  'Tomato 1': { url: '/models/props/tomato_tree.glb', targetWidth: 2.0, scaleMul: 0.5, opts: {} },
  'Tomato 2': { url: '/models/props/tomato_tree.glb', targetWidth: 2.0, scaleMul: 0.5, opts: {} },
  'Tomato 3': { url: '/models/props/tomato_tree.glb', targetWidth: 2.0, scaleMul: 0.5, opts: {} },
  'Blueberry 1': { url: '/models/props/blueberry.glb', targetWidth: 1.6, scaleMul: 0.5, opts: {} },
  'Blueberry 2': { url: '/models/props/blueberry.glb', targetWidth: 1.6, scaleMul: 0.5, opts: {} },
  'Sunflower 1': { url: '/models/props/sunflower.glb', targetWidth: 1.6, scaleMul: 0.5, opts: {} },
  'Sunflower 2': { url: '/models/props/sunflower.glb', targetWidth: 1.6, scaleMul: 0.5, opts: {} },
  'Pumpkin 1': { url: '/models/props/pumpkin_pink.glb', targetWidth: 1.6, scaleMul: 0.5, opts: {} },
  'Pumpkin 2': { url: '/models/props/pumpkin_pink.glb', targetWidth: 1.6, scaleMul: 0.5, opts: {} },
}

const RUNTIME_LOAD_OVERRIDES = {
  Barn: { faceTowardOrigin: true },
  Coop: { faceTowardOrigin: true, name: 'Employment', colliderName: 'Employment' },
  'Shipping bin': { faceTowardOrigin: true },
  Well: { faceTowardOrigin: true },
  University: { faceTowardOrigin: true, name: 'Education', colliderName: 'Education' },
}

function getBaseLabel(label) {
  return label.replace(/(_copy\d*)+$/i, '').trim()
}

function loadExtraLayoutModels(loadStatic) {
  for (const [label] of STARTUP_LAYOUT_BY_NAME) {
    if (MODEL_REGISTRY[label]) continue

    const baseLabel = getBaseLabel(label)
    const config = MODEL_REGISTRY[baseLabel]
    if (!config) {
      warn('layout', `Cannot restore clone "${label}" — no base model "${baseLabel}" in registry`)
      continue
    }
    log('layout', `Restoring clone "${label}" from ${config.url}`)
    loadStatic(config.url, label, new THREE.Vector3(0, 0, 0), config.targetWidth, config.scaleMul, config.opts)
  }
}

export function removeCharacter() {
  if (state.characterMixer && state.characterModel) {
    state.characterMixer.stopAllAction()
    state.characterMixer.uncacheRoot(state.characterModel)
  }
  const scene = state.scene
  if (scene && state.character) {
    scene.remove(state.character)
    disposeObject3D(state.character)
  }
  state.character = null
  state.characterModel = null
  state.characterMixer = null
  state.clipActionsByName = {}
  state.characterActions = {}
  state.currentActionName = null
}

/** @param {THREE.Scene} scene */
export function loadModels(scene) {
  beginCriticalLoad()
  setLoadingStage(getMessages().loading.farmhouse)
  const assetManager = new AssetManager()
  assetManager.detectSupport(state.renderer)
  const world = new WorldManager(scene)

  const loadByUrl = (url, onSuccess, onError, options = {}) => {
    const preferOptimized = options.preferOptimized !== false
    const wantsOptimized = preferOptimized && MODEL_SOURCE_POLICY === 'optimized'
    const optimizedUrl = url.startsWith('/models/')
      ? url.replace('/models/', '/models-optimized/')
      : url
    const candidate = wantsOptimized ? optimizedUrl : url
    const startAt = performance.now()

    assetManager
      .loadGltf(candidate)
      .then((gltf) => {
        recordModelLoad(gltf?.scene?.name || 'model', candidate, performance.now() - startAt)
        onSuccess(gltf)
      })
      .catch((err) => {
        if (wantsOptimized && candidate !== url) {
          // Fallback once to original source to avoid hard failure on missing optimized assets.
          warn('models', `Fallback to original source for ${url}`)
          assetManager
            .loadGltf(url)
            .then((gltf) => {
              recordModelLoad(gltf?.scene?.name || 'model', url, performance.now() - startAt)
              onSuccess(gltf)
            })
            .catch(onError)
          return
        }
        onError(err)
      })
  }

  const loadStatic = (url, label, position, targetWidth, scaleMul = 1, opts = {}) => {
    if (STARTUP_LAYOUT_BY_NAME.size > 0 && !STARTUP_LAYOUT_BY_NAME.has(label)) {
      log('layout', `skip "${label}" — not in saved layout`)
      return
    }
    const startLoad = () => loadByUrl(
      url,
      (gltf) => {
        const obj = gltf.scene
        if (opts.name) obj.name = opts.name
        obj.userData.editorLabel = label
        obj.userData.isSolid = opts.collidable !== false
        obj.position.copy(position)

        const box = new THREE.Box3().setFromObject(obj)
        obj.position.y -= box.min.y

        const size = box.getSize(new THREE.Vector3())
        const s = (targetWidth / Math.max(size.x, 0.0001)) * scaleMul * ENV_SCALE
        if (Number.isFinite(s) && s > 0) obj.scale.setScalar(s)

        const box2 = new THREE.Box3().setFromObject(obj)
        obj.position.y -= box2.min.y

        obj.traverse((child) => {
          if (child && child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })

        if (opts.faceTowardOrigin) faceToward(obj, new THREE.Vector3(0, 0, 0), opts.extraYaw ?? 0)
        if (typeof opts.rotationY === 'number') obj.rotation.y = opts.rotationY

        applyStartupLayout(obj, label)

        world.addEditable(obj)
        if (label === 'Pond') {
          state.pondMarker = attachPondMarker(obj)
        }
        log('models', `${label} loaded`)

        if (obj.userData.isSolid) {
          addStaticCollider(opts.colliderName || label, obj, {
            padding: opts.colliderPadding ?? 0.05,
            insetX: opts.colliderInsetX ?? 0,
            insetY: opts.colliderInsetY ?? 0,
            insetZ: opts.colliderInsetZ ?? 0,
            useFootprint: opts.colliderUseFootprint ?? false,
            footprintHalfX: opts.colliderFootprintHalfX ?? null,
            footprintHalfZ: opts.colliderFootprintHalfZ ?? null,
            footprintOffsetX: opts.colliderFootprintOffsetX ?? 0,
            footprintOffsetZ: opts.colliderFootprintOffsetZ ?? 0,
            footprintYawOffset: opts.colliderFootprintYawOffset ?? 0,
          })
          if (Array.isArray(opts.extraFootprints)) {
            opts.extraFootprints.forEach((fp, idx) => {
              addStaticCollider(`${opts.colliderName || label}:part:${idx + 1}`, obj, {
                useFootprint: true,
                footprintHalfX: fp.halfX ?? null,
                footprintHalfZ: fp.halfZ ?? null,
                footprintOffsetX: fp.offsetX ?? 0,
                footprintOffsetZ: fp.offsetZ ?? 0,
                footprintYawOffset: fp.yawOffset ?? 0,
              })
            })
          }
          if (Array.isArray(opts.extraAabbs)) {
            opts.extraAabbs.forEach((box, idx) => {
              const blocker = new THREE.Mesh(
                new THREE.BoxGeometry(
                  Math.max((box.halfX ?? 0.3) * 2, 0.05),
                  Math.max((box.halfY ?? 0.8) * 2, 0.05),
                  Math.max((box.halfZ ?? 0.2) * 2, 0.05),
                ),
                new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
              )
              blocker.name = `${opts.colliderName || label}:aabb-blocker:${idx + 1}`
              const localPos = new THREE.Vector3(
                box.offsetX ?? 0,
                box.offsetY ?? (box.halfY ?? 0.8),
                box.offsetZ ?? 0,
              )
              if (box.worldSpace) {
                blocker.position.copy(obj.localToWorld(localPos))
                scene.add(blocker)
              } else {
                blocker.position.copy(localPos)
                obj.add(blocker)
              }
              blocker.userData.editorLabel = blocker.name
              blocker.userData.isSolid = false
              addStaticCollider(blocker.name, blocker, {
                useFootprint: false,
                padding: 0,
              })
            })
          }
          if (opts.colliderSafetyUseFootprint && (opts.colliderUseFootprint ?? false)) {
            addStaticCollider(`${opts.colliderName || label}:safety`, obj, {
              useFootprint: true,
              footprintHalfX: (opts.colliderFootprintHalfX ?? null) == null
                ? null
                : (opts.colliderFootprintHalfX + (opts.colliderSafetyFootprintExpand ?? 0.12)),
              footprintHalfZ: (opts.colliderFootprintHalfZ ?? null) == null
                ? null
                : (opts.colliderFootprintHalfZ + (opts.colliderSafetyFootprintExpand ?? 0.12)),
              footprintOffsetX: opts.colliderFootprintOffsetX ?? 0,
              footprintOffsetZ: opts.colliderFootprintOffsetZ ?? 0,
              footprintYawOffset: opts.colliderFootprintYawOffset ?? 0,
            })
          } else if (typeof opts.colliderSafetyAabbPadding === 'number' && opts.colliderSafetyAabbPadding > 0) {
            addStaticCollider(`${opts.colliderName || label}:safety`, obj, {
              padding: opts.colliderSafetyAabbPadding,
              useFootprint: false,
            })
          }
        }
      },
      (err) => {
        error('models', `Failed to load ${url}`, err)
        showLoadError(`Missing asset: ${url}`, err instanceof Error ? err : null)
      },
      // Try optimized GLBs for all phases (large bandwidth win). Fallback to original on failure.
      { preferOptimized: MODEL_SOURCE_POLICY === 'optimized' },
    )
    const phase = getLoadPhase(label)
    scheduleLoadByPhase(phase, startLoad)
  }

  loadByUrl(
    '/models/farmhouse.glb',
    (gltf) => {
      const model = gltf.scene
      setLoadingStage(getMessages().loading.buildings)
      log('models', 'Farmhouse scene loaded')
      model.userData.editorLabel = 'Farmhouse'
      model.userData.isSolid = true

      model.position.set(0, 0, 0)

      const box = new THREE.Box3().setFromObject(model)
      model.position.y -= box.min.y

      const size = box.getSize(new THREE.Vector3())
      const targetWidth = 6
      const s = (targetWidth / Math.max(size.x, 0.0001)) * ENV_SCALE
      if (Number.isFinite(s) && s > 0) model.scale.setScalar(s)

      const box2 = new THREE.Box3().setFromObject(model)
      model.position.y -= box2.min.y

      model.traverse((obj) => {
        if (obj && obj.isMesh) {
          obj.castShadow = true
          obj.receiveShadow = true
        }
      })

      applyStartupLayout(model, 'Farmhouse')

      world.addClickable(model)
      state.farmhouse = model

      model.updateMatrixWorld(true)
      state.farmhouseBox = new THREE.Box3().setFromObject(model)
      // Use a tighter ground footprint so player can stand closer to walls.
      addStaticCollider('Farmhouse', model, {
        useFootprint: true,
        footprintHalfX: 2.9,
        footprintHalfZ: 2.3,
        footprintOffsetZ: -0.25,
      })
      addStaticCollider('Farmhouse:safety', model, {
        padding: 0.14,
      })

      for (const [label, position] of STATIC_MODEL_ENTRIES) {
        const config = MODEL_REGISTRY[label]
        if (!config) continue
        loadStatic(config.url, label, position, config.targetWidth, config.scaleMul, {
          ...config.opts,
          ...(RUNTIME_LOAD_OVERRIDES[label] || {}),
        })
      }

      loadExtraLayoutModels(loadStatic)

      loadByUrl(
        '/models/player.glb',
        (gltf2) => {
          setLoadingStage(getMessages().loading.character)
          removeCharacter()

          const charModel = gltf2.scene
          const playerRoot = new THREE.Group()
          playerRoot.name = 'PlayerRoot'
          playerRoot.add(charModel)

          // Spawn in front of the farmhouse (near the mailbox), a little
          // outside its collider so the character doesn't start stuck.
          let spawnX = 6
          let spawnZ = 6
          if (state.farmhouseBox) {
            const b = state.farmhouseBox
            spawnX = (b.min.x + b.max.x) * 0.5
            // Front of the house is +Z; push slightly forward from the porch.
            spawnZ = b.max.z + 1.0
          }
          playerRoot.position.set(spawnX, 0, spawnZ)

          const cBox = new THREE.Box3().setFromObject(charModel)
          charModel.position.y -= cBox.min.y

          const cSize = cBox.getSize(new THREE.Vector3())
          const desiredHeight = 1.6
          const cs = desiredHeight / Math.max(cSize.y, 0.0001)
          if (Number.isFinite(cs) && cs > 0) charModel.scale.setScalar(cs)

          const cBox2 = new THREE.Box3().setFromObject(charModel)
          charModel.position.y -= cBox2.min.y

          const cBox3 = new THREE.Box3().setFromObject(charModel)
          const cCenter = cBox3.getCenter(new THREE.Vector3())
          charModel.position.x -= cCenter.x
          charModel.position.z -= cCenter.z

          charModel.traverse((obj) => {
            if (obj && obj.isMesh) {
              obj.castShadow = true
              obj.receiveShadow = true
            }
          })

          scene.add(playerRoot)
          state.character = playerRoot
          state.characterModel = charModel

          // If we accidentally spawned overlapping any static collider (due to
          // layout tweaks), nudge the player forward until clear so they never
          // start stuck inside geometry.
          {
            let guard = 0
            while (intersectsAnyStatic(playerRoot) && guard < 48) {
              playerRoot.position.z += 0.2
              guard += 1
            }
          }

          if (gltf2.animations && gltf2.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(charModel)
            mixer.timeScale = 1
            state.characterMixer = mixer

            const clips = gltf2.animations
            const all = /** @type {Record<string, THREE.AnimationAction>} */ ({})
            clips.forEach((clip) => {
              const key = normalizeAnimName(clip.name)
              all[key] = mixer.clipAction(clip)
            })
            state.clipActionsByName = all

            const walkClip = clips.find((clip) => clip.name === CLIP_NAME_WALKING) || null
            const runClip = clips.find((clip) => clip.name === CLIP_NAME_RUNNING) || null

            if (!walkClip || !runClip) {
              warn(
                'models',
                `Missing expected clips. walk="${CLIP_NAME_WALKING}" run="${CLIP_NAME_RUNNING}"`,
              )
            }

            const actions = /** @type {Record<string, THREE.AnimationAction>} */ ({})
            actions.walking = mixer.clipAction(walkClip || clips[0])
            actions.running = mixer.clipAction(runClip || walkClip || clips[0])
            state.characterActions = actions

            mixer.stopAllAction()
            state.currentActionName = null
            setIdlePose()
          } else {
            warn('models', 'No animations found in GLB')
          }

          setLoadingStage(getMessages().loading.finalizing)
          endCriticalLoad()
        },
        (err2) => {
          error('models', 'Failed to load /models/player.glb', err2)
          showLoadError('Player model failed to load.', err2 instanceof Error ? err2 : null)
          endCriticalLoad()
        },
        { preferOptimized: MODEL_SOURCE_POLICY === 'optimized' },
      )
    },
    (err) => {
      error('models', 'Failed to load /models/farmhouse.glb', err)
      showLoadError('Farm scene could not start (farmhouse model missing).', err instanceof Error ? err : null)
      endCriticalLoad()
    },
  )
}
