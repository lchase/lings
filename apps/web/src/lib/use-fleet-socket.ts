import { useCallback, useEffect, useRef } from 'react'
import type { ClientWsMessage, ServerWsMessage } from '@lings/shared-types'
import { getStoredAuthToken } from './auth-client'
import { queryClient } from './query-client'
import { agentSessionQueryKey, applyServerWsMessage } from './ws-cache'
import type { AgentSessionCacheEntry } from './ws-cache'

const RECONNECT_DELAY_MS = 1000

function send(ws: WebSocket, message: ClientWsMessage) {
  ws.send(JSON.stringify(message))
}

async function refetchThenSubscribe(ws: WebSocket, sessionId: string) {
  const res = await fetch(`/api/agent-sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${getStoredAuthToken()}` },
  })
  if (res.ok) {
    const { session } = (await res.json()) as {
      session: Omit<AgentSessionCacheEntry, 'output'>
    }
    queryClient.setQueryData(
      agentSessionQueryKey(sessionId),
      (prev: AgentSessionCacheEntry | undefined) => ({
        ...session,
        output: prev?.output ?? '',
      }),
    )
  }
  if (ws.readyState === WebSocket.OPEN) {
    send(ws, { op: 'subscribe', sessionId })
  }
}

// One multiplexed WS connection per tab (SPEC.md's WebSocket protocol
// decision). On (re)connect: authenticate, then for every session this tab
// currently cares about, refetch its state via REST before resuming the
// live subscription — no replay of missed events (see
// .scratch/lings/issues/08-websocket-fleet-view.md).
export function useFleetSocket() {
  const wsRef = useRef<WebSocket | null>(null)
  const subscribedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined

    function connect() {
      if (cancelled) return
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const ws = new WebSocket(`${protocol}://${window.location.host}/fleet`)
      wsRef.current = ws

      ws.addEventListener('open', () => {
        send(ws, { op: 'authenticate', token: getStoredAuthToken() })
        for (const sessionId of subscribedRef.current) {
          void refetchThenSubscribe(ws, sessionId)
        }
      })

      ws.addEventListener('message', (event) => {
        const message: ServerWsMessage = JSON.parse(event.data as string)
        applyServerWsMessage(queryClient, message)
      })

      ws.addEventListener('close', () => {
        if (cancelled) return
        reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS)
      })
    }

    connect()
    return () => {
      cancelled = true
      clearTimeout(reconnectTimer)
      wsRef.current?.close()
    }
  }, [])

  const subscribe = useCallback((sessionId: string) => {
    subscribedRef.current.add(sessionId)
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      void refetchThenSubscribe(ws, sessionId)
    }
  }, [])

  const unsubscribe = useCallback((sessionId: string) => {
    subscribedRef.current.delete(sessionId)
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      send(ws, { op: 'unsubscribe', sessionId })
    }
  }, [])

  return { subscribe, unsubscribe }
}
