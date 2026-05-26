# Database Standard

## Required

- Use versioned migrations.
- Review destructive changes.
- Add indexes for critical read paths.
- Protect tenant boundaries.
- Document sensitive data ownership.

## Avoid

- Manual production database changes.
- Unreviewed raw SQL.
- Schema changes without rollback thinking.
