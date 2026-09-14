# 08 — WebSocket protocol + live fleet view

**What to build:** A single multiplexed WebSocket connection per browser tab, authenticated with the bearer token, that pushes `status`/`cost`/`delta` events for subscribed sessions straight into the TanStack Query cache. A fleet view lets a user start a mock agent session (via the ticket 07 adapter) and watch it live.

**Blocked by:** 02 — Auth, 07 — AgentRunner interface + mock adapter, 04 — Design system & style guide.

**Status:** ready-for-agent

- [ ] `agent_sessions` table exists (minimal columns: id, status, cost fields — full shape can extend later).
- [ ] Client opens one WS connection per tab; first message is `{op:'authenticate', token}`; server validates against the session-token table before accepting further messages.
- [ ] Client sends `{op:'subscribe'|'unsubscribe', sessionId}`; server checks the user has access to that session before adding it to the fan-out list.
- [ ] Server forwards a started mock session's `status`/`cost`/`delta` events as `{type:'status'|'cost'|'delta', sessionId, ...}` discriminated-union messages.
- [ ] Client applies `status`/`cost`/`delta` messages via direct `setQueryData` cache patches, not `invalidate`.
- [ ] Fleet view: starting a session shows its live status, cost, and streamed output update in real time without a manual refresh.
- [ ] On reconnect, client refetches current session state via REST and resumes the live stream — no replay of missed events.
