# C.A.S.A Improvement Roadmap

This roadmap comes from a deep analysis of C.A.S.A against the current (2025-2026) state of
the art in spec-driven development, agent harnesses, context engineering, multi-agent
orchestration, governance/evals and agent protocols (MCP, A2A, AGENTS.md, Agent Skills).

## Identity verdict

C.A.S.A is best understood as a **spec-anchored governance harness built on a multi-surface
context compiler** — not "another SDD tool" and not "another agent harness".

- **SDD: partial.** It ships spec/mission artifacts but, until now, did not enforce a gated
  `spec -> plan -> tasks -> implement` loop.
- **Harness: partial.** It has the vocabulary and a CLI, but governance was prose the model
  could ignore, with no executable sensors and no lifecycle hooks.
- **Control plane: aspirational.** No MCP server or runtime is shipped yet.

The maturity target is **spec-anchored** (drift-checks keep spec and code aligned), not
**spec-as-source** (code generated from the spec). Position the project as: *write context,
specs, policies and gates once in `.casa`; C.A.S.A compiles them into adapters for many IDEs
AND into deterministic enforcement that works with any agent.*

## Done (this iteration)

- **R1 - Generate `AGENTS.md` from `.casa`.** `AGENTS.md` is now a first-class generated
  adapter output (principles + protected paths from `casa.manifest.yaml`), drift-checked by
  `casa generate adapters --check` and `casa doctor`. See `scripts/lib/casa-adapters.mjs`.
- **R2 - Executable sensors + `casa verify`.** Each sensor under
  `.casa/governance/sensors/*.sensor.md` now declares executable frontmatter
  (`detect` / `command` / `manual` + `when` globs). `casa verify [--sensors ...] [--changed]
  [--strict]` resolves and runs them and blocks by exit code. `doctor` now fails if a sensor
  is neither executable nor declared manual. See `scripts/lib/casa-verify.mjs`.
- **R3 - Spec loop with gates.** `casa spec new|plan|tasks|implement|status|list` drives a
  gated work unit under `.casa/specs/<slug>/`. A phase will not advance until the prior phase
  has no `<...>` placeholders and is marked `status: ready`; `implement` runs `casa verify`.
  `doctor` validates work-unit integrity. See `scripts/lib/casa-loop.mjs`.
- **R5 - Deterministic enforcement.** `.claude/settings.json` is generated deny-first from
  `protected_paths`, and a `PreToolUse` hook (`.casa/governance/hooks/protected-path-guard.mjs`)
  blocks edits to protected paths with exit code 2. `doctor` asserts the deny list covers every
  protected path and that the hook is wired.
- **R4 - EARS notation + stable requirement IDs.** Spec acceptance criteria now use EARS
  (`WHEN <event> THE SYSTEM SHALL <response>`) with stable ids (`AC1`, `AC2`). Tasks reference
  them as `(AC1)`. `casa spec check` validates EARS grammar, unique ids and task coverage; the
  spec gate blocks `plan` on non-EARS criteria. See `scripts/lib/casa-loop.mjs`.

## Next - prioritized

### Medium term
- **R6 - Missions as runtime state machine + evidence ledger.** `mission start/advance/
  evidence/close` transitions, with structured evidence (prompt, model+version, policy hash,
  tool calls, gate results, risk tier, approval, rollback ref). Grounded in OWASP MCP08.
- **R8 - Mechanical risk gate with segregation of duties.** Map action/path to a risk tier
  and select an oversight mode; prevent the same agent proposing and approving a change.
- **R10 - Real brownfield discovery.** Make `init --mode brownfield` scan the target repo to
  populate the repo-map and legacy inventory instead of copying placeholders.
- **R12 - Compile skills + subagents to `.claude/agents/*.md`** with least-privilege
  frontmatter (tools allowlist, model, permissionMode). The one existing subagent is never
  compiled today.
- **R15 - Harden supply chain + CI** (allowlist/provenance for skills; SHA-pin GitHub
  Actions, add `zizmor`).

### Strategic bets
- **R2+ - Wire `casa verify` into CI and `PostToolUse`.** Run changed-scope sensors after
  edits and in CI so gates actually fail builds.
- **R7 - Ship an MCP server** (stdio) exposing capsules, registry, sensors and gates as
  Tools/Resources/Prompts. Read-only first; treat tool descriptions as untrusted.
- **R9 - Compile the repo map from real code** with tree-sitter + PageRank (Aider-style),
  emitting `symbols.index.json`, `call-graph.json`, `dependency-graph.json`,
  `api-surface.json`. Keep the dependency opt-in.

### Lower priority / later
- **R11** content freshness (source<->context hash drift), **R13** already largely done
  (skills follow `SKILL.md`), **R14** OpenSpec-style spec-delta for modernization,
  **R16** LLM-as-judge over deterministic sensors.

## Adoption blind spots to address

1. Versioning/migration of the `.casa` overlay across projects (`schema_version`, `casa migrate`).
2. Inverse drift: keeping `.casa` in sync as code evolves (staleness budget, pre-commit guard).
3. Developer experience / onboarding (guided first run; actionable `doctor` fixes).
4. Token-cost budget of loading many markdown files (`casa context budget`).
5. Testing the method itself (golden-file snapshots of generated adapters).
6. The empty cockpit: declare it a view over the ledger/OTel, not a new app.
7. Documentation coherence (a doc-lint that checks "documented vs implemented").
8. Marketplace/community governance (publisher verification, namespaces, licensing).
9. A user-facing "implemented vs documented" maturity matrix.
