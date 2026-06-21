---
id: lint
detect: lint
when:
  - "**/*.{ts,tsx,js,jsx,mjs,cjs}"
optional: true
---

# Sensor: lint

## Purpose

Catch style, syntax and static quality issues.

## Command

Auto-detected by `casa verify`: a `lint` package script when present, otherwise a
detected ESLint config. Set `command:` in this file's frontmatter to override.

## Required when

- Source code changes.
- Generated scripts change.
- CI configuration changes.

## Evidence

`casa verify --sensors lint` records the command and exit code in the harness ledger.
