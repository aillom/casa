---
id: security-scan
detect: security-scan
when:
  - "**/package.json"
  - "**/*.{ts,tsx,js,jsx}"
optional: true
---

# Sensor: security scan

## Purpose

Detect dependency, secret, IaC and container risks.

## Command

Auto-detected by `casa verify`: a dependency audit (`npm/pnpm/yarn audit --audit-level=high`)
for Node projects. Set `command:` to wire CodeQL, secret scanning or container scanning.

## Required when

- Dependencies change.
- Authentication, authorization, secrets, infrastructure or public API behavior changes.

## Evidence

`casa verify --sensors security-scan` records the command and exit code in the harness ledger.
