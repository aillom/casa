# Testing Standard

## Required

- Match test level to risk.
- Add characterization tests before legacy refactors.
- Add negative tests for sensitive authorization paths.
- Add contract tests for API behavior that clients consume.

## Avoid

- Snapshot-only coverage for critical behavior.
- Refactoring legacy code without a baseline.
- Treating smoke tests as a substitute for contract tests.
