const CRITICAL_LABELS = new Set(['Barn', 'Coop', 'Well', 'University', 'Pond'])
const IMPORTANT_LABELS = new Set(['Shipping bin', 'Mailbox', 'Fence', 'Stump'])

const PHASE_DELAYS_MS = {
  important: 48,
  ambient: 420,
}

export function isCriticalLabel(label) {
  return CRITICAL_LABELS.has(label)
}

export function getLoadPhase(label) {
  if (CRITICAL_LABELS.has(label)) return 'critical'
  if (IMPORTANT_LABELS.has(label)) return 'important'
  return 'ambient'
}

export function scheduleNonCriticalLoad(task) {
  if (typeof window === 'undefined') {
    setTimeout(task, 0)
    return
  }

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(
      () => task(),
      { timeout: 400 },
    )
    return
  }

  setTimeout(task, 16)
}

export function scheduleLoadByPhase(phase, task) {
  if (phase === 'critical') {
    task()
    return
  }

  const run = () => scheduleNonCriticalLoad(task)
  setTimeout(run, PHASE_DELAYS_MS[phase] ?? PHASE_DELAYS_MS.ambient)
}
