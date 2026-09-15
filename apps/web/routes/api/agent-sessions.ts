import { defineHandler } from 'nitro'
import { agentSessions } from '@lings/db'
import { db } from '../../src/lib/db'
import { requireUser } from '../../src/lib/require-user'
import { startMockAgentSession } from '../../src/lib/agent-sessions'

// Lives under Nitro's own routes/ dir (not TanStack Start's src/routes/api)
// so that starting a session runs in the same server environment as the WS
// handler (routes/fleet.ts) — they share one in-memory fleetHub singleton,
// which a cross-environment import would not (see
// .scratch/lings/issues/08-websocket-fleet-view.md).
export default defineHandler(async (event) => {
  const { response } = await requireUser(event.req)
  if (response) return response

  if (event.req.method === 'POST') {
    const session = await startMockAgentSession()
    return Response.json({ session }, { status: 201 })
  }

  const all = await db.select().from(agentSessions)
  return Response.json({ sessions: all })
})
