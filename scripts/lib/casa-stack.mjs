import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"

export const defaultOpenRouterModel = "openai/gpt-5.2"
export const openRouterBaseUrl = "https://openrouter.ai/api/v1"

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"))
}

function unique(items) {
  return [...new Set(items.filter(Boolean))]
}

function quoteArg(value) {
  if (/^[a-zA-Z0-9_@./:+-]+$/.test(value)) {
    return value
  }

  return `'${value.replace(/'/g, "'\\''")}'`
}

function commandLine(command) {
  return [command.command, ...command.args].map(quoteArg).join(" ")
}

function normalizeSlug(value, fallback = "stack-plan") {
  const normalized = String(value || fallback)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return normalized || fallback
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function packMatchesFilter(pack, filters) {
  if (filters.category && pack.category !== filters.category) {
    return false
  }

  if (filters.surface && !(pack.surfaces || []).includes(filters.surface)) {
    return false
  }

  return true
}

function findCatalogPath(cwd, packageRoot) {
  const candidates = [
    path.join(cwd, ".casa/registry/stacks.json"),
    path.join(packageRoot, ".casa/registry/stacks.json")
  ]

  return candidates.find((candidate) => fs.existsSync(candidate))
}

function nodeInstallCommands(pack, manager) {
  const npmConfig = pack.packages?.npm
  if (!npmConfig) {
    return []
  }

  const dependencies = npmConfig.dependencies || []
  const devDependencies = npmConfig.devDependencies || []
  const commands = []

  if (dependencies.length > 0) {
    if (manager === "pnpm") {
      commands.push({ ecosystem: "node", command: "pnpm", args: ["add", ...dependencies], packId: pack.id })
    } else if (manager === "yarn") {
      commands.push({ ecosystem: "node", command: "yarn", args: ["add", ...dependencies], packId: pack.id })
    } else if (manager === "bun") {
      commands.push({ ecosystem: "node", command: "bun", args: ["add", ...dependencies], packId: pack.id })
    } else {
      commands.push({ ecosystem: "node", command: "npm", args: ["install", ...dependencies], packId: pack.id })
    }
  }

  if (devDependencies.length > 0) {
    if (manager === "pnpm") {
      commands.push({ ecosystem: "node", command: "pnpm", args: ["add", "-D", ...devDependencies], packId: pack.id })
    } else if (manager === "yarn") {
      commands.push({ ecosystem: "node", command: "yarn", args: ["add", "-D", ...devDependencies], packId: pack.id })
    } else if (manager === "bun") {
      commands.push({ ecosystem: "node", command: "bun", args: ["add", "-d", ...devDependencies], packId: pack.id })
    } else {
      commands.push({ ecosystem: "node", command: "npm", args: ["install", "-D", ...devDependencies], packId: pack.id })
    }
  }

  return commands
}

function composerInstallCommands(pack) {
  const composerConfig = pack.packages?.composer
  if (!composerConfig) {
    return []
  }

  const commands = []
  const dependencies = composerConfig.dependencies || []
  const devDependencies = composerConfig.devDependencies || []

  if (dependencies.length > 0) {
    commands.push({ ecosystem: "composer", command: "composer", args: ["require", ...dependencies], packId: pack.id })
  }

  if (devDependencies.length > 0) {
    commands.push({ ecosystem: "composer", command: "composer", args: ["require", "--dev", ...devDependencies], packId: pack.id })
  }

  return commands
}

function pythonInstallCommands(pack) {
  const pythonConfig = pack.packages?.python
  if (!pythonConfig) {
    return []
  }

  const dependencies = pythonConfig.dependencies || []
  if (dependencies.length === 0) {
    return []
  }

  return [{ ecosystem: "python", command: "python", args: ["-m", "pip", "install", ...dependencies], packId: pack.id }]
}

function cargoInstallCommands(pack) {
  const cargoConfig = pack.packages?.cargo
  if (!cargoConfig) {
    return []
  }

  const commands = []
  const dependencies = cargoConfig.dependencies || []
  const devDependencies = cargoConfig.devDependencies || []

  if (dependencies.length > 0) {
    commands.push({ ecosystem: "cargo", command: "cargo", args: ["add", ...dependencies], packId: pack.id })
  }

  if (devDependencies.length > 0) {
    commands.push({ ecosystem: "cargo", command: "cargo", args: ["add", "--dev", ...devDependencies], packId: pack.id })
  }

  return commands
}

function packageEcosystems(pack) {
  const packages = pack.packages || {}
  return Object.keys(packages).map((ecosystem) => ecosystem === "npm" ? "node" : ecosystem)
}

function detectCommandEcosystem(cwd, packs) {
  const packEcosystems = unique(packs.flatMap((pack) => packageEcosystems(pack)))

  if (packEcosystems.length === 1) {
    return packEcosystems[0]
  }

  if (fs.existsSync(path.join(cwd, "package.json")) && packEcosystems.includes("node")) {
    return "node"
  }
  if (fs.existsSync(path.join(cwd, "composer.json")) && packEcosystems.includes("composer")) {
    return "composer"
  }
  if ((fs.existsSync(path.join(cwd, "pyproject.toml")) || fs.existsSync(path.join(cwd, "requirements.txt"))) && packEcosystems.includes("python")) {
    return "python"
  }
  if (fs.existsSync(path.join(cwd, "Cargo.toml")) && packEcosystems.includes("cargo")) {
    return "cargo"
  }
  if (packEcosystems.includes("node")) {
    return "node"
  }

  return packEcosystems[0] || "node"
}

export function loadStackCatalog({ cwd = process.cwd(), packageRoot = process.cwd() } = {}) {
  const catalogPath = findCatalogPath(cwd, packageRoot)

  if (!catalogPath) {
    throw new Error("Missing stack catalog: .casa/registry/stacks.json")
  }

  const catalog = readJson(catalogPath)
  return {
    ...catalog,
    path: catalogPath,
    packs: catalog.packs || [],
    presets: catalog.presets || []
  }
}

export function detectNodePackageManager(cwd = process.cwd()) {
  if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) {
    return "pnpm"
  }
  if (fs.existsSync(path.join(cwd, "yarn.lock"))) {
    return "yarn"
  }
  if (fs.existsSync(path.join(cwd, "bun.lockb")) || fs.existsSync(path.join(cwd, "bun.lock"))) {
    return "bun"
  }

  return "npm"
}

