import { auth } from './auth'

// Shared guard for API routes: resolves the bearer-authenticated user or
// returns a 401 Response the caller should return immediately.
export async function requireUser(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return {
      user: null,
      response: Response.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }
  return { user: session.user, response: null }
}
