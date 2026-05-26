# C4 Context

## System

C.A.S.A is a method repository that defines an agent-native architecture layer for software delivery.

## Users

- Humans using AI coding agents.
- AI coding agents reading generated instructions.
- Maintainers evolving the method, templates and policies.

## External systems

- Cursor consumes `.cursor/rules`.
- Codex consumes `.codex/skills` and `AGENTS.md`.
- Generic agents consume `AGENTS.md` and `.agents/casa-agent-guide.md`.
- GitHub Actions consumes the repository scripts and workflows.

## Boundaries

- `.casa` is the source of truth.
- Generated adapter files are disposable outputs.
- Scripts enforce sync between source and generated outputs.
