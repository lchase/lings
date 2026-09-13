Type: grilling
Status: resolved
Assignee: lawrence.rjw.chase@gmail.com

## Question

A session's `systemPrompt` is assembled from four parts decided separately: the folder-scoped laws doc ([[04-laws-and-permissions]]), the bot's own `system_prompt` ([[08-bot-entity-model]]), its memory dump ([[09-agent-memory-model]]), and enabled skills' instruction text ([[12-bot-skills-config]]). Resolve the concatenation order and any separators/headers between sections (does each section get a labeled header like "## Laws" so the model can distinguish provenance, or is it seamless prose?).

## Answer

- **Order**: Laws → Bot prompt → Skills → Memory. Highest-authority/org-wide rules first, then persona/instructions, then capability instructions (skills), then recalled facts last, closest to the actual task turn.
- **Labeling**: each section gets a markdown header (`## Laws`, `## Instructions`, `## Skills`, `## Memory`) rather than seamless prose — keeps provenance distinguishable to the model and makes the assembled prompt inspectable/debuggable.
