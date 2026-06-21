# C.A.S.A CLI

The C.A.S.A CLI is the command surface for the engineering control plane.

It is intentionally small in v0.1. The goal is to make C.A.S.A operable without creating a large framework too early.

## Local Usage

From this repository:

```bash
./casa init ../my-app --mode greenfield
./casa doctor
./casa check
./casa verify
./casa spec new auth-login --title "Auth Login"
./casa commands
./casa generate adapters
./casa compose --preset web-saas --name "Customer Portal"
./casa stack list
./casa stack plan frontend:react-app security:web-baseline
./casa ai configure openrouter --model openai/gpt-5.2
./casa guide --goal "build and deploy a SaaS"
./casa recipe list
./casa recipe plan create-web-saas --name "Customer Portal"
./casa template list
./casa history list
./casa skill search stripe
./casa skill inspect owner/repo/path/to/skill
./casa mission new invoice-dashboard --title "Invoice Dashboard" --mode greenfield
./casa capsule list
./casa gate list
```

## npx Usage

After publishing as an npm package, the same commands are available through `npx`:

```bash
npx @aillomai/casa init --mode greenfield
./casa doctor
./casa check
./casa commands
```

Without the local shortcut:

```bash
npx @aillomai/casa doctor
npx @aillomai/casa check
npx @aillomai/casa generate adapters
npx @aillomai/casa compose --preset ai-fullstack --openrouter
npx @aillomai/casa stack add frontend:react-app security:web-baseline
npx @aillomai/casa mission new invoice-dashboard --title "Invoice Dashboard" --mode greenfield
```

## Commands

### `casa init [target-dir]`

Installs the C.A.S.A control-plane overlay into a new or existing project.

It copies:

- `AGENTS.md`
- `casa.manifest.yaml`
- `casa`
- `casa.cmd`
- `.casa`
- `.agents`
- `.codex`
- `.cursor`
- `.claude/settings.json`

It also creates `.casa/commands.md`, a short command cheat sheet for the project.

Useful options:

- `--mode greenfield|brownfield|hybrid`
- `--adapters claude,github-copilot,kilo-code`
- `--adapters all`
- `--force`

### `casa commands`

Prints the short command cheat sheet:

```bash
./casa doctor
./casa check
./casa mission new first-feature --title "First Feature"
```

### `casa doctor`

Validates the C.A.S.A structure, policies, specs, context maps, generated adapters, Mission Control files, context capsules, quality gates and registries. In the source repository it also validates IDE examples.

### `casa check`

Runs the full local validation chain:

1. structure check
2. generated adapter sync check
3. doctor

### `casa generate adapters`

Regenerates agent-specific adapter outputs from C.A.S.A Core.

This includes the generated `AGENTS.md` and the deny-first `.claude/settings.json`
derived from `casa.manifest.yaml` protected paths.

Use `--check` to validate sync without writing files.

### `casa verify`

Runs governance sensors and blocks on failures by exit code. Sensors live in
`.casa/governance/sensors/*.sensor.md` and declare executable frontmatter
(`detect` / `command` / `manual` with `when` globs).

```bash
./casa verify
./casa verify --sensors lint,typecheck,test
./casa verify --changed
./casa verify --strict
```

`--changed` only runs sensors whose `when` globs match files changed against git HEAD.
`--strict` treats skipped sensors as failures. Results are recorded in the harness ledger.

### `casa context`

Compiles a repo map from real source code (zero-dependency scan) and checks its freshness.

```bash
./casa context build [--map-tokens 50]
./casa context check
```

`build` extracts top-level symbols and import edges, ranks files by inbound imports, and writes
`.casa/context/repo-map/*` plus `.casa/context/code-intelligence/*.json`. `check` exits non-zero
when the source has drifted from the last build. `casa init --mode brownfield` runs this
automatically against the target repository.

### `casa risk`

Classifies one or more paths into a risk tier from `casa.manifest.yaml` protected paths and
sensitive areas.

```bash
./casa risk assess src/auth/login.ts .casa/kernel/policies/secure-coding.md
```

High and critical risk drives segregation of duties on `casa mission close` (see below).

### `casa spec`

Drives the gated `spec -> plan -> tasks -> implement` loop over a work unit in
`.casa/specs/<slug>/`. A phase will not advance until the prior phase has no `<...>`
placeholders and is marked `status: ready` in its frontmatter.

```bash
./casa spec new auth-login --title "Auth Login" --mode greenfield
./casa spec plan auth-login
./casa spec tasks auth-login
./casa spec delta auth-login         # OpenSpec-style ADDED/MODIFIED/REMOVED for modernization
./casa spec check auth-login
./casa spec implement auth-login
./casa spec list
./casa spec status auth-login
```

Acceptance criteria use EARS notation with stable ids (`- AC1: WHEN ... THE SYSTEM SHALL ...`).
`casa spec check` validates the EARS grammar, unique ids, and which criteria are covered by a
task (tasks reference criteria as `(AC1)`). The spec gate blocks `plan` until every criterion is
valid EARS. `casa spec implement` only runs after all phases are ready, and then runs `casa verify`.

### `casa compose`

Generates a governed application stack plan, a stack composition spec and optional AI provider config.

Examples:

