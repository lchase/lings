# 01 — Repo & tooling scaffold

**What to build:** Boot the pnpm workspace monorepo — `apps/web`, `apps/desktop`, `packages/{db,agent-runner,ui,shared-types}` — with an empty Drizzle/libSQL migration that runs cleanly, so every later ticket has somewhere to land code.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] `pnpm install` at repo root resolves all workspace packages.
- [ ] `apps/web` boots a bare TanStack Start dev server (empty route is fine).
- [ ] `apps/desktop` has a Tauri project scaffold that builds (pointed at a placeholder API base URL config).
- [ ] `packages/db` has a Drizzle config and one migration (even if it only creates a placeholder table) that applies to a local SQLite file.
- [ ] `packages/agent-runner`, `packages/ui`, `packages/shared-types` exist as empty-but-buildable TypeScript packages, importable from `apps/web`.
- [ ] Root package is named `lings`; scoped packages are named `@lings/db`, `@lings/ui`, `@lings/agent-runner`, `@lings/shared-types`.
