# Example: Invoice Dashboard

## Mode

Greenfield.

## C.A.S.A flow

1. Create a greenfield feature spec.
2. Select `frontend-design-engineer`, `api-contract-engineer` and `test-engineer`.
3. Define API contract for invoice list and summary endpoints.
4. Implement UI with loading, empty and error states.
5. Run lint, typecheck, tests and `casa doctor`.

## Acceptance example

- Given invoices exist, when a user opens the dashboard, then totals, filters and invoice rows are visible.
- Given no invoices exist, when a user opens the dashboard, then an empty state explains the next action.
