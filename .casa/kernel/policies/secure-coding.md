# Secure Coding Policy

## Required

- Validate all external input.
- Never trust client-side validation.
- Never hardcode secrets.
- Never log tokens, passwords, cookies or sensitive data.
- Use centralized error handling.
- Use authorization checks for sensitive actions.
- Add tests for authorization-sensitive logic.

## Forbidden

- Raw SQL without parameterization and review.
- Exposing stack traces to API consumers.
- Disabling TLS verification.
- Silent catch blocks.
- Public endpoints without explicit authorization decision.
