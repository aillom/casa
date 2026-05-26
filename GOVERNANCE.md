# Governance

C.A.S.A governance keeps agent-assisted development auditable, reviewable and safe.

## Source of truth

- `.casa/kernel`: principles, standards, policies and risk model.
- `.casa/governance`: permissions, sensors, evals and audit guidance.
- `casa.manifest.yaml`: repository-level requirements and protected paths.

## Change expectations

- Use specs for behavior changes.
- Update docs, examples and contracts when behavior changes.
- Run `npm run check` before opening or merging a PR.
- Do not edit generated adapter files directly.

## Risk levels

- Low: normal validation.
- Medium: reviewer recommended.
- High: human approval, rollback plan and relevant sensors required.
- Critical: two-person review and incident-style change planning required.
