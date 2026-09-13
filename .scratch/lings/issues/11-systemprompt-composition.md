# 11 — SystemPrompt composition

**What to build:** Assemble a session's actual `systemPrompt` from all four sources — the folder-scoped laws doc, the bot's own system prompt, its enabled skills' instruction text, and its memory dump — in order, under labeled markdown headers, injected once at session start.

**Blocked by:** 05 — Laws & permissions, 08 — Bots: entity + ad-hoc chat, 09 — Bot memory, 10 — Bot skills config.

**Status:** ready-for-agent

- [ ] Starting a session resolves the effective laws doc for its folder (per ticket 05's nearest-ancestor rule).
- [ ] The assembled prompt concatenates, in order: Laws → Bot's own system prompt → Skills → Memory.
- [ ] Each section appears under its own labeled header (`## Laws`, `## Instructions`, `## Skills`, `## Memory`) — not seamless prose.
- [ ] The prompt is composed once at session start and does not change if the laws doc, bot config, or memory is edited mid-session.
- [ ] A debug/inspectable view (even a raw text dump) lets a user see the exact assembled prompt for a given session.
