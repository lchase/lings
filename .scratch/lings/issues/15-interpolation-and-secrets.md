# 15 — Step interpolation + secrets

**What to build:** `{{...}}` interpolation resolved at step-run time — prior step outputs, run trigger input, and folder-scoped encrypted secrets — so a bash step can reference upstream data and credentials without hardcoding them.

**Blocked by:** 14 — Bash step execution.

**Status:** ready-for-agent

- [ ] `secrets` table: `folder_id` (nullable = global), `name`, `encrypted_value`, encrypted at rest with a server-held key.
- [ ] Secret resolution uses the same nearest-ancestor-then-global-fallback rule as laws docs (ticket 06).
- [ ] `{{steps.<stepId>.stdout|stderr|exitCode}}` resolves to the named prior step's captured output; only steps reachable via an incoming edge chain are valid (rejected at save time, not run time).
- [ ] `{{secrets.<NAME>}}` resolves from the `secrets` table and is injected as an env var into the bash step's process — never written to run logs or step output storage in plaintext.
- [ ] `{{run.input.<field>}}` resolves from the run's trigger payload (a manual-trigger form is enough for this ticket).
- [ ] A playbook using all three interpolation forms in one run produces the expected substituted output.
