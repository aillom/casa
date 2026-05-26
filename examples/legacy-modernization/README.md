# Example: Legacy Modernization

## Mode

Brownfield.

## C.A.S.A flow

1. Use `legacy-archaeologist` for read-only discovery.
2. Fill a brownfield modernization spec.
3. Add characterization tests for current behavior.
4. Create a seam or facade.
5. Introduce the new implementation behind the seam.
6. Retire legacy code only after evidence and rollback planning.

## Safety example

- Preserve existing API response shape until contract consumers are migrated.
- Record known legacy defects separately from behavior that must remain compatible.
