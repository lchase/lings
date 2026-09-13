Type: grilling
Status: resolved
Assignee: lawrence.rjw.chase@gmail.com

## Question

Spec what the desktop app ([[06-repo-structure]]) actually needs beyond being a thin Tauri wrapper: which native-chrome value-adds it's meant to deliver (tray icon, OS notifications, deep links — or none of these for v1), an auto-update mechanism for the Tauri build, and behavior when the shared server is unreachable (an explicit offline/disconnected state to show, not offline-first functionality).

## Answer

- **Native-chrome value-adds**: tray icon (system tray/menu-bar presence, minimize-to-tray, quick reopen) plus the already-decided OS notification on unread ([[16-notifications-unread]]). No deep-link URL scheme for v1 — stays fog-free by exclusion, not deferred.
- **Auto-update**: Tauri's built-in updater plugin — checks a hosted static manifest/endpoint, downloads and installs a signed update in the background, prompts the user to restart. No custom update server logic beyond hosting the manifest.
- **Disconnected behavior**: full-screen blocking "can't reach server" state with retry, replacing the UI entirely once the WebSocket/API connection drops — no stale data left visible, no offline-first functionality. Reconnect restores the app to its normal state (consistent with [[05-websocket-protocol]]'s no-replay-buffer, refetch-on-reconnect pattern).
