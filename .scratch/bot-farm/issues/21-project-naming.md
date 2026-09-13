Type: grilling
Status: resolved

## Question

The working folder/project name "bot-farm" was a lazy placeholder chosen at the start of this effort, not a deliberate product name. Brainstorm and settle an actual name for this project (and how far the rename reaches — just the spec doc's title, or the repo/package names decided in [[06-repo-structure]] too).

## Answer

- **Name**: **Lings** — a small-team/company framing (not a literal farm/herd), coined from the "-ling" diminutive suffix (hireling, underling): a boss bot directs its lings. Landed here after ruling out farm/swarm metaphors (too literal for a team/company model), then "Minions" for a direct trademark collision with the Despicable Me franchise.
- **Scope**: the rename reaches the repo/package names decided in [[06-repo-structure]], not just doc branding — e.g. root package name `lings`, scoped packages like `@lings/db`, `@lings/ui`, `@lings/agent-runner`, `@lings/shared-types`, `apps/web`/`apps/desktop` unchanged (those are build-target names, not product branding). Still pre-code, so no migration cost to naming it correctly now.
- **Follow-up action** (not a decision, just noted): the actual working directory/repo folder (currently `bot-farm`) should get renamed to `lings` at some point — that's a filesystem rename for whoever picks up the build phase, not something this map's planning tickets do.
