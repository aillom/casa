# Runtime Map

## Commands

- `npm run generate`: regenerate agent-specific adapter files.
- `npm run generate:check`: verify generated adapter files are in sync.
- `npm run doctor`: run C.A.S.A compliance checks.
- `npm run check`: run generated sync checks and doctor.

## CI

- `.github/workflows/ci.yml`: runs the C.A.S.A checks.
- `.github/workflows/security.yml`: runs CodeQL and package audit checks.

## Deployables

- None. This repository currently publishes method files, templates and scripts.
