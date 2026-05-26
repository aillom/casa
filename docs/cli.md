# C.A.S.A CLI

The C.A.S.A CLI is the command surface for the engineering control plane.

It is intentionally small in v0.1. The goal is to make C.A.S.A operable without creating a large framework too early.

## Local Usage

From this repository:

```bash
npm run casa -- doctor
npm run casa -- check
npm run casa -- generate adapters
npm run casa -- mission new invoice-dashboard --title "Invoice Dashboard" --mode greenfield
npm run casa -- capsule list
npm run casa -- gate list
```

## Future npx Usage

After publishing as an npm package, the same commands should become:

```bash
npx @aillomai/casa doctor
npx @aillomai/casa check
npx @aillomai/casa generate adapters
npx @aillomai/casa mission new invoice-dashboard --title "Invoice Dashboard" --mode greenfield
```

## Commands

### `casa doctor`

Validates the C.A.S.A structure, policies, specs, context maps, generated adapters, Mission Control files, context capsules, quality gates, registries and IDE examples.

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
