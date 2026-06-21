---
id: test
detect: test
when:
  - "**/*"
optional: true
---

# Sensor: test

## Purpose

Verify behavior and prevent regressions.

## Command

Auto-detected by `casa verify`: the repository `test` package script when present.
Set `command:` in this file's frontmatter to override for non-Node ecosystems.

## Required when

- Behavior changes.
- Legacy behavior is being protected.
- API, database or security-sensitive paths change.

## Evidence

`casa verify --sensors test` records the command and exit code in the harness ledger.
