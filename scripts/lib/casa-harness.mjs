import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"
import {
  collectPackCommands,
  collectPackMetadata,
  commandLineForDisplay,
  loadStackCatalog,
  presetPackIds,
  requireStackPacks
} from "./casa-stack.mjs"

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"))
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function timestampId(prefix = "run") {
  return `${new Date().toISOString().replace(/[:.]/g, "-")}-${prefix}`
}

function normalizeSlug(value, fallback = "recipe") {
  const normalized = String(value || fallback)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return normalized || fallback
}

function unique(items) {
  return [...new Set(items.filter(Boolean))]
}

function findRecipesPath(cwd, packageRoot) {
  const candidates = [
    path.join(cwd, ".casa/registry/recipes.json"),
    path.join(packageRoot, ".casa/registry/recipes.json")
  ]

  return candidates.find((candidate) => fs.existsSync(candidate))
}

export function loadRecipeCatalog({ cwd = process.cwd(), packageRoot = process.cwd() } = {}) {
  const catalogPath = findRecipesPath(cwd, packageRoot)

  if (!catalogPath) {
    throw new Error("Missing recipe catalog: .casa/registry/recipes.json")
  }

  const catalog = readJson(catalogPath)
  return {
    ...catalog,
    path: catalogPath,
    recipes: catalog.recipes || []
  }
}

export function listRecipes(catalog, filters = {}) {
  return catalog.recipes
    .filter((recipe) => !filters.category || recipe.category === filters.category)
    .sort((a, b) => a.id.localeCompare(b.id))
}

export function findRecipe(catalog, recipeId) {
  return catalog.recipes.find((recipe) => recipe.id === recipeId)
}

export function recipePackIds(recipe, stackCatalog) {
  const presetPacks = recipe.preset ? presetPackIds(stackCatalog, recipe.preset) : []
  return unique([...presetPacks, ...(recipe.packs || [])])
}

export function recipePacks(recipe, { cwd = process.cwd(), packageRoot = process.cwd() } = {}) {
  const stackCatalog = loadStackCatalog({ cwd, packageRoot })
  return requireStackPacks(stackCatalog, recipePackIds(recipe, stackCatalog))
}

export function renderRecipePlan({ recipe, cwd = process.cwd(), packageRoot = process.cwd(), name = "", nodeManager, ecosystem = "auto" }) {
  const packs = recipePacks(recipe, { cwd, packageRoot })
  const packMetadata = collectPackMetadata(packs)
  const commands = collectPackCommands(packs, { cwd, nodeManager, ecosystem })
  const skills = unique([...(recipe.skills || []), ...packMetadata.skills]).sort()
  const policies = packMetadata.policies
  const gates = packMetadata.qualityGates
  const titleName = name || recipe.name
  const lines = []

  lines.push(`# Recipe Plan: ${recipe.name}`)
  lines.push("")
  lines.push(`- Recipe: ${recipe.id}`)
  lines.push(`- Generated: ${new Date().toISOString()}`)
  lines.push(`- Mode: ${recipe.mode || "hybrid"}`)
  lines.push(`- Category: ${recipe.category}`)
  lines.push(`- Target name: ${titleName}`)
  lines.push("")
  lines.push("## Outcome")
  lines.push("")
  lines.push(recipe.summary)
  lines.push("")

  if (packs.length > 0) {
    lines.push("## Stack Packs")
    lines.push("")
    for (const pack of packs) {
      lines.push(`- ${pack.id}: ${pack.name} - ${pack.summary}`)
    }
    lines.push("")
  }

  lines.push("## Step By Step")
  lines.push("")
  for (const [index, step] of (recipe.steps || []).entries()) {
    lines.push(`${index + 1}. ${step}`)
  }
  lines.push("")

  lines.push("## Suggested Commands")
  lines.push("")
  if ((recipe.commands || []).length === 0 && commands.length === 0) {
    lines.push("No commands declared for this recipe.")
  } else {
    lines.push("```bash")
    for (const command of recipe.commands || []) {
      lines.push(`# ${command.phase}`)
      lines.push(command.run.replace(/<app-name>/g, normalizeSlug(titleName, "app")))
    }
    for (const command of commands) {
      lines.push(`# install ${command.packId}`)
      lines.push(commandLineForDisplay(command))
    }
    lines.push("```")
  }
  lines.push("")

  if ((recipe.templates || []).length > 0) {
    lines.push("## Templates")
    lines.push("")
    for (const template of recipe.templates) {
      lines.push(`- templates/${template}`)
    }
    lines.push("")
  }

  lines.push("## Skills")
  lines.push("")
  for (const skill of skills) {
    lines.push(`- ${skill}`)
  }
  lines.push("")

  lines.push("## Policies")
  lines.push("")
  for (const policy of policies) {
    lines.push(`- .casa/kernel/policies/${policy}.md`)
  }
  lines.push("")

  lines.push("## Quality Gates")
  lines.push("")
  for (const gate of gates) {
    lines.push(`- .casa/quality-gates/${gate}.md`)
  }
  lines.push("")

  lines.push("## Evidence")
  lines.push("")
  for (const evidence of recipe.evidence || []) {
    lines.push(`- ${evidence}`)
  }
  lines.push("")

  lines.push("## Harness Notes")
  lines.push("")
  lines.push("- Installing dependencies or mutating external services requires explicit `--execute`.")
  lines.push("- Keep secrets outside committed files.")
  lines.push("- Record validation output before closing the mission.")
  lines.push("")

  return lines.join("\n")
}

