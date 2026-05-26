# Playbook: Seams

## Goal

Create controlled extension points for incremental change.

## Steps

1. Identify the smallest stable boundary.
2. Add a facade, port or wrapper.
3. Preserve existing behavior behind the seam.
4. Route new implementation through the seam.

## Output

- Seam design.
- Tests proving old behavior still works.
- Migration path for new behavior.
