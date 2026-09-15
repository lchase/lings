import type { AgentHandle, AgentRunner, CostEvent, SessionStatus, StartOptions } from './types'

type Listeners = {
  delta: Set<(chunk: string) => void>
  status: Set<(status: SessionStatus) => void>
  cost: Set<(c: CostEvent) => void>
}

// Fake in-memory AgentHandle: no real LLM call. Tests drive it directly via
// the emit* methods to script a sequence of events and assert subscribers
// receive them in order (see .scratch/lings/issues/07-agent-runner-mock.md).
export class MockAgentHandle implements AgentHandle {
  readonly sessionId: string
  private isChild: boolean
  private stopped = false
  private listeners: Listeners = {
    delta: new Set(),
    status: new Set(),
    cost: new Set(),
  }

  constructor(sessionId: string, isChild: boolean) {
    this.sessionId = sessionId
    this.isChild = isChild
  }

  send(_message: string): void {
    // No real backend — the mock adapter only emits events under explicit
    // test control via emit*, it doesn't react to sent messages.
  }

  spawnChild(_opts: StartOptions): MockAgentHandle {
    if (this.isChild) {
      throw new Error('cannot spawnChild on a handle that is itself a child')
    }
    return new MockAgentHandle(crypto.randomUUID(), true)
  }

  stop(): void {
    this.stopped = true
  }

  on(event: 'delta', cb: (chunk: string) => void): void
  on(event: 'status', cb: (status: SessionStatus) => void): void
  on(event: 'cost', cb: (c: CostEvent) => void): void
  on(event: 'delta' | 'status' | 'cost', cb: (arg: never) => void): void {
    this.listeners[event].add(cb as never)
  }

  emitDelta(chunk: string): void {
    if (this.stopped) return
    for (const cb of this.listeners.delta) cb(chunk)
  }

  emitStatus(status: SessionStatus): void {
    if (this.stopped) return
    for (const cb of this.listeners.status) cb(status)
  }

  emitCost(cost: CostEvent): void {
    if (this.stopped) return
    for (const cb of this.listeners.cost) cb(cost)
  }
}

export class MockAgentRunner implements AgentRunner {
  start(_opts: StartOptions): MockAgentHandle {
    return new MockAgentHandle(crypto.randomUUID(), false)
  }
}
