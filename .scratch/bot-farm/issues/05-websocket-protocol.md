Type: grilling
Status: resolved
Blocked by: 01, 02

## Question

Spec the WebSocket protocol: message schema for pushing live agent state (status, cost, context%, streamed output) from server to client, connection auth (how a WS connection ties to a logged-in user), and how it maps onto TanStack Query's cache (invalidate-on-message vs direct cache writes).

## Answer

- **Connection topology**: one multiplexed WS connection per browser tab. Client sends `{op: 'subscribe', sessionId}` / `{op: 'unsubscribe', sessionId}` control messages over it as the user navigates or fleet view adds/drops watched sessions. No per-session sockets.
- **Auth** (amended, see [[07-auth-implementation]]): auth landed on a bearer token via `Authorization` header, not a cookie — cross-origin desktop client ([[06-repo-structure]]) made cookie/CORS handling not worth it. WS carries this instead: client sends `{op: 'authenticate', token}` as the first message right after the connection opens (WS upgrade requests can't carry custom headers from a browser/webview), server validates against the same session-token table before accepting any `subscribe` messages on that connection.
- **Subscribe authz**: on `subscribe`, server checks the requesting user has access to that `sessionId` (same rule as the HTTP routes) before adding it to the fan-out list; reject/ignore otherwise.
- **Message schema**: single discriminated union, `type` field switches payload shape — one parser on the client, easy to extend later. Server-to-client event types map 1:1 onto `AgentHandle`'s events ([[02-agent-runner-interface]]):
  - `{type: 'status', sessionId, status, contextPct}` — status enum change; `contextPct` folded in here (not a separate event) since it updates alongside status as a running gauge, not a discrete transition.
  - `{type: 'cost', sessionId, costUsd, ...}`
  - `{type: 'delta', sessionId, chunk}` — streamed output token/chunk.
- **Reconnect/backfill**: no replay buffer, no sequence numbers. On reconnect, client refetches current state via normal REST/query (session status + transcript-so-far), then resumes live stream from "now"; anything missed during the drop is discarded, not replayed. Trusted-team v1 tool, drops are rare and cheap to recover from.
- **TanStack Query integration**: `status`/`cost`/`delta` messages all go through direct `queryClient.setQueryData` patches — `status`/`cost` merge fields into the cached session object, `delta` appends to the cached transcript array. Never a plain `invalidate` for these three, to avoid a refetch storm on token-by-token deltas. `invalidate` stays reserved for non-WS-covered changes (e.g. a ticket edited elsewhere).
