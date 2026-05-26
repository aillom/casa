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

- Given...
- When...
- Then...

## Tests

- Negative authorization tests:
- Abuse-case tests:
- Logging and error exposure checks:

## Risks and Questions

- Risk or unknown 1
- Risk or unknown 2
