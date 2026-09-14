# 13 — Playbooks: CRUD/DAG editor, lock/versioning

**What to build:** A global, reusable playbook library — build a DAG of steps (bash and approval types only for this ticket; agent-call comes in ticket 16), lock/unlock a playbook, and have an edit-while-unlocked create a new version rather than mutate history.

**Blocked by:** 03 — Folders & tickets, 04 — Design system & style guide.

**Status:** ready-for-agent

- [ ] `playbooks`, `playbook_versions`, `playbook_steps`, `playbook_step_edges` tables, per the spec's shape (steps/edges live under a version snapshot, not directly on `playbooks.id`).
- [ ] User can create a playbook and add `bash` and `approval` steps, wiring edges between them with a `condition` (e.g. on_success/on_failure).
- [ ] Any authenticated user can lock/unlock a playbook (no ownership check).
- [ ] Editing an unlocked playbook's steps/edges and saving creates a new row in `playbook_versions` rather than mutating the previous one in place.
- [ ] A playbook can be listed/browsed — confirms the library holds more than one, since playbooks are org-wide and unlimited in count.
