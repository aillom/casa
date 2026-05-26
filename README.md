# C.A.S.A — Context, Architecture, Stack & Automation

**An agent-native engineering control plane for governed vibe coding.**

[Português](README.pt-BR.md) | [Español](README.es.md)

C.A.S.A is an agent-native engineering control plane for teams building, governing and modernizing software with AI coding agents.

It is not a framework, a prompt pack, a coding agent or a visual workflow builder. C.A.S.A is the architecture layer that makes coding agents usable in real software systems: structured context, architectural boundaries, reusable capabilities, mission-based execution, risk governance and evidence-based validation.

The goal is simple: keep the speed of vibe coding without losing engineering control.

## Core Principle

**Design for agents. Govern for humans. Evolve for legacy.**

**Write once. Adapt everywhere. Validate always.**

## Why C.A.S.A Exists

AI coding agents can move fast, but without architecture they amplify common engineering problems:

- duplicated patterns
- architecture drift
- stale documentation
- missing tests and contracts
- unsafe automation
- tool-specific instructions that cannot be reused
- rewrite-first behavior in legacy systems
- generated files with no clear source of truth

C.A.S.A turns ad hoc agent work into governed software delivery.

## How It Works

C.A.S.A separates stable project knowledge from agent-specific instructions and adds mission-based execution on top.

```text
.casa Core
  -> specs
  -> policies
  -> standards
  -> skills
  -> workflows
  -> context maps
  -> governance sensors
  -> quality gates
  -> mission templates
  -> context capsules

Adapter generation
  -> Codex skills
  -> Cursor rules
  -> Claude memory and agents
  -> Devin knowledge
  -> Copilot instructions
  -> Antigravity rules and workflows
  -> Windsurf rules
  -> Trae context
  -> Kilo Code instructions
  -> generic agent guides
```

The rule is: **write once in `.casa`, adapt everywhere.**

The outcome is: **every mission ends with evidence.**

## What You Get

- **Context**: `AGENTS.md`, specs, policies, repo maps, domain maps and generated agent guidance.
- **Architecture**: boundaries, dependency direction, API contracts, ownership and modernization paths.
- **Stack**: replaceable stack guidance for frontend, backend, database, DevOps, testing and documentation.
- **Automation**: doctor checks, generated adapter sync checks, CI gates, sensors, security scans and drift detection.
- **Governance**: risk levels, protected paths, security policies, permissions and review expectations.
- **Modernization**: discovery, baselining, seams, strangler migration and retirement playbooks.
- **Mission Control**: missions, tasks, handoffs, risk gates, agent runs and evidence.
- **Quality Gates**: versioned checks for architecture, security, API contracts, UI quality and legacy safety.

## Control Plane Modules

C.A.S.A 2.1 is organized around these blocks:

1. Kernel
2. Context Fabric
3. Capability Layer
4. Mission Control
5. Protocol Layer
6. Governance Engine
7. Modernization Layer
8. Adapter Layer
9. Evidence Ledger
10. Quality Gates

## Supported Agent Surfaces

C.A.S.A is designed to work across IDEs and coding agents instead of locking a project into one product.

| Surface | C.A.S.A example |
| --- | --- |
| Universal agents | `AGENTS.md` |
| Codex | `.codex/skills/*/SKILL.md` |
| Cursor | `.cursor/rules/*.mdc` |
| Claude Code | `CLAUDE.md`, `.claude/settings.json`, `.claude/agents/*.md` |
| Devin | `knowledge/*.md` |
| GitHub Copilot | `.github/copilot-instructions.md`, `.github/instructions/*.instructions.md` |
| Antigravity | `.agents/rules/*.md`, `.agents/workflows/*.md` |
| Windsurf | `.windsurf/rules/*.md` |
| Trae | `AGENTS.md`, `.agents/*.md`, `.trae/mcp.json` |
| Kilo Code | `AGENTS.md`, `CONTEXT.md`, `kilo.jsonc` |
| Continue | `.continue/rules/*.md` |
| Generic CLI agents | `AGENT-GUIDE.md` |
| Generic web chat | `casa-system-prompt.md` |
| MCP-aware agents | `context-card.md` |

Start with [docs/agent-ide-examples.md](docs/agent-ide-examples.md) and [examples/ide-adapters](examples/ide-adapters).

## Quick Start

### New Project

```bash
mkdir my-app
cd my-app
npx @aillomai/casa init --mode greenfield
./casa doctor
./casa mission new first-feature --title "First Feature" --mode greenfield
```

### Existing Project

From the root of your existing repository:

```bash
cd existing-app
npx @aillomai/casa init --mode brownfield
./casa doctor
./casa mission new legacy-discovery --title "Legacy Discovery" --mode brownfield
```

Use `--force` only when you intentionally want to overwrite existing C.A.S.A files.

### This Repository

```bash
npm ci
./casa check
```

C.A.S.A exposes a small local CLI:

```bash
./casa init ../my-app --mode greenfield
./casa doctor
./casa check
./casa commands
./casa generate adapters
./casa generate adapters --check
./casa mission new invoice-dashboard --title "Invoice Dashboard" --mode greenfield
./casa capsule list
./casa gate list
```

