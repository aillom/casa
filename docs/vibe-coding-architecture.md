# C.A.S.A As Vibe Coding Architecture

C.A.S.A treats vibe coding as an engineering control-plane problem.

The goal is not to stop fast AI-assisted work. The goal is to make fast work safe enough to survive real projects: clear context, boundaries, specs, policies, missions, tests, quality gates, generated adapters and validation loops.

## The Problem

Without architecture, vibe coding usually creates:

- prompts that drift from the real codebase
- duplicated instructions per IDE
- accidental architecture changes
- missing tests and contracts
- weak security review
- legacy rewrites without safety baselines
- generated files that no one can trace back to a source of truth

## The C.A.S.A Answer

C.A.S.A separates the stable method from the agent-specific surface and adds mission-based execution with evidence.

```text
.casa Core
  -> specs
  -> policies
  -> standards
  -> skills
  -> workflows
  -> context maps
  -> governance sensors
  -> quality gates
  -> mission control
  -> context capsules

Adapter generation
  -> Codex skills
  -> Cursor rules
  -> Claude memory and agents
  -> Devin knowledge
  -> Copilot instructions
  -> Antigravity rules and workflows
  -> Windsurf workspace rules
  -> Trae project context
  -> Kilo Code AGENTS.md and CONTEXT.md
  -> generic agent guide
  -> any IDE prompt pack
```

## Operating Model

1. Put stable project knowledge in `.casa`.
2. Keep global agent instructions short.
3. Load specialized capabilities only when the task needs them.
4. Use specs as the source of feature truth.
5. Use policies and risk levels to decide what needs review.
6. Create a mission with tasks, handoffs, risk gates and evidence.
7. Generate agent-specific files from one core.
8. Run sensors and quality gates before claiming the work is complete.

## What Makes It Different From Prompt Packs

Prompt packs copy instructions into every tool. C.A.S.A keeps one source of truth and adapts it.

The same feature request should work across tools:

```text
Implement the invoice dashboard using C.A.S.A.
Read AGENTS.md, the feature spec, relevant policies and generated adapter guidance.
Use the smallest useful skills.
Update tests, docs and contracts.
Run the required sensors before completion.
```

The agent surface may change. The C.A.S.A mission model does not.

## Design Rule

Write once. Adapt everywhere. Validate always.
