import { describe, expect, it } from 'vitest'
import { parseClientWsMessage } from './ws-protocol'

describe('parseClientWsMessage', () => {
  it('parses an authenticate message', () => {
    expect(parseClientWsMessage({ op: 'authenticate', token: 'abc' })).toEqual({
      op: 'authenticate',
      token: 'abc',
    })
  })

  it('parses a subscribe message', () => {
    expect(
      parseClientWsMessage({ op: 'subscribe', sessionId: 'session-1' }),
    ).toEqual({ op: 'subscribe', sessionId: 'session-1' })
  })

  it('parses an unsubscribe message', () => {
    expect(
      parseClientWsMessage({ op: 'unsubscribe', sessionId: 'session-1' }),
    ).toEqual({ op: 'unsubscribe', sessionId: 'session-1' })
  })

  it('rejects an unknown op', () => {
    expect(parseClientWsMessage({ op: 'nonsense' })).toBeNull()
  })

  it('rejects authenticate with a non-string token', () => {
    expect(parseClientWsMessage({ op: 'authenticate', token: 42 })).toBeNull()
  })

  it('rejects subscribe with a missing sessionId', () => {
    expect(parseClientWsMessage({ op: 'subscribe' })).toBeNull()
  })

  it('rejects non-object input', () => {
    expect(parseClientWsMessage('not json')).toBeNull()
    expect(parseClientWsMessage(null)).toBeNull()
    expect(parseClientWsMessage(undefined)).toBeNull()
  })
})
