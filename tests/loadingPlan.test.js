import { describe, expect, it, vi } from 'vitest'
import { getLoadPhase, scheduleLoadByPhase } from '../src/perf/loadingPlan.js'

describe('loading plan phases', () => {
  it('classifies critical labels', () => {
    expect(getLoadPhase('Barn')).toBe('critical')
    expect(getLoadPhase('Pond')).toBe('critical')
  })

  it('classifies important labels', () => {
    expect(getLoadPhase('Fence')).toBe('important')
    expect(getLoadPhase('Mailbox')).toBe('important')
  })

  it('classifies ambient labels', () => {
    expect(getLoadPhase('Tree E1')).toBe('ambient')
  })

  it('runs critical tasks immediately', () => {
    const fn = vi.fn()
    scheduleLoadByPhase('critical', fn)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
