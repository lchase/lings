# 06 — AgentRunner interface + mock adapter

**What to build:** The `AgentRunner`/`AgentHandle` contract in `packages/agent-runner`, plus a fake in-memory adapter that emits scripted `delta`/`status`/`cost` events — no real LLM call. This is the seam every later agent-facing ticket builds against.

**Blocked by:** 01 — Repo & tooling scaffold.

**Status:** ready-for-agent

- [ ] `AgentRunner.start(opts)` returns an `AgentHandle` with `send()`, `spawnChild()`, `stop()`, and `on('delta'|'status'|'cost', cb)`.
- [ ] Status enum is exactly `idle | generating | waiting-approval | error | done`.
- [ ] `cost` events carry `tokensIn`, `tokensOut`, `costUsd`, `contextPct`, independent of `status` events.
- [ ] `spawnChild()` on a handle that is itself already a child throws/rejects — enforces the fixed 2-level hierarchy at the interface boundary.
- [ ] The mock adapter can be driven in a test to emit a scripted sequence of events, verifying subscribers receive them in order.
- [ ] `stop()` terminates the handle and no further events fire afterward.
