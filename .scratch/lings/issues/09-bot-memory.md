# 09 — Bot memory

**What to build:** A bot can journal a learning mid-session via an explicit `remember(content)` tool call, and a user can view, edit, or delete any bot's memory entries.

**Blocked by:** 08 — Bots: entity + ad-hoc chat.

**Status:** ready-for-agent

- [ ] `bot_memories` table: `bot_id` FK, free-text `content`, `created_at`, `source_session_id`.
- [ ] The bot's tool allowlist includes a `remember(content)` function; calling it during a session inserts a new memory row attributed to that session.
- [ ] A bot's memory list is viewable (e.g. from the bot's detail/edit view).
- [ ] Any authenticated user can edit or delete any memory entry (no ownership/ACL check).
- [ ] Deleting an entry removes it permanently — a later session no longer sees it.
