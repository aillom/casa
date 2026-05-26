# Context Capsule: security-sensitive-change

## Use When

Touching authentication, authorization, secrets, sensitive data, public endpoints, logs, uploads or infrastructure.

## Load

- `.casa/capabilities/skills/security-reviewer/SKILL.md`
- `.casa/kernel/policies/secure-coding.md`
- `.casa/kernel/policies/data-protection.md`
- `.casa/governance/permissions/protected-files.md`
- `.casa/governance/sensors/security-scan.sensor.md`

## Watch

- Server-side authorization.
- Input validation.
- Secret and sensitive data logging.
- Error exposure.
- Required approval for high-risk changes.

## Validate

- Security quality gate.
- Negative authorization tests when relevant.
- `npm run check`
