Type: grilling
Status: resolved

## Question

Pick the concrete auth implementation for basic email+password multi-user accounts on TanStack Start (e.g. Lucia-style rolled-your-own, Better Auth, Auth.js/etc), and decide session storage strategy (cookie+DB session row vs signed JWT) consistent with the SQLite/Drizzle persistence choice.

## Answer

- **Library**: Better Auth. Has a Drizzle adapter (matches the stack) and a built-in bearer-token plugin, avoiding a hand-rolled password-hashing/token/revocation implementation.
- **Transport**: opaque bearer token, DB-backed (session row + random token, revocable/lookup-based like a normal session — not a stateless JWT), sent via `Authorization` header. Chosen over cookie+DB session because the desktop app ([[06-repo-structure]]) hits the API cross-origin (Tauri webview, configurable API base URL) — cookie/CORS-credentials handling across origins is finicky, while a header-based token is uniform for both `apps/web` and `apps/desktop`.
- **Client storage**: `localStorage`, same on both web and desktop's webview — one storage code path, consistent with the trusted-team security posture already set elsewhere on this map (no sandboxing for playbook steps).

**Invalidates part of [[05-websocket-protocol]]**: that ticket's "cookie reuse, same-origin" WS auth answer assumed cookie-based sessions. Amended there to token-based (first WS message carries the bearer token) to stay consistent with this decision.
