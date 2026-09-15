import type { QueryClient } from '@tanstack/react-query'
import type { ServerWsMessage, SessionStatus } from '@lings/shared-types'

export type AgentSessionCacheEntry = {
  id: string
  status: SessionStatus
  tokensIn: number
  tokensOut: number
  costUsd: number
  contextPct: number
  output: string
}

export function agentSessionQueryKey(sessionId: string) {
  return ['agent-session', sessionId] as const
}

export function emptyAgentSessionEntry(sessionId: string): AgentSessionCacheEntry {
  return {
    id: sessionId,
    status: 'idle',
    tokensIn: 0,
    tokensOut: 0,
    costUsd: 0,
    contextPct: 0,
    output: '',
  }
}

// The WS-message->cache-patch seam (SPEC.md's WebSocket protocol decision):
// status/cost/delta apply via direct setQueryData patches, never invalidate,
// so a live session updates without a refetch round-trip.
export function applyServerWsMessage(
  queryClient: QueryClient,
  message: ServerWsMessage,
): void {
  if (message.type === 'error') return

  queryClient.setQueryData(
    agentSessionQueryKey(message.sessionId),
    (prev: AgentSessionCacheEntry | undefined) => {
      const base = prev ?? emptyAgentSessionEntry(message.sessionId)
      switch (message.type) {
        case 'status':
          return { ...base, status: message.status }
        case 'cost':
          return {
            ...base,
            tokensIn: message.tokensIn,
            tokensOut: message.tokensOut,
            costUsd: message.costUsd,
            contextPct: message.contextPct,
          }
        case 'delta':
          return { ...base, output: base.output + message.chunk }
      }
    },
  )
}
