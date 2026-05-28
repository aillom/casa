# Harness Standard

## Required

- Prefer C.A.S.A recipes before ad hoc terminal commands.
- Record generated plans, install intent and validation evidence in `.casa/runtime`.
- Keep every install command reproducible and reviewable before execution.
- Require `--execute` for commands that install dependencies, run deploys or mutate external services.
- Keep secrets outside committed files.
- Generate specs, stack plans and risk notes before high-risk changes.
- Capture validation output after stack, database, security and deploy work.
- Preserve history so future agents can understand why a stack or recipe was chosen.

## Avoid

- Running package managers or deploy commands without an explicit execution flag.
- Hiding manual steps that still require human review.
- Treating generated plans as proof that the implementation is complete.
- Mixing recipe output with generated adapter files.
- Committing local run history that contains secrets or provider responses.
