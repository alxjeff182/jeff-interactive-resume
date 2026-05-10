const LOG_ENABLED = Boolean(import.meta.env?.DEV)

export function log(scope, ...args) {
  if (!LOG_ENABLED) return
  console.warn(`[${scope}]`, ...args)
}

export function warn(scope, ...args) {
  console.warn(`[${scope}]`, ...args)
}

export function error(scope, ...args) {
  console.error(`[${scope}]`, ...args)
}
