import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { bots, BOT_MODEL_TIERS } from '@lings/db'
import { db } from '../../../lib/db'
import { requireUser } from '../../../lib/require-user'
import { allBotIdsExist } from '../../../lib/bots'

function parseStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value.filter((v): v is string => typeof v === 'string' && v.length > 0)
}

export const Route = createFileRoute('/api/bots/$id')({
  server: {
    handlers: {
      GET: async ({
        request,
        params,
      }: {
        request: Request
        params: { id: string }
      }) => {
        const { response } = await requireUser(request)
        if (response) return response

        const rows = await db.select().from(bots).where(eq(bots.id, params.id))
        if (rows.length === 0) {
          return Response.json({ error: 'not found' }, { status: 404 })
        }
        return Response.json({ bot: rows[0] })
      },
      PATCH: async ({
        request,
        params,
      }: {
        request: Request
        params: { id: string }
      }) => {
        const { response } = await requireUser(request)
        if (response) return response

        const existingRows = await db
          .select({ id: bots.id })
          .from(bots)
          .where(eq(bots.id, params.id))
        if (existingRows.length === 0) {
          return Response.json({ error: 'not found' }, { status: 404 })
        }

        const body = await request.json()
        const patch: Partial<typeof bots.$inferInsert> = {}

        if (typeof body.name === 'string') {
          const name = body.name.trim()
          if (!name) {
            return Response.json(
              { error: 'name cannot be empty' },
              { status: 400 },
            )
          }
          patch.name = name
        }
        if (typeof body.description === 'string') {
          patch.description = body.description
        }
        if (typeof body.systemPrompt === 'string') {
          patch.systemPrompt = body.systemPrompt
        }
        if (body.toolsConfig !== undefined) {
          const toolsConfig = parseStringArray(body.toolsConfig)
          if (toolsConfig === undefined) {
            return Response.json(
              { error: 'toolsConfig must be an array of strings' },
              { status: 400 },
            )
          }
          patch.toolsConfig = toolsConfig
        }
        if (body.delegationAllowlist !== undefined) {
          const delegationAllowlist = parseStringArray(body.delegationAllowlist)
          if (delegationAllowlist === undefined) {
            return Response.json(
              { error: 'delegationAllowlist must be an array of strings' },
              { status: 400 },
            )
          }
          if (delegationAllowlist.includes(params.id)) {
            return Response.json(
              { error: 'a bot cannot delegate to itself' },
              { status: 400 },
            )
          }
          if (!(await allBotIdsExist(delegationAllowlist))) {
            return Response.json(
              { error: 'delegationAllowlist contains an unknown bot id' },
              { status: 400 },
            )
          }
          patch.delegationAllowlist = delegationAllowlist
        }
        if (typeof body.avatarSeed === 'string' && body.avatarSeed) {
          patch.avatarSeed = body.avatarSeed
        }
        if (body.defaultModelTier !== undefined) {
          if (!BOT_MODEL_TIERS.includes(body.defaultModelTier)) {
            return Response.json(
              { error: 'invalid defaultModelTier' },
              { status: 400 },
            )
          }
          patch.defaultModelTier = body.defaultModelTier
        }

        const [updated] = await db
          .update(bots)
          .set(patch)
          .where(eq(bots.id, params.id))
          .returning()

        return Response.json({ bot: updated })
      },
    },
  },
})
