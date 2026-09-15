import { describe, expect, it } from 'vitest'
import { MockAgentRunner } from './mock-agent-runner'
import { runScriptedMockSession } from './scripted-mock-session'

describe('runScriptedMockSession', () => {
  it('emits a generating status, then delta chunks with rising cost, then done', async () => {
    const handle = new MockAgentRunner().start({ playbookRunId: 'run-1' })
    const statuses: string[] = []
    const chunks: string[] = []
    const costs: number[] = []
    handle.on('status', (s) => statuses.push(s))
    handle.on('delta', (c) => chunks.push(c))
    handle.on('cost', (c) => costs.push(c.costUsd))

    await runScriptedMockSession(handle, { stepMs: 0 })

    expect(statuses[0]).toBe('generating')
    expect(statuses.at(-1)).toBe('done')
    expect(chunks.length).toBeGreaterThan(0)
    expect(chunks.join('')).not.toBe('')
    expect(costs.length).toBeGreaterThan(0)
    // Cost should be non-decreasing across the session.
    for (let i = 1; i < costs.length; i++) {
      expect(costs[i]).toBeGreaterThanOrEqual(costs[i - 1])
    }
  })
})
