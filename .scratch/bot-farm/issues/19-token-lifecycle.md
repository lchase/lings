Type: grilling
Status: resolved
Assignee: lawrence.rjw.chase@gmail.com

## Question

Spec the bearer session token's lifecycle ([[07-auth-implementation]]): expiry duration and refresh policy (silent refresh vs re-login), and what happens to an open WebSocket connection ([[05-websocket-protocol]]) when its token expires mid-session — does the server close the connection and force a re-authenticate message, or does token expiry not apply to already-open WS connections at all?

## Answer

- **Expiry/refresh**: long-lived token (e.g. 30-90 day fixed window), no silent refresh flow or refresh-token pair. Re-login only on explicit logout or after the long window lapses. Matches v1's trusted-team, no-extra-machinery posture elsewhere (no sandboxing, soft-nudge laws, single-server poller).
- **WS mid-session behavior**: token is checked only at the WS handshake's first-message auth ([[05-websocket-protocol]]); expiry is not re-checked against an already-open connection. A connection rides until it naturally closes/reconnects, at which point the (possibly-expired) token is re-validated on the new handshake. No server-side tracked expiry-triggered force-close.