export function listStackPacks(catalog, filters = {}) {
  return catalog.packs.filter((pack) => packMatchesFilter(pack, filters)).sort((a, b) => a.id.localeCompare(b.id))
}

export function findStackPack(catalog, packId) {
  return catalog.packs.find((pack) => pack.id === packId)
}

export function requireStackPacks(catalog, packIds) {
  const selected = []
  const missing = []

  for (const packId of packIds) {
    const pack = findStackPack(catalog, packId)
    if (!pack) {
      missing.push(packId)
      continue
    }
    selected.push(pack)
  }

  if (missing.length > 0) {
    throw new Error(`Unknown stack pack(s): ${missing.join(", ")}`)
  }

  return selected
}

export function presetPackIds(catalog, presetId) {
  const preset = catalog.presets.find((entry) => entry.id === presetId)
  if (!preset) {
    throw new Error(`Unknown stack preset: ${presetId}`)
  }

  return preset.packs || []
}

export function collectPackCommands(packs, options = {}) {
  const nodeManager = options.nodeManager || detectNodePackageManager(options.cwd)
  const selectedEcosystem = options.ecosystem && options.ecosystem !== "auto"
    ? options.ecosystem
    : detectCommandEcosystem(options.cwd || process.cwd(), packs)
  const commands = packs.flatMap((pack) => [
    ...nodeInstallCommands(pack, nodeManager),
    ...composerInstallCommands(pack),
    ...pythonInstallCommands(pack),
    ...cargoInstallCommands(pack)
  ])

  if (selectedEcosystem === "all") {
    return commands
  }

  return commands.filter((command) => command.ecosystem === selectedEcosystem)
}

export function collectPackMetadata(packs) {
  return {
    skills: unique(packs.flatMap((pack) => pack.skills || [])).sort(),
    policies: unique(packs.flatMap((pack) => pack.policies || [])).sort(),
    qualityGates: unique(packs.flatMap((pack) => pack.quality_gates || [])).sort(),
    questions: unique(packs.flatMap((pack) => pack.questions || [])),
    manualSteps: unique(packs.flatMap((pack) => pack.manual_steps || []))
  }
}

