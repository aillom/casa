# Playbook: Branch by Abstraction

## Goal

Ship large internal changes through a stable abstraction instead of long-lived branches.

## Steps

1. Introduce an abstraction around the behavior.
2. Keep old implementation as the default.
3. Add the new implementation behind the same abstraction.
4. Switch gradually with tests and observability.
5. Remove old code after evidence.

## Output

- Abstraction boundary.
- Migration checklist.
- Retirement plan.
