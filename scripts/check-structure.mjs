import fs from "node:fs"

const requiredPaths = [
  "README.md",
  "README.pt-BR.md",
  "README.es.md",
  "LICENSE",
  "AGENTS.md",
  "docs/vibe-coding-architecture.md",
  "docs/cli.md",
  "docs/publishing.md",
  "docs/agent-ide-examples.md",
  "examples/ide-adapters/README.md",
  "casa.manifest.yaml",
  "scripts/casa.mjs",
  "scripts/casa-doctor.mjs",
  "scripts/generate-adapters.mjs",
  ".casa/kernel/principles/context.md",
  ".casa/kernel/principles/architecture.md",
  ".casa/kernel/principles/stack.md",
  ".casa/kernel/principles/automation.md",
  ".casa/kernel/policies/secure-coding.md",
  ".casa/kernel/policies/api-security.md",
  ".casa/kernel/policies/database-security.md",
  ".casa/kernel/policies/infrastructure-security.md",
  ".casa/kernel/policies/supply-chain-security.md",
  ".casa/kernel/risk-model/approval-matrix.md",
  ".casa/mission-control/mission-template.md",
  ".casa/mission-control/evidence-template.md",
  ".casa/runtime/missions/README.md",
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
  ".casa/registry/agents.yaml",
  ".casa/registry/adapters.yaml",
  ".casa/registry/workflows.yaml",
  ".casa/registry/policies.yaml",
  ".casa/cockpit/README.md",
  ".casa/cockpit/screens.md",
  ".casa/cockpit/information-architecture.md",
  ".casa/capabilities/skills/casa-skill-router/SKILL.md",
  ".casa/specs/templates/greenfield-feature/spec.md",
  ".casa/specs/templates/brownfield-modernization/spec.md",
  ".casa/specs/templates/api-endpoint/spec.md",
  ".casa/specs/templates/security-sensitive-feature/spec.md",
  ".casa/governance/permissions/agent-permissions.md",
  ".casa/governance/permissions/protected-files.md",
  ".casa/governance/permissions/dangerous-actions.md",
  ".casa/context/repo-map/modules.md",
  ".casa/context/domain-map/domains.md",
  ".casa/governance/sensors/test.sensor.md"
]

const missing = requiredPaths.filter((path) => !fs.existsSync(path))

if (missing.length > 0) {
  console.error("Missing required C.A.S.A files:")
  for (const path of missing) {
    console.error(`- ${path}`)
  }
  process.exit(1)
}

console.log("C.A.S.A structure check passed.")
