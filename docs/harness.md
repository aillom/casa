# C.A.S.A Harness

C.A.S.A is a terminal-first software creation harness.

It keeps reusable delivery knowledge in the repository so an engineer can move quickly without losing architecture, security, history or validation.

## Core Loop

```bash
casa guide --goal "build a SaaS"
casa recipe list
casa recipe plan create-web-saas --name "Customer Portal"
casa stack add frontend:react-app security:web-baseline
casa template list
casa skill search stripe
casa history list
casa check
```

## Verification And Spec Gates

The harness is not only suggestions: it can run and block.

```bash
casa spec new auth-login --title "Auth Login"   # spec -> plan -> tasks -> implement, gated
casa spec plan auth-login                        # blocked until the spec is marked ready
casa verify --changed                            # run governance sensors, block by exit code
```

- Sensors in `.casa/governance/sensors/*.sensor.md` declare executable frontmatter, so
  `casa verify` actually runs lint, typecheck, tests and audits and fails on a non-zero exit.
- The spec loop refuses to advance a phase until the previous phase has no `<...>` placeholders
  and is marked `status: ready`.
- `.claude/settings.json` is generated deny-first from `protected_paths`, with a `PreToolUse`
  guard that blocks edits to protected paths. Enforcement is by the harness, not the prompt.

## Recipes

Recipes are prebuilt terminal workflows stored in `.casa/registry/recipes.json`.

They combine:

- stack packs
- skills
- policies
- templates
- suggested commands
- validation evidence
- deploy and database steps
- external skill installs

Common recipes:

- `create-web-saas`
- `create-mobile-app`
- `create-desktop-app`
- `create-filament-admin`
- `add-openrouter-ai`
- `harden-web-security`
- `setup-postgres-prisma`
- `setup-supabase`
- `prepare-docker-deploy`
- `prepare-vercel-deploy`
- `prepare-fly-deploy`

## Execution Safety

Planning commands write files and history.

Commands that install dependencies, run recipe commands or mutate external systems require `--execute`:

```bash
casa recipe run create-web-saas --name "Customer Portal" --execute
casa stack add frontend:react-app --execute
```

## History

Harness history is stored in `.casa/runtime/history/harness.jsonl`.

```bash
casa history list
casa history show <entry-id>
```

Do not store secrets, raw provider responses or production data in history.

## Templates

Templates live in `templates`.

```bash
casa template list
casa template use greenfield-next-nest-postgres ../my-app
```

Templates are starting points. Recipes decide the delivery path and validation evidence.
