# 06 — Laws & permissions

**What to build:** A free-text markdown laws doc scoped to a folder (or global, as fallback), with nearest-ancestor resolution: given any folder, find the effective doc by walking up the tree toward root, falling back to the global doc if none is found along the way.

**Blocked by:** 03 — Folders & tickets.

**Status:** ready-for-agent

- [ ] `laws_docs` table with `folder_id` FK, nullable (null = global default), and a markdown `content` column.
- [ ] User can create/edit a laws doc scoped to a specific folder, and a separate global doc (no folder).
- [ ] Given a folder with no doc of its own, resolution walks up its ancestors and returns the nearest one that has a doc.
- [ ] Given a folder tree with no doc anywhere in its ancestry, resolution falls back to the global doc.
- [ ] A read view shows, for any selected folder, which doc is currently effective for it (and ideally where it came from).
