import { createDb } from '@lings/db'

// Single shared server-side db handle for the whole app.
export const db = createDb(process.env.DATABASE_URL ?? 'file:./local.db')
