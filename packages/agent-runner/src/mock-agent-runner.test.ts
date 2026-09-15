import { describe, expect, it } from 'vitest'
import { MockAgentRunner } from './mock-agent-runner'

function opts(overrides: Partial<{ playbookRunId: string; systemPrompt: string }> = {}) {
  return { playbookRunId: 'run-1', ...overrides }
}

describe('MockAgentRunner', () => {
  it('start() returns a handle with a sessionId', () => {
    const runner = new MockAgentRunner()
    const handle = runner.start(opts())
    expect(typeof handle.sessionId).toBe('string')
    expect(handle.sessionId.length).toBeGreaterThan(0)
  })

  it('delivers a scripted sequence of delta/status/cost events to subscribers in order', () => {
    const runner = new MockAgentRunner()
    const handle = runner.start(opts())
    const received: string[] = []

    handle.on('status', (status) => received.push(`status:${status}`))
    handle.on('delta', (chunk) => received.push(`delta:${chunk}`))
    handle.on('cost', (c) => received.push(`cost:${c.tokensOut}`))

    handle.emitStatus('generating')
    handle.emitDelta('hello ')
    handle.emitDelta('world')
    handle.emitCost({ tokensIn: 10, tokensOut: 5, costUsd: 0.001, contextPct: 0.1 })
    handle.emitStatus('done')

    expect(received).toEqual([
      'status:generating',
      'delta:hello ',
      'delta:world',
      'cost:5',
      'status:done',
    ])
  })

  it('supports multiple subscribers to the same event', () => {
    const runner = new MockAgentRunner()
    const handle = runner.start(opts())
    const a: string[] = []
    const b: string[] = []
    handle.on('delta', (chunk) => a.push(chunk))
    handle.on('delta', (chunk) => b.push(chunk))

    handle.emitDelta('x')

    expect(a).toEqual(['x'])
    expect(b).toEqual(['x'])
  })

  it('cost events are independent of status events', () => {
    const runner = new MockAgentRunner()
    const handle = runner.start(opts())
    const statuses: string[] = []
    const costs: number[] = []
    handle.on('status', (s) => statuses.push(s))
    handle.on('cost', (c) => costs.push(c.tokensOut))

    handle.emitCost({ tokensIn: 1, tokensOut: 1, costUsd: 0, contextPct: 0 })
    handle.emitCost({ tokensIn: 2, tokensOut: 2, costUsd: 0, contextPct: 0 })

    expect(costs).toEqual([1, 2])
    expect(statuses).toEqual([])
  })

  it('spawnChild returns a new handle with its own sessionId', () => {
    const runner = new MockAgentRunner()
    const parent = runner.start(opts())
    const child = parent.spawnChild(opts({ playbookRunId: 'run-2' }))
    expect(child.sessionId).not.toBe(parent.sessionId)
  })

  it('spawnChild on a child handle throws, enforcing the 2-level hierarchy', () => {
    const runner = new MockAgentRunner()
    const parent = runner.start(opts())
    const child = parent.spawnChild(opts())
    expect(() => child.spawnChild(opts())).toThrow()
  })

  it('stop() prevents further events from reaching subscribers', () => {
    const runner = new MockAgentRunner()
    const handle = runner.start(opts())
    const received: string[] = []
    handle.on('delta', (chunk) => received.push(chunk))

    handle.emitDelta('before')
    handle.stop()
    handle.emitDelta('after')

    expect(received).toEqual(['before'])
  })

  it('stop() does not affect other handles', () => {
    const runner = new MockAgentRunner()
    const handleA = runner.start(opts())
    const handleB = runner.start(opts())
    const received: string[] = []
    handleB.on('delta', (chunk) => received.push(chunk))

    handleA.stop()
    handleB.emitDelta('still alive')

    expect(received).toEqual(['still alive'])
  })
})
