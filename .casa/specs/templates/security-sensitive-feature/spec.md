# Security-Sensitive Feature Spec: <Feature Name>

## Goal

Describe the sensitive behavior and why it is needed.

## Assets

- Account data
- Tenant data
- Tokens, secrets or credentials
- Audit records

## Trust Boundaries

- Client to API
- API to database
- API to external provider

## Threats

- Broken authorization
- Tenant data leakage
- Token or secret exposure
- Injection or unsafe input handling
- Missing audit trail

## Controls

- Server-side authorization:
- Input validation:
- Rate limiting:
- Error sanitization:
- Audit logging:

## Acceptance Criteria

> EARS format with stable ids. Negative and abuse-case tests reference them as `(AC1)`.

- AC1: WHEN an unauthorized principal requests a protected resource THE SYSTEM SHALL deny access
- AC2: IF input is malformed or hostile THEN THE SYSTEM SHALL reject it and log the attempt
- AC3: THE SYSTEM SHALL keep secrets and tokens out of responses, errors and logs

## Tests

- Negative authorization tests:
- Abuse-case tests:
- Logging and error exposure checks:

## Risks and Questions

- Risk or unknown 1
- Risk or unknown 2
