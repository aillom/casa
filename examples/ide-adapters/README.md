# IDE And Agent Adapter Examples

These examples show how to express the same C.A.S.A method across different IDEs, coding agents and generic AI tools.

They are intentionally small. In a real project, generated files should come from `.casa` Core instead of being copied by hand.

## Examples

- `universal`: baseline `AGENTS.md` for any agent that reads repository instructions.
- `codex`: Codex-oriented AGENTS.md plus a sample skill.
- `cursor`: Cursor project rules.
- `claude`: Claude Code memory, settings and a subagent example.
- `devin`: Devin-style knowledge entries.
- `github-copilot`: GitHub Copilot repository and path-scoped instructions.
- `antigravity`: workflow-agent task cards.
- `windsurf`: workspace rules and AGENTS.md-compatible example.
- `trae`: Trae-oriented AGENTS.md, `.agents` context and MCP placeholder.
- `kilo-code`: Kilo Code AGENTS.md, CONTEXT.md and `kilo.jsonc` examples.
- `continue`: rule-based IDE example.
- `generic-cli`: portable guide for CLI agents.
- `generic-web-chat`: compact prompt for browser chat agents.
- `generic-mcp`: context card for MCP-aware agents.

## Rule

Do not create a new source of truth per IDE. Translate C.A.S.A Core into the IDE surface.
