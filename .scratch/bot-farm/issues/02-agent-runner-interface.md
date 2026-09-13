Type: grilling
Status: resolved
Blocked by: 01

## Question

Spec the `AgentRunner` interface contract: the operations bot-farm needs from any pluggable agent backend (start session, send message, get status/stream, spawn a child worker within the fixed 2-level hierarchy, report cost/token usage, stop/close). Define the shape of session state (idle/generating/paused/etc) and how cost/context% gets surfaced back to the data model from [[01-core-data-model]]. Implementation adapters (which SDKs it's backed by) are out of scope for this ticket — interface only.

## Answer

Push model, event-emitting handle, spawn as a handle method:

```ts
interface AgentRunner {
  start(opts: StartOptions): AgentHandle;
}

interface StartOptions {
  playbookRunId: string;      // agent_sessions.playbook_run_id, always required
  systemPrompt?: string;
  // parentSessionId intentionally absent — spawning is handle.spawnChild(), not another start()
}

type SessionStatus = 'idle' | 'generating' | 'waiting-approval' | 'error' | 'done';

interface AgentHandle {
  readonly sessionId: string;
  send(message: string): void;
  spawnChild(opts: StartOptions): AgentHandle;   // throws/rejects if `this` is already a child (enforces fixed 2-level hierarchy at the interface boundary)
  stop(): void;

  on(event: 'delta', cb: (chunk: string) => void): void;
  on(event: 'status', cb: (status: SessionStatus) => void): void;
  on(event: 'cost', cb: (c: { tokensIn: number; tokensOut: number; costUsd: number; contextPct: number }) => void): void;
}
```

Key decisions:
- **Push, not pull**: `start()` returns an `AgentHandle`; the server subscribes to its events and forwards them over the WebSocket ([[05-websocket-protocol]] consumes these three event names directly).
- **Status enum**: `idle | generating | waiting-approval | error | done`. `waiting-approval` replaces a generic `paused` — it ties directly to an approval-gate step type in [[03-playbook-step-model]], the concrete reason a session halts mid-run.
- **Cost is its own event**, not bundled into `status` — lets cost/context% tick live during `generating` without implying a status transition. Fields (`tokensIn`, `tokensOut`, `costUsd`, `contextPct`) surface straight into `agent_sessions` columns (exact columns are schema detail, out of scope here).
- **Spawn lives on the handle** (`handle.spawnChild()`), not as a second call to `AgentRunner.start()` with a parent id — lets an adapter hook a backend's native sub-agent/delegation support directly if one exists. The fixed 2-level rule is enforced by the handle itself refusing to spawn if it is already a child (adapter-level invariant, backstopped by the `parent_session_id` self-FK constraint in [[01-core-data-model]] at the data layer).
- `stop()`/`close()` collapse to one method — no separate "close" needed beyond `stop()`.
