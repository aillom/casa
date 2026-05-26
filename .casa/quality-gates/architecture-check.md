# Quality Gate: Architecture Check

## Purpose

Validate that a mission preserves intended architecture boundaries.

## Applies When

- Modules, packages or dependency direction change.
- A new feature introduces new boundaries.
- Legacy code is refactored.

## Check

- Domain code does not depend on framework, transport or persistence details.
- New code follows existing module ownership.
- Cross-module coupling is intentional and documented.
- Existing examples are reused before introducing new patterns.

## Evidence

- Files reviewed:
- Architecture concerns:
- Decision:
