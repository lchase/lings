# 20 — Desktop app

**What to build:** The Tauri desktop wrapper as a real client — frontend-only build against a configurable remote API base URL, tray icon, auto-update, a disconnected state, and native OS notifications on the same unread event as ticket 19.

**Blocked by:** 02 — Auth, 07 — WebSocket protocol + live fleet view, 19 — Notifications (web).

**Status:** ready-for-agent

- [ ] `apps/desktop` builds a frontend-only bundle that talks to a configurable remote API base URL — no local server or DB.
- [ ] Login, fleet view, and WS live updates all work identically to web from inside the desktop shell.
- [ ] A tray icon is present; the app can minimize to tray and be reopened from it.
- [ ] Tauri's built-in updater plugin is wired against a hosted static manifest (a stub/local manifest is fine for this ticket) — an update check runs without crashing.
- [ ] When the shared server is unreachable, the UI is replaced by a full-screen "can't reach server" state with retry — no stale data left visible.
- [ ] Reconnecting restores the app to normal state without a manual restart.
- [ ] The `unread` WS event (ticket 19) fires a native OS notification in addition to the in-app badge.
