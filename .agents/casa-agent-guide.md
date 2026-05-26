# C.A.S.A Agent Guide

This project uses C.A.S.A — Context, Architecture, Stack & Automation.

## How to operate

1. Read `AGENTS.md`.
2. Read `casa.manifest.yaml`.
3. Select the smallest relevant capability from `.casa/capabilities`.
4. Follow policies in `.casa/kernel/policies`.
5. Follow specs in `.casa/specs`.
6. Do not edit generated files directly.

## When working on legacy code

Use the legacy modernization flow:

1. Discovery
2. Baseline
3. Seams
4. Strangler
5. Retirement

## When working on security-sensitive code

Use security review before implementation and before final response.
