import fs from "node:fs"

function isCasaPackageRepo() {
  if (!fs.existsSync("package.json")) {
    return false
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"))
    return packageJson.name === "@aillomai/casa"
  } catch {
    return false
  }
}

const requiredCorePaths = [
  "AGENTS.md",
  "casa.manifest.yaml",
  ".casa/kernel/principles/context.md",
  ".casa/kernel/principles/architecture.md",
  ".casa/kernel/principles/stack.md",
  ".casa/kernel/principles/automation.md",
  ".casa/kernel/standards/ai.md",
  ".casa/kernel/standards/harness.md",
  ".casa/kernel/standards/skill-marketplace.md",
  ".casa/kernel/standards/stack-composition.md",
  ".casa/kernel/policies/secure-coding.md",
  ".casa/kernel/policies/api-security.md",
  ".casa/kernel/policies/database-security.md",
  ".casa/kernel/policies/infrastructure-security.md",
  ".casa/kernel/policies/supply-chain-security.md",
  ".casa/kernel/risk-model/approval-matrix.md",
  ".casa/mission-control/mission-template.md",
  ".casa/mission-control/evidence-template.md",
  ".casa/runtime/missions/README.md",
  ".casa/runtime/history/README.md",
  ".casa/runtime/recipes/README.md",
  ".casa/context-capsules/frontend-dashboard/capsule.md",
  ".casa/context-capsules/api-contract/capsule.md",
  ".casa/context-capsules/legacy-modernization/capsule.md",
  ".casa/context-capsules/security-sensitive-change/capsule.md",
  ".casa/context-capsules/database-migration/capsule.md",
  ".casa/quality-gates/architecture-check.md",
  ".casa/quality-gates/security-check.md",
  ".casa/quality-gates/api-contract-check.md",
  ".casa/quality-gates/ui-quality-check.md",
  ".casa/quality-gates/legacy-safety-check.md",
  ".casa/registry/skills.yaml",
  ".casa/registry/recipes.json",
  ".casa/registry/skill-marketplace.json",
  ".casa/registry/stacks.json",
  ".casa/registry/skills.lock.json",
  ".casa/registry/agents.yaml",
  ".casa/registry/adapters.yaml",
  ".casa/registry/workflows.yaml",
  ".casa/registry/policies.yaml",
  ".casa/cockpit/README.md",
  ".casa/cockpit/screens.md",
  ".casa/cockpit/information-architecture.md",
  ".casa/capabilities/skills/casa-skill-router/SKILL.md",
  ".casa/capabilities/skills/stack-composer/SKILL.md",
  ".casa/capabilities/skills/ai-integration-engineer/SKILL.md",
  ".casa/capabilities/skills/software-delivery-facilitator/SKILL.md",
  ".casa/capabilities/workflows/compose-application-stack.workflow.md",
  ".casa/specs/templates/greenfield-feature/spec.md",
  ".casa/specs/templates/stack-composition/spec.md",
  ".casa/specs/templates/brownfield-modernization/spec.md",
  ".casa/specs/templates/api-endpoint/spec.md",
  ".casa/specs/templates/security-sensitive-feature/spec.md",
  ".casa/governance/permissions/agent-permissions.md",
  ".casa/governance/permissions/protected-files.md",
  ".casa/governance/permissions/dangerous-actions.md",
  ".casa/context/repo-map/modules.md",
  ".casa/context/domain-map/domains.md",
  ".casa/governance/sensors/test.sensor.md",
  ".casa/governance/hooks/protected-path-guard.mjs",
  ".casa/generated/adapters.manifest.json",
  ".agents/casa-agent-guide.md",
  ".codex/skills/casa-skill-router/SKILL.md",
  ".cursor/rules/00-casa-context.mdc",
  ".claude/settings.json"
]

const requiredPackagePaths = [
  "README.md",
  "README.pt-BR.md",
  "README.es.md",
  "LICENSE",
  "CHANGELOG.md",
  "docs/vibe-coding-architecture.md",
  "docs/cli.md",
  "docs/harness.md",
  "docs/skill-marketplace.md",
  "docs/stack-composition.md",
  "docs/publishing.md",
  "docs/agent-ide-examples.md",
  "examples/ide-adapters/README.md",
  "scripts/casa.mjs",
  "scripts/lib/casa-harness.mjs",
  "scripts/lib/casa-skill-marketplace.mjs",
  "scripts/lib/casa-stack.mjs",
  "scripts/casa-doctor.mjs",
  "scripts/generate-adapters.mjs",
  "scripts/test-cli.mjs",
  "casa",
  "casa.cmd"
]

const requiredPaths = isCasaPackageRepo() ? [...requiredCorePaths, ...requiredPackagePaths] : requiredCorePaths
const missing = requiredPaths.filter((path) => !fs.existsSync(path))

if (missing.length > 0) {
  console.error("Missing required C.A.S.A files:")
  for (const path of missing) {
    console.error(`- ${path}`)
  }
  process.exit(1)
}

console.log("C.A.S.A structure check passed.")
