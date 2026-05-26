# C.A.S.A — Context, Architecture, Stack & Automation

C.A.S.A is an agent-native architecture method for building, governing and modernizing software systems with AI coding agents.

It is not a framework, a prompt pack or a single starter template. C.A.S.A is an operating layer that gives agents the right context, boundaries, reusable capabilities and validation gates so AI-assisted delivery stays maintainable.

**Core principle:** Design for agents. Govern for humans. Evolve for legacy.

## Why It Exists

AI coding agents can move fast, but without structure they amplify common engineering problems:

- duplicated patterns
- architecture drift
- weak or stale documentation
- missing tests and contracts
- unsafe automation
- tool-specific instructions that cannot be reused
- rewrite-first behavior in legacy systems

C.A.S.A turns ad hoc agent work into governed software delivery.

## What You Get

- **Context**: AGENTS.md, specs, policies, repo maps, domain maps and generated agent guidance.
- **Architecture**: boundaries, dependency direction, API contracts, ownership and modernization paths.
- **Stack**: replaceable stack guidance for frontend, backend, database, DevOps, testing and docs.
- **Automation**: doctor checks, generated adapter sync checks, CI gates, sensors, security scans and drift detection.

## Quick Start

```bash
npm ci
npm run check
```

Useful commands:

```bash
npm run generate        # regenerate agent-specific adapter files
npm run generate:check  # verify generated adapters are in sync
npm run doctor          # validate C.A.S.A structure and governance checks
npm run check           # run structure, generated sync and doctor checks
```

## How To Work In This Repo

1. Edit C.A.S.A Core files first, usually under `.casa`.
2. Update specs, policies, docs or examples when behavior changes.
3. Run `npm run generate` after changing Core files that affect agent adapters.
4. Run `npm run check` before opening or merging a PR.
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

Start with `templates/greenfield-next-nest-postgres`.

### Brownfield

Install C.A.S.A as an overlay on an existing system without forcing a rewrite:

- discover before changing
- map modules, dependencies, runtime and risks
- add characterization or smoke tests
- create seams before refactoring
- migrate incrementally through strangler or branch-by-abstraction patterns

Start with `templates/brownfield-overlay`.

## Repository Map

- `AGENTS.md` — short universal instructions for coding agents.
- `casa.manifest.yaml` — method metadata, enabled adapters, governance requirements and protected paths.
- `.casa/kernel` — source of truth for principles, standards, policies and risk model.
- `.casa/context` — repo maps, architecture maps, domain maps, runtime maps and legacy inventory.
- `.casa/capabilities` — skills, subagents and workflows.
- `.casa/protocols` — alignment with AGENTS.md, Agent Skills, MCP, A2A, OpenAPI and AsyncAPI.
- `.casa/adapters` — adapter notes for supported agent surfaces.
- `.casa/generated` — generated adapter packs and indexes.
- `.casa/specs` — reusable specification templates.
- `.casa/modernization` — brownfield discovery, baselining, seams, strangler and retirement playbooks.
- `.casa/governance` — permissions, protected files, dangerous actions, sensors, evals and audit guidance.
- `.codex`, `.cursor`, `.agents` — generated tool-specific outputs.
- `templates` — starter structures for greenfield and brownfield adoption.
- `examples` — practical usage examples.
- `docs` — concise human-readable documentation.

## Governance

C.A.S.A expects work to be scoped, reviewed and validated according to risk.

- Low risk: normal validation.
- Medium risk: reviewer recommended, tests and contracts when relevant.
- High risk: human approval, rollback plan and relevant sensors.
- Critical risk: two-person review and incident-style change planning.

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

`npm run doctor` checks that the minimum C.A.S.A structure, policies, specs, context maps, sensors and generated adapters are present and in sync.

## Manual

The long-form public draft is included as `CASA_Agent_Native_Architecture_Manual.pdf`.

## Status

C.A.S.A is in early development. The current repository contains the method core, governance files, initial adapters, examples, templates and local validation scripts.

## License

Apache-2.0. See `LICENSE`.