export function renderStackPlan({ title = "C.A.S.A Stack Plan", packs, cwd = process.cwd(), nodeManager, ecosystem = "auto", openrouter = false, model = defaultOpenRouterModel }) {
  const commands = collectPackCommands(packs, { cwd, nodeManager, ecosystem })
  const metadata = collectPackMetadata(packs)
  const selectedSurfaces = unique(packs.flatMap((pack) => pack.surfaces || [])).sort()
  const selectedCategories = unique(packs.map((pack) => pack.category)).sort()
  const riskOrder = ["low", "medium", "high", "critical"]
  const highestRisk = packs
    .map((pack) => pack.risk || "low")
    .sort((a, b) => riskOrder.indexOf(b) - riskOrder.indexOf(a))[0] || "low"
  const shouldConfigureOpenRouter = openrouter || packs.some((pack) => pack.id === "ai:openrouter")
  const lines = []

  lines.push(`# ${title}`)
  lines.push("")
  lines.push(`- Generated: ${new Date().toISOString()}`)
  lines.push(`- Highest risk: ${highestRisk}`)
  lines.push(`- Surfaces: ${selectedSurfaces.join(", ") || "none"}`)
  lines.push(`- Categories: ${selectedCategories.join(", ") || "none"}`)
  lines.push("")
  lines.push("## Selected Packs")
  lines.push("")
  for (const pack of packs) {
    lines.push(`- ${pack.id} (${pack.risk || "low"}): ${pack.name} - ${pack.summary}`)
  }
  lines.push("")
  lines.push("## Install Commands")
  lines.push("")
  if (commands.length === 0) {
    lines.push("No package install commands are declared for the selected packs.")
  } else {
    lines.push("```bash")
    for (const command of commands) {
      lines.push(`# ${command.packId}`)
      lines.push(commandLine(command))
    }
    lines.push("```")
  }
  lines.push("")
  lines.push("## Skills")
  lines.push("")
  for (const skill of metadata.skills) {
    lines.push(`- ${skill}`)
  }
  lines.push("")
  lines.push("## Policies")
  lines.push("")
  for (const policy of metadata.policies) {
    lines.push(`- .casa/kernel/policies/${policy}.md`)
  }
  lines.push("")
  lines.push("## Quality Gates")
  lines.push("")
  for (const gate of metadata.qualityGates) {
    lines.push(`- .casa/quality-gates/${gate}.md`)
  }
  lines.push("")
  lines.push("## Open Questions")
  lines.push("")
  for (const question of metadata.questions) {
    lines.push(`- ${question}`)
  }

  if (metadata.manualSteps.length > 0) {
    lines.push("")
    lines.push("## Manual Steps")
    lines.push("")
    for (const step of metadata.manualSteps) {
      lines.push(`- ${step}`)
    }
  }

  if (shouldConfigureOpenRouter) {
    lines.push("")
    lines.push("## OpenRouter")
    lines.push("")
    lines.push(`- Base URL: ${openRouterBaseUrl}`)
    lines.push("- API key env var: OPENROUTER_API_KEY")
    lines.push("- Model env var: OPENROUTER_MODEL")
    lines.push(`- Default model: ${model}`)
    lines.push("- Store real keys only in local environment or secret managers.")
  }

  lines.push("")
  lines.push("## Evidence To Capture")
  lines.push("")
  lines.push("- Dependency install output or lockfile diff.")
  lines.push("- Dependency review and vulnerability scan.")
  lines.push("- Relevant test, typecheck and security gate output.")
  lines.push("- Security review notes for high-risk packs.")
  lines.push("")

  return lines.join("\n")
}

