import * as THREE from 'three'
import {
  CAM_ISO_DISTANCE_DEFAULT,
} from './constants.js'

export const state = {
  /** @type {'en' | 'id'} */
  locale: 'en',
  renderer: /** @type {THREE.WebGLRenderer | null} */ (null),
  scene: /** @type {THREE.Scene | null} */ (null),
  camera: /** @type {THREE.OrthographicCamera | null} */ (null),
  clock: new THREE.Clock(),
  raycaster: new THREE.Raycaster(),
  pointerNdc: new THREE.Vector2(),
  clickable: /** @type {THREE.Object3D[]} */ ([]),
  farmhouse: /** @type {THREE.Object3D | null} */ (null),
  farmhouseBox: /** @type {THREE.Box3 | null} */ (null),
  staticColliders: /** @type {import('./collision.js').StaticCollider[]} */ ([]),
  character: /** @type {THREE.Object3D | null} */ (null),
  characterModel: /** @type {THREE.Object3D | null} */ (null),
  characterMixer: /** @type {THREE.AnimationMixer | null} */ (null),
  clipActionsByName: /** @type {Record<string, THREE.AnimationAction>} */ ({}),
  characterActions: /** @type {Record<string, THREE.AnimationAction>} */ ({}),
  currentActionName: /** @type {string | null} */ (null),
  playerBox: new THREE.Box3(),
  _prevPos: new THREE.Vector3(),
  ground: /** @type {THREE.Mesh | null} */ (null),
  keys: { up: false, down: false, left: false, right: false },
  cameraControl: { zoom: CAM_ISO_DISTANCE_DEFAULT, distance: CAM_ISO_DISTANCE_DEFAULT, behindYaw: 0 },
  mouse: {},
  input: {
    lastTapMs: /** @type {Record<string, number>} */ ({}),
    runUntilMs: 0,
  },
  /** Virtual stick + coarse-pointer bookkeeping (see mobileControls / interaction). */
  touch: {
    stickX: 0,
    stickY: 0,
    stickActive: false,
    /** Active touch pointers on the canvas (for tap vs pinch). */
    canvasPointerCount: 0,
  },
  editables: /** @type {THREE.Object3D[]} */ ([]),
  /** Pond waypoint marker group (bob animation); child of Pond model */
  pondMarker: /** @type {THREE.Group | null} */ (null),
  cv: {
    hovered: /** @type {THREE.Object3D | null} */ (null),
    /** @type {Map<THREE.Material, { color: THREE.Color, intensity: number }>} */
    hoveredEmissive: new Map(),
    focusLabel: /** @type {string | null} */ (null),
    focusPoint: new THREE.Vector3(),
    isFocusing: false,
    /** @type {HTMLElement | null} */
    lastFocusEl: null,
    /** @type {((e: KeyboardEvent) => void) | null} */
    focusTrapHandler: null,
  },
  load: {
    criticalPending: 0,
    sceneReady: false,
  },
  render: {
    needsFrame: true,
    idleFps: 20,
    activeFps: 60,
    hiddenFps: 1,
    quality: {
      currentPixelRatio: 1,
      // Keep baseline crispness; avoid overly soft rendering on desktop.
      minPixelRatio: 1,
      maxPixelRatio: 2,
      lowFrameThresholdMs: 24,
      highFrameThresholdMs: 12,
      adjustCooldownMs: 1200,
      lastAdjustAt: 0,
    },
  },
  debug: {
    showColliders: false,
    colliderHelpers: /** @type {THREE.Object3D[]} */ ([]),
  },
}
