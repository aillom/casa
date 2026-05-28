# Runtime Map

## Commands

- `npm run generate`: regenerate agent-specific adapter files.
- `npm run generate:check`: verify generated adapter files are in sync.
- `npm run doctor`: run C.A.S.A compliance checks.
- `npm run check`: run generated sync checks and doctor.
- `./casa compose`: generate stack plans, composition specs and optional AI provider config.
- `./casa stack list|show|plan|add`: inspect and apply governed stack packs.
- `./casa recipe list|show|plan|run`: inspect and run prebuilt terminal workflows.
- `./casa skill search|inspect|install|audit|update|remove`: manage local and GitHub skills with audit and lockfile.
- `./casa guide`: suggest terminal steps and recipes for a goal.
- `./casa template list|use`: inspect or copy starter templates.
- `./casa history list|show`: inspect local harness history.
- `./casa ai configure openrouter`: generate OpenRouter config placeholders without storing secrets.

## CI

- `.github/workflows/ci.yml`: runs the C.A.S.A checks.
- `.github/workflows/security.yml`: runs CodeQL and package audit checks.

## Deployables

- None. This repository currently publishes method files, templates and scripts.
