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

- **R6 - Missions as runtime state machine + evidence ledger.** `casa mission start|advance|
  close|evidence|status|list` with validated transitions and a per-mission evidence ledger
  (`.casa/runtime/missions/<id>.evidence.jsonl`) capturing status, policy hash and gate
  results; `close` requires evidence. See `scripts/lib/casa-mission.mjs`.
- **R7 - MCP server.** Zero-dependency stdio JSON-RPC server (`scripts/casa-mcp.mjs`,
  `casa-mcp` bin) exposing capsules, gates, policies and repo maps as Resources, read-only
  Tools plus `casa_verify`, and spec/mission templates as Prompts.
- **R8 - Mechanical risk gate + segregation of duties.** `casa risk assess <path...>`
  classifies paths into low/medium/high/critical; high/critical missions require an approval
  from a different actor than the implementer before `close`. See `scripts/lib/casa-risk.mjs`.
- **R9 - Compile the repo map from real code.** Zero-dependency scanner (`casa context build`)
  extracts symbols and import edges, ranks by inbound imports, and emits `modules.md`,
  `dependency-map.md` and code-intelligence JSON. See `scripts/lib/casa-repomap.mjs`.
- **R10 - Real brownfield discovery.** `init --mode brownfield|hybrid` scans the target repo
  and writes a real repo map and a heuristic legacy inventory.
- **R11 - Context freshness.** `casa context check` and `doctor` detect when the compiled repo
  map drifts from source (content hash in `repomap.lock.json`).
- **R12 - Compiled Claude subagents.** Skills and subagents compile to `.claude/agents/*.md`
  with least-privilege tool allowlists (read-only agents cannot edit).
- **R14 - Behavior delta unit.** `casa spec delta <slug>` adds an OpenSpec-style
  ADDED/MODIFIED/REMOVED change unit for modernization, validated by `casa spec check`.
- **CI** runs `casa verify` so governance gates fail builds.

## Next - prioritized

### Medium term
- **R15 - Harden supply chain + CI further** (SHA-pin GitHub Actions, add `zizmor`/`mcp-scan`;
  the offline-resolvable parts ship, SHA-pinning needs a network pass).
- **R2++ - `PostToolUse` verify** wiring so changed-scope sensors run after each edit.

### Deferred
- **R13** already done (skills follow `SKILL.md`).
- **R16 - LLM-as-judge over deterministic sensors.** Deferred: requires an external model
  provider and API keys, which would break the zero-dependency footprint. Revisit as an
  optional plugin.

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
