# 18 — Playbook triggering (cron)

**What to build:** Schedule a playbook to run on a cron expression, fired unattended by an in-process poller — no separate worker infrastructure.

**Blocked by:** 16 — agent-call step + approval gate.

**Status:** ready-for-agent

- [ ] `playbooks` gains `cron_expression` (nullable = manual-only), `next_run_at`, `created_by -> users.id`.
- [ ] Setting a cron expression on a playbook computes and stores its `next_run_at`.
- [ ] An in-process interval poller inside the web server's process queries due playbooks (e.g. every minute) and spawns their runs, then advances `next_run_at`.
- [ ] A scheduled run's `playbook_runs` row and any spawned `agent_sessions` are attributed to the playbook's `created_by` as initiator identity.
- [ ] Setting `cron_expression` back to null stops future automatic firing.
