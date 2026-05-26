import fs from "node:fs"

const requiredPaths = [
  "README.md",
  "LICENSE",
  "AGENTS.md",
  "casa.manifest.yaml",
  ".casa/kernel/principles/context.md",
  ".casa/kernel/principles/architecture.md",
  ".casa/kernel/principles/stack.md",
  ".casa/kernel/principles/automation.md",
  ".casa/kernel/policies/secure-coding.md",
  ".casa/capabilities/skills/casa-skill-router/SKILL.md",
  ".casa/specs/templates/greenfield-feature/spec.md",
  ".casa/specs/templates/brownfield-modernization/spec.md",
  ".casa/governance/permissions/agent-permissions.md"
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
