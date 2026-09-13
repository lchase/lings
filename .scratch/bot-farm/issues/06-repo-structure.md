Type: grilling
Status: resolved

## Question

Spec the repo/package layout for a TypeScript TanStack Start app with a pluggable AgentRunner and Drizzle/SQLite: monorepo (apps/packages split) vs single app, and where the AgentRunner interface + adapters, the db schema/migrations, and shared types each live.

## Answer

Scope widened mid-ticket: a desktop app is real planned scope, not just web (see updated map Destination). Desktop is a thin client — a Tauri wrapper bundling its own frontend-only build, pointed at a configurable remote API base URL, talking to the same shared self-hosted server (no local embedded server/DB on desktop).

That forces a monorepo, since the desktop build is a genuinely different build artifact (frontend-only, different API base URL) from the web app's, not just a config flag on one app.

- **Tooling**: pnpm workspaces only, no Turborepo. Two apps + a few packages is small enough that build-graph caching doesn't pay for itself yet; add Turborepo later if build times actually hurt.
- **Package split**:
  - `apps/web` — full TanStack Start app: routes, server functions, deploy target.
  - `apps/desktop` — Tauri wrapper; builds a frontend-only bundle against a configurable API base URL.
  - `packages/db` — Drizzle schema + migrations.
  - `packages/agent-runner` — `AgentRunner` interface + adapters ([[02-agent-runner-interface]]), server-side only, consumed by `apps/web`.
  - `packages/ui` — shared React components, consumed by both `apps/web`'s frontend and `apps/desktop`'s bundle.
  - `packages/shared-types` — WS message schema ([[05-websocket-protocol]]), API contracts, domain types shared across both frontends and the server.
