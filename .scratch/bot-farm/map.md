Status: closed

## Destination

An architecture/spec doc for **Lings** (working name "bot-farm" retired — see [[21-project-naming]]), a self-hosted (solo-or-small-team) coding agent app. The spec covers the four pillars seen in the reference screenshots — **playbooks** (versioned automation recipes), **project tracker** (issues, table/kanban/gantt/list), **agent fleet/orchestration** (spawn, monitor, cost), **laws & permissions** (a shared rulebook every agent inherits) — plus a fifth: **bots** (named, custom-configured contexts — system prompt, tool/MCP access, delegation ability — a user selects and starts tasks with, each with its own persistent memory). Two client surfaces: a web app and a desktop app (thin native shell, shared remote server — no local server/DB on desktop). No code gets written against this map — it hands off to a build-phase effort once the way is clear.

## Notes

- Stack locked: TypeScript, TanStack Start + Router + Query, SQLite via Drizzle/libSQL, WebSockets for live state, basic email+password multi-user auth.
- Agent backend: abstracted `AgentRunner` interface, SDK/API-first (CLI-wrapping adapters are a later concern, not this spec).
- Hierarchy: fixed 2-level (manager spawns workers; workers do not spawn further) — holds for both deterministic playbook `agent-call` steps and dynamic bot-to-bot delegation.
- Bots are global/org-wide, not folder-scoped (like playbooks, unlike laws docs); flat tool/MCP allowlist per bot, no granular per-tool scoping.
- Playbook steps execute as host processes — trusted-team model, no sandboxing in v1.
- Use `/grilling` and `/domain-modeling` for ticket work unless a ticket says otherwise.
- Repo: pnpm workspaces monorepo (no Turborepo yet). `apps/web` (TanStack Start, server+client), `apps/desktop` (Tauri wrapper, frontend-only build against configurable API base URL), `packages/db`, `packages/agent-runner`, `packages/ui`, `packages/shared-types`.
- Product name: Lings. Root package `lings`, scoped packages `@lings/db`, `@lings/ui`, `@lings/agent-runner`, `@lings/shared-types`; `apps/web`/`apps/desktop` folder names unchanged (build-target names, not branding). Working repo folder still physically named `bot-farm` — rename is a filesystem action for the build phase, not this map.

## Decisions so far

