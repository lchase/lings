# Lings — Architecture Spec

*(working name "bot-farm" retired — see Project naming decision below)*

## Problem Statement

Small teams and solo builders running coding agents today stitch together several disconnected tools: a project tracker for tickets, ad-hoc scripts or CI for automation recipes, whatever chat UI their agent vendor ships for spawning and monitoring agent sessions, and no shared, enforced rulebook for what agents are and aren't allowed to do. There's no single place to define a reusable "persona" (a bot with its own system prompt, tool access, and memory), wire it into a versioned automation recipe, watch it run against real tickets, and see its cost — all under one set of house rules every agent inherits.

## Solution

Lings is a self-hosted app (solo-or-small-team scale) that unifies five pillars in one product:

- **Playbooks** — versioned, lockable automation recipes built from chained steps (bash, agent calls, human approvals), triggered manually or on a schedule.
- **Project tracker** — a folder-organized ticket tracker (table/kanban/gantt/list views) that a playbook run can be tied to, with run history visible on the ticket.
- **Agent fleet/orchestration** — spawn, watch, and manage a fixed 2-level hierarchy of live agent sessions (manager + workers), with streaming output, status, and live cost.
- **Laws & permissions** — a folder-scoped, inherited markdown rulebook injected into every agent's system prompt.
- **Bots** — named, reusable personas (system prompt, tool/MCP allowlist, delegation allowlist, persistent memory) a user configures once and invokes repeatedly, deterministically (from a playbook step) or dynamically (via runtime delegation).

Two client surfaces share one server and one SQLite database: a web app, and a thin desktop wrapper (Tauri) that talks to the same remote API — no local server or database on desktop.

## User Stories

**Accounts & access**
1. As a user, I want to sign up with email + password, so that I have my own account on a self-hosted instance.
2. As a user, I want a long-lived login session, so that I'm not forced to re-authenticate constantly on a trusted, small-team tool.
3. As a user, I want the same login to work from both the web app and the desktop app, so that I don't manage separate credentials per client.

**Workspace / folders**
4. As a user, I want to organize tickets and rules into an arbitrarily nested folder tree (mirroring how my team organizes projects), so that I can scope things naturally (e.g. "Engineering / Backend").
5. As a user, I want any folder, not just "leaf" folders, to hold tickets directly, so that I'm not forced into an artificial group-vs-project distinction.

**Project tracker**
6. As a user, I want to view my tickets as a table, kanban board, gantt chart, or list, so that I can pick the view that fits how I'm currently working.
7. As a user, I want a ticket's status (Backlog/In Progress/QA/Done) to be something I set manually, so that a ticket's lifecycle reflects my own review judgment, not just agent activity.
8. As a user, I want to see the live status of any agent session currently working a ticket, distinct from the ticket's own manual status, so that I can tell "is someone running on this right now" at a glance.
9. As a user, I want to set planning start/due dates on a ticket for the Gantt view, so that I can schedule work independent of when an agent happens to run against it.
10. As a user, I want to see every playbook run that has ever touched a ticket (bot, status, cost, timestamp), inline on the ticket, so that I have a full audit trail without switching to the fleet view.

**Playbooks**
11. As a user, I want to build a playbook as a DAG of steps (not just a linear list), so that I can branch on success/failure.
12. As a user, I want three step types — a raw shell command, a call to a configured bot, and a human-approval gate — so that I can compose automation and judgment in one recipe.
13. As a user, I want to reference a prior step's stdout/stderr/exit code, a stored secret, or the run's trigger input inside a later step, via `{{...}}` interpolation, so that steps can pass data to each other.
14. As a user, I want secrets stored encrypted and scoped to a folder (with global fallback), so that I can manage credentials at the right granularity without them leaking into logs.
15. As a user, I want to lock a playbook so it can't be casually edited, and unlock it when I need to change it, so that stable recipes aren't accidentally broken mid-use.
16. As a user, I want editing an unlocked playbook to create a new version rather than mutate history, so that a run already in flight keeps behaving the way it did when it started.
17. As a user, I want to "Distill" an ad-hoc agent conversation into a brand-new playbook, so that I can formalize repeated manual work into a reusable recipe.
18. As a user, I want to trigger a playbook run manually or schedule it on a cron expression, so that recurring automation doesn't need me to click a button every time.
19. As a user, I want a scheduled run to be attributed to whoever created the playbook, so that there's a sensible identity behind runs nobody explicitly clicked.

