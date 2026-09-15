import { inArray } from 'drizzle-orm'
import { bots } from '@lings/db'
import { db } from './db'

// Fixed id (not a random one) so ensureDefaultBot is idempotent across
// process restarts via onConflictDoNothing, and so agent-sessions can
// preselect it without a round-trip lookup (see
// .scratch/lings/issues/09-bots-entity-and-chat.md).
export const DEFAULT_BOT_ID = 'default-generic-assistant'

let seeded: Promise<unknown> | null = null

// Guarantees the out-of-the-box "generic assistant" bot exists, so
// agent_sessions.bot_id (a required FK) always has a no-persona fallback to
// point ad-hoc chats at. Cached per-process since it's an idempotent insert.
export function ensureDefaultBot() {
  if (!seeded) {
    seeded = db
      .insert(bots)
      .values({
        id: DEFAULT_BOT_ID,
        name: 'Generic Assistant',
        description:
          'General-purpose default bot for ad-hoc chats with no dedicated persona configured.',
        systemPrompt: 'You are a helpful, general-purpose assistant.',
        toolsConfig: [],
        delegationAllowlist: [],
        avatarSeed: DEFAULT_BOT_ID,
        defaultModelTier: 'balanced',
      })
      .onConflictDoNothing()
  }
  return seeded
}

// Delegation allowlist entries are bot ids (SPEC.md "Core data model": "a
// delegation allowlist (bot ids it may spawn)") — verify every entry
// actually names a bot that exists, rather than persisting arbitrary
// strings.
export async function allBotIdsExist(ids: string[]): Promise<boolean> {
  if (ids.length === 0) return true
  const rows = await db
    .select({ id: bots.id })
    .from(bots)
    .where(inArray(bots.id, ids))
  return rows.length === new Set(ids).size
}