- [Core data model](issues/01-core-data-model.md) — arbitrary-depth `folders` tree holds tickets directly; laws docs scoped per-folder (nearest-ancestor resolution, global fallback); playbook steps chain via DAG edges not linear order; every agent session hangs off a `playbook_runs` row (nullable `playbook_id` covers ad-hoc/no-recipe runs), self-FK for manager/worker spawn.
- [AgentRunner interface](issues/02-agent-runner-interface.md) — push-model `start()` returns an event-emitting `AgentHandle` (`delta`/`status`/`cost` events); status enum `idle|generating|waiting-approval|error|done`; spawn is `handle.spawnChild()`, self-refusing if already a child.
- [Playbook step model](issues/03-playbook-step-model.md) — step types `bash|agent-call|approval`; `{{steps.*}}`/`{{secrets.*}}`/`{{run.input.*}}` interpolation, no playbook-level vars; secrets live in a folder-scoped encrypted `secrets` table; edge `condition` column decides DAG branching; bash steps spawn per-step (no persistent shell).
- [Laws & permissions](issues/04-laws-and-permissions.md) — free-text markdown doc, injected into `systemPrompt` once at session start only (no re-injection per turn); violations get no technical enforcement, just a soft nudge where the manager session flags suspected breaks as a ticket comment.
- [WebSocket protocol](issues/05-websocket-protocol.md) — single multiplexed connection per tab with subscribe/unsubscribe control messages; auth via first-message bearer token (amended by [[07-auth-implementation]], was cookie-based); discriminated-union message schema mapping 1:1 onto `AgentHandle`'s status/cost/delta events (context% folded into `status`); no reconnect replay buffer (client just refetches + resumes); status/cost/delta all patch TanStack Query cache directly, never invalidate.
- [Repo structure](issues/06-repo-structure.md) — pnpm workspaces monorepo, no Turborepo; `apps/web` + `apps/desktop` (Tauri, thin client bundling its own frontend build) + `packages/{db,agent-runner,ui,shared-types}`. Surfaced desktop app as real scope, not just web.
- [Auth implementation](issues/07-auth-implementation.md) — Better Auth (Drizzle adapter + bearer plugin); DB-backed opaque bearer token via `Authorization` header, not cookies (desktop's cross-origin API made cookies painful); `localStorage` token storage on both web and desktop. Invalidated WS protocol's cookie-auth answer, amended there.
- [Bot entity model](issues/08-bot-entity-model.md) — new global `bots` table (name, description, system prompt, flat tool/MCP allowlist, per-bot delegation allowlist); `agent_sessions.bot_id` required (seeded default bot covers no-persona case); deterministic invocation via playbook `agent-call` steps vs dynamic runtime delegation via `spawnChild()`, both staying inside the locked fixed-2-level hierarchy. Surfaced "bots" as a fifth pillar.
- [Agent memory model](issues/09-agent-memory-model.md) — structured `bot_memories` table (not a blob), full dump into `systemPrompt` once at session start (same pattern as laws docs); writes via an explicit `remember()` tool call (not auto-summarization); any authenticated user can view/edit/forget any bot's entries (no ownership/ACL introduced).
- [Overall UI prototype](issues/10-overall-ui-prototype.md) — static multi-artboard mockup (`/design`) of all five pillar screens plus shared nav, dark terminal aesthetic matching the reference screenshots.
- [Bot avatar generation](issues/11-bot-avatar-generation.md) — deterministic algorithmic low-poly SVG from a seed (no image-gen API call); `bots.avatar_seed` stored, SVG recomputed client-side on every render; regenerate = new random seed.
- [Bot skills config](issues/12-bot-skills-config.md) — skills are a distinct concept from tools/MCP (not folded into `tools_config`): global `skills` table + `bot_skills` allowlist join, instruction text injected into `systemPrompt` upfront at session start (same pattern/injection point as laws/bot-prompt/memory), not a callable mid-session tool.
- [Project naming](issues/21-project-naming.md) — the project is named **Lings** (retiring the "bot-farm" working name); rename reaches repo/package names (`lings`, `@lings/*`), not just doc branding. Working directory itself still needs a filesystem rename at build-phase handoff.
- [Ticket tracker views](issues/13-ticket-tracker-views.md) — `tickets.status` is a manual fixed-enum lifecycle (`backlog|in_progress|qa|done`), separate from the live `agent_session.status` badge shown alongside it; `start_date`/`due_date` are manual Gantt fields, not derived from run timestamps; ticket detail gets an inline `playbook_runs` history panel.
- [Cost/budget controls](issues/14-cost-budget-controls.md) — hard stop (or halt-to-approval) on a per-session spend cap, breaking from the soft-nudge pattern elsewhere; no workspace-wide aggregate cap yet. Model-tier choice is a bot-level `default_model_tier` fallback (session creation requires an explicit model, defaulting from the bot) — the server enforces that a choice is made, the judgment of which tier stays a soft law.
- [Playbook lifecycle](issues/15-playbook-lifecycle.md) — any authenticated user can lock/unlock (no ownership concept); real versioning via a new `playbook_versions` table snapshotting steps/edges on edit-and-save, `playbook_runs.version_id` pins each run to its spawn-time version so live edits never retroactively change an in-flight run; "Distill" turns an ad-hoc session into a brand-new playbook, not a tightening of an existing one.
- [Notifications & unread semantics](issues/16-notifications-unread.md) — unread fires on `waiting-approval`/`error` status transitions only, fleet-wide (not just subscribed sessions); new `session_unread` table + `{type:'unread'/'unread-clear'}` WS broadcast amending [[05-websocket-protocol]]; desktop adds a native OS notification on top of the shared in-app badge.
- [Playbook triggering](issues/17-playbook-triggering.md) — manual + cron-scheduled runs for v1 (event/webhook triggers stay fog); `playbooks` gains nullable `cron_expression`/`next_run_at` + `created_by`; an in-process interval poller in `apps/web` fires due runs (no new worker infra); scheduled runs attributed to the playbook's creator as initiator identity.
- [Desktop app specifics](issues/18-desktop-app-specifics.md) — tray icon + OS notifications as the only native-chrome value-adds (no deep links); Tauri's built-in updater plugin for auto-update; full-screen blocking disconnected state (no stale UI, no offline-first) when the server is unreachable.
- [Token lifecycle](issues/19-token-lifecycle.md) — long-lived bearer token (30-90 day window), no silent refresh; open WS connections aren't re-checked against expiry mid-session, only at handshake.
- [SystemPrompt composition order](issues/20-systemprompt-composition-order.md) — concatenation order Laws → Bot prompt → Skills → Memory; each section gets a labeled markdown header (`## Laws` etc.), not seamless prose.

## Not yet specified

(none — no open child tickets remain)

## Out of scope

(none yet)
