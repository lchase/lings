# 08 — Bots: entity + ad-hoc chat

**What to build:** A global `bots` library — name, description, system prompt, flat tool/MCP allowlist, delegation allowlist, generated avatar — and the ability to start an ad-hoc chat session as a chosen bot, visible live in the fleet view from ticket 07.

**Blocked by:** 07 — WebSocket protocol + live fleet view.

**Status:** ready-for-agent

- [ ] `bots` table: `name`, `description`, `system_prompt`, `tools_config` (flat allowlist), delegation allowlist (bot ids it may spawn), `avatar_seed`, `default_model_tier`.
- [ ] A seeded default "generic assistant" bot exists out of the box.
- [ ] User can create/edit a bot through a form covering all the fields above.
- [ ] Bot avatar renders as a deterministic low-poly SVG generated client-side from `avatar_seed`; clicking "regenerate" picks a new random seed and re-renders instantly (no image-gen API call, no stored image).
- [ ] `agent_sessions.bot_id` is a required FK; starting an ad-hoc chat requires picking a bot (default bot preselected).
- [ ] Starting a chat as a bot spawns a real session via the ticket 06 `AgentRunner` and shows it live in the fleet view (still against the mock adapter — no real LLM call required yet).
