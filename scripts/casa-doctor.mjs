import fs from "node:fs"
import { buildAdapterFiles, findAdapterDrift } from "./lib/casa-adapters.mjs"

const requiredPaths = [
  "README.md",
  "LICENSE",
  "AGENTS.md",
  "docs/vibe-coding-architecture.md",
  "docs/agent-ide-examples.md",
  "examples/ide-adapters/README.md",
  "casa.manifest.yaml",
  ".casa/kernel/principles/context.md",
  ".casa/kernel/principles/architecture.md",
  ".casa/kernel/principles/stack.md",
  ".casa/kernel/principles/automation.md",
  ".casa/kernel/policies/secure-coding.md",
  ".casa/kernel/policies/api-security.md",
  ".casa/kernel/policies/database-security.md",
  ".casa/kernel/policies/infrastructure-security.md",
  ".casa/kernel/policies/supply-chain-security.md",
  ".casa/kernel/risk-model/risk-levels.md",
  ".casa/kernel/risk-model/approval-matrix.md",
  ".casa/governance/permissions/agent-permissions.md",
  ".casa/governance/permissions/protected-files.md",
  ".casa/governance/permissions/dangerous-actions.md",
  ".casa/specs/templates/greenfield-feature/spec.md",
  ".casa/specs/templates/brownfield-modernization/spec.md",
  ".casa/specs/templates/api-endpoint/spec.md",
  ".casa/specs/templates/security-sensitive-feature/spec.md"
]

const requiredManifestSnippets = [
  "name:",
  "version:",
  "modes:",
  "principles:",
  "agent_native:",
  "adapters:",
  "context:",
  "governance:",
  "protected_paths:",
  "legacy:"
]

let failures = 0
let warnings = 0

function fail(message) {
  failures += 1
  console.error(`FAIL ${message}`)
}

function warn(message) {
  warnings += 1
  console.warn(`WARN ${message}`)
}

function pass(message) {
  console.log(`PASS ${message}`)
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8")
}

function exists(filePath) {
  return fs.existsSync(filePath)
}

function assertRequiredPaths() {
  const missing = requiredPaths.filter((filePath) => !exists(filePath))

  if (missing.length > 0) {
    for (const filePath of missing) {
      fail(`Missing required path: ${filePath}`)
    }
    return
  }

  pass("Required C.A.S.A paths exist")
}

function assertManifest() {
  let localFailures = 0

  if (!exists("casa.manifest.yaml")) {
    fail("Missing casa.manifest.yaml")
    return
  }

  const manifest = readText("casa.manifest.yaml")

  for (const snippet of requiredManifestSnippets) {
    if (!manifest.includes(snippet)) {
      localFailures += 1
      fail(`Manifest missing ${snippet}`)
    }
  }

  if (!manifest.includes(".casa/kernel/policies/**")) {
    localFailures += 1
    fail("Manifest protected_paths must include .casa/kernel/policies/**")
  }

  if (!manifest.includes("critical")) {
    warn("Manifest does not declare critical risk governance")
  }

  if (localFailures === 0) {
    pass("Manifest contains required sections")
  }
}

function assertAgentsFile() {
  const lineCount = readText("AGENTS.md").trim().split("\n").length

  if (lineCount > 80) {
    fail(`AGENTS.md is too long for global context (${lineCount} lines)`)
    return
  }

  pass("AGENTS.md is concise")
}

function assertSkills() {
  let localFailures = 0
  const skillRoot = ".casa/capabilities/skills"
  const entries = fs
    .readdirSync(skillRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())

  if (entries.length === 0) {
    fail("No C.A.S.A skills found")
    return
  }

  for (const entry of entries) {
    const skillPath = `${skillRoot}/${entry.name}/SKILL.md`
    if (!exists(skillPath)) {
      localFailures += 1
      fail(`Skill missing SKILL.md: ${entry.name}`)
      continue
    }

    const content = readText(skillPath)
    if (!content.includes(`name: ${entry.name}`)) {
      localFailures += 1
      fail(`Skill frontmatter name does not match folder: ${entry.name}`)
    }
    if (!content.includes("description:")) {
      localFailures += 1
      fail(`Skill missing description: ${entry.name}`)
    }
  }

  if (localFailures === 0) {
    pass("Skills include names and descriptions")
  }
}

function assertSpecs() {
  let localFailures = 0
  const specFiles = [
    ".casa/specs/templates/greenfield-feature/spec.md",
    ".casa/specs/templates/brownfield-modernization/spec.md",
    ".casa/specs/templates/api-endpoint/spec.md",
    ".casa/specs/templates/security-sensitive-feature/spec.md"
  ]

  for (const specFile of specFiles) {
    const content = readText(specFile)
    if (!content.includes("## Acceptance Criteria")) {
      localFailures += 1
      fail(`Spec template missing acceptance criteria: ${specFile}`)
    }
    if (!content.includes("## Risks") && !content.includes("## Risks and Questions")) {
      localFailures += 1
      fail(`Spec template missing risks section: ${specFile}`)
    }
  }

  if (localFailures === 0) {
    pass("Spec templates include acceptance criteria and risks")
  }
}

