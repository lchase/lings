Type: grilling
Status: resolved
Blocked by: 08

## Question

Each `bot` ([[08-bot-entity-model]]) journals learnings over time into its own persistent memory, with a user-facing way to view/edit/revise/forget entries so the bot improves but the user can curate what it "knows." Resolve: storage shape (structured entries vs free text, one table scoped by `bot_id`), how memory gets injected into a session (relates to [[04-laws-and-permissions]]'s systemPrompt-injection-once decision — does memory get the same once-at-start treatment, or does it need mid-session updates?), what triggers a write (agent decides to journal via a tool call, vs an automatic end-of-session summarization step), and the audit/edit/forget UI (where it lives, who can edit — just the bot's owner, or any user with access to that bot).

## Answer

- **Storage**: structured entries table `bot_memories` — `bot_id` FK, free-text `content`, `created_at`, `source_session_id` (which run wrote it). Chosen over a single evolving blob so per-item edit/forget is a row delete/edit, not hand-editing prose to find one learning.
- **Injection**: full dump of a bot's memory entries into `systemPrompt`, once at session start — same pattern as [[04-laws-and-permissions]] (no re-injection per turn, no retrieval/relevance filtering). Session's `systemPrompt` is now composed of: laws doc + bot's own `system_prompt` + memory dump (composition order itself still fog — see map's "Not yet specified").
- **Write trigger**: explicit tool call. The bot's tool/MCP allowlist ([[08-bot-entity-model]]) includes a `remember(content)` function it can call mid-session when it decides something's worth journaling — not an automatic end-of-session summarization pass. Deliberate control over what's kept, clear provenance per entry, no separate summarization pipeline to build.
- **Edit/forget access**: any authenticated user can view/edit/delete any bot's memory entries. No ownership/ACL concept exists anywhere else on this map (bots are a global library like playbooks) — memory doesn't introduce one either.
