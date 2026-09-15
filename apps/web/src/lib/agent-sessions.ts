import { eq } from 'drizzle-orm'
import { agentSessions } from '@lings/db'
import { MockAgentRunner, runScriptedMockSession } from '@lings/agent-runner'
import type { ServerWsMessage } from '@lings/shared-types'
import { db } from './db'
import { fleetHub } from './fleet-hub'

const mockRunner = new MockAgentRunner()

// Persists a DB patch (if any) and fans the event out over the fleet hub in
// one step — status and cost events both do this; delta only broadcasts.
// drizzle's query builder is a thenable that only executes once awaited or
// otherwise driven — a bare `void` on the chain would construct the query
// and never run it, so every patch gets a `.catch()` to trigger execution.
function persistAndBroadcast(
  sessionId: string,
  patch: Partial<typeof agentSessions.$inferInsert> | null,
  message: ServerWsMessage,
) {
  if (patch) {
    db.update(agentSessions)
      .set(patch)
      .where(eq(agentSessions.id, sessionId))
      .catch((error: unknown) =>
        console.error('failed to persist agent session update', error),
      )
  }
  fleetHub.broadcast(sessionId, message)
}

// Starts a mock agent session (ticket 07's adapter), persisting every
// status/cost event to the agent_sessions row and forwarding it live over
// the fleet hub. The scripted driver runs in the background — the caller
// gets the freshly-created row back immediately (see
// .scratch/lings/issues/08-websocket-fleet-view.md).
export async function startMockAgentSession() {
  const [row] = await db
    .insert(agentSessions)
    .values({ id: crypto.randomUUID(), status: 'idle' })
    .returning()

  const handle = mockRunner.start({ playbookRunId: row.id })

  handle.on('status', (status) => {
    persistAndBroadcast(row.id, { status }, { type: 'status', sessionId: row.id, status })
  })

  handle.on('cost', (cost) => {
    persistAndBroadcast(row.id, cost, { type: 'cost', sessionId: row.id, ...cost })
  })

  handle.on('delta', (chunk) => {
    persistAndBroadcast(row.id, null, { type: 'delta', sessionId: row.id, chunk })
  })

  runScriptedMockSession(handle).catch((error: unknown) => {
    console.error('scripted mock session failed', error)
  })

  return row
}
