# C.A.S.A Stack Composition

C.A.S.A can compose application stacks through governed packs instead of ad hoc dependency installs.

The source of truth is `.casa/registry/stacks.json`.
For full terminal workflows, use recipes from `.casa/registry/recipes.json` through `casa recipe`.

## Presets

Use presets when you want C.A.S.A to choose a coherent starting set:

```bash
./casa compose --preset web-saas --name "Customer Portal"
./casa compose --preset mobile-app --name "Field App"
./casa compose --preset desktop-app --name "Backoffice Desktop"
./casa compose --preset filament-admin --name "Ops Admin"
./casa compose --preset ai-fullstack --openrouter --model openai/gpt-5.2
```

Current presets:

- `web-saas`: React, Fastify, Postgres/Prisma and web/API security.
- `mobile-app`: Expo, Fastify, Supabase and web/API security.
- `desktop-app`: Tauri, React, SQLite/Prisma and desktop security.
- `filament-admin`: Laravel Filament admin panel, database review and Laravel security.
- `ai-fullstack`: Web SaaS plus OpenRouter model routing.

## Packs

Use packs when you want explicit control:

```bash
./casa stack list
./casa stack show frontend:react-app
./casa stack plan frontend:react-app backend:fastify-api database:postgres-prisma security:web-baseline
./casa stack add frontend:react-app security:web-baseline
```

`stack add` writes a plan and prints commands. It installs packages only with `--execute`:

```bash
./casa stack add frontend:react-app security:web-baseline --execute
```

Use `--ecosystem node|composer|python|cargo|all` if auto-detection is not right for the target project.

## Generated Files

`casa compose` generates:

- `.casa/runtime/stack-plans/<date>-<name>.md`
- `.casa/specs/generated/<name>/spec.md`
- `.casa/ai/model-router.yaml` when OpenRouter is selected
- `.casa/ai/openrouter.env.example` when OpenRouter is selected

## OpenRouter

OpenRouter configuration uses environment variables:

- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `OPENROUTER_BASE_URL`

Real keys must stay in local environment files or secret managers.

```bash
./casa ai configure openrouter --model openai/gpt-5.2
```

## Governance

Before installing dependencies:

1. Review the generated stack plan.
2. Check the selected skills and policies.
3. Confirm high-risk packs have security review.
4. Run dependency review and vulnerability scanning after install.
5. Capture validation output as mission evidence.
