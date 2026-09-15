import { sql } from 'drizzle-orm'
import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  type AnySQLiteColumn,
} from 'drizzle-orm/sqlite-core'

// Better Auth's core schema (user/session/account/verification), hand-authored
// to match what `better-auth`'s drizzle adapter expects for provider "sqlite".
export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' })
    .default(false)
    .notNull(),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
})

export const session = sqliteTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => ({ userIdIdx: index('session_userId_idx').on(table.userId) }),
)

export const account = sqliteTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', {
      mode: 'timestamp_ms',
    }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', {
      mode: 'timestamp_ms',
    }),
    scope: text('scope'),
    password: text('password'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({ userIdIdx: index('account_userId_idx').on(table.userId) }),
)

export const verification = sqliteTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    identifierIdx: index('verification_identifier_idx').on(table.identifier),
  }),
)

// Arbitrary-depth folder tree; null parentId = root. Any folder — not just
// leaves — can hold tickets directly (see .scratch/lings/issues/03).
export const folders = sqliteTable(
  'folders',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    parentId: text('parent_id').references(
      (): AnySQLiteColumn => folders.id,
      { onDelete: 'cascade' },
    ),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({ parentIdIdx: index('folders_parentId_idx').on(table.parentId) }),
)

// Free-text markdown laws doc scoped to a folder, or global when folderId is
// null (see .scratch/lings/issues/06-laws-and-permissions.md). At most one
// row per scope, enforced at the application layer (upsert-by-scope) rather
// than a unique index, since sqlite treats every NULL as distinct and so
// can't uniquely constrain the single global row.
export const lawsDocs = sqliteTable(
  'laws_docs',
  {
    id: text('id').primaryKey(),
    folderId: text('folder_id').references(() => folders.id, {
      onDelete: 'cascade',
    }),
    content: text('content').notNull().default(''),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    folderIdIdx: index('laws_docs_folderId_idx').on(table.folderId),
  }),
)

// Mirrors @lings/shared-types' SessionStatus — kept as a plain literal tuple
// here rather than importing it, since @lings/db has no dependency on
// @lings/shared-types (see .scratch/lings/issues/08-websocket-fleet-view.md).
export const AGENT_SESSION_STATUSES = [
  'idle',
  'generating',
  'waiting-approval',
  'error',
  'done',
] as const
export type AgentSessionStatus = (typeof AGENT_SESSION_STATUSES)[number]

// Global, not folder-scoped (SPEC.md "Core data model"). toolsConfig and
// delegationAllowlist are flat string-id allowlists, not per-tool scoping —
// see .scratch/lings/issues/09-bots-entity-and-chat.md.
export const BOT_MODEL_TIERS = ['fast', 'balanced', 'max'] as const
export type BotModelTier = (typeof BOT_MODEL_TIERS)[number]

export const bots = sqliteTable('bots', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  systemPrompt: text('system_prompt').notNull().default(''),
  toolsConfig: text('tools_config', { mode: 'json' })
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
  delegationAllowlist: text('delegation_allowlist', { mode: 'json' })
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
  // Regenerated client-side only (new random seed, re-rendered instantly) —
  // never a stored image, never an image-gen API call.
  avatarSeed: text('avatar_seed').notNull(),
  defaultModelTier: text('default_model_tier', { enum: BOT_MODEL_TIERS })
    .default('balanced')
    .notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
})

// Extends ticket 08's minimal shape with the required bot_id FK (ticket 09);
// no playbook_run_id / parent_session_id yet, since playbooks don't exist in
// this schema — full shape extends later per SPEC.md's core data model.
export const agentSessions = sqliteTable(
  'agent_sessions',
  {
    id: text('id').primaryKey(),
    botId: text('bot_id')
      .notNull()
      .references(() => bots.id),
    status: text('status', { enum: AGENT_SESSION_STATUSES })
      .default('idle')
      .notNull(),
    tokensIn: integer('tokens_in').default(0).notNull(),
    tokensOut: integer('tokens_out').default(0).notNull(),
    costUsd: real('cost_usd').default(0).notNull(),
    contextPct: integer('context_pct').default(0).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({ botIdIdx: index('agent_sessions_botId_idx').on(table.botId) }),
)

export const TICKET_STATUSES = ['backlog', 'in_progress', 'qa', 'done'] as const
export type TicketStatus = (typeof TICKET_STATUSES)[number]

export const tickets = sqliteTable(
  'tickets',
  {
    id: text('id').primaryKey(),
    folderId: text('folder_id')
      .notNull()
      .references(() => folders.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status', { enum: TICKET_STATUSES })
      .default('backlog')
      .notNull(),
    startDate: integer('start_date', { mode: 'timestamp_ms' }),
    dueDate: integer('due_date', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({ folderIdIdx: index('tickets_folderId_idx').on(table.folderId) }),
)
