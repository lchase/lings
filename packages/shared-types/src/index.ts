export type SessionStatus =
  'idle' | 'generating' | 'waiting-approval' | 'error' | 'done'

// WS protocol (SPEC.md "WebSocket protocol" / .scratch/lings/issues/08):
// one multiplexed connection per tab, {op:'authenticate', token} first, then
// {op:'subscribe'|'unsubscribe', sessionId} control messages.
export type ClientWsMessage =
  | { op: 'authenticate'; token: string }
  | { op: 'subscribe'; sessionId: string }
  | { op: 'unsubscribe'; sessionId: string }

// Server-to-client messages map 1:1 onto AgentHandle events.
export type ServerWsMessage =
  | { type: 'status'; sessionId: string; status: SessionStatus }
  | {
      type: 'cost'
      sessionId: string
      tokensIn: number
      tokensOut: number
      costUsd: number
      contextPct: number
    }
  | { type: 'delta'; sessionId: string; chunk: string }
  | { type: 'error'; message: string }

export { parseClientWsMessage } from './ws-protocol'