function executionCommand(rawCommand, cwd, name) {
  const command = rawCommand.replace(/<app-name>/g, normalizeSlug(name, "app"))
  if (command.startsWith("casa ")) {
    if (fs.existsSync(path.join(cwd, "casa"))) {
      return `./${command}`
    }
    if (fs.existsSync(path.join(cwd, "scripts/casa.mjs"))) {
      return `node scripts/casa.mjs ${command.slice("casa ".length)}`
    }
  }

  return command
}

export function runRecipeCommands(recipe, { cwd = process.cwd(), name = "" } = {}) {
  for (const command of recipe.commands || []) {
    const run = executionCommand(command.run, cwd, name || recipe.name)
    const result = spawnSync(run, {
      cwd,
      shell: true,
      stdio: "inherit"
    })

    if ((result.status ?? 1) !== 0) {
      return result.status ?? 1
    }
  }

  return 0
}

export function writeRecipePlan({ recipe, cwd = process.cwd(), packageRoot = process.cwd(), name = "", outputPath = "", nodeManager, ecosystem = "auto", force = false }) {
  const targetPath = outputPath
    ? path.resolve(cwd, outputPath)
    : path.join(cwd, ".casa/runtime/recipes", `${today()}-${normalizeSlug(recipe.id)}.md`)

  if (fs.existsSync(targetPath) && !force) {
    throw new Error(`Recipe plan already exists: ${path.relative(cwd, targetPath)}`)
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
  fs.writeFileSync(targetPath, renderRecipePlan({ recipe, cwd, packageRoot, name, nodeManager, ecosystem }))
  return targetPath
}

export function appendHarnessHistory({ cwd = process.cwd(), action, subject = "", details = {} }) {
  const historyDir = path.join(cwd, ".casa/runtime/history")
  const historyPath = path.join(historyDir, "harness.jsonl")
  const entry = {
    id: timestampId(normalizeSlug(action || "run")),
    timestamp: new Date().toISOString(),
    action,
    subject,
    details
  }

  fs.mkdirSync(historyDir, { recursive: true })
  fs.appendFileSync(historyPath, `${JSON.stringify(entry)}\n`)
  return { entry, historyPath }
}

export function readHarnessHistory({ cwd = process.cwd(), limit = 20 } = {}) {
  const historyPath = path.join(cwd, ".casa/runtime/history/harness.jsonl")
  if (!fs.existsSync(historyPath)) {
    return []
  }

  const entries = fs
    .readFileSync(historyPath, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line))

  return entries.slice(-limit).reverse()
}

export function findHistoryEntry({ cwd = process.cwd(), id }) {
  return readHarnessHistory({ cwd, limit: Number.MAX_SAFE_INTEGER }).find((entry) => entry.id === id)
}

export function formatRecipeList(recipes) {
  return recipes
    .map((recipe) => `${recipe.id}\t${recipe.category}\t${recipe.mode || "hybrid"}\t${recipe.name}`)
    .join("\n")
}

export function renderGuide({ recipes, goal = "" }) {
  const normalizedGoal = goal.toLowerCase()
  const matching = recipes.filter((recipe) => {
    if (!normalizedGoal) {
      return ["create-web-saas", "create-mobile-app", "create-filament-admin", "harden-web-security", "prepare-docker-deploy"].includes(recipe.id)
    }

    return [recipe.id, recipe.name, recipe.category, recipe.summary].join(" ").toLowerCase().includes(normalizedGoal)
  })
  const selected = matching.length > 0 ? matching : recipes.slice(0, 6)
  const lines = []

  lines.push("# C.A.S.A Terminal Guide")
  lines.push("")
  lines.push("Use recipes for repeatable software creation, stack packs for dependency installs, and history for traceability.")
  lines.push("")
  lines.push("## Suggested Flow")
  lines.push("")
  lines.push("1. `casa guide --goal \"<what you want>\"`")
  lines.push("2. `casa recipe plan <recipe-id> --name \"<app-name>\"`")
  lines.push("3. Review `.casa/runtime/recipes/<plan>.md`")
  lines.push("4. `casa recipe run <recipe-id> --execute` when you intentionally want installs or mutations")
  lines.push("5. `casa check` and capture evidence")
  lines.push("")
  lines.push("## Matching Recipes")
  lines.push("")
  for (const recipe of selected) {
    lines.push(`- ${recipe.id}: ${recipe.summary}`)
  }
  lines.push("")
  lines.push("## Common Commands")
  lines.push("")
  lines.push("```bash")
  lines.push("casa recipe list")
  lines.push("casa stack list")
  lines.push("casa template list")
  lines.push("casa history list")
  lines.push("```")

  return lines.join("\n")
}
