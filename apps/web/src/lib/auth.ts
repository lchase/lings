import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createAuthMiddleware } from 'better-auth/api'
import { bearer } from 'better-auth/plugins'
import type { BetterAuthPlugin } from 'better-auth/types'
import { db } from './db'

const SIXTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 60
const DEV_ONLY_FALLBACK_SECRET = 'dev-only-secret-do-not-use-in-production'

// Better Auth's bearer plugin sets a Set-Cookie header alongside the
// set-auth-token response header. We're bearer-only (Authorization header,
// not cookies) per SPEC.md's Auth decision, so strip it — the documented
// Better Auth pattern for cookie-less bearer clients.
function noSetCookiePlugin(): BetterAuthPlugin {
  return {
    id: 'no-set-cookie',
    hooks: {
      after: [
        {
          matcher: () => true,
          handler: createAuthMiddleware(async (ctx) => {
            const headers = ctx.context.responseHeaders
            if (headers instanceof Headers) headers.delete('set-cookie')
          }),
        },
      ],
    },
  }
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? DEV_ONLY_FALLBACK_SECRET,
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
  plugins: [bearer(), noSetCookiePlugin()],
})
