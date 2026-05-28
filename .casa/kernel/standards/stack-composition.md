# Stack Composition Standard

## Required

- Start from `.casa/registry/stacks.json` before adding dependencies.
- Record why each dependency pack is needed.
- Prefer packs that match the target surface: web, mobile, desktop, API, admin or database.
- Load the smallest required set of skills for the selected packs.
- Generate or update a stack plan before installing dependencies.
- Keep install commands reproducible and compatible with the detected package manager.
- Treat auth, AI, database, uploads, crypto, parser and payment packs as security-sensitive.
- Store secrets only in environment variables or ignored local files.
- Update specs, docs and examples when stack behavior changes.

## Avoid

- Installing packages without a C.A.S.A pack or explicit justification.
- Mixing multiple frameworks for the same boundary without an architecture reason.
- Committing real API keys, tokens or generated local environment files.
- Exposing admin panels before authorization policies exist.
- Skipping dependency review after adding new packages.
