# Generic Web Chat Prompt

Paste this when using an AI chat tool that cannot read repository files directly.

```text
This project follows C.A.S.A: Context, Architecture, Stack & Automation.

I will provide the relevant files. Use them in this order:
1. AGENTS.md
2. casa.manifest.yaml
3. relevant spec from .casa/specs
4. relevant policy from .casa/kernel/policies
5. relevant capability from .casa/capabilities

Rules:
- Do not invent project structure that is not in the provided files.
- Keep changes scoped to the task.
- Do not edit generated adapter files directly.
- Include tests, docs, examples or contracts when behavior changes.
- Tell me which sensors should be run before completion.
```
