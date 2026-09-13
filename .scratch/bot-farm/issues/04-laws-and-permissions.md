Type: grilling
Status: resolved
Blocked by: 01

## Question

Spec the laws & permissions doc: its format (structured rules vs free-text markdown), scope (global vs per-project vs per-agent-role), and — most importantly — the enforcement mechanism: how it actually reaches a spawned agent's context (injected at session start? re-read each pulse? referenced by the AgentRunner from [[02-agent-runner-interface]]?), and whether/how violations are surfaced back to the tracker.

## Answer

**Format:** free-text markdown. `laws_docs.content` is a plain markdown blob — no rule parsing/structure/`law_rules` table. Rules read as prose ("Never force-push to main", "Choose model by task complexity") and are injected verbatim, not validated or machine-checked in v1.

**Scope:** already settled in [[01-core-data-model]] — `laws_docs.folder_id` nullable-as-global, nearest-ancestor resolution walking the `folders` tree.

**Enforcement mechanism:** injected once, at session start only. The server resolves the effective doc (nearest ancestor of the session's folder) and prepends it to `systemPrompt` in the `AgentRunner.start()` call ([[02-agent-runner-interface]]) — `start({ playbookRunId, systemPrompt: effectiveLawsMarkdown + userSystemPrompt })`. `send()` does not carry law text on every turn: if the doc is edited mid-session, already-running sessions don't see the update (acceptable for v1 — edit-then-restart is the escape hatch). No runtime interpreter checks compliance; this is instruction-following, not a sandbox.

**Violation surfacing:** no automatic/technical detection. The manager-level session (the top of the fixed 2-level hierarchy, per [[01-core-data-model]]'s `parent_session_id`) is prompted — as part of its own laws/system prompt — to flag suspected violations it notices (in its own or a worker's output) by posting a comment on the linked ticket (`playbook_runs.ticket_id`). This is a soft, LLM-driven nudge, not a hard gate; a human triages from there. Consistent with the already-locked trusted-team/no-sandbox posture — enforcement stays social/prompted, not code-enforced, for v1.
