# Eval: Security Regression

## Purpose

Detect security regressions in sensitive changes.

## Check

- Authorization remains server-side.
- Inputs are validated at boundaries.
- Secrets and sensitive data are not logged.
- Errors do not expose stack traces or internals.

## Output

- Blocking security findings.
- Required tests or policy updates.
