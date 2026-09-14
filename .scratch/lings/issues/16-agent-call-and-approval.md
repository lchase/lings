# 16 — agent-call step + approval gate

**What to build:** The `agent-call` step type — spawning a real bot session mid-run via `AgentRunner`, with the fully composed systemPrompt — and wiring the `approval` step to a session's `waiting-approval` status rather than a bare acknowledgement.

**Blocked by:** 15 — Step interpolation + secrets, 09 — Bots: entity + ad-hoc chat, 07 — AgentRunner interface + mock adapter, 12 — SystemPrompt composition.

**Status:** ready-for-agent

- [ ] An `agent-call` step's config names a `bot_id`; executing it calls `AgentRunner.start()` with that bot's fully composed systemPrompt (per ticket 12) and a `playbookRunId` pointing at the current run.
- [ ] The spawned session is visible live in the fleet view (per ticket 08), same as an ad-hoc chat.
- [ ] The run does not advance past the `agent-call` step until that session reaches a terminal status (`done`/`error`) — `waiting-approval` on that session halts run progress.
- [ ] An `approval` step, when hit, leaves the run halted and any active session at that point in `waiting-approval`, resuming only once a human resolves it.
- [ ] A playbook combining bash → agent-call → approval → bash runs end to end, demonstrating all three step types chained together.
