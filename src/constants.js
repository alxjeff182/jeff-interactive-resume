import * as THREE from 'three'

/** @type {import('three').Vector3} */
export const _yAxis = new THREE.Vector3(0, 1, 0)
export const _targetQuat = new THREE.Quaternion()
export const CHARACTER_YAW_OFFSET = Math.PI

export const CAM_ISO_OFFSET_DIR = new THREE.Vector3(1, 1, 1).normalize()

export const CAM_BASE_HALF = 14
export const CAM_ISO_ZOOM_DEFAULT = 2.5
export const CAM_ISO_ZOOM_MIN = 0.5
export const CAM_ISO_ZOOM_MAX = 2.5

/**
 * Floor ortho zoom on coarse pointers (touch). Lower zoom = wider view = much
 * heavier fill on mobile GPUs; desktop keeps {@link CAM_ISO_ZOOM_MIN}.
 */
export const CAM_ISO_ZOOM_MIN_COARSE_POINTER = 1.0

// Backward-compat aliases. Prefer *_ZOOM_* names for new code.
export const CAM_ISO_DISTANCE_DEFAULT = CAM_ISO_ZOOM_DEFAULT
export const CAM_ISO_DISTANCE_MIN = CAM_ISO_ZOOM_MIN
export const CAM_ISO_DISTANCE_MAX = CAM_ISO_ZOOM_MAX

export const _camDesired = new THREE.Vector3()
export const _camLook = new THREE.Vector3()
export const _camOffset = new THREE.Vector3()

export const ENV_SCALE = 1

// Keep defaults aligned to current model clips; names now reflect intent.
export const CLIP_NAME_WALKING = 'Running'
export const CLIP_NAME_RUNNING = 'Walk_Backward_inplace'

// Slightly larger radius so character body does not visually clip through walls.
export const PLAYER_COLLIDER_HALF = 0.5

/**
 * Grass field — tight axis-aligned box around `default-farm-layout.json` anchor XY:
 * X ∈ [-12, 21], Z ∈ [-24, 3], plus **small** edge inset (~2.5m) for scaled meshes only.
 * Extra margin on −X so University (layout anchor ~−12) sits on grass, not the sky edge.
 */
export const GROUND_FIELD_CENTER_X = 3
export const GROUND_FIELD_CENTER_Z = -10.5
export const GROUND_FIELD_HALF_EXTENT_X = 20.5
export const GROUND_FIELD_HALF_EXTENT_Z = 16

export const ISO_ARM = 40

export const LAYOUT_SCHEMA_VERSION = 3
export const FARM_LAYOUT_STORAGE_KEY = 'farmLayout_v3'
export const FARM_LAYOUT_LEGACY_KEYS = ['farmLayout', 'farmLayout_v2']
