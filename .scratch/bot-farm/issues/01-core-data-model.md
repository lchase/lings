Type: grilling
Status: resolved

## Question

Design the core data model (entities + relations) spanning all four pillars: users/accounts, workspace/project hierarchy (the "Projects / scape / Engineering / ..." nested-folder breadcrumb seen in the reference screenshots), tickets (project tracker), playbooks + playbook steps, agent sessions/runs (including parent-child spawn links), and the laws/permissions doc. Cover just enough to name tables and their key relations/foreign keys — not full column-level schema.

## Answer

Entities and key relations (table names, FKs only — no full columns):

- `users` — accounts. Basic email+password.
- `folders` — arbitrary-depth workspace tree. `folders.parent_id -> folders.id` (nullable = root). Any node can hold tickets directly (no group-vs-project type distinction).
- `tickets` — project tracker items. `tickets.folder_id -> folders.id`.
- `laws_docs` — laws/permissions text, scoped to the tree. `laws_docs.folder_id -> folders.id`, **nullable = global default**. Effective law for an agent = nearest ancestor's doc, walking up from its folder toward root (global as fallback).
- `playbooks` — versioned automation recipes. Not tied to a folder for v1 (org-wide recipe library; assignment to a folder is fog, not decided here).
- `playbook_steps` — one row per step. `playbook_steps.playbook_id -> playbooks.id`. Step type/config/secrets-ref live in columns not detailed here (see [[03-playbook-step-model]]).
- `playbook_step_edges` — DAG chaining. `from_step_id -> playbook_steps.id`, `to_step_id -> playbook_steps.id`, plus a `condition` column (branch predicate, shape deferred to [[03-playbook-step-model]]).
- `playbook_runs` — one row per execution (scheduled, manual, or ad-hoc). `playbook_runs.playbook_id -> playbooks.id`, **nullable** — an ad-hoc run (no saved recipe) is just a run with no playbook. `playbook_runs.ticket_id -> tickets.id`, nullable — a run may or may not be tied to a ticket.
- `agent_sessions` — one row per spawned agent. `agent_sessions.playbook_run_id -> playbook_runs.id`, **required** — every session, including ad-hoc chats, hangs off a run (ad-hoc chat = run with null `playbook_id`). `agent_sessions.parent_session_id -> agent_sessions.id`, nullable, self-FK for the fixed 2-level manager/worker spawn (workers must have a non-null parent; workers' own children are disallowed at the app layer, not the schema).

Chain for a fully automated flow: `folders -> tickets -> playbook_runs -> agent_sessions`, with `playbook_runs -> playbooks -> playbook_steps -> playbook_step_edges` as the recipe side. Ad-hoc flow collapses to `tickets(optional) -> playbook_runs(playbook_id=null) -> agent_sessions`.

Deferred to later tickets: full column sets per table (out of scope for this ticket), step type/secrets shape ([[03-playbook-step-model]]), whether `playbooks` ever gets scoped to a folder (fog).

**Extended by** [[15-playbook-lifecycle]]: a new `playbook_versions` table sits between `playbooks` and `playbook_steps`/`playbook_step_edges` (each edit-and-save snapshots a version rather than mutating rows in place); `playbook_runs` gains a `version_id` FK pinning it to the version that was current when the run was spawned.
