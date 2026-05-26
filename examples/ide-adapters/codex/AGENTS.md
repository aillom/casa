# AGENTS.md

This project follows C.A.S.A.

Use generated Codex skills from `.codex/skills` when a task matches a skill description.

## Required flow

1. Read `casa.manifest.yaml`.
2. Read the relevant spec and policy.
3. Load only the smallest useful skill set.
4. Implement the smallest coherent change.
5. Run `npm run check` before completion.
