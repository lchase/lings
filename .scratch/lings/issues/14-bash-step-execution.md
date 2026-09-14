# 14 — Bash step execution

**What to build:** Run a playbook made entirely of `bash` (and `approval`) steps end to end: each step spawns a fresh host process, captures stdout/stderr/exitCode, and the DAG edge `condition` decides which step runs next.

**Blocked by:** 13 — Playbooks: CRUD/DAG editor, lock/versioning.

**Status:** ready-for-agent

- [ ] `playbook_runs` table: `playbook_id` (nullable), `version_id` FK pinning to the version current at spawn time, `ticket_id` (nullable, unused until ticket 17).
- [ ] Triggering a run of a bash-only playbook spawns each step as its own host process (`spawnSync`-style — no persistent shell, no sandbox).
- [ ] Each step's stdout/stderr/exitCode is captured and stored per step-run.
- [ ] An edge's `condition` is evaluated against the just-finished step's exit code/output to pick the next step(s) — a branching bash-only playbook (e.g. on_success vs on_failure paths) resolves correctly.
- [ ] An `approval` step blocks the run until resolved (resolution can be a bare "approve" action for this ticket — full session `waiting-approval` wiring lands in ticket 16).
- [ ] The run's overall progress/step outputs are viewable somewhere (even a simple run-detail page).
