# 17 — Playbook runs & ticket linkage

**What to build:** Tie a playbook run to a ticket, surface that run's history inline on the ticket detail view, and support ad-hoc runs (no saved playbook) alongside recipe-backed ones.

**Blocked by:** 16 — agent-call step + approval gate, 05 — Ticket views.

**Status:** ready-for-agent

- [ ] `playbook_runs.ticket_id` is populated when a run is triggered against a specific ticket.
- [ ] Ticket detail view shows an inline history panel of every `playbook_runs` row linked to it (bot, status, cost, timestamp).
- [ ] A ticket with zero runs against it renders the panel sensibly (empty state, not an error).
- [ ] An ad-hoc run (`playbook_id` null) works the same way as a recipe-backed one for linkage purposes — it can still be tied to a ticket.
- [ ] Triggering a run from a ticket's detail view (not just from the playbook library) is possible.