**Agent fleet / sessions**
20. As a user, I want to watch an agent session's output stream live, token by token, so that I can follow along in real time.
21. As a user, I want to see a session's current status (idle, generating, waiting on my approval, errored, done), so that I know at a glance whether it needs me.
22. As a user, I want to see a session's live cost and context-window usage, so that I can catch a runaway or near-full-context session before it's a problem.
23. As a user, I want a manager agent to be able to spawn worker agents, but not have those workers spawn further workers, so that the fleet stays a bounded, comprehensible two-level hierarchy.
24. As a user, I want a hard spend cap on a session (configurable, defaulting from the bot's setting), so that a runaway session can't burn unbounded money before I notice.
25. As a user, I want every session — including a raw ad-hoc chat with no playbook — to require an explicit model choice (or a bot's configured default), so that I never accidentally run on the wrong-tier model.

**Laws & permissions**
26. As a user, I want to write a markdown rulebook that any agent working under a folder inherits (nearest-ancestor, falling back to a global doc), so that org-wide and project-specific rules coexist naturally.
27. As a user, I want that rulebook injected into an agent's instructions when its session starts, so that it actually shapes behavior rather than sitting unread.
28. As a user, I want a manager agent to flag a suspected rule violation (its own or a worker's) as a ticket comment, so that a human can review it, even though nothing technically blocks the action.

**Bots**
29. As a user, I want to create a named bot with its own system prompt, a flat allowlist of tools/MCP servers it can use, and a list of other bots it's allowed to delegate to, so that I can build reusable specialized personas.
30. As a user, I want to invoke a bot deterministically from a playbook step, so that a recipe always runs a known, fixed persona at that point.
31. As a user, I want a running bot to dynamically delegate to another bot at runtime (within its configured allowlist), so that agents can collaborate without every path being pre-wired into a playbook.
32. As a user, I want a default generic-assistant bot to exist out of the box, so that starting an ad-hoc chat doesn't require configuring a bot first.
33. As a user, I want each bot to have a distinctive generated avatar, and be able to regenerate it with one click, so that bots are visually distinguishable without me hunting for or uploading images.
34. As a user, I want a bot's config to also list which "skills" (packaged behavior/instruction sets, distinct from tools) are enabled for it, so that a Product Manager bot can default into grilling-style behavior while a UX Designer bot defaults into prototyping behavior.

**Bot memory**
35. As a user, I want a bot to be able to journal a learning about the world into its own persistent memory during a session, so that it improves the next time it's invoked.
36. As a user, I want that memory injected into the bot's system prompt on every future session start, so that it actually benefits from what it's learned.
37. As a user, I want to view, edit, or delete any bot's memory entries, so that I can curate what it "knows" and correct mistakes.

**Notifications**
38. As a user, I want a fleet-wide unread indicator that lights up when any session I have access to needs my attention (enters waiting-approval or errors), even if I'm not currently watching it, so that I don't have to babysit every open session.
39. As a desktop user, I want a native OS notification on top of the in-app badge for the same event, so that I notice even when the app isn't focused.
40. As a user, opening a session that has an unread flag should clear it, so that the badge reflects only genuinely-unseen events.

**Desktop app**
41. As a desktop user, I want a tray icon so the app can live in the background without an open window, so that I get ambient awareness without dedicating screen space.
42. As a desktop user, I want the app to auto-update in the background, so that I'm always on a current build without manually reinstalling.
43. As a desktop user, when the shared server is unreachable, I want a clear full-screen "can't connect" state rather than a stale or partially-broken UI, so that I never mistake old data for current state.

## Implementation Decisions

**Stack**: TypeScript, TanStack Start + Router + Query, SQLite via Drizzle/libSQL, WebSockets for live state, Better Auth (Drizzle adapter, bearer-token plugin) for basic email+password multi-user auth.

**Repo layout**: pnpm workspaces monorepo, no Turborepo (revisit if build times hurt). Root package `lings`.
- `apps/web` — full TanStack Start app: routes, server functions, the deploy target.
- `apps/desktop` — Tauri wrapper; frontend-only build against a configurable API base URL; no embedded server/DB.
- `packages/db` (`@lings/db`) — Drizzle schema + migrations.
- `packages/agent-runner` (`@lings/agent-runner`) — the `AgentRunner` interface + adapters, server-side only.
- `packages/ui` (`@lings/ui`) — shared React components used by both frontends.
- `packages/shared-types` (`@lings/shared-types`) — WS message schema, API contracts, domain types.
- The working repo directory is a filesystem rename from `bot-farm` to `lings` at build-phase handoff — not part of this spec's scope.

**Core data model** (entities + key FKs; full column sets are implementation detail):
- `users` — email+password accounts.
- `folders` — arbitrary-depth tree, `parent_id -> folders.id` (nullable = root). Any folder can hold tickets directly.
- `tickets` — `folder_id -> folders.id`; `status` (`backlog|in_progress|qa|done`, manual, fixed enum) and `start_date`/`due_date` (manual, Gantt) live here.
- `laws_docs` — `folder_id -> folders.id`, nullable = global default; free-text markdown `content`. Effective doc = nearest ancestor, walking toward root.
- `secrets` — `folder_id -> folders.id`, nullable = global; `name`, `encrypted_value` (server-held key env var for v1). Same nearest-ancestor resolution as `laws_docs`.
- `bots` — global (not folder-scoped): `name`, `description`, `system_prompt`, `tools_config` (flat tool/MCP allowlist), a delegation allowlist (bot ids it may spawn), `avatar_seed`, `default_model_tier`.
- `bot_memories` — `bot_id` FK, free-text `content`, `created_at`, `source_session_id`.
- `skills` — global: `name`, instruction body (markdown).
- `bot_skills` — join table, per-bot skill allowlist.
- `playbooks` — global, not folder-scoped; `cron_expression` (nullable = manual-only), `next_run_at`, `created_by -> users.id`.
- `playbook_versions` — snapshot of a playbook's steps/edges, created on every edit-and-save of an unlocked playbook.
- `playbook_steps` — `playbook_id -> playbooks.id` (versioned via `playbook_versions`); type `bash|agent-call|approval` plus type-specific config.
- `playbook_step_edges` — `from_step_id`/`to_step_id -> playbook_steps.id`, plus a `condition` column (branch predicate evaluated against the prior step's exit code/output).
- `playbook_runs` — `playbook_id` nullable (null = ad-hoc run), `version_id -> playbook_versions.id` (pins run to spawn-time version), `ticket_id -> tickets.id` nullable.
- `agent_sessions` — `playbook_run_id -> playbook_runs.id` (required — every session, including ad-hoc chat, hangs off a run), `parent_session_id -> agent_sessions.id` (nullable, self-FK; workers must have a non-null parent, workers cannot themselves have children — enforced at the app/interface layer, not the schema), `bot_id -> bots.id` (required; a seeded default bot covers the no-persona case).
- `session_unread` — `user_id`, `session_id`, `created_at`; one row per user with access, inserted when a session transitions to `waiting-approval`/`error`, deleted on view.

**AgentRunner interface** (`packages/agent-runner`), SDK/API-first, adapters out of scope for this spec:
```ts
interface AgentRunner {
  start(opts: StartOptions): AgentHandle;
}
interface StartOptions {
  playbookRunId: string;
  systemPrompt?: string;
}
type SessionStatus = 'idle' | 'generating' | 'waiting-approval' | 'error' | 'done';
interface AgentHandle {
  readonly sessionId: string;
  send(message: string): void;
  spawnChild(opts: StartOptions): AgentHandle; // throws if `this` is already a child
  stop(): void;
  on(event: 'delta', cb: (chunk: string) => void): void;
  on(event: 'status', cb: (status: SessionStatus) => void): void;
  on(event: 'cost', cb: (c: { tokensIn: number; tokensOut: number; costUsd: number; contextPct: number }) => void): void;
}
```
Push model: `start()` returns a handle; the server subscribes to its events and forwards them over WebSocket. Spawn lives on the handle (not a second `start()` call) so an adapter can hook a backend's native delegation if one exists; the handle self-refuses to spawn if it's already a child, enforcing the fixed 2-level hierarchy at the interface boundary, backstopped by the `parent_session_id` self-FK at the data layer. Cost is its own event, not bundled into `status`, so it can tick live during `generating`.

**Playbook step execution**: `bash` steps spawn a fresh host process per step (`spawnSync`, no persistent shell, no sandbox — trusted-team v1 posture); `agent-call` steps invoke `AgentRunner.start()` naming a `bot_id`; `approval` steps block the run, leaving any active session in `waiting-approval`. Interpolation (`{{steps.<id>.stdout|stderr|exitCode}}`, `{{secrets.<NAME>}}`, `{{run.input.<field>}}`) is resolved by string substitution at step-run time; `{{secrets.*}}` is injected as env vars, never logged in plaintext. No `{{vars.*}}` in v1.

**Laws & permissions enforcement**: the effective doc (nearest-ancestor resolution) is prepended into `systemPrompt` at `AgentRunner.start()`, once, at session start only — not re-injected per turn, not updated mid-session on doc edits (edit-then-restart is the escape hatch). No runtime compliance checking; the manager-level session is itself prompted (via its own laws text) to flag suspected violations as a ticket comment. Soft, LLM-driven nudge, not a technical gate.

**Auth**: Better Auth, opaque bearer token (DB-backed session row, not JWT), sent via `Authorization` header (not cookies, to keep cross-origin desktop access simple), stored in `localStorage` on both web and desktop. Long-lived token (30-90 day window), no silent refresh — re-login only on explicit logout or expiry.

**WebSocket protocol**: one multiplexed connection per tab; `{op:'subscribe'|'unsubscribe', sessionId}` control messages. First message after connect is `{op:'authenticate', token}` (bearer token, since WS upgrades can't carry custom headers from a browser). Server checks per-session access on `subscribe`. Discriminated-union server-to-client messages mapping 1:1 onto `AgentHandle` events: `{type:'status', sessionId, status, contextPct}`, `{type:'cost', sessionId, ...}`, `{type:'delta', sessionId, chunk}`, plus `{type:'unread'|'unread-clear', sessionId}` (broadcast to all of a user's connections regardless of subscribe list). No reconnect replay buffer — client refetches current state via REST then resumes live from "now." `status`/`cost`/`delta` patch the TanStack Query cache directly (`setQueryData`); `invalidate` is reserved for non-WS-covered changes. Token expiry is checked only at handshake — an already-open connection is not re-validated mid-session.

**Bots & delegation**: two invocation modes share one mechanism — a playbook's `agent-call` step names a fixed `bot_id` (deterministic), or a running bot calls `spawnChild()` at runtime restricted to its own delegation allowlist (dynamic); both stay inside the fixed 2-level hierarchy. Bot avatars are deterministic algorithmic low-poly SVGs generated client-side from a stored `avatar_seed` — no image-gen API call, no stored image blob; "regenerate" just picks a new random seed.

**Bot memory**: written via an explicit `remember(content)` tool call available to any bot (not automatic end-of-session summarization). Any authenticated user can view/edit/delete any bot's entries — no ownership/ACL concept anywhere on this map.

**SystemPrompt composition**: assembled in order — Laws → Bot's own system prompt → Skills → Memory — each section under a labeled markdown header (`## Laws`, `## Instructions`, `## Skills`, `## Memory`) rather than seamless prose, so provenance is distinguishable and the assembled prompt is inspectable. All four sections are injected once, at session start.

**Skills**: distinct from tools/MCP (a behavior/instruction toggle, not a function-call capability). Enabled skills' instruction text concatenates into `systemPrompt` at session start via the same mechanism as laws/bot-prompt/memory — no slash-command interpretation, since the SDK/API-first `AgentRunner` has no CLI harness underneath it.

**Cost/budget controls**: hard stop (or halt-to-`waiting-approval`) on a per-session spend cap, set at spawn and defaulting from the spawning bot's `default_model_tier`/cap config, overridable per spawn — the one place this spec breaks from the soft-nudge law pattern, since a runaway agent burning money is concrete bounded harm. No workspace-wide aggregate cap in v1. Session creation requires an explicit model value (bot default as fallback) — the server enforces that *a* choice is made; judging which tier fits a task stays a soft law.

**Playbook lifecycle**: any authenticated user may lock/unlock a playbook (no ownership). Editing an unlocked playbook creates a new row in `playbook_versions` rather than mutating steps/edges in place; a run pins to its spawn-time version via `playbook_runs.version_id`, so live edits never retroactively change an in-flight run. "Distill" creates a brand-new playbook from an ad-hoc session/conversation — it does not tighten or edit an existing playbook.

**Playbook triggering**: manual + cron-scheduled for v1 (event/webhook triggers out of scope — see below). `playbooks.cron_expression`/`next_run_at` (both nullable) plus `created_by`. An in-process interval poller inside `apps/web`'s Node server (e.g. a one-minute `setInterval`) queries due playbooks, spawns their runs, advances `next_run_at` — no separate worker infrastructure; only correct with exactly one server instance. A scheduled run is attributed to the playbook's `created_by` as initiator identity (auth scope, laws-doc resolution owner).

**Notifications**: unread fires only on a session's transition to `waiting-approval` or `error` (not plain status changes or streamed output) — both are "needs a human" states. Fleet-wide: covers every session the user has access to, not just subscribed ones. Push model via `session_unread` rows and the WS `unread`/`unread-clear` message types described above; clearing happens via a REST call on session view. Desktop additionally fires a native OS notification (Tauri notification API) on the same event; web stays in-app-badge only.

**Desktop app**: thin Tauri wrapper, no local server/DB, configurable remote API base URL. Native-chrome value-adds limited to a tray icon (background presence, minimize-to-tray) plus the OS notification above — no deep-link URL scheme in v1. Auto-update via Tauri's built-in updater plugin against a hosted static manifest. On server unreachable: full-screen blocking "can't reach server" state with retry, replacing the UI entirely (no stale data, no offline-first behavior); reconnect restores normal state, consistent with the WS protocol's no-replay/refetch-on-reconnect pattern.

**Naming**: the product is named **Lings** (a boss bot directs its lings — small-team framing, not a literal farm/swarm metaphor). Rename reaches package/repo naming (`lings`, `@lings/*`) as specified in Repo layout above, not just doc branding.

## Testing Decisions

This is a greenfield spec — there is no existing codebase, so there are no existing seams to test against or prior-art tests to point to in this repo. The build phase that consumes this spec should establish its own seams as modules land; the guidance below is what to aim for once code exists, not a description of anything present today.

- Prefer testing at module boundaries over internals: the `AgentRunner` interface (mock/fake adapter implementing the contract above, not a real LLM call), the WebSocket message layer (schema + fan-out/subscribe-authz behavior, not the underlying transport), and the playbook DAG execution engine (given a fixed set of steps/edges/conditions, does it visit the right steps in the right order) are the highest-value seams — each is a narrow interface with complex behavior behind it.
- `packages/agent-runner` should be tested against the `AgentRunner`/`AgentHandle` contract only — a test double standing in for a real backend (Claude, etc.), verifying the fixed-2-level spawn refusal, event shapes, and `stop()` semantics.
- `packages/db` schema/migrations should have round-trip tests for the folder-scoped nearest-ancestor resolution logic (`laws_docs`, `secrets`) — that's the one piece of non-trivial query logic named in this spec, worth pinning down directly.
- Playbook step interpolation (`{{steps.*}}`, `{{secrets.*}}`, `{{run.input.*}}`) and DAG-edge condition evaluation deserve direct unit coverage — they're pure functions over stored data and easy to get subtly wrong (e.g. secret leakage into logs, wrong step ordering on a branch).
- Avoid testing UI screens against real WebSocket/agent infrastructure; the query-cache patch logic (`status`/`cost`/`delta` → `setQueryData`) is the seam — verify cache state after a synthetic message, not that a real agent produced it.

## Out of Scope

- Event/webhook-triggered playbook runs (only manual + cron for v1).
- Per-tool/per-MCP granular permission scoping on a bot (flat allowlist only).
- Sandboxing or containerization of `bash` playbook steps (trusted-team, host-process execution).
- Any technical/automated enforcement of laws-doc rules (soft, LLM-prompted nudge only).
- Workspace-wide aggregate cost caps (only per-session caps).
- Silent token refresh / short-lived-token rotation (long-lived token only).
- Deep-link URL scheme for the desktop app.
- Offline-first functionality on desktop (disconnected state is block-and-retry, not degraded local operation).
- Image-gen-API-backed bot avatars (deterministic algorithmic SVG only).
- Ownership/ACL concepts anywhere in the system (bots, playbooks, memory, laws docs are all globally editable by any authenticated user).
- Multi-server/horizontally-scaled deployment (the cron poller and in-process assumptions require exactly one server instance).
- CLI-wrapping `AgentRunner` adapters (SDK/API-first only for this spec; adapter implementations of any kind are a later, separate concern).
- The filesystem rename of the working repo directory from `bot-farm` to `lings` (a build-phase action, not a planning decision).

## Further Notes

This spec was synthesized from a 21-ticket wayfinder map (`.scratch/bot-farm/map.md`) that resolved every surfaced decision and closed with no open fog. No code exists yet against this spec — it is a handoff document for a build-phase effort to plan and implement against, not a description of current system behavior. The next step for whoever picks this up is likely establishing the initial repo scaffold (per the Repo layout decision) and the Drizzle schema (per Core data model) before any feature work, since nearly every other decision depends on both.
