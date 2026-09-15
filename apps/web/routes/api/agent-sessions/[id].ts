import { defineHandler } from 'nitro'
import { eq } from 'drizzle-orm'
import { agentSessions } from '@lings/db'
import { db } from '../../../src/lib/db'
import { requireUser } from '../../../src/lib/require-user'

// Used on WS reconnect to refetch current session state before resuming the
// live stream (no replay of missed events — see
// .scratch/lings/issues/08-websocket-fleet-view.md).
export default defineHandler(async (event) => {
  const { response } = await requireUser(event.req)
  if (response) return response

  const id = event.context.params?.id
  const rows = await db
    .select()
    .from(agentSessions)
    .where(eq(agentSessions.id, id ?? ''))
  if (rows.length === 0) {
    return Response.json({ error: 'not found' }, { status: 404 })
  }
  return Response.json({ session: rows[0] })
})
