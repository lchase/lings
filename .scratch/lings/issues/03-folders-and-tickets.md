# 03 — Folders & tickets

**What to build:** An arbitrary-depth folder tree, and tickets that live directly in any folder (no leaf-vs-group distinction). A logged-in user can create nested folders and create/edit tickets inside them, viewed as a plain table.

**Blocked by:** 02 — Auth.

**Status:** ready-for-agent

- [ ] `folders` table with self-referencing `parent_id` (nullable = root).
- [ ] `tickets` table with `folder_id` FK, plus `status` (`backlog|in_progress|qa|done`) and `start_date`/`due_date` columns.
- [ ] User can create a folder under any existing folder (or at root), producing an arbitrarily deep tree.
- [ ] Any folder — not just "leaf" ones — can hold tickets directly.
- [ ] User can create/edit a ticket (title, description, status, dates) inside a chosen folder.
- [ ] A table view lists tickets scoped to a folder (and its descendants, or the whole tree — pick one and note it), showing status and dates.
