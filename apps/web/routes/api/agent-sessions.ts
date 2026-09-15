import { defineHandler } from 'nitro'
import { eq } from 'drizzle-orm'
import { agentSessions, bots } from '@lings/db'
import { db } from '../../src/lib/db'
import { requireUser } from '../../src/lib/require-user'
import { startMockAgentSession } from '../../src/lib/agent-sessions'
import { DEFAULT_BOT_ID, ensureDefaultBot } from '../../src/lib/bots'

// Lives under Nitro's own routes/ dir (not TanStack Start's src/routes/api)
// so that starting a session runs in the same server environment as the WS
// handler (routes/fleet.ts) — they share one in-memory fleetHub singleton,
// which a cross-environment import would not (see
// .scratch/lings/issues/08-websocket-fleet-view.md).
export default defineHandler(async (event) => {
  const { response } = await requireUser(event.req)
  if (response) return response

  if (event.req.method === 'POST') {
    await ensureDefaultBot()
    const body: unknown = await event.req.json().catch(() => ({}))
    const rawBotId =
      body && typeof body === 'object' && 'botId' in body
        ? (body as { botId: unknown }).botId
        : undefined
    const botId = typeof rawBotId === 'string' && rawBotId ? rawBotId : DEFAULT_BOT_ID

    const botRows = await db.select({ id: bots.id }).from(bots).where(eq(bots.id, botId))
    if (botRows.length === 0) {
      return Response.json({ error: 'botId not found' }, { status: 400 })
    }

    const session = await startMockAgentSession(botId)
    return Response.json({ session }, { status: 201 })
  }

  const all = await db.select().from(agentSessions)
  return Response.json({ sessions: all })
})
