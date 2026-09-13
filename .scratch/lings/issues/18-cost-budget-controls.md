# 18 — Cost/budget controls

**What to build:** A hard per-session spend cap (defaulting from the spawning bot, overridable per spawn) that halts a session outright when exceeded, plus an enforced model-tier choice at session creation.

**Blocked by:** 15 — agent-call step + approval gate, 08 — Bots: entity + ad-hoc chat.

**Status:** ready-for-agent

- [ ] `bots.default_model_tier` and a spend-cap default column exist.
- [ ] Session creation (ad-hoc or agent-call) requires an explicit model value, falling back to the spawning bot's default when not overridden — the server rejects a session with no resolvable model.
- [ ] A session's live `cost` events (from ticket 06/07) are checked against its cap; crossing it hard-stops the session (or halts it to `waiting-approval` — pick one and apply consistently).
- [ ] A test/demo session with an artificially low cap actually stops when it crosses that cap.
- [ ] No workspace-wide aggregate cap is implemented — only the per-session cap.
