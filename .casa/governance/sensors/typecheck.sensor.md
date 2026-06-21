---
id: typecheck
detect: typecheck
when:
  - "**/*.{ts,tsx}"
optional: true
---

# Sensor: typecheck

## Purpose

Catch invalid types and broken contracts.

## Command

Auto-detected by `casa verify`: a `typecheck` package script when present, otherwise
`tsc --noEmit` when a `tsconfig.json` and TypeScript are available. Set `command:` to override.

## Required when

- TypeScript or typed API contracts change.
- Generated clients or DTOs change.

## Evidence

`casa verify --sensors typecheck` records the command and exit code in the harness ledger.