The npm package exposes the same interface through `npx @aillomai/casa ...`.
Initialized projects also get a local `./casa` shortcut and `.casa/commands.md`.

Publishing instructions are in [docs/publishing.md](docs/publishing.md).

## Daily Workflow

1. Edit C.A.S.A Core files first, usually under `.casa`.
2. Update specs, policies, docs or examples when behavior changes.
3. Run `./casa generate adapters` after changing Core files that affect agent adapters.
4. Run `./casa check` before opening or merging a PR.
5. Do not edit generated adapter files directly.

Generated outputs include:

- `.codex/skills`
- `.cursor/rules`
- `.agents/casa-agent-guide.md`
- `.casa/generated`

## Adoption Modes

### Greenfield

Use C.A.S.A from day one in a new project:

- write specs before implementation
- define API contracts before shared endpoints
- add tests and CI gates early
- generate agent-specific guidance from one source of truth

Start with [templates/greenfield-next-nest-postgres](templates/greenfield-next-nest-postgres).

### Brownfield

Install C.A.S.A as an overlay on an existing system without forcing a rewrite:

- discover before changing
- map modules, dependencies, runtime and risks
- add characterization or smoke tests
- create seams before refactoring
- migrate incrementally through strangler or branch-by-abstraction patterns

Start with [templates/brownfield-overlay](templates/brownfield-overlay).

### Hybrid

Use C.A.S.A selectively in a live product:

- start with protected paths and policies
- map only the risky or high-change areas first
- add specs around new work
- generate adapters for the agents your team already uses

## Repository Map

- `AGENTS.md`: short universal instructions for coding agents.
- `casa.manifest.yaml`: method metadata, enabled adapters, governance requirements and protected paths.
- `.casa/kernel`: source of truth for principles, standards, policies and risk model.
- `.casa/context`: repo maps, architecture maps, domain maps, runtime maps and legacy inventory.
- `.casa/context-capsules`: reusable scoped context packages for common engineering missions.
- `.casa/capabilities`: skills, subagents and workflows.
- `.casa/mission-control`: mission, evidence, handoff, capsule and risk gate templates.
- `.casa/runtime/missions`: optional persisted mission records.
- `.casa/protocols`: alignment with AGENTS.md, Agent Skills, MCP, A2A, OpenAPI and AsyncAPI.
- `.casa/adapters`: adapter notes for supported agent surfaces.
- `.casa/generated`: generated adapter packs and indexes.
- `.casa/specs`: reusable specification templates.
- `.casa/modernization`: brownfield discovery, baselining, seams, strangler and retirement playbooks.
- `.casa/governance`: permissions, protected files, dangerous actions, sensors, evals and audit guidance.
- `.casa/quality-gates`: versioned quality checks for missions and PRs.
- `.casa/registry`: indexes of skills, agents, adapters, workflows and policies.
- `.casa/cockpit`: future visual control-plane IA and screen definitions.
- `.codex`, `.cursor`, `.agents`: generated tool-specific outputs.
- `templates`: starter structures for greenfield and brownfield adoption.
- `examples`: practical usage examples.
- `examples/ide-adapters`: examples for Codex, Cursor, Claude, Devin, Copilot, Antigravity, Windsurf, Trae, Kilo Code and generic agents.
- `docs`: concise human-readable documentation.

## Governance

C.A.S.A expects work to be scoped, reviewed and validated according to risk.

- **Low risk**: normal validation.
- **Medium risk**: reviewer recommended, tests and contracts when relevant.
- **High risk**: human approval, rollback plan and relevant sensors.
- **Critical risk**: two-person review and incident-style change planning.

Protected paths are declared in `casa.manifest.yaml`. Policy details live in `.casa/kernel/policies`, and operational rules live in `.casa/governance`.

## Specs And Sensors

Specs are the source of feature truth. Use templates in `.casa/specs/templates` for:

- greenfield features
- API endpoints
- security-sensitive features
- brownfield modernization

Sensors define the validation expected before completion:

- lint
- typecheck
- tests
- OpenAPI diff
- migration risk
- dependency risk
- security scan

`./casa doctor` checks that the minimum C.A.S.A structure, policies, specs, context maps, sensors, mission-control files, context capsules, quality gates, registries and generated adapters are present and in sync. In this source repository it also validates IDE examples.

## Examples And Documentation

- [C.A.S.A as vibe coding architecture](docs/vibe-coding-architecture.md)
- [C.A.S.A CLI](docs/cli.md)
- [Publishing to npm](docs/publishing.md)
- [Agent and IDE examples](docs/agent-ide-examples.md)
- [C.A.S.A cockpit IA](.casa/cockpit/information-architecture.md)
- [Greenfield mode](docs/greenfield-mode.md)
- [Brownfield mode](docs/brownfield-mode.md)
- [IDE adapter examples](examples/ide-adapters)
- [Invoice dashboard example](examples/invoice-dashboard)
- [Legacy modernization example](examples/legacy-modernization)

## Manual

The long-form public draft is included as `CASA_Agent_Native_Architecture_Manual.pdf`.

## Status

C.A.S.A is in early development. The current repository contains the method core, governance files, initial adapters, examples, templates and local validation scripts.

## License

Apache-2.0. See [LICENSE](LICENSE).
