import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Card, StatusBadge } from '@lings/ui'
import type { StatusTone } from '@lings/ui'
import type { SessionStatus } from '@lings/shared-types'
import { getStoredAuthToken } from '../lib/auth-client'
import { useFleetSocket } from '../lib/use-fleet-socket'
import { agentSessionQueryKey, emptyAgentSessionEntry } from '../lib/ws-cache'

export const Route = createFileRoute('/fleet')({ component: FleetPage })

type AgentSessionRow = {
  id: string
  status: SessionStatus
  tokensIn: number
  tokensOut: number
  costUsd: number
  contextPct: number
}

const STATUS_LABEL: Record<SessionStatus, string> = {
  idle: 'Idle',
  generating: 'Generating',
  'waiting-approval': 'Waiting on you',
  error: 'Error',
  done: 'Done',
}

const STATUS_TONE: Record<SessionStatus, StatusTone> = {
  idle: 'backlog',
  generating: 'progress',
  'waiting-approval': 'qa',
  error: 'error',
  done: 'done',
}

async function api(path: string, init?: RequestInit) {
  return fetch(path, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${getStoredAuthToken()}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    },
  })
}

function SessionCard({ sessionId }: { sessionId: string }) {
  const { data } = useQuery({
    queryKey: agentSessionQueryKey(sessionId),
    queryFn: () => emptyAgentSessionEntry(sessionId),
    staleTime: Infinity,
  })
  const session = data ?? emptyAgentSessionEntry(sessionId)

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-[var(--ink-soft)]">
          {sessionId.slice(0, 8)}
        </span>
        <StatusBadge
          tone={STATUS_TONE[session.status]}
          label={STATUS_LABEL[session.status]}
        />
      </div>
      <div className="flex gap-4 font-mono text-xs text-[var(--ink-soft)]">
        <span>tokens in {session.tokensIn}</span>
        <span>tokens out {session.tokensOut}</span>
        <span>cost ${session.costUsd.toFixed(4)}</span>
        <span>context {session.contextPct}%</span>
      </div>
      <pre className="min-h-[4rem] whitespace-pre-wrap rounded-[var(--radius-control)] bg-[var(--paper)] p-2 font-mono text-xs text-[var(--ink)]">
        {session.output || '…'}
      </pre>
    </Card>
  )
}

function FleetPage() {
  const navigate = useNavigate()
  const { subscribe } = useFleetSocket()
  const [authed, setAuthed] = useState(false)
  const [sessionIds, setSessionIds] = useState<string[] | null>(null)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    api('/api/agent-sessions').then(async (res) => {
      if (res.status === 401) {
        navigate({ to: '/login' })
        return
      }
      const data: { sessions: AgentSessionRow[] } = await res.json()
      const ids = data.sessions.map((s) => s.id)
      setSessionIds(ids)
      setAuthed(true)
      for (const id of ids) subscribe(id)
    })
  }, [navigate, subscribe])

  async function handleStart() {
    setStarting(true)
    const res = await api('/api/agent-sessions', { method: 'POST' })
    setStarting(false)
    if (res.ok) {
      const { session }: { session: AgentSessionRow } = await res.json()
      setSessionIds((prev) => [...(prev ?? []), session.id])
      subscribe(session.id)
    }
  }

  if (!authed || !sessionIds) {
    return (
      <main className="page-wrap px-4 py-14 text-[var(--ink-soft)]">
        <p>Loading…</p>
      </main>
    )
  }

  return (
    <main className="page-wrap px-4 py-14">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="display-title text-2xl font-bold text-[var(--ink)]">
          Fleet
        </h1>
        <Button type="button" variant="primary" onClick={handleStart} disabled={starting}>
          {starting ? 'Starting…' : '+ Start mock session'}
        </Button>
      </div>

      {sessionIds.length === 0 ? (
        <p className="text-sm text-[var(--ink-soft)]">
          No sessions yet. Start one to watch it live.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {sessionIds.map((id) => (
            <SessionCard key={id} sessionId={id} />
          ))}
        </div>
      )}
    </main>
  )
}
