# 10 — Bot skills config

**What to build:** A global `skills` library (name + instruction text) and a per-bot skill allowlist, distinct from the tool/MCP allowlist — a skill is a behavior toggle, not a callable function.

**Blocked by:** 08 — Bots: entity + ad-hoc chat.

**Status:** ready-for-agent

- [ ] `skills` table: `name`, instruction body (markdown).
- [ ] `bot_skills` join table: per-bot allowlist of enabled skills.
- [ ] User can create a skill and enable/disable it on a given bot's config form (separate control from the tool/MCP allowlist).
- [ ] A bot's enabled-skills list persists and is readable back from its detail view.
