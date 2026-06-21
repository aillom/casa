# Changelog

All notable changes to C.A.S.A will be documented in this file.

## 0.2.0

- Generate `AGENTS.md` from the C.A.S.A core (principles and protected paths) as a first-class, drift-checked adapter output instead of a hand-maintained file.
- Add executable governance sensors (frontmatter `detect` / `command` / `manual` with `when` globs) and `casa verify` to run them and block on failures by exit code.
- Add a gated spec loop: `casa spec new|plan|tasks|implement|status|list` advances `.casa/specs/<slug>/` work units only when each phase is complete and marked `status: ready`.
- Adopt EARS acceptance criteria with stable requirement ids (`AC1`, `AC2`) across spec templates, add `casa spec check` for EARS/uniqueness/task-coverage validation, and block the plan gate on non-EARS criteria.
- Generate deterministic enforcement for Claude Code: a deny-first `.claude/settings.json` from `protected_paths` plus a `PreToolUse` guard hook that blocks edits to protected paths (exit code 2).
- Extend `casa doctor` to validate executable sensors, spec work-unit integrity and protected-path enforcement coverage.
- Add `docs/improvement-roadmap.md` with the analysis verdict and the prioritized next steps.

## 0.1.6

- Add GitHub skill marketplace search, inspect, install, audit, update and remove commands.
- Add skill marketplace trust config, commit-pinned skill lockfile and external skill audit rules.
- Add skill marketplace documentation and supply-chain governance checks.

## 0.1.5

- Add terminal-first harness recipes, stack packs, templates, history and guided CLI commands.
- Add OpenRouter model-router configuration support with env-only secrets.
- Add stack, AI and harness standards plus generated skills for stack composition, AI integration and software delivery facilitation.

## 0.1.4

- Add AI coding agent harness positioning to README, introduction and npm metadata for discovery.

## 0.1.3

- Split README quick start instructions into new project, existing project and source repository flows.

## 0.1.2

- Add local command shortcut files: `casa`, `casa.cmd` and `.casa/commands.md`.
- Add `casa commands` to print the short command cheat sheet.
- Update docs to prefer `./casa ...` after initialization.

## 0.1.1

- Add `casa init` for installing the C.A.S.A overlay into new or existing projects.
- Add CLI smoke tests for init, doctor, check, adapter generation and mission creation.
- Make doctor and structure checks work in both the source repository and initialized projects.

## 0.1.0

Initial public structure:

- C.A.S.A manifest
- AGENTS.md
- Kernel principles
- Security policies
- Initial skills
- Initial workflows
- Greenfield and brownfield spec templates
- Governance permissions
