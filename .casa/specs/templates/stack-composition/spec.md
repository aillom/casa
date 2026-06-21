# Spec: <Application Stack>

## Goal

Define the stack packs, skills, policies, install commands and generated assets required for the application.

## Users

- Builder using C.A.S.A to compose a governed app stack.
- Agent implementing the stack through C.A.S.A missions.
- Reviewer validating dependency, security and architecture decisions.

## Selected Surfaces

- Web:
- Mobile:
- Desktop:
- API:
- Admin:
- Database:
- AI:

## Selected Packs

- Pack:
- Why:
- Risk:
- Install command:

## Functional Requirements

- The user can select stack packs from `.casa/registry/stacks.json`.
- The generated plan lists install commands, skills, policies and quality gates.
- Security-sensitive packs trigger security review expectations.
- AI provider configuration uses environment variables and never stores raw keys.

## Non-Functional Requirements

- Dependency additions must be reproducible.
- Generated plans must be reviewable in version control.
- Secrets must remain outside committed files.
- The stack must keep frontend, backend, database and AI boundaries explicit.

## API Requirements

- List public endpoints that selected backend/API packs will expose.
- Document authentication and authorization expectations before implementation.
- Generate or update OpenAPI contracts when API behavior is introduced.

## Data Model

Describe tenant boundaries, sensitive data ownership and migration risk for selected database packs.

## Acceptance Criteria

> EARS format with stable ids. Tasks and evidence reference them as `(AC1)`.

- AC1: WHEN the stack plan is generated THE SYSTEM SHALL include install commands, skills, policies, quality gates and open questions
- AC2: WHEN OpenRouter is selected THE SYSTEM SHALL write only environment variable names and example placeholders
- AC3: IF a security-sensitive pack is selected THEN THE SYSTEM SHALL include the security gate in the mission
- AC4: WHEN dependencies are installed THE SYSTEM SHALL record dependency review and relevant tests in evidence

## Risks and Questions

- Which selected packages need extra review because they affect auth, crypto, uploads, parsing, payments, database access or AI?
- Which generated files are committed and which local files must remain ignored?
- Which framework boundaries are authoritative if existing project code already uses another stack?

## Out of Scope

- Storing real provider keys.
- Automatically resolving all framework conflicts in existing code.
- Deploying infrastructure without a separate DevOps mission.
