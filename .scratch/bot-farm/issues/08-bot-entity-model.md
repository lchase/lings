Type: grilling
Status: resolved

## Question

New scope surfaced mid-grilling: bot-farm needs a first-class "Bot" entity — a named, described, custom-configured context (system prompt, tool/MCP access, delegation ability) a user selects and starts tasks with, rather than one AI agent that does everything. Originally framed as "does each role need memory" — that turned out to depend on defining what a role/bot even is first. This ticket resolves the Bot entity itself; memory is split out to [[09-agent-memory-model]].

## Answer

- **New entity**: `bots` table — `name`, `description`, `system_prompt`, `tools_config` (flat allowlist of enabled tools/MCP servers — no granular per-tool scoping, consistent with the no-sandboxing/trusted-team posture already locked in [[04-laws-and-permissions]]), plus a delegation allowlist (which other bot ids this bot may spawn).
- **Scope**: global/org-wide library, not folder-scoped — matches how `playbooks` was already decided ([[01-core-data-model]]), unlike `laws_docs` which resolves by folder ancestry. A bot is a reusable persona/tool-loadout you pick and run, not an ambient rule.
- **Two invocation modes, same underlying mechanism**:
  - **Deterministic**: a playbook's `agent-call` step ([[03-playbook-step-model]]) names a specific `bot_id` to run — fixed in the DAG, guaranteed shape.
  - **Dynamic delegation**: a running bot's own reasoning calls `AgentHandle.spawnChild()` ([[02-agent-runner-interface]]) at runtime, restricted to its configured delegation allowlist — looser, not pre-wired, but stays inside the already-locked fixed-2-level hierarchy (a delegated-to bot cannot itself delegate further).
- **Data model**: `agent_sessions.bot_id` is a **required** FK to `bots` (extends [[01-core-data-model]]) — every session, including raw ad-hoc chat, runs as some bot. A seeded default "generic assistant" bot covers the no-persona case, so nothing downstream (memory scoping, WS status display, fleet view) needs a null-bot branch.

**Extends/touches** (not invalidates): [[01-core-data-model]] (new `bots` table + required `agent_sessions.bot_id`), [[03-playbook-step-model]] (`agent-call` step config now names a `bot_id`), [[02-agent-runner-interface]] (`spawnChild()` gains a delegation-allowlist check), [[14-cost-budget-controls]] (`bots` gains a `default_model_tier` column, used as session creation's model fallback).
