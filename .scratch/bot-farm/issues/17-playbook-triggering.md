Type: grilling
Status: resolved
Assignee: lawrence.rjw.chase@gmail.com

## Question

Spec playbook triggering: is a `playbook_run` ([[01-core-data-model]]) only ever created manually (a user clicks Run), or does bot-farm also support scheduled (cron-like) or event-triggered runs (e.g. on a webhook, on a ticket entering a status)? If triggers beyond manual exist, what schedules/fires them given no background worker infrastructure has been decided yet.

## Answer

- **Scope**: manual + cron-scheduled triggering for v1. Event/webhook triggers (ticket-status entry, external webhook) stay fog — not decided here, deferred to a later spec if needed.
- **Schema**: `playbooks` gains `cron_expression` (nullable — null means manual-only, matching every other optional/global pattern in the spec), `next_run_at` (nullable, computed from the expression), and `created_by -> users.id`.
- **Firing mechanism**: an in-process interval poller inside `apps/web`'s Node server (e.g. `setInterval` every minute) queries playbooks with a due `next_run_at`, spawns their `playbook_runs`, and advances `next_run_at`. No new worker infrastructure — rides the existing single server process, consistent with v1's trusted-team/no-sandboxing/single-deployment posture. Only correct with exactly one server instance; revisit if bot-farm ever runs multi-instance.
- **Run identity**: a scheduled run has no clicking user, so it's attributed to the playbook's `created_by` as initiator (auth scope, laws-doc resolution owner, etc.) — reuses an existing account rather than introducing a new system/service identity concept.
