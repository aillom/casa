---
id: migration-risk
manual: true
when:
  - "**/migrations/**"
---

# Sensor: migration risk

## Purpose

Detect destructive or production-risky database changes.

## Command

Manual checklist. There is no universal automatable command, so `casa verify` reports this
sensor as `manual` when migrations change. Set `command:` to wire a project-specific check
(for example a migration linter or a dry-run against a shadow database).

## Required when

- Database migrations change.
- Data retention, tenant isolation or sensitive storage changes.

## Evidence

Record migration review, rollback notes and test result in the mission evidence.
