Type: grilling
Status: resolved
Blocked by: 01

## Question

Spec the playbook step model: what step types v1 supports (bash, at minimum — decide which others: LLM-call, HTTP, git, wait/approval, etc), the inputs/secrets/variable-interpolation contract (`{{...}}` syntax seen in the reference screenshot), how a step's outputs (stdout/stderr/exitCode) chain into "next steps," and how host-process execution (already locked, trusted-team, no sandbox) is invoked from the server.

## Answer

**Step types (v1):** `bash | agent-call | approval`.
- `bash` — host process, spawned per step (see invocation below).
- `agent-call` — spawns an `AgentRunner` session as a step ([[02-agent-runner-interface]]'s `start()`); this is the "LLM-call" type, folded into the agent hierarchy rather than being a separate concept.
- `approval` — blocks the run pending human sign-off; the spawned `agent_sessions` row (if any is active at that point) sits in `waiting-approval` status ([[02-agent-runner-interface]]) until resolved.
No dedicated `http`/`git` types — those are `bash` one-liners (`curl`, `git ...`) for v1.

**Interpolation contract** (`{{...}}`), resolved at step-run time by string substitution before dispatch:
- `{{steps.<stepId>.stdout|stderr|exitCode}}` — prior step's captured output. Only steps reachable via an incoming edge chain are valid references (enforced at playbook-save time, not runtime).
- `{{secrets.<NAME>}}` — resolved from the `secrets` table (see below), injected as env vars for `bash` steps, never written to `agent_sessions`/logs in plaintext.
- `{{run.input.<field>}}` — the `playbook_runs` trigger payload (manual form fields, or webhook/schedule payload once [[trigger mechanism]] is decided).
No playbook-level `{{vars.*}}` in v1 — reuse via `{{run.input.*}}` or hardcoding for now.

**Secrets storage:** new `secrets` table — `id, folder_id (nullable = global), name, encrypted_value, updated_at`. Encrypted at rest with a server-held key (env var for v1; KMS/rotation is a later concern). Scoped like `laws_docs` — nearest-ancestor-in-tree resolution, global fallback, consistent with [[01-core-data-model]]'s folder-scoping pattern. This closes the map's "Secrets management mechanism" fog item.

**Chaining:** step outputs are captured (`stdout`, `stderr`, `exitCode`) and stored per step-run; the DAG edges from [[01-core-data-model]] (`playbook_step_edges`, with a `condition` column) determine which step(s) run next — an edge's `condition` is evaluated against the just-finished step's exit code / output (e.g. `on_success`, `on_failure`, or an interpolated boolean expression; exact condition grammar deferred as schema/engine detail, not blocking).

**Host-process invocation:** spawn-per-step, not a persistent shell. Each `bash` step runs as `spawnSync(interpolatedCommand, { cwd: run.workdir, env: { ...process.env, ...resolvedSecrets } })`; no shell state persists between steps except what's explicitly threaded through `{{steps.*}}` interpolation. Matches the already-locked trusted-team/no-sandbox posture — no container/jail per step.

**Extended by** [[15-playbook-lifecycle]]: `playbook_steps`/`playbook_step_edges` are versioned snapshots under a new `playbook_versions` table, not directly-mutable rows owned by `playbooks.id` alone — an unlocked edit-and-save creates a new version rather than mutating in place.
