import { describe, expect, it } from 'vitest'
import { getLatestPerfSnapshot, recordFrameTime, recordModelLoad } from '../src/perf/metrics.js'

describe('perf metrics snapshot', () => {
  it('captures frame and model metrics', () => {
    for (let i = 0; i < 80; i += 1) {
      recordFrameTime(8 + (i % 5))
    }
    recordModelLoad('Barn', '/models/barn.glb', 42)
    const snapshot = getLatestPerfSnapshot()

    expect(snapshot.frameCount).toBeGreaterThan(0)
    expect(snapshot.p95).toBeGreaterThan(0)
    expect(snapshot.lastModelLoads.length).toBeGreaterThan(0)
  })
})
