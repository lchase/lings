import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

// Placeholder table proving the migration pipeline works end to end.
// Real domain tables (users, folders, tickets, ...) land in later tickets.
export const scaffoldCheck = sqliteTable('scaffold_check', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  note: text('note').notNull(),
})
