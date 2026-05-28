# AI Integration Standard

## Required

- Keep provider keys in environment variables.
- Make the default model explicit and configurable per environment.
- Add timeout, retry, rate-limit and budget decisions before production use.
- Validate model input and output at the boundary.
- Avoid logging raw prompts, completions, files or API keys unless explicitly approved and redacted.
- Document fallback model behavior when multiple models are allowed.
- Add tests for tool calls, structured output parsing and provider errors when relevant.

## Avoid

- Hardcoded API keys.
- Silent fallback to a cheaper or weaker model without traceable configuration.
- Provider-specific code inside domain logic.
- Unbounded streaming or background generation jobs.
- Treating AI output as trusted data.
