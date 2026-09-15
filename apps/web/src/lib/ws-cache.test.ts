import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { agentSessionQueryKey, applyServerWsMessage } from './ws-cache'

describe('applyServerWsMessage', () => {
  it('patches status onto the session cache entry via setQueryData, not invalidate', () => {
    const queryClient = new QueryClient()
    applyServerWsMessage(queryClient, {
      type: 'status',
      sessionId: 's1',
      status: 'generating',
    })

    expect(queryClient.getQueryData(agentSessionQueryKey('s1'))).toMatchObject({
      status: 'generating',
    })
  })

  it('patches cost fields', () => {
    const queryClient = new QueryClient()
    applyServerWsMessage(queryClient, {
      type: 'cost',
      sessionId: 's1',
      tokensIn: 10,
      tokensOut: 5,
      costUsd: 0.02,
      contextPct: 3,
    })

    expect(queryClient.getQueryData(agentSessionQueryKey('s1'))).toMatchObject({
      tokensIn: 10,
      tokensOut: 5,
      costUsd: 0.02,
      contextPct: 3,
    })
  })

  it('appends delta chunks to accumulated output rather than replacing it', () => {
    const queryClient = new QueryClient()
    applyServerWsMessage(queryClient, { type: 'delta', sessionId: 's1', chunk: 'Hello ' })
    applyServerWsMessage(queryClient, { type: 'delta', sessionId: 's1', chunk: 'world' })

    expect(queryClient.getQueryData(agentSessionQueryKey('s1'))).toMatchObject({
      output: 'Hello world',
    })
  })

  it('keeps sessions in separate cache entries', () => {
    const queryClient = new QueryClient()
    applyServerWsMessage(queryClient, { type: 'delta', sessionId: 's1', chunk: 'a' })
    applyServerWsMessage(queryClient, { type: 'delta', sessionId: 's2', chunk: 'b' })

    expect(queryClient.getQueryData(agentSessionQueryKey('s1'))).toMatchObject({
      output: 'a',
    })
    expect(queryClient.getQueryData(agentSessionQueryKey('s2'))).toMatchObject({
      output: 'b',
    })
  })
})
