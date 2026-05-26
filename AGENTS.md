# AGENTS.md

This repository follows C.A.S.A — Context, Architecture, Stack & Automation.

## Before coding

1. Read `casa.manifest.yaml`.
2. Read the relevant spec in `.casa/specs`.
3. Read the relevant policy in `.casa/kernel/policies`.
4. Use existing examples before creating new patterns.
5. Do not edit generated adapter files directly.
6. Update tests, docs and examples when behavior changes.

## Source of truth

- `.casa/kernel` is authoritative.
- `.casa/generated` is generated.
- `.casa/adapters` contains adapter templates.
- `.casa/capabilities` contains skills, subagents and workflows.
- `.casa/context` contains maps and discovery outputs.
- `.casa/modernization` contains brownfield and legacy modernization playbooks.

## Rule

Edit the C.A.S.A Core.
Generate agent-specific files.
Do not duplicate instructions manually.
