# Agent And IDE Examples

This guide shows how the same C.A.S.A Core can be translated into many IDEs, coding agents and generic AI surfaces.

Use `examples/ide-adapters` as copyable examples. They are not separate sources of truth. They are example translations of C.A.S.A concepts.

## Adapter Strategy

| Surface type | C.A.S.A adapter pattern | Example files |
| --- | --- | --- |
| Universal agent support | Short root instructions | `AGENTS.md` |
| Codex | AGENTS.md plus Agent Skills | `.codex/skills/*/SKILL.md` |
| Cursor | Project rules | `.cursor/rules/*.mdc` |
| Claude Code | CLAUDE.md, settings and subagents | `CLAUDE.md`, `.claude/settings.json`, `.claude/agents/*.md` |
| Devin | Knowledge entries and playbooks | `knowledge/*.md` |
| GitHub Copilot | Repository instructions and path-scoped instructions | `.github/copilot-instructions.md`, `.github/instructions/*.instructions.md` |
| Antigravity | Project rules and workflow cards | `.agents/rules/*.md`, `.agents/workflows/*.md` |
| Windsurf | Workspace rules and AGENTS.md | `.windsurf/rules/*.md`, `AGENTS.md` |
| Trae | Project instructions, indexed docs and MCP context | `AGENTS.md`, `.agents/*.md`, `.trae/mcp.json` |
| Kilo Code | AGENTS.md, CONTEXT.md and optional `kilo.jsonc` instruction sources | `AGENTS.md`, `CONTEXT.md`, `kilo.jsonc` |
| Continue | Workspace rules | `.continue/rules/*.md` |
| Generic CLI agents | Portable agent guide | `AGENT-GUIDE.md` |
| Generic web chat | Compressed system prompt and task checklist | `casa-system-prompt.md` |
| MCP-aware agents | Context card plus tool boundaries | `context-card.md` |

## Translation Rules

- If the tool supports `AGENTS.md`, keep it short and point to `.casa`.
- If the tool supports skills, translate `.casa/capabilities/skills`.
- If the tool supports project rules, translate policies, protected paths and workflows.
- If the tool supports knowledge, create short task cards with triggers and expected outputs.
- If the tool supports indexed workspace context, keep C.A.S.A docs small, explicit and easy to reference.
- If the tool only supports chat, provide a compact C.A.S.A prompt and ask it to read attached files.
- If the tool can run commands, make `npm run check` the completion gate.

## Minimum Generic Prompt

```text
This project follows C.A.S.A: Context, Architecture, Stack & Automation.
Read AGENTS.md, casa.manifest.yaml, the relevant spec in .casa/specs and the relevant policy in .casa/kernel/policies.
Use the smallest useful capability from .casa/capabilities.
Do not edit generated adapter files directly.
Update tests, docs, examples and contracts when behavior changes.
Run the required sensors and report the result.
```

## Official Reference Surfaces

- AGENTS.md: https://agents.md/
- Codex AGENTS.md: https://developers.openai.com/codex/guides/agents-md
- Codex Skills: https://developers.openai.com/codex/skills
- Cursor rules: https://docs.cursor.com/en/context/rules
- Claude Code memory: https://docs.anthropic.com/en/docs/claude-code/memory
- Claude Code settings: https://docs.anthropic.com/en/docs/claude-code/settings
- Devin Knowledge: https://docs.devin.ai/product-guides/knowledge
- GitHub Copilot custom instructions: https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot
- Continue rules: https://docs.continue.dev/customize/rules
- Antigravity rules and workflows: https://antigravity.google/docs/rules-workflows
- Windsurf rules: https://docs.windsurf.com/windsurf/cascade/memories
- Trae IDE AI settings and code index: https://traeide.com/docs/trae-ide-ai-setting
- Kilo Code custom instructions: https://kilo.ai/docs/customize/custom-instructions
