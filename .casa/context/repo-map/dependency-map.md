# Dependency Map

## Runtime dependencies

- None.

## Development dependencies

- None.

## Platform dependencies

- Node.js 22 for local scripts and CI.
- GitHub Actions for structure, doctor and security checks.

## External services

- None required for repository validation.
- OpenRouter can be configured by generated project files, but real API keys stay outside committed files.

## Risk notes

- Adapter generation depends on deterministic local files.
- The project intentionally avoids runtime dependencies until the CLI surface justifies them.
- Stack installation commands are generated from `.casa/registry/stacks.json` and require explicit `--execute` before package managers run.
- Recipe execution commands are generated from `.casa/registry/recipes.json`; package installs and external mutations require explicit `--execute`.
- External skill installs are pinned in `.casa/registry/skills.lock.json` and audited before adapter generation.
