Type: grilling
Status: resolved

## Question

Spec cost/budget controls: per-bot or per-session spend caps (hard stop vs soft warning, and who gets notified), and the model-tier-selection rule referenced by the reference screenshots' law ("choose model by task complexity" — [[04-laws-and-permissions]] currently treats all laws as unenforced soft nudges; does model-tier selection stay a soft law too, or does it need an actual enforced default wired into [[02-agent-runner-interface]]'s session creation?).

## Answer

- **Enforcement**: hard stop (or halt-to-`waiting-approval`), breaking from the soft-nudge pattern elsewhere on this map ([[04-laws-and-permissions]]). A runaway agent burning real money is a concrete, bounded harm a soft nudge can't prevent — worth an exception.
- **Scope**: per-`agent_session` cap only for v1, set at spawn, defaulting from the spawning bot's config, overridable per spawn. Direct extension of cost data already tracked per session ([[02-agent-runner-interface]]'s `cost` events, [[05-websocket-protocol]]). No workspace-wide aggregate cap yet — needs rollup infrastructure that doesn't exist; left as fog if it turns out to matter.
- **Model-tier selection**: each bot gets a configured default model tier. Session creation requires an explicit model value, falling back to the bot's default when the spawning call doesn't override — the server can't judge "task complexity" itself (that judgment stays a soft law, same pattern as other laws), but silently defaulting to nothing or an accidental wrong-tier model is a structural cost footgun worth preventing outright.
