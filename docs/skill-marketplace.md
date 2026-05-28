# C.A.S.A Skill Marketplace

C.A.S.A can search, inspect, audit and install external skills from GitHub.

Remote skills are treated as supply-chain inputs. Installation is pinned to a commit SHA and recorded in `.casa/registry/skills.lock.json`.

## Commands

```bash
casa skill search stripe
casa skill inspect owner/repo/path/to/skill
casa skill install owner/repo/path/to/skill
casa skill audit
casa skill update skill-name
casa skill remove skill-name
```

Search prefers repositories tagged with `casa-skill` or `casa-skills`. If no tagged repository is found, results are marked as `unverified` and must be inspected before installation.

## GitHub Skill Shape

A GitHub skill can be a folder containing:

```text
casa.skill.json
SKILL.md
```

Minimal `casa.skill.json`:

```json
{
  "name": "stripe-payments",
  "description": "Use when implementing Stripe payments.",
  "version": "0.1.0",
  "entrypoint": "SKILL.md",
  "tags": ["stripe", "payments"],
  "permissions": ["docs", "code-review"]
}
```

If `casa.skill.json` is missing, C.A.S.A can inspect a folder with `SKILL.md`, but installation records a generated manifest.

## Safety Rules

- Marketplace v1 installs Markdown and manifest files only.
- Remote scripts are not executed during install.
- GitHub branch refs are resolved to commit SHA before installation.
- Audit runs before install and blocks suspicious content unless explicitly overridden.
- Installed external skills are marked in `.casa/registry/skills.lock.json`.

## Audit

```bash
casa skill audit
casa skill audit stripe-payments
casa skill audit owner/repo/path/to/skill
```

Audit checks for dangerous instructions such as secret exfiltration, hidden behavior, destructive commands and policy bypasses.
