Type: grilling
Status: resolved

## Question

If skills (Claude-Code-style packaged prompts/workflows, e.g. `/grilling`, `/prototype`) get installed into bot-farm, should a bot's configuration expose which skills it can use, the same way [[08-bot-entity-model]] gave each bot a flat tool/MCP allowlist — e.g. a Product Manager bot enables `/grilling` while a UX Designer bot enables `/prototype`? Resolve: are skills the same kind of thing as tools/MCP servers (fold into the existing `tools_config` allowlist) or a distinct concept needing its own `bot_skills` config, and mechanically, how does an enabled skill reach the model given [[02-agent-runner-interface]]'s SDK/API-first `AgentRunner` (no CLI harness to interpret a slash command)?

## Answer

- **Concept**: skills are a distinct concept from tools/MCP, not folded into `tools_config`. A skill is a reusable **instruction block** (markdown text, e.g. the grilling behavior), not a function-call capability — mixing the two under one allowlist would confuse a tool toggle with a behavior toggle at the UI layer.
- **Data model**: new global `skills` table (name, instruction body) + `bot_skills` join table (per-bot allowlist), same global/org-wide scope as `bots` and `playbooks` — not folder-scoped like `laws_docs`.
- **Mechanism**: no slash-command interpretation (there's no CLI harness underneath the SDK/API-first `AgentRunner`). An enabled skill's instruction text is concatenated into `systemPrompt` once at session start, same injection point and pattern as laws doc + bot's own system prompt + memory dump — one composition mechanism, not two. A Product Manager bot with the grilling skill enabled behaves that way throughout the session by default, rather than deciding per-turn whether to invoke it.
