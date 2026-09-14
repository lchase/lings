# 22 — Distill

**What to build:** Turn a finished ad-hoc agent session/conversation into a brand-new reusable playbook — formalizing informal manual work into a formal DAG recipe.

**Blocked by:** 13 — Playbooks: CRUD/DAG editor, lock/versioning, 17 — Playbook runs & ticket linkage.

**Status:** ready-for-agent

- [ ] A "Distill" action is available from a finished ad-hoc session (or its `playbook_runs` row where `playbook_id` is null).
- [ ] Running Distill creates a brand-new `playbooks` row (with its own `playbook_versions`/`playbook_steps`/`playbook_step_edges`) — it never edits or tightens an existing playbook.
- [ ] The resulting playbook is immediately visible and editable in the playbook library like any other.
- [ ] Distilling the same ad-hoc session twice produces two independent playbooks, not a shared/linked one.
