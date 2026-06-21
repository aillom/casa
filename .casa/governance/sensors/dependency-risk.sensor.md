---
id: dependency-risk
detect: dependency-audit
when:
  - "**/package.json"
  - "**/package-lock.json"
  - "**/pnpm-lock.yaml"
  - "**/yarn.lock"
optional: true
---

# Sensor: dependency risk

## Purpose

Detect supply-chain risk from new or changed dependencies.

## Command

Auto-detected by `casa verify`: a dependency audit for Node projects. Set `command:` to
wire an alternative SCA tool (for example `osv-scanner` or `pip-audit`).

## Required when

- Package manifests or lockfiles change.
- Auth, crypto, parser, upload or payment dependencies are added.

## Evidence

`casa verify --sensors dependency-risk` records the command and exit code in the harness ledger.