```bash
./casa compose --preset web-saas --name "Customer Portal"
./casa compose --preset mobile-app --name "Field App"
./casa compose --preset desktop-app --name "Backoffice Desktop"
./casa compose --preset filament-admin --name "Ops Admin"
./casa compose --preset ai-fullstack --openrouter --model openai/gpt-5.2
```

Without `--preset` or `--packs`, `casa compose` asks questions in an interactive terminal.

Generated files include:

- `.casa/runtime/stack-plans/<date>-<name>.md`
- `.casa/specs/generated/<name>/spec.md`
- `.casa/ai/model-router.yaml` when OpenRouter is selected
- `.casa/ai/openrouter.env.example` when OpenRouter is selected

The OpenRouter files store environment variable names and placeholders only. Real API keys must stay in local environment files or secret managers.

### `casa stack`

Lists, inspects, plans or installs governed stack packs from `.casa/registry/stacks.json`.

```bash
./casa stack list
./casa stack list --surface mobile
./casa stack show ai:openrouter
./casa stack plan frontend:react-app security:web-baseline
./casa stack plan desktop:tauri-react --ecosystem all
./casa stack plan --preset web-saas --output .casa/runtime/stack-plans/web-saas.md
./casa stack add frontend:react-app security:web-baseline
```

`stack add` writes a plan and prints install commands. It only runs package managers when `--execute` is passed:

```bash
./casa stack add frontend:react-app security:web-baseline --execute
```

Supported pack categories include frontend, backend, database, security, mobile, desktop, admin and AI.
Use `--ecosystem node|composer|python|cargo|all` when the auto-detected package ecosystem is not the one you want.

### `casa recipe`

Plans or runs prebuilt terminal workflows from `.casa/registry/recipes.json`.

```bash
./casa recipe list
./casa recipe show create-web-saas
./casa recipe plan create-web-saas --name "Customer Portal"
./casa recipe plan add-openrouter-ai --name "Assistant Runtime" --write
./casa recipe run harden-web-security
```

`recipe run` records history and prints install commands. It only runs recipe commands and installs packages when `--execute` is present.

```bash
./casa recipe run create-web-saas --name "Customer Portal" --execute
```

### `casa guide`

Suggests a terminal-first path for a goal.

```bash
./casa guide --goal "deploy"
./casa guide --goal "mobile app"
```

### `casa template`

Lists or copies starter templates.

```bash
./casa template list
./casa template use greenfield-next-nest-postgres ../my-app
```

### `casa history`

Shows local harness history from `.casa/runtime/history/harness.jsonl`.

```bash
./casa history list
./casa history show <entry-id>
```

### `casa skill`

Lists, creates, searches, audits, installs or removes C.A.S.A skills.

```bash
./casa skill list
./casa skill new billing-engineer --description "Use when implementing billing flows."
./casa skill new payment-reviewer --no-generate
./casa skill search stripe
./casa skill inspect owner/repo/path/to/skill
./casa skill install owner/repo/path/to/skill
./casa skill audit
./casa skill update stripe-payments
./casa skill remove stripe-payments
```

By default, `skill new` updates `.casa/registry/skills.yaml` and regenerates agent adapters.
Remote GitHub installs are inspected, audited, pinned to a commit SHA in `.casa/registry/skills.lock.json`, then installed under `.casa/capabilities/skills`.

### `casa ai configure openrouter`

Generates safe OpenRouter configuration without storing raw secrets.

```bash
./casa ai configure openrouter --model openai/gpt-5.2
./casa ai configure openrouter --model anthropic/claude-sonnet-4.5 --api-key-env OPENROUTER_API_KEY
```

The generated config uses:

- base URL: `https://openrouter.ai/api/v1`
- API key env var: `OPENROUTER_API_KEY`
- model env var: `OPENROUTER_MODEL`

### `casa mission`

Creates and drives missions as a runtime state machine over
`.casa/runtime/missions/<id>.md` (status tracked in frontmatter).

```bash
./casa mission new invoice-dashboard --title "Invoice Dashboard" --mode greenfield --risk high
./casa mission start invoice-dashboard      # planned -> active
./casa mission advance invoice-dashboard    # active -> review
./casa mission evidence invoice-dashboard --note "validated" --verify --actor dev@example.com
./casa mission approve invoice-dashboard --actor reviewer@example.com
./casa mission close invoice-dashboard      # review -> done (requires evidence; approval if high/critical)
./casa mission status invoice-dashboard
./casa mission list
```

For high or critical risk missions, `close` requires an approval recorded by a different actor
than the implementer (segregation of duties). The actor defaults to `git config user.email` or
the `CASA_ACTOR` environment variable.

`mission evidence` appends to a per-mission ledger
(`.casa/runtime/missions/<id>.evidence.jsonl`) with a timestamp, the current status, a policy
hash, and (with `--verify`) `casa verify` gate results. `mission close` refuses to finish until
at least one evidence entry exists.

### `casa-mcp` (MCP server)

A zero-dependency MCP stdio server that exposes the C.A.S.A control plane to MCP-aware agents
over JSON-RPC. See [docs/agent-ide-examples.md](agent-ide-examples.md) and
`.casa/protocols/mcp` for resource, tool and prompt details.

```bash
casa-mcp
# or
node scripts/casa-mcp.mjs
```

### `casa capsule list`

Lists available context capsules.

### `casa gate list`

Lists available quality gates.