export function writeStackPlan({ cwd = process.cwd(), title, slug, packs, outputPath, nodeManager, ecosystem = "auto", openrouter = false, model = defaultOpenRouterModel, force = false }) {
  const targetPath = outputPath
    ? path.resolve(cwd, outputPath)
    : path.join(cwd, ".casa/runtime/stack-plans", `${today()}-${normalizeSlug(slug || title)}.md`)

  if (fs.existsSync(targetPath) && !force) {
    throw new Error(`Stack plan already exists: ${path.relative(cwd, targetPath)}`)
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
  fs.writeFileSync(targetPath, renderStackPlan({ title, packs, cwd, nodeManager, ecosystem, openrouter, model }))
  return targetPath
}

export function writeOpenRouterConfig({ cwd = process.cwd(), model = defaultOpenRouterModel, apiKeyEnv = "OPENROUTER_API_KEY", force = true }) {
  const aiDir = path.join(cwd, ".casa/ai")
  const envExamplePath = path.join(aiDir, "openrouter.env.example")
  const modelRouterPath = path.join(aiDir, "model-router.yaml")

  fs.mkdirSync(aiDir, { recursive: true })

  const envExample = `# Copy these names into your local environment.
# Never commit real provider keys.
${apiKeyEnv}=
OPENROUTER_MODEL=${model}
OPENROUTER_BASE_URL=${openRouterBaseUrl}
`

  const modelRouter = `providers:
  openrouter:
    enabled: true
    base_url: ${openRouterBaseUrl}
    api_key_env: ${apiKeyEnv}
    default_model_env: OPENROUTER_MODEL
    default_model: ${model}
    request_headers:
      http_referer_env: APP_PUBLIC_URL
      title_env: APP_NAME
`

  for (const [targetPath, content] of [[envExamplePath, envExample], [modelRouterPath, modelRouter]]) {
    if (fs.existsSync(targetPath) && !force) {
      throw new Error(`AI config already exists: ${path.relative(cwd, targetPath)}`)
    }
    fs.writeFileSync(targetPath, content)
  }

  return { envExamplePath, modelRouterPath }
}

export function writeCompositionSpec({ cwd = process.cwd(), name, slug, packs, model = defaultOpenRouterModel, force = false }) {
  const specSlug = normalizeSlug(slug || name || "application-stack")
  const targetPath = path.join(cwd, ".casa/specs/generated", specSlug, "spec.md")

  if (fs.existsSync(targetPath) && !force) {
    throw new Error(`Composition spec already exists: ${path.relative(cwd, targetPath)}`)
  }

  const metadata = collectPackMetadata(packs)
  const openrouter = packs.some((pack) => pack.id === "ai:openrouter")
  const content = `# Spec: ${name || "Application Stack"}

## Goal

Compose a governed C.A.S.A application stack from registry packs.

## Users

- Builder selecting stack capabilities.
- Agent implementing the selected stack.
- Reviewer validating dependency, architecture and security decisions.

## Selected Packs

${packs.map((pack) => `- ${pack.id}: ${pack.summary}`).join("\n")}

## Functional Requirements

- Generate a stack plan with install commands, skills, policies and quality gates.
- Keep implementation boundaries explicit for selected surfaces.
- Treat high-risk packs as security-sensitive work.
${openrouter ? "- Configure OpenRouter through environment variables only." : "- Configure providers through environment variables only when providers are selected."}

## Non-Functional Requirements

- Dependency changes must be reproducible.
- Secrets must not be committed.
- Runtime behavior must be validated with the relevant gates.
- Documentation must be updated when stack behavior changes.

## API Requirements

- Define public endpoints before implementation.
- Record authorization decisions for public endpoints.
- Update OpenAPI contracts when API behavior is introduced.

## Data Model

- Document tenant boundaries and sensitive data ownership before adding persistence.
- Review migration rollback needs before destructive changes.

## Acceptance Criteria

- Given selected packs, when the stack plan is reviewed, then every dependency has a declared pack and justification.
- Given dependencies are installed, when validation runs, then dependency review and relevant gates are captured as evidence.
- Given an AI provider is configured, when files are generated, then no raw API key is written.
${openrouter ? `- Given OpenRouter is selected, when runtime config is loaded, then ${model} is configurable through OPENROUTER_MODEL.` : ""}

## Risks and Questions

${metadata.questions.map((question) => `- ${question}`).join("\n")}

## Out of Scope

- Committing real API keys.
- Deploying infrastructure without a separate DevOps mission.
- Resolving unrelated framework conflicts.
`

  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
  fs.writeFileSync(targetPath, content)
  return targetPath
}

export function runInstallCommands(commands, cwd = process.cwd()) {
  for (const command of commands) {
    const result = spawnSync(command.command, command.args, {
      cwd,
      stdio: "inherit"
    })

    if ((result.status ?? 1) !== 0) {
      return result.status ?? 1
    }
  }

  return 0
}

export function formatPackList(packs) {
  return packs
    .map((pack) => `${pack.id}\t${pack.category}\t${(pack.surfaces || []).join(",")}\t${pack.risk || "low"}\t${pack.name}`)
    .join("\n")
}

export function commandLineForDisplay(command) {
  return commandLine(command)
}
