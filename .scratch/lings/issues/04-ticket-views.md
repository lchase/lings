# 04 — Ticket views (kanban/gantt/list)

**What to build:** The same tickets from the table view, rendered as a kanban board, a gantt chart, and a list — same underlying data, three lenses.

**Blocked by:** 03 — Folders & tickets.

**Status:** ready-for-agent

- [ ] Kanban view: one column per `status` value, drag-and-drop (or equivalent) moves a ticket between columns and persists the change.
- [ ] Gantt view: bars positioned from `start_date`/`due_date`; a ticket missing either date renders sensibly (no crash, clear placeholder).
- [ ] List view: a compact, dense listing of the same tickets.
- [ ] All three views read from the same ticket data — a status change made in kanban shows up in table/list without a manual refresh (or documents why not, e.g. requires reload).
