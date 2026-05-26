# Agent Permissions Policy

## Default

Agents may read the repository and edit only files related to the assigned task.

## Forbidden without explicit approval

- Deleting files
- Changing CI/CD secrets
- Editing production infrastructure
- Running destructive database commands
- Modifying authentication or authorization logic
- Adding new dependencies
- Changing generated files directly
- Disabling tests, lint or security checks

## Required before PR

- Run tests
- Run typecheck
- Update specs
- Update OpenAPI if API changed
- Update docs if architecture changed
- Add security review if sensitive code changed
