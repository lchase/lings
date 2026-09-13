Type: grilling
Status: resolved

## Question

Spec the ticket tracker views: which fields Table/Kanban/Gantt/List each actually need (Kanban needs a status/column field, Gantt needs start/due dates, etc. — what does a `tickets` row carry beyond what [[01-core-data-model]] already named?), and how a ticket links to the playbooks/agent runs that touch it (a ticket can have zero or more `playbook_runs` against it per [[01-core-data-model]] — does the tracker UI surface that history inline on the ticket, and does a ticket's status auto-update from run/session state or stay manually set?).

## Answer

- **Status is two fields, not one**: `tickets.status` is a manually-set lifecycle field (Kanban column) — `backlog|in_progress|qa|done`, a fixed shared enum, not per-folder configurable. It is independent of any agent activity (a ticket can sit in Backlog with zero runs, or move to Done after human review of merged work). Separately, Table/Kanban cards also surface the ticket's most recent/active `agent_session.status` ([[02-agent-runner-interface]]) as a live badge — the two never get conflated into one field.
- **Gantt fields**: `tickets.start_date` / `tickets.due_date`, manually set by the user (planning dates). Not derived from linked `playbook_runs` timestamps — a ticket can have zero, one, or many runs against it over time, so deriving a planning bar from run history would conflate "scheduled" with "when an agent happened to run," and breaks for a not-yet-run ticket.
- **Run history on the ticket**: the ticket detail view shows an inline history panel listing its linked `playbook_runs` (bot, status, cost, timestamp) — the tracker surfaces the ticket↔run relationship directly rather than leaving it only visible from the fleet/session view.
