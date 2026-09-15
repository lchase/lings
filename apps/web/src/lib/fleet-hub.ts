import type { ServerWsMessage } from '@lings/shared-types'

export interface FleetPeer {
  send: (data: unknown) => void
}

// In-process registry of which peers are subscribed to which agent session's
// live events, and the fan-out point that forwards status/cost/delta events
// to exactly the subscribed peers — the WS route owns the access check
// (does this user have access to this session?) before calling subscribe
// (see .scratch/lings/issues/08-websocket-fleet-view.md).
export class FleetHub {
  private peersBySession = new Map<string, Set<FleetPeer>>()

  subscribe(sessionId: string, peer: FleetPeer): void {
    let peers = this.peersBySession.get(sessionId)
    if (!peers) {
      peers = new Set()
      this.peersBySession.set(sessionId, peers)
    }
    peers.add(peer)
  }

  unsubscribe(sessionId: string, peer: FleetPeer): void {
    const peers = this.peersBySession.get(sessionId)
    if (!peers) return
    peers.delete(peer)
    if (peers.size === 0) this.peersBySession.delete(sessionId)
  }

  unsubscribeAll(peer: FleetPeer): void {
    for (const sessionId of [...this.peersBySession.keys()]) {
      this.unsubscribe(sessionId, peer)
    }
  }

  broadcast(sessionId: string, message: ServerWsMessage): void {
    for (const peer of this.peersBySession.get(sessionId) ?? []) {
      peer.send(message)
    }
  }
}

// One process-wide hub — a WS route handler and the REST endpoint that
// starts a mock session both need to reach the same registry.
export const fleetHub = new FleetHub()
