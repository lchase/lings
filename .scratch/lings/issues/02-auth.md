# 02 — Auth

**What to build:** Email+password signup and login on the web app, backed by Better Auth with a Drizzle adapter, issuing an opaque bearer token stored in `localStorage` and sent via the `Authorization` header on every subsequent request. A protected route redirects an unauthenticated visitor to login and renders for an authenticated one.

**Blocked by:** 01 — Repo & tooling scaffold.

**Status:** ready-for-agent

- [ ] `users` table exists via Drizzle migration.
- [ ] A new user can sign up with email + password and lands authenticated.
- [ ] An existing user can log in and receives a bearer token.
- [ ] The token is stored client-side and attached to authenticated API calls; a protected route 401s without it and succeeds with it.
- [ ] Logging out clears the token and the DB-backed session row (token is revocable, not a stateless JWT).
- [ ] Token is long-lived (no silent refresh flow implemented) — session survives a page reload without re-login.
