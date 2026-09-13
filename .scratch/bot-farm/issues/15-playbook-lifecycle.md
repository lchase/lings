Type: grilling
Status: resolved

## Question

Spec playbook lifecycle features seen in the reference screenshots: locking/unlocking (who can unlock, and does unlocking require a reason/audit trail), versioning (does editing a locked-then-unlocked playbook create a new version or mutate in place — affects in-flight `playbook_runs` per [[01-core-data-model]]), and the "Distill" action (what does it actually do — summarize the playbook, generate docs from it, something else?).

## Answer

- **Locking**: any authenticated user can lock/unlock a playbook — no ownership/ACL concept, consistent with everything else on this map (bots are an unowned global library, any user can edit memory).
- **Versioning**: real versioning, since Destination already calls playbooks "versioned automation recipes." New `playbook_versions` table snapshots a playbook's `playbook_steps`/`playbook_step_edges` on each edit-and-save; `playbook_runs.version_id` pins to whichever version was current at spawn time, so editing an unlocked playbook never retroactively changes an in-flight run's behavior. **Extends** [[01-core-data-model]] and [[03-playbook-step-model]] — steps/edges are now versioned snapshots, not directly-mutable rows owned by `playbooks.id` alone.
- **Distill**: turns an ad-hoc agent session/conversation into a brand-new reusable playbook — formalizes informal, repeated manual work into a formal DAG recipe, rather than tightening/optimizing an existing playbook's own steps.