function assertPolicies() {
  let localFailures = 0
  const policyFiles = fs
    .readdirSync(".casa/kernel/policies")
    .filter((fileName) => fileName.endsWith(".md"))

  if (policyFiles.length < 5) {
    fail("Expected at least five kernel security policies")
    return
  }

  for (const policyFile of policyFiles) {
    const content = readText(`.casa/kernel/policies/${policyFile}`)
    if (!content.includes("Required")) {
      localFailures += 1
      fail(`Policy missing Required section: ${policyFile}`)
    }
  }

  if (localFailures === 0) {
    pass("Kernel policies are present")
  }
}

function assertGeneratedAdapters() {
  const drift = findAdapterDrift(buildAdapterFiles())

  if (drift.length > 0) {
    for (const file of drift) {
      fail(`Generated adapter is out of sync: ${file.targetPath}`)
    }
    return
  }

  pass("Generated adapters are in sync")
}

function assertContextMaps() {
  let localFailures = 0
  const contextFiles = [
    ".casa/context/repo-map/modules.md",
    ".casa/context/repo-map/dependency-map.md",
    ".casa/context/repo-map/runtime-map.md",
    ".casa/context/architecture-map/c4-context.md",
    ".casa/context/domain-map/domains.md",
    ".casa/context/legacy-inventory/risks.md"
  ]

  for (const contextFile of contextFiles) {
    if (!exists(contextFile)) {
      localFailures += 1
      fail(`Missing minimum context map: ${contextFile}`)
    }
  }

  if (localFailures === 0) {
    pass("Minimum context maps exist")
  }
}

function assertSensors() {
  let localFailures = 0
  const sensorFiles = [
    ".casa/governance/sensors/lint.sensor.md",
    ".casa/governance/sensors/typecheck.sensor.md",
    ".casa/governance/sensors/test.sensor.md",
    ".casa/governance/sensors/security-scan.sensor.md"
  ]

  for (const sensorFile of sensorFiles) {
    if (!exists(sensorFile)) {
      localFailures += 1
      fail(`Missing governance sensor: ${sensorFile}`)
    }
  }

  if (localFailures === 0) {
    pass("Governance sensors exist")
  }
}

function assertIdeExamples() {
  let localFailures = 0
  const exampleFiles = [
    "examples/ide-adapters/universal/AGENTS.md",
    "examples/ide-adapters/codex/AGENTS.md",
    "examples/ide-adapters/codex/.codex/skills/casa-skill-router/SKILL.md",
    "examples/ide-adapters/cursor/.cursor/rules/00-casa-context.mdc",
    "examples/ide-adapters/claude/CLAUDE.md",
    "examples/ide-adapters/claude/.claude/settings.json",
    "examples/ide-adapters/devin/knowledge/casa-core.md",
    "examples/ide-adapters/github-copilot/.github/copilot-instructions.md",
    "examples/ide-adapters/antigravity/workflows/implement-feature.md",
    "examples/ide-adapters/antigravity/.agents/rules/casa-core.md",
    "examples/ide-adapters/antigravity/.agents/workflows/implement-feature.md",
    "examples/ide-adapters/windsurf/.windsurf/rules/casa-core.md",
    "examples/ide-adapters/trae/AGENTS.md",
    "examples/ide-adapters/trae/.agents/casa-core.md",
    "examples/ide-adapters/kilo-code/AGENTS.md",
    "examples/ide-adapters/kilo-code/CONTEXT.md",
    "examples/ide-adapters/kilo-code/kilo.jsonc",
    "examples/ide-adapters/continue/.continue/rules/casa.md",
    "examples/ide-adapters/windsurf/workspace-rules/casa.md",
    "examples/ide-adapters/generic-cli/AGENT-GUIDE.md",
    "examples/ide-adapters/generic-web-chat/casa-system-prompt.md",
    "examples/ide-adapters/generic-mcp/context-card.md"
  ]

  for (const exampleFile of exampleFiles) {
    if (!exists(exampleFile)) {
      localFailures += 1
      fail(`Missing IDE adapter example: ${exampleFile}`)
    }
  }

  if (localFailures === 0) {
    pass("IDE and generic agent examples exist")
  }
}

assertRequiredPaths()
assertManifest()
assertAgentsFile()
assertSkills()
assertSpecs()
assertPolicies()
assertGeneratedAdapters()
assertContextMaps()
assertSensors()
assertIdeExamples()

if (failures > 0) {
  console.error(`C.A.S.A doctor failed with ${failures} failure(s) and ${warnings} warning(s).`)
  process.exit(1)
}

console.log(`C.A.S.A doctor passed with ${warnings} warning(s).`)
