# Legacy Inventory Risks

This repository is not itself a legacy application, but C.A.S.A supports brownfield adoption.

## Brownfield adoption risks

- Existing systems may have missing tests and hidden coupling.
- Architecture maps may be incomplete during initial overlay.
- Agents may over-refactor before characterization tests exist.
- Production-sensitive files may not match the default protected path patterns.

## Required mitigation

- Start with read-only discovery.
- Capture current behavior before refactoring.
- Add characterization or smoke tests before changing legacy modules.
- Document unknowns in the modernization spec.
