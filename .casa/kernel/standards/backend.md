# Backend Standard

## Required

- Keep domain logic out of controllers.
- Validate external input at the boundary.
- Keep persistence details behind repositories or data access modules.
- Use explicit authorization for sensitive actions.
- Add tests for behavior changes.

## Avoid

- Framework imports in domain logic.
- Silent catch blocks.
- Business rules duplicated across controllers and jobs.
