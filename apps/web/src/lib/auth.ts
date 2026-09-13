import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { bearer } from 'better-auth/plugins'
import { db } from './db'

const SIXTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 60

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? 'dev-only-secret-do-not-use-in-production',
  database: drizzleAdapter(db, { provider: 'sqlite' }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    // Long-lived, no silent refresh — re-login only on explicit logout or
    // once the window lapses (see .scratch/lings/issues/02-auth.md).
    expiresIn: SIXTY_DAYS_IN_SECONDS,
    disableSessionRefresh: true,
  },
  // Opaque bearer token via Authorization header, not cookies — the desktop
  // app's cross-origin API access is what forces this (see SPEC.md's Auth
  // implementation decision).
  plugins: [bearer()],
})
