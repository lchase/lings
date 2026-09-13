Type: grilling
Status: resolved
Assignee: lawrence.rjw.chase@gmail.com

## Question

Spec notifications / unread-count semantics for sessions, e.g. the reference screenshot's "Watching" status and unread badges: what marks a session unread (a status change, a `waiting-approval` transition, new output since last viewed?), does this ride the existing WebSocket protocol ([[05-websocket-protocol]]) as another patched query-cache field or need its own mechanism, and does the desktop app ([[06-repo-structure]]) get native OS notifications for this or just an in-app badge.

## Answer

- **Badge scope**: all sessions the user has access to, not just ones with a live WS subscription — a fleet-wide unread count, so background sessions not currently open in any view still surface.
- **Unread trigger**: a session's status transitioning to `waiting-approval` or `error` (from [[02-agent-runner-interface]]'s status enum). Not plain status changes, not new streamed output — both are passive/expected and would make the badge noisy. Both `waiting-approval` and `error` are "needs a human" states, same urgency class.
- **Storage**: new `session_unread` table (`user_id`, `session_id`, `created_at`), one row inserted per user with access when a session hits `waiting-approval`/`error`. Not derived-on-read from a `last_viewed_at` timestamp — a push model keeps list fetches cheap and gives a real event to drive the badge/notification.
- **Wire mechanism**: amends [[05-websocket-protocol]] — its `subscribe`/`unsubscribe` model only pushes to sessionIds a connection explicitly subscribed to. Unread events broadcast to *all* of a user's active WS connections regardless of subscribe list: new `{type: 'unread', sessionId}` / `{type: 'unread-clear', sessionId}` message types, additive to the existing discriminated union. Clearing happens via a REST call when the user opens/views the session, deleting the row and firing the clear event.
- **Desktop** ([[06-repo-structure]]): fires a native OS notification (Tauri notification API) on the `unread` event, in addition to the in-app badge — the payoff for running a thin desktop shell (background awareness without a tab open). Web stays in-app-badge only; browser push notifications are a heavier permission flow, out of scope for v1.
