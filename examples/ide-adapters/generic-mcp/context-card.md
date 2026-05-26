# Generic MCP Context Card

Use this card with agents that can access files and tools through MCP.

## Context resources

- `AGENTS.md`
- `casa.manifest.yaml`
- `.casa/context/repo-map/modules.md`
- `.casa/context/domain-map/domains.md`
- `.casa/kernel/policies`
- `.casa/capabilities/skills`

## Tool boundaries

- Read repository files freely.
- Write only task-related files.
- Do not write generated adapter files directly.
- Do not read secrets or `.env` files.
- Run `npm run check` before completion when shell access is available.

## Evidence

Return changed files, sensors run, warnings and residual risk.
