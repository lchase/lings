# 19 — Notifications (web)

**What to build:** A fleet-wide unread badge that lights up when any session the user has access to transitions to `waiting-approval` or `error`, even if it's not currently subscribed/open, and clears when the user views that session.

**Blocked by:** 07 — WebSocket protocol + live fleet view.

**Status:** ready-for-agent

- [ ] `session_unread` table: `user_id`, `session_id`, `created_at`.
- [ ] A session transitioning to `waiting-approval` or `error` inserts a row for every user with access to it — not just users currently subscribed to it over WS.
- [ ] New WS message types `{type:'unread', sessionId}` / `{type:'unread-clear', sessionId}` broadcast to all of a user's active connections, regardless of that connection's subscribe list.
- [ ] The web UI shows a fleet-wide unread count/badge that updates live from these messages.
- [ ] Viewing a session with an unread flag clears it via a REST call, deleting the row and firing the clear event.
- [ ] A plain status change (e.g. `idle` → `generating`) does not trigger an unread event.
