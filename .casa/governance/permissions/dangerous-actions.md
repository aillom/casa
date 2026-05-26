# Dangerous Actions

These actions are forbidden unless the user explicitly asks for them and the risk is understood.

## Forbidden by default

- Delete data or migration files.
- Disable CI, tests, lint or security checks.
- Rotate, print or commit secrets.
- Run destructive database commands.
- Change production infrastructure.
- Edit generated adapter files directly.
- Rewrite legacy modules without a safety baseline.

## Required handling

- Prefer reversible changes.
- Create a rollback plan for high-risk changes.
- Capture evidence from tests or sensors.
- Stop and ask when the action could cause data loss or production impact.
