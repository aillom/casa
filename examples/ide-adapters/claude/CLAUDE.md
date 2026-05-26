# Claude Code Instructions

This project follows C.A.S.A - Context, Architecture, Stack & Automation.

## Operating rules

- Read `AGENTS.md` and `casa.manifest.yaml` before implementation.
- Treat `.casa` as the source of truth.
- Use specs before coding.
- Use policies and risk levels before changing sensitive paths.
- Do not edit generated adapter files directly.
- Run `npm run check` before completion.

## Capability loading

Use the smallest relevant C.A.S.A capability:

- frontend work: `frontend-design-engineer`
- backend work: `backend-clean-architect`
- API work: `api-contract-engineer`
- security-sensitive work: `security-reviewer`
- legacy work: `legacy-archaeologist`
