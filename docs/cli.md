# C.A.S.A CLI

The C.A.S.A CLI is the command surface for the engineering control plane.

It is intentionally small in v0.1. The goal is to make C.A.S.A operable without creating a large framework too early.

## Local Usage

From this repository:

```bash
./casa init ../my-app --mode greenfield
./casa doctor
./casa check
./casa commands
./casa generate adapters
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

Use `--check` to validate sync without writing files.

### `casa mission new <slug>`

Creates a mission record in `.casa/runtime/missions` from `.casa/mission-control/mission-template.md`.

### `casa capsule list`

Lists available context capsules.

### `casa gate list`

Lists available quality gates.
