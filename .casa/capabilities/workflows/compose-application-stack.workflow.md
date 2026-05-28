# Workflow: Compose Application Stack

1. Read the stack composition spec or create one from `.casa/specs/templates/stack-composition/spec.md`.
2. Read `.casa/registry/stacks.json`.
3. Select a preset or the smallest set of stack packs.
4. Load `stack-composer` and the skills declared by the selected packs.
5. Generate a stack plan under `.casa/runtime/stack-plans`.
6. Configure AI providers through environment variable names only.
7. Install dependencies only when explicitly requested.
8. Update specs, docs or examples if behavior changes.
9. Run dependency, security and relevant test gates.
10. Summarize installed packs, risk and validation evidence.
