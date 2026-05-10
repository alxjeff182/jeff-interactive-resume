import { warn } from '../core/logger.js'

const frameTimes = []
const modelLoads = []
const FRAME_WINDOW_SIZE = 240
let lastFrameReportAt = 0
let reportIntervalMs = 5000

function percentile(sorted, p) {
  if (sorted.length === 0) return 0
  const index = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p))
  return sorted[index]
}

export function configurePerfTelemetry({ intervalMs = 5000 } = {}) {
  reportIntervalMs = intervalMs
}

export function recordModelLoad(label, url, elapsedMs) {
  modelLoads.push({ label, url, elapsedMs, at: performance.now() })
  if (modelLoads.length > 200) modelLoads.shift()
}

export function recordFrameTime(ms) {
  frameTimes.push(ms)
  if (frameTimes.length > FRAME_WINDOW_SIZE) frameTimes.shift()

  const now = performance.now()
  if (now - lastFrameReportAt < reportIntervalMs || frameTimes.length < 60) return

  const sorted = [...frameTimes].sort((a, b) => a - b)
  const p50 = percentile(sorted, 0.5)
  const p95 = percentile(sorted, 0.95)
  const droppedFrames = frameTimes.filter((t) => t > 24).length
  warn('perf', `frame p50=${p50.toFixed(1)}ms p95=${p95.toFixed(1)}ms dropped=${droppedFrames}/${frameTimes.length}`)
  lastFrameReportAt = now
}

export function getLatestPerfSnapshot() {
  const sorted = [...frameTimes].sort((a, b) => a - b)
  return {
    frameCount: frameTimes.length,
    p50: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    droppedFrames: frameTimes.filter((t) => t > 24).length,
    lastModelLoads: modelLoads.slice(-10),
  }
}
