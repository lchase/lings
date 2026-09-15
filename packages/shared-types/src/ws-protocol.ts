import type { ClientWsMessage } from './index'

// Runtime validation for the client->server WS control-message union — the
// server can't trust a peer's JSON payload to match ClientWsMessage's shape
// (see .scratch/lings/issues/08-websocket-fleet-view.md).
export function parseClientWsMessage(raw: unknown): ClientWsMessage | null {
  if (typeof raw !== 'object' || raw === null) return null
  const op = (raw as { op?: unknown }).op

  if (op === 'authenticate') {
    const token = (raw as { token?: unknown }).token
    return typeof token === 'string' ? { op, token } : null
  }
  if (op === 'subscribe' || op === 'unsubscribe') {
    const sessionId = (raw as { sessionId?: unknown }).sessionId
    return typeof sessionId === 'string' ? { op, sessionId } : null
  }
  return null
}
