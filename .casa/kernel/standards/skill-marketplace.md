# Skill Marketplace Standard

## Required

- Treat remote skills as supply-chain inputs.
- Inspect remote skill content before installation.
- Pin GitHub installs to a commit SHA in `.casa/registry/skills.lock.json`.
- Install only Markdown and manifest files in marketplace v1.
- Store external skills under `.casa/capabilities/skills/<skill-name>`.
- Mark third-party skills as external in the lockfile.
- Run a skill audit before generating adapters.
- Regenerate adapters after skill installation, update or removal.
- Record installs, updates, removals and audit results in harness history.

## Avoid

- Installing unpinned branch content without recording the resolved commit.
- Executing remote scripts during skill installation.
- Installing skills that instruct agents to bypass policies, leak secrets or hide actions.
- Trusting GitHub search ranking as a trust signal.
- Updating external skills without reviewing the diff or audit output.
