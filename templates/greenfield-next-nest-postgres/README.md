# Template: Greenfield Next.js + NestJS + PostgreSQL

## Purpose

Starter shape for a new product using C.A.S.A from day one.

## Expected structure

- `apps/web`: Next.js frontend.
- `apps/api`: NestJS API.
- `packages/contracts`: OpenAPI and generated client contracts.
- `packages/shared`: shared domain-safe utilities.
- `.casa`: copied C.A.S.A Core overlay.

## Required setup

1. Create a feature spec before implementation.
2. Define API contracts before public endpoints.
3. Add CI checks for lint, typecheck, tests and `casa doctor`.
4. Keep agent adapters generated from `.casa`.
