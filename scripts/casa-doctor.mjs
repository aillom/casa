import fs from "node:fs"
import { buildAdapterFiles, findAdapterDrift } from "./lib/casa-adapters.mjs"
import { loadSensors } from "./lib/casa-verify.mjs"
import { auditWorkUnits } from "./lib/casa-loop.mjs"
import { auditMissions } from "./lib/casa-mission.mjs"
import { repoMapFreshness } from "./lib/casa-repomap.mjs"

function isCasaPackageRepo() {
  if (!exists("package.json")) {
    return false
  }

  try {
    const packageJson = JSON.parse(readText("package.json"))
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
  ".casa/kernel/risk-model/risk-levels.md",
  ".casa/kernel/risk-model/approval-matrix.md",
  ".casa/mission-control/mission-template.md",
  ".casa/mission-control/context-capsule-template.md",
  ".casa/mission-control/evidence-template.md",
  ".casa/mission-control/handoff-template.md",
  ".casa/mission-control/risk-gate-template.md",
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
  ".casa/governance/permissions/agent-permissions.md",
  ".casa/governance/permissions/protected-files.md",
  ".casa/governance/permissions/dangerous-actions.md",
  ".casa/capabilities/skills/stack-composer/SKILL.md",
  ".casa/capabilities/skills/ai-integration-engineer/SKILL.md",
  ".casa/capabilities/skills/software-delivery-facilitator/SKILL.md",
  ".casa/capabilities/workflows/compose-application-stack.workflow.md",
  ".casa/specs/templates/greenfield-feature/spec.md",
  ".casa/specs/templates/stack-composition/spec.md",
  ".casa/specs/templates/brownfield-modernization/spec.md",
  ".casa/specs/templates/api-endpoint/spec.md",
  ".casa/specs/templates/security-sensitive-feature/spec.md",
  ".casa/generated/adapters.manifest.json",
  ".agents/casa-agent-guide.md",
  ".codex/skills/casa-skill-router/SKILL.md",
  ".cursor/rules/00-casa-context.mdc"
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

const requiredManifestSnippets = [
  "name:",
  "version:",
  "modes:",
  "principles:",
  "agent_native:",
  "adapters:",
  "context:",
  "stack_composition:",
  "harness:",
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
  const requiredPaths = isCasaPackageRepo() ? [...requiredCorePaths, ...requiredPackagePaths] : requiredCorePaths
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

  if (!manifest.includes("Validate always")) {
    localFailures += 1
    fail("Manifest principles must include Validate always")
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
    ".casa/specs/templates/stack-composition/spec.md",
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
    if (!/- AC\d+:/.test(content) || !/the system shall/i.test(content)) {
      localFailures += 1
      fail(`Spec template missing EARS acceptance criteria with ids: ${specFile}`)
    }
  }

  if (localFailures === 0) {
    pass("Spec templates include EARS acceptance criteria and risks")
  }
}

function manifestProtectedPaths() {
  const lines = readText("casa.manifest.yaml").split("\n")
  const start = lines.findIndex((line) => line === "  protected_paths:")
  if (start === -1) {
    return []
  }

  const items = []
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("    - ")) {
      items.push(line.slice(6).replace(/^["']|["']$/g, ""))
      continue
    }
    if (line.trim() !== "" && !line.startsWith("    ")) {
      break
    }
  }
  return items
}

function assertClaudeEnforcement() {
  let localFailures = 0
  const settingsPath = ".claude/settings.json"
  const guardPath = ".casa/governance/hooks/protected-path-guard.mjs"

  if (!exists(settingsPath)) {
    fail(`Missing generated Claude settings: ${settingsPath}`)
    return
  }

  let settings
  try {
    settings = JSON.parse(readText(settingsPath))
  } catch {
    fail(`${settingsPath} must be valid JSON`)
    return
  }

  const deny = settings.permissions?.deny || []

  for (const glob of manifestProtectedPaths()) {
    if (!deny.includes(`Edit(${glob})`)) {
      localFailures += 1
      fail(`Claude settings deny is missing protected path: Edit(${glob})`)
    }
  }

  if (!deny.includes("Read(.env)")) {
    localFailures += 1
    fail("Claude settings must deny Read(.env)")
  }

  if (!exists(guardPath)) {
    localFailures += 1
    fail(`Missing protected-path guard hook: ${guardPath}`)
  }

  if (!JSON.stringify(settings.hooks || {}).includes("protected-path-guard.mjs")) {
    localFailures += 1
    fail("Claude settings PreToolUse hook is not wired to the protected-path guard")
  }

  if (localFailures === 0) {
    pass("Claude enforcement (deny-first + PreToolUse guard) covers protected paths")
  }
}

function assertWorkUnits() {
  const failures = auditWorkUnits({ cwd: process.cwd() })

  if (failures.length > 0) {
    for (const message of failures) {
      fail(message)
    }
    return
  }

  pass("Spec work units are consistent")
}

function assertMissions() {
  const failures = auditMissions({ cwd: process.cwd() })

  if (failures.length > 0) {
    for (const message of failures) {
      fail(message)
    }
    return
  }

  pass("Missions are consistent")
}

function assertStackCatalog() {
  if (!exists(".casa/registry/stacks.json")) {
    fail("Missing stack catalog")
    return
  }

  let catalog
  try {
    catalog = JSON.parse(readText(".casa/registry/stacks.json"))
  } catch {
    fail("Stack catalog must be valid JSON")
    return
  }

  const packs = catalog.packs || []
  const requiredPacks = ["frontend:react-app", "backend:fastify-api", "database:postgres-prisma", "security:web-baseline", "ai:openrouter", "admin:filament-php"]
  let localFailures = 0

  for (const packId of requiredPacks) {
    const pack = packs.find((entry) => entry.id === packId)
    if (!pack) {
      localFailures += 1
      fail(`Stack catalog missing pack: ${packId}`)
      continue
    }
    if (!pack.summary || !pack.category || !Array.isArray(pack.skills) || pack.skills.length === 0) {
      localFailures += 1
      fail(`Stack pack is incomplete: ${packId}`)
    }
  }

  if (!Array.isArray(catalog.presets) || catalog.presets.length === 0) {
    localFailures += 1
    fail("Stack catalog must declare presets")
  }

  if (localFailures === 0) {
    pass("Stack catalog includes core packs and presets")
  }
}

function assertRecipeCatalog() {
  if (!exists(".casa/registry/recipes.json")) {
    fail("Missing recipe catalog")
    return
  }

  let catalog
  try {
    catalog = JSON.parse(readText(".casa/registry/recipes.json"))
  } catch {
    fail("Recipe catalog must be valid JSON")
    return
  }

  const recipes = catalog.recipes || []
  const requiredRecipes = ["create-web-saas", "add-openrouter-ai", "harden-web-security", "prepare-docker-deploy"]
  let localFailures = 0

  for (const recipeId of requiredRecipes) {
    const recipe = recipes.find((entry) => entry.id === recipeId)
    if (!recipe) {
      localFailures += 1
      fail(`Recipe catalog missing recipe: ${recipeId}`)
      continue
    }
    if (!recipe.summary || !recipe.category || !Array.isArray(recipe.steps) || recipe.steps.length === 0) {
      localFailures += 1
      fail(`Recipe is incomplete: ${recipeId}`)
    }
  }

  if (localFailures === 0) {
    pass("Recipe catalog includes core terminal workflows")
  }
}

function assertSkillMarketplace() {
  let localFailures = 0
  const marketplacePath = ".casa/registry/skill-marketplace.json"
  const lockPath = ".casa/registry/skills.lock.json"
  let marketplace = null

  for (const filePath of [marketplacePath, lockPath]) {
    if (!exists(filePath)) {
      localFailures += 1
      fail(`Missing skill marketplace file: ${filePath}`)
      continue
    }
    try {
      const parsed = JSON.parse(readText(filePath))
      if (filePath === marketplacePath) {
        marketplace = parsed
      }
    } catch {
      localFailures += 1
      fail(`Skill marketplace file must be valid JSON: ${filePath}`)
    }
  }

  if (marketplace) {
    if (!marketplace.github?.manifest || !marketplace.install_policy?.pin_to_commit) {
      localFailures += 1
      fail("Skill marketplace must define GitHub manifest and commit pinning policy")
    }
  }

  if (localFailures === 0) {
    pass("Skill marketplace config and lockfile exist")
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

function assertContextFreshness() {
  const freshness = repoMapFreshness({ cwd: process.cwd() })
  if (freshness.state === "stale") {
    warn("Compiled repo map is stale; run `casa context build`")
    return
  }
  if (freshness.state === "fresh") {
    pass("Compiled repo map is fresh")
  }
}

function assertSensors() {
  let localFailures = 0
  const requiredIds = ["lint", "typecheck", "test", "security-scan"]
  const sensors = loadSensors({ cwd: process.cwd() })
  const sensorIds = new Set(sensors.map((sensor) => sensor.id))

  for (const requiredId of requiredIds) {
    if (!sensorIds.has(requiredId)) {
      localFailures += 1
      fail(`Missing governance sensor: ${requiredId}`)
    }
  }

  for (const sensor of sensors) {
    if (!sensor.command && !sensor.detect && !sensor.manual) {
      localFailures += 1
      fail(`Sensor is not executable (needs command, detect or manual): ${sensor.file}`)
    }
  }

  if (localFailures === 0) {
    pass("Governance sensors are executable or declared manual")
  }
}

function assertControlPlaneBlocks() {
  let localFailures = 0
  const missionFiles = [
    ".casa/mission-control/mission-template.md",
    ".casa/mission-control/evidence-template.md",
    ".casa/mission-control/handoff-template.md",
    ".casa/mission-control/risk-gate-template.md"
  ]
  const capsuleFiles = [
    ".casa/context-capsules/frontend-dashboard/capsule.md",
    ".casa/context-capsules/api-contract/capsule.md",
    ".casa/context-capsules/legacy-modernization/capsule.md",
    ".casa/context-capsules/security-sensitive-change/capsule.md",
    ".casa/context-capsules/database-migration/capsule.md"
  ]
  const qualityGateFiles = [
    ".casa/quality-gates/architecture-check.md",
    ".casa/quality-gates/security-check.md",
    ".casa/quality-gates/api-contract-check.md",
    ".casa/quality-gates/ui-quality-check.md",
    ".casa/quality-gates/legacy-safety-check.md"
  ]
  const registryFiles = [
    ".casa/registry/skills.yaml",
    ".casa/registry/agents.yaml",
    ".casa/registry/adapters.yaml",
    ".casa/registry/workflows.yaml",
    ".casa/registry/policies.yaml"
  ]
  const cockpitFiles = [
    ".casa/cockpit/README.md",
    ".casa/cockpit/screens.md",
    ".casa/cockpit/information-architecture.md"
  ]

  for (const filePath of [...missionFiles, ...capsuleFiles, ...qualityGateFiles, ...registryFiles, ...cockpitFiles]) {
    if (!exists(filePath)) {
      localFailures += 1
      fail(`Missing control-plane file: ${filePath}`)
    }
  }

  for (const filePath of qualityGateFiles) {
    if (exists(filePath) && !readText(filePath).includes("## Evidence")) {
      localFailures += 1
      fail(`Quality gate missing evidence section: ${filePath}`)
    }
  }

  if (localFailures === 0) {
    pass("Mission Control, Context Capsules, Quality Gates, Registry and Cockpit exist")
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

function assertProjectAdapters() {
  let localFailures = 0
  const adapterFiles = [
    ".agents/casa-agent-guide.md",
    ".codex/skills/casa-skill-router/SKILL.md",
    ".cursor/rules/00-casa-context.mdc",
    ".casa/generated/adapters/generic/AGENT-GUIDE.md",
    ".casa/generated/adapters/codex/SKILLS.md"
  ]

  for (const adapterFile of adapterFiles) {
    if (!exists(adapterFile)) {
      localFailures += 1
      fail(`Missing project adapter output: ${adapterFile}`)
    }
  }

  if (localFailures === 0) {
    pass("Project adapter outputs exist")
  }
}

assertRequiredPaths()
assertManifest()
assertAgentsFile()
assertSkills()
assertSpecs()
assertWorkUnits()
assertMissions()
assertStackCatalog()
assertRecipeCatalog()
assertSkillMarketplace()
assertPolicies()
assertGeneratedAdapters()
assertContextMaps()
assertContextFreshness()
assertSensors()
assertClaudeEnforcement()
assertControlPlaneBlocks()
if (isCasaPackageRepo()) {
  assertIdeExamples()
} else {
  assertProjectAdapters()
}

if (failures > 0) {
  console.error(`C.A.S.A doctor failed with ${failures} failure(s) and ${warnings} warning(s).`)
  process.exit(1)
}

console.log(`C.A.S.A doctor passed with ${warnings} warning(s).`)
