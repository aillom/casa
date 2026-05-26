# Protected Files

Protected files require extra care because changes can affect security, CI, data integrity or generated instructions.

## Protected path patterns

- `.github/workflows/**`
- `.casa/kernel/policies/**`
- `.casa/kernel/risk-model/**`
- `devops/**`
- `**/migrations/**`
- `**/auth/**`
- `**/security/**`
- `**/contracts/openapi/**`

## Required handling

- Identify risk level before editing.
- Explain why the protected path must change.
- Run the relevant sensors.
- Request human approval for high-risk or critical changes.
