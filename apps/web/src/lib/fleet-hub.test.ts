import { describe, expect, it, vi } from 'vitest'
import { FleetHub } from './fleet-hub'

function fakePeer() {
  return { send: vi.fn() }
}

describe('FleetHub', () => {
  it('broadcasts only to peers subscribed to that session', () => {
    const hub = new FleetHub()
    const subscribed = fakePeer()
    const other = fakePeer()
    hub.subscribe('session-1', subscribed)
    hub.subscribe('session-2', other)

    hub.broadcast('session-1', { type: 'delta', sessionId: 'session-1', chunk: 'hi' })

    expect(subscribed.send).toHaveBeenCalledTimes(1)
    expect(other.send).not.toHaveBeenCalled()
  })

  it('stops delivering to a peer after unsubscribe', () => {
    const hub = new FleetHub()
    const peer = fakePeer()
    hub.subscribe('session-1', peer)
    hub.unsubscribe('session-1', peer)

    hub.broadcast('session-1', { type: 'delta', sessionId: 'session-1', chunk: 'hi' })

    expect(peer.send).not.toHaveBeenCalled()
  })

  it('unsubscribeAll removes a peer from every session it was subscribed to', () => {
    const hub = new FleetHub()
    const peer = fakePeer()
    hub.subscribe('session-1', peer)
    hub.subscribe('session-2', peer)
    hub.unsubscribeAll(peer)

    hub.broadcast('session-1', { type: 'delta', sessionId: 'session-1', chunk: 'hi' })
    hub.broadcast('session-2', { type: 'delta', sessionId: 'session-2', chunk: 'hi' })

    expect(peer.send).not.toHaveBeenCalled()
  })

  it('a peer subscribed twice to the same session only receives one message', () => {
    const hub = new FleetHub()
    const peer = fakePeer()
    hub.subscribe('session-1', peer)
    hub.subscribe('session-1', peer)

    hub.broadcast('session-1', { type: 'delta', sessionId: 'session-1', chunk: 'hi' })

    expect(peer.send).toHaveBeenCalledTimes(1)
  })
})
