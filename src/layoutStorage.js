import defaultFarmLayoutFile from './default-farm-layout.json'
import {
  FARM_LAYOUT_LEGACY_KEYS,
  FARM_LAYOUT_STORAGE_KEY,
  LAYOUT_SCHEMA_VERSION,
} from './constants.js'

/**
 * @param {unknown} parsed
 * @returns {object[]}
 */
function normalizeToItems(parsed) {
  if (!parsed) return []
  if (Array.isArray(parsed)) return /** @type {object[]} */ (parsed)
  if (typeof parsed === 'object' && parsed !== null && 'items' in parsed) {
    const items = /** @type {{ items?: unknown }} */ (parsed).items
    if (Array.isArray(items)) return /** @type {object[]} */ (items)
  }
  return []
}

/**
 * @param {object[]} items
 * @returns {object[]}
 */
function filterValidEntries(items) {
  const finiteOrUndefined = (value) => value === undefined || (typeof value === 'number' && Number.isFinite(value))
  return items.filter((e) => {
    if (!e || typeof e.name !== 'string') return false
    const groups = ['position', 'rotation', 'scale']
    for (const key of groups) {
      const group = e[key]
      if (!group) continue
      if (!finiteOrUndefined(group.x)) return false
      if (!finiteOrUndefined(group.y)) return false
      if (!finiteOrUndefined(group.z)) return false
    }
    return true
  })
}

function readLayoutFromStorage() {
  const keysToTry = [FARM_LAYOUT_STORAGE_KEY, ...FARM_LAYOUT_LEGACY_KEYS]
  for (const key of keysToTry) {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw)
      const items = filterValidEntries(normalizeToItems(parsed))
      if (!items.length) continue

      if (key !== FARM_LAYOUT_STORAGE_KEY) {
        try {
          localStorage.setItem(
            FARM_LAYOUT_STORAGE_KEY,
            JSON.stringify({ version: LAYOUT_SCHEMA_VERSION, items }),
          )
        } catch { /* ignore quota */ }
      }
      return items
    } catch (err) {
      console.warn(`[layout] Failed to read ${key}:`, err)
    }
  }
  return []
}

function getDefaultLayoutItems() {
  return filterValidEntries(normalizeToItems(defaultFarmLayoutFile))
}

export function getStartupLayoutEntries() {
  const stored = readLayoutFromStorage()
  if (stored.length) return stored
  return getDefaultLayoutItems()
}

export const STARTUP_LAYOUT_BY_NAME = new Map(
  getStartupLayoutEntries()
    .filter((entry) => entry && typeof entry.name === 'string')
    .map((entry) => [/** @type {string} */ (entry.name), entry]),
)

/**
 * @param {import('three').Object3D | null | undefined} obj
 * @param {string} [fallbackLabel]
 */
export function applyStartupLayout(obj, fallbackLabel) {
  const label = obj?.userData?.editorLabel || obj?.name || fallbackLabel
  if (!label) return false

  const entry = STARTUP_LAYOUT_BY_NAME.get(label)
  if (!entry) return false

  if (entry.position) {
    obj.position.set(
      entry.position.x ?? obj.position.x,
      entry.position.y ?? obj.position.y,
      entry.position.z ?? obj.position.z,
    )
  }

  if (entry.rotation) {
    obj.rotation.set(
      entry.rotation.x ?? obj.rotation.x,
      entry.rotation.y ?? obj.rotation.y,
      entry.rotation.z ?? obj.rotation.z,
    )
  }

  if (entry.scale) {
    obj.scale.set(
      entry.scale.x ?? obj.scale.x,
      entry.scale.y ?? obj.scale.y,
      entry.scale.z ?? obj.scale.z,
    )
  }

  return true
}
