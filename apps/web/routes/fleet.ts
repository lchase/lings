import { defineWebSocketHandler } from 'nitro'
import { eq } from 'drizzle-orm'
import { agentSessions } from '@lings/db'
import { parseClientWsMessage } from '@lings/shared-types'
import { auth } from '../src/lib/auth'
import { db } from '../src/lib/db'
import { fleetHub } from '../src/lib/fleet-hub'

type FleetPeerContext = { userId: string | null }

// One multiplexed WS connection per tab (SPEC.md's WebSocket protocol
// decision, see .scratch/lings/issues/08-websocket-fleet-view.md). Auth
// happens via the first message, not the upgrade request, since a browser
// WebSocket can't set the Authorization header during the handshake.
export default defineWebSocketHandler({
  upgrade() {
    return { context: { userId: null } satisfies FleetPeerContext }
  },

  async message(peer, raw) {
    let json: unknown
    try {
      json = raw.json()
    } catch {
      peer.send({ type: 'error', message: 'invalid JSON' })
      return
    }

    const parsed = parseClientWsMessage(json)
    if (!parsed) {
      peer.send({ type: 'error', message: 'invalid message' })
      return
    }

    const ctx = peer.context as FleetPeerContext

    if (parsed.op === 'authenticate') {
      const session = await auth.api.getSession({
        headers: new Headers({ authorization: `Bearer ${parsed.token}` }),
      })
      if (!session) {
        peer.send({ type: 'error', message: 'unauthorized' })
        peer.close(4001, 'unauthorized')
        return
      }
      ctx.userId = session.user.id
      return
    }

    if (!ctx.userId) {
      peer.send({ type: 'error', message: 'not authenticated' })
      return
    }

    if (parsed.op === 'subscribe') {
      // No per-user ACL on agent_sessions yet (SPEC.md: no ownership/ACL
      // concept anywhere) — "access" is existence, checked before adding
      // the peer to the fan-out list.
      const rows = await db
        .select({ id: agentSessions.id })
        .from(agentSessions)
        .where(eq(agentSessions.id, parsed.sessionId))
      if (rows.length === 0) {
        peer.send({ type: 'error', message: 'session not found' })
        return
      }
      fleetHub.subscribe(parsed.sessionId, peer)
      return
    }

    fleetHub.unsubscribe(parsed.sessionId, peer)
  },

  close(peer) {
    fleetHub.unsubscribeAll(peer)
  },
})
