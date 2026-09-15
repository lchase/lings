import { createFileRoute } from '@tanstack/react-router'
import { bots, BOT_MODEL_TIERS } from '@lings/db'
import type { BotModelTier } from '@lings/db'
import { db } from '../../lib/db'
import { requireUser } from '../../lib/require-user'
import { DEFAULT_BOT_ID, allBotIdsExist, ensureDefaultBot } from '../../lib/bots'

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is string => typeof v === 'string' && v.length > 0)
}

export const Route = createFileRoute('/api/bots')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const { response } = await requireUser(request)
        if (response) return response

        await ensureDefaultBot()
        const all = await db.select().from(bots)
        return Response.json({ bots: all, defaultBotId: DEFAULT_BOT_ID })
      },
      POST: async ({ request }: { request: Request }) => {
        const { response } = await requireUser(request)
        if (response) return response

        await ensureDefaultBot()
        const body = await request.json()
        const name = typeof body.name === 'string' ? body.name.trim() : ''
        if (!name) {
          return Response.json({ error: 'name is required' }, { status: 400 })
        }
        const description =
          typeof body.description === 'string' ? body.description : ''
        const systemPrompt =
          typeof body.systemPrompt === 'string' ? body.systemPrompt : ''
        const toolsConfig = parseStringArray(body.toolsConfig)
        const delegationAllowlist = parseStringArray(body.delegationAllowlist)
        if (!(await allBotIdsExist(delegationAllowlist))) {
          return Response.json(
            { error: 'delegationAllowlist contains an unknown bot id' },
            { status: 400 },
          )
        }
        const avatarSeed =
          typeof body.avatarSeed === 'string' && body.avatarSeed
            ? body.avatarSeed
            : crypto.randomUUID()
        const defaultModelTier: BotModelTier = BOT_MODEL_TIERS.includes(
          body.defaultModelTier,
        )
          ? body.defaultModelTier
          : 'balanced'

        const [created] = await db
          .insert(bots)
          .values({
            id: crypto.randomUUID(),
            name,
            description,
            systemPrompt,
            toolsConfig,
            delegationAllowlist,
            avatarSeed,
            defaultModelTier,
          })
          .returning()

        return Response.json({ bot: created }, { status: 201 })
      },
    },
  },
})
