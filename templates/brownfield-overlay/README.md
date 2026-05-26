# Template: Brownfield Overlay

## Purpose

Install C.A.S.A into an existing repository without forcing an immediate rewrite.

## Expected first files

- `AGENTS.md`
- `casa.manifest.yaml`
- `.casa/context/repo-map/modules.md`
- `.casa/context/legacy-inventory/risks.md`
- `.casa/specs/templates/brownfield-modernization/spec.md`
- `.casa/modernization/discovery/playbook.md`

## First workflow

1. Run read-only discovery.
2. Build repo and dependency maps.
3. Add characterization or smoke tests.
4. Create seams before refactoring.
5. Migrate incrementally.
