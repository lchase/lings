import type { SessionStatus } from '@lings/shared-types'

export type { SessionStatus }

export interface StartOptions {
  playbookRunId: string
  systemPrompt?: string
}

export interface CostEvent {
  tokensIn: number
  tokensOut: number
  costUsd: number
  contextPct: number
}

// Push model: start() returns a handle; the caller subscribes to its events
// and forwards them (e.g. over WebSocket). Spawn lives on the handle, not a
// second start() call, so an adapter can hook a backend's native delegation
// if one exists (see SPEC.md's AgentRunner interface).
export interface AgentHandle {
  readonly sessionId: string
  send(message: string): void
  // Throws if `this` is already a child — enforces the fixed 2-level
  // hierarchy at the interface boundary.
  spawnChild(opts: StartOptions): AgentHandle
  stop(): void
  on(event: 'delta', cb: (chunk: string) => void): void
  on(event: 'status', cb: (status: SessionStatus) => void): void
  on(event: 'cost', cb: (c: CostEvent) => void): void
}

export interface AgentRunner {
  start(opts: StartOptions): AgentHandle
}
