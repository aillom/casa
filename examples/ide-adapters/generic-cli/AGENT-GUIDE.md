# Generic CLI Agent Guide

Use this guide for CLI-based coding agents without native C.A.S.A support.

## Bootstrap prompt

```text
You are working in a C.A.S.A repository.
Read AGENTS.md, casa.manifest.yaml, the relevant spec and relevant policy.
Use the smallest useful capability from .casa/capabilities.
Do not edit generated adapter files directly.
Run npm run check before completion.
```

## Expected workflow

1. Inspect context.
2. Identify risk.
3. Implement narrowly.
4. Update tests, docs, examples or contracts.
5. Run sensors.
6. Summarize evidence.
