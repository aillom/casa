# Eval: Architecture Drift

## Purpose

Detect changes that violate intended module boundaries or dependency direction.

## Check

- Does domain code import framework, persistence or transport code?
- Did a feature create duplicated patterns instead of reusing local examples?
- Did a shortcut introduce coupling across bounded contexts?

## Output

- Blocking drift issues.
- Recommended refactor or follow-up.
