---
id: openapi-diff
manual: true
when:
  - "**/contracts/openapi/**"
  - "**/openapi.{yaml,yml,json}"
---

# Sensor: OpenAPI diff

## Purpose

Detect breaking API contract changes.

## Command

Manual by default because a diff needs a base revision. `casa verify` reports this sensor as
`manual` when API contracts change. Set `command:` to wire a real diff, for example
`oasdiff breaking <base> <revision> --fail-on ERR`.

## Required when

- HTTP endpoints change.
- Request or response DTOs change.
- Generated API clients are affected.

## Evidence

Record the contract diff command and result in the mission evidence.
