# Playbook: Strangler

## Goal

Replace legacy behavior incrementally without a risky rewrite.

## Steps

1. Put new behavior behind a seam.
2. Run old and new paths in parallel when possible.
3. Move traffic gradually.
4. Compare metrics, logs and tests.
5. Keep rollback available until confidence is high.

## Output

- Traffic migration plan.
- Rollback plan.
- Verification evidence.
