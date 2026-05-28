#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import readline from "node:readline/promises"
import { buildAdapterFiles, writeAdapterFiles } from "./lib/casa-adapters.mjs"
import {
  collectPackCommands,
  commandLineForDisplay,
  defaultOpenRouterModel,
  detectNodePackageManager,
  findStackPack,
  formatPackList,
  listStackPacks,
  loadStackCatalog,
  openRouterBaseUrl,
  presetPackIds,
  renderStackPlan,
  requireStackPacks,
  runInstallCommands,
  writeCompositionSpec,
  writeOpenRouterConfig,
  writeStackPlan
} from "./lib/casa-stack.mjs"
import {
  appendHarnessHistory,
  findHistoryEntry,
  findRecipe,
  formatRecipeList,
  listRecipes,
  loadRecipeCatalog,
  readHarnessHistory,
  renderGuide,
  renderRecipePlan,
  recipePacks,
  runRecipeCommands,
  writeRecipePlan
} from "./lib/casa-harness.mjs"
import {
  auditSkillContent,
  formatSkillSearchResults,
  inspectGithubSkill,
  installInspectedSkill,
  loadSkillMarketplaceConfig,
  parseGitHubSkillSource,
  readSkillsLock,
  removeLockedSkill,
  renderSkillInspection,
  searchGithubSkills
} from "./lib/casa-skill-marketplace.mjs"

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(scriptDir, "..")

function printHelp() {
  console.log(`C.A.S.A CLI

Usage:
  casa init [target-dir] [--mode greenfield|brownfield|hybrid] [--adapters codex,cursor,generic,claude,...|all] [--force]
  casa commands
  casa doctor
  casa check
  casa generate adapters [--check]
  casa compose [--preset web-saas|mobile-app|desktop-app|filament-admin|ai-fullstack] [--name "App"] [--openrouter] [--model model]
  casa stack list [--category name] [--surface name]
  casa stack show <pack-id>
  casa stack plan <pack-id...> [--preset id] [--ecosystem auto|node|composer|python|cargo|all] [--openrouter] [--model model] [--output file]
  casa stack add <pack-id...> [--preset id] [--ecosystem auto|node|composer|python|cargo|all] [--execute] [--openrouter] [--model model]
  casa recipe list [--category name]
  casa recipe show <recipe-id>
  casa recipe plan <recipe-id> [--name "App"] [--output file]
  casa recipe run <recipe-id> [--name "App"] [--execute]
  casa guide [--goal "what you want"]
  casa template list
  casa template use <template-id> [target-dir] [--force]
  casa history list [--limit 20]
  casa history show <entry-id>
  casa skill list
  casa skill new <slug> [--description "Description"] [--no-generate]
  casa skill search <query> [--limit 10]
  casa skill inspect <owner/repo[/path]> [--ref branch|tag|sha]
  casa skill install <owner/repo[/path]> [--ref branch|tag|sha] [--force] [--allow-risk]
  casa skill audit [skill-name|owner/repo[/path]]
  casa skill update <skill-name> [--allow-risk]
  casa skill remove <skill-name> [--no-generate]
  casa ai configure openrouter [--model model] [--api-key-env OPENROUTER_API_KEY]
  casa mission new <slug> [--title "Title"] [--mode greenfield|brownfield|hybrid]
  casa capsule list
  casa gate list

Commands:
  init                Install the C.A.S.A control-plane overlay into a project.
  commands            Print short local commands and aliases.
  doctor              Validate C.A.S.A structure and governance.
  check               Run structure check, adapter sync check and doctor.
  generate adapters   Generate agent-specific adapter outputs.
  compose             Ask stack questions and generate a stack plan, spec and optional AI config.
  stack               List, inspect, plan or install governed stack packs.
  recipe             Plan or run prebuilt terminal recipes.
  guide              Suggest the next C.A.S.A steps for a goal.
  template           List or copy starter templates.
  history            Inspect local harness history.
  skill               List or create C.A.S.A skills and regenerate adapters.
  ai configure        Generate safe provider config without storing raw secrets.
  mission new         Create a mission file from the mission template.
  capsule list        List available context capsules.
  gate list           List available quality gates.
`)
}

function printCommands() {
  console.log(`C.A.S.A command shortcuts

Install in a project:
  npx @aillomai/casa init
  npx @aillomai/casa init --mode brownfield
  npx @aillomai/casa init --adapters all

After init, use the local shortcut:
  ./casa doctor
  ./casa check
  ./casa mission new first-feature --title "First Feature"
  ./casa compose --preset web-saas --name "Customer Portal"
  ./casa compose --preset ai-fullstack --openrouter --model ${defaultOpenRouterModel}
  ./casa stack list
  ./casa stack add frontend:react-app security:web-baseline
  ./casa recipe list
  ./casa recipe plan create-web-saas --name "Customer Portal"
  ./casa guide --goal "deploy"
  ./casa history list
  ./casa skill search stripe
  ./casa ai configure openrouter --model ${defaultOpenRouterModel}
  ./casa generate adapters --check
  ./casa capsule list
  ./casa gate list

Without the local shortcut:
  npx @aillomai/casa doctor
  npx @aillomai/casa check

Optional global install:
  npm install -g @aillomai/casa
  casa init
  casa doctor
`)
}

function printInitHelp() {
  console.log(`C.A.S.A init

Usage:
  casa init [target-dir] [--mode greenfield|brownfield|hybrid] [--adapters claude,github-copilot,kilo-code|all] [--force]

Examples:
  casa init
  casa init ../my-app --mode greenfield
  casa init . --adapters claude,github-copilot
  casa init . --adapters all --force
`)
}

function runNodeScript(scriptName, args = []) {
  const status = runNodeScriptStatus(scriptName, args)
  process.exit(status)
}

function runNodeScriptStatus(scriptName, args = []) {
  const result = spawnSync(process.execPath, [path.join(scriptDir, scriptName), ...args], {
    cwd: process.cwd(),
    stdio: "inherit"
  })

  return result.status ?? 1
}

function runCheck() {
  const checks = [
    ["check-structure.mjs", []],
    ["generate-adapters.mjs", ["--check"]],
    ["casa-doctor.mjs", []]
  ]

  for (const [scriptName, args] of checks) {
    const status = runNodeScriptStatus(scriptName, args)
    if (status !== 0) {
      process.exit(status)
    }
  }

  process.exit(0)
}

function parseOption(args, name, fallback = "") {
  const index = args.indexOf(name)
  if (index === -1) {
    return fallback
  }

  return args[index + 1] ?? fallback
}

function hasFlag(args, name) {
  return args.includes(name)
}

function parseCsvOption(args, name, fallback = []) {
  const raw = parseOption(args, name, "")
  if (!raw) {
    return fallback
  }

  return raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
}

function positionalArgs(args, optionsWithValues = new Set()) {
  const positionals = []

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (optionsWithValues.has(arg)) {
      index += 1
      continue
    }
    if (arg.startsWith("--")) {
      continue
    }
    positionals.push(arg)
  }

  return positionals
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function ensureSafeSlug(slug) {
  const normalized = slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")

  if (!normalized) {
    console.error("Mission slug is required.")
    process.exit(1)
  }

  return normalized
}

function resolvePackagePath(relativePath) {
  return path.join(packageRoot, relativePath)
}

function collectFiles(sourcePath, basePath = sourcePath) {
  const stat = fs.statSync(sourcePath)

  if (stat.isFile()) {
    return [
      {
        sourcePath,
        relativePath: path.relative(basePath, sourcePath)
      }
    ]
  }

  const files = []
  const entries = fs.readdirSync(sourcePath, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))

  for (const entry of entries) {
    const entryPath = path.join(sourcePath, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectFiles(entryPath, basePath))
      continue
    }
    if (entry.isFile()) {
      files.push({
        sourcePath: entryPath,
        relativePath: path.relative(basePath, entryPath)
      })
    }
  }

  return files
}

function buildCopyPlan(sources, targetRoot) {
  const plan = []

  for (const source of sources) {
    const absoluteSource = resolvePackagePath(source.from)
    if (!fs.existsSync(absoluteSource)) {
      console.error(`Missing package source: ${source.from}`)
      process.exit(1)
    }

    const stat = fs.statSync(absoluteSource)

    if (stat.isFile()) {
      plan.push({
        sourcePath: absoluteSource,
        targetPath: path.join(targetRoot, source.to)
      })
      continue
    }

    for (const file of collectFiles(absoluteSource)) {
      plan.push({
        sourcePath: file.sourcePath,
        targetPath: path.join(targetRoot, source.to, file.relativePath)
      })
    }
  }

  return plan
}

function writeCopyPlan(plan, force) {
  const conflicts = plan
    .filter((file) => fs.existsSync(file.targetPath))
    .map((file) => path.relative(process.cwd(), file.targetPath))

  if (conflicts.length > 0 && !force) {
    console.error("C.A.S.A init would overwrite existing files. Re-run with --force or remove the conflicts:")
    for (const filePath of conflicts.slice(0, 20)) {
      console.error(`- ${filePath}`)
    }
    if (conflicts.length > 20) {
      console.error(`- ...and ${conflicts.length - 20} more`)
    }
    process.exit(1)
  }

  for (const file of plan) {
    fs.mkdirSync(path.dirname(file.targetPath), { recursive: true })
    if (Object.hasOwn(file, "content")) {
      fs.writeFileSync(file.targetPath, file.content)
    } else {
      fs.copyFileSync(file.sourcePath, file.targetPath)
    }
    if (file.mode) {
      fs.chmodSync(file.targetPath, file.mode)
    }
  }
}

function commandShortcutFiles(targetRoot) {
  const shellShortcut = `#!/usr/bin/env sh
set -eu

exec npx --yes @aillomai/casa "$@"
`
  const windowsShortcut = `@echo off\r
npx --yes @aillomai/casa %*\r
`
  const commandsGuide = `# C.A.S.A Commands

Use these short commands from the project root after running \`casa init\`.

## Daily

\`\`\`bash
./casa doctor
./casa check
./casa generate adapters --check
\`\`\`

## Missions

\`\`\`bash
./casa mission new first-feature --title "First Feature" --mode greenfield
./casa mission new legacy-auth --title "Legacy Auth" --mode brownfield
\`\`\`

## Stack Composition

\`\`\`bash
./casa compose --preset web-saas --name "Customer Portal"
./casa compose --preset ai-fullstack --openrouter --model ${defaultOpenRouterModel}
./casa stack list
./casa stack add frontend:react-app security:web-baseline
./casa recipe list
./casa recipe plan create-web-saas --name "Customer Portal"
./casa guide --goal "deploy"
./casa history list
./casa ai configure openrouter --model ${defaultOpenRouterModel}
\`\`\`

## Discovery

\`\`\`bash
./casa capsule list
./casa gate list
\`\`\`

## Without Local Shortcut

\`\`\`bash
npx @aillomai/casa doctor
npx @aillomai/casa check
\`\`\`
`

  return [
    {
      targetPath: path.join(targetRoot, "casa"),
      content: shellShortcut,
      mode: 0o755
    },
    {
      targetPath: path.join(targetRoot, "casa.cmd"),
      content: windowsShortcut
    },
    {
      targetPath: path.join(targetRoot, ".casa/commands.md"),
      content: commandsGuide
    }
  ]
}

function adapterSources(adapterNames) {
  const adapterMap = new Map([
    ["claude", [{ from: "examples/ide-adapters/claude/CLAUDE.md", to: "CLAUDE.md" }, { from: "examples/ide-adapters/claude/.claude", to: ".claude" }]],
    ["devin", [{ from: "examples/ide-adapters/devin/knowledge", to: "knowledge" }]],
    ["github-copilot", [{ from: "examples/ide-adapters/github-copilot/.github", to: ".github" }]],
    ["copilot", [{ from: "examples/ide-adapters/github-copilot/.github", to: ".github" }]],
    ["antigravity", [{ from: "examples/ide-adapters/antigravity/.agents", to: ".agents" }, { from: "examples/ide-adapters/antigravity/workflows", to: "workflows" }]],
    ["windsurf", [{ from: "examples/ide-adapters/windsurf/.windsurf", to: ".windsurf" }, { from: "examples/ide-adapters/windsurf/workspace-rules", to: "workspace-rules" }]],
    ["trae", [{ from: "examples/ide-adapters/trae/.agents", to: ".agents" }, { from: "examples/ide-adapters/trae/.trae", to: ".trae" }]],
    ["kilo-code", [{ from: "examples/ide-adapters/kilo-code/.kilocoderules", to: ".kilocoderules" }, { from: "examples/ide-adapters/kilo-code/CONTEXT.md", to: "CONTEXT.md" }, { from: "examples/ide-adapters/kilo-code/kilo.jsonc", to: "kilo.jsonc" }]],
    ["kilocode", [{ from: "examples/ide-adapters/kilo-code/.kilocoderules", to: ".kilocoderules" }, { from: "examples/ide-adapters/kilo-code/CONTEXT.md", to: "CONTEXT.md" }, { from: "examples/ide-adapters/kilo-code/kilo.jsonc", to: "kilo.jsonc" }]],
    ["continue", [{ from: "examples/ide-adapters/continue/.continue", to: ".continue" }]]
  ])

  if (adapterNames.includes("all")) {
    return [...new Set([...adapterMap.values()].flat().map((entry) => JSON.stringify(entry)))].map((entry) => JSON.parse(entry))
  }

  const selected = []
  for (const name of adapterNames) {
    if (["codex", "cursor", "generic"].includes(name)) {
      continue
    }

    const sources = adapterMap.get(name)
    if (!sources) {
      console.error(`Unknown adapter: ${name}`)
      process.exit(1)
    }

    selected.push(...sources)
  }

  return selected
}

function createInit(args) {
  if (args.includes("--help") || args.includes("-h")) {
    printInitHelp()
    return
  }

  const positional = positionalArgs(args, new Set(["--mode", "--adapters"]))
  const targetArg = positional[0] ?? "."
  const targetRoot = path.resolve(process.cwd(), targetArg)
  const mode = parseOption(args, "--mode", "greenfield")
  const validModes = new Set(["greenfield", "brownfield", "hybrid"])
  const force = hasFlag(args, "--force")
  const adapters = parseCsvOption(args, "--adapters", ["codex", "cursor", "generic"])

  if (!validModes.has(mode)) {
    console.error("Invalid init mode. Use greenfield, brownfield or hybrid.")
    process.exit(1)
  }

  const coreSources = [
    { from: "AGENTS.md", to: "AGENTS.md" },
    { from: "casa.manifest.yaml", to: "casa.manifest.yaml" },
    { from: ".casa", to: ".casa" },
    { from: ".agents", to: ".agents" },
    { from: ".codex", to: ".codex" },
    { from: ".cursor", to: ".cursor" }
  ]
  const sources = [...coreSources, ...adapterSources(adapters)]
  const plan = [...buildCopyPlan(sources, targetRoot), ...commandShortcutFiles(targetRoot)]

  fs.mkdirSync(targetRoot, { recursive: true })
  writeCopyPlan(plan, force)

  console.log(`Installed C.A.S.A in ${path.relative(process.cwd(), targetRoot) || "."}`)
  console.log(`Mode: ${mode}`)
  console.log("Next:")
  console.log("  ./casa doctor")
  console.log("  ./casa mission new first-mission --title \"First Mission\"")
  console.log("  ./casa commands")
}

function createMission(args) {
  const slug = ensureSafeSlug(args[0] ?? "")
  const title = parseOption(args, "--title", slug.replace(/-/g, " "))
  const mode = parseOption(args, "--mode", "greenfield")
  const validModes = new Set(["greenfield", "brownfield", "hybrid"])

  if (!validModes.has(mode)) {
    console.error("Invalid mission mode. Use greenfield, brownfield or hybrid.")
    process.exit(1)
  }

  const templatePath = ".casa/mission-control/mission-template.md"
  if (!fs.existsSync(templatePath)) {
    console.error(`Missing mission template: ${templatePath}`)
    process.exit(1)
  }

  const missionId = `${today()}-${slug}`
  const targetDir = ".casa/runtime/missions"
  const targetPath = path.join(targetDir, `${missionId}.md`)

  fs.mkdirSync(targetDir, { recursive: true })

  if (fs.existsSync(targetPath)) {
    console.error(`Mission already exists: ${targetPath}`)
    process.exit(1)
  }

  const content = fs
    .readFileSync(templatePath, "utf8")
    .replace("- ID:", `- ID: ${missionId}`)
    .replace("- Title:", `- Title: ${title}`)
    .replace("- Mode: greenfield | brownfield | hybrid", `- Mode: ${mode}`)
    .replace("- Status: proposed | planned | active | blocked | review | done", "- Status: planned")

  fs.writeFileSync(targetPath, content)
  console.log(`Created mission: ${targetPath}`)
}

function listMarkdownDirectory(rootDir, label) {
  if (!fs.existsSync(rootDir)) {
    console.error(`Missing ${label} directory: ${rootDir}`)
    process.exit(1)
  }

  const entries = fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() || entry.name.endsWith(".md"))
    .map((entry) => entry.name.replace(/\.md$/, ""))
    .sort((a, b) => a.localeCompare(b))

  if (entries.length === 0) {
    console.log(`No ${label} found.`)
    return
  }

  for (const entry of entries) {
    console.log(entry)
  }
}

function requireRecipe(recipeId, catalog) {
  if (!recipeId) {
    console.error("Recipe id is required.")
    process.exit(1)
  }

  const recipe = findRecipe(catalog, recipeId)
  if (!recipe) {
    console.error(`Unknown recipe: ${recipeId}`)
    process.exit(1)
  }

  return recipe
}

function printRecipe(recipe) {
  console.log(`${recipe.id}`)
  console.log(`Name: ${recipe.name}`)
  console.log(`Category: ${recipe.category}`)
  console.log(`Mode: ${recipe.mode || "hybrid"}`)
  console.log(`Summary: ${recipe.summary}`)
  if (recipe.preset) {
    console.log(`Preset: ${recipe.preset}`)
  }
  if ((recipe.packs || []).length > 0) {
    console.log(`Packs: ${recipe.packs.join(", ")}`)
  }
  if ((recipe.templates || []).length > 0) {
    console.log(`Templates: ${recipe.templates.join(", ")}`)
  }
  if ((recipe.skills || []).length > 0) {
    console.log(`Skills: ${recipe.skills.join(", ")}`)
  }
}

function createRecipeCommand(action, args) {
  const catalog = loadRecipeCatalog({ cwd: process.cwd(), packageRoot })

  if (!action || action === "list") {
    const recipes = listRecipes(catalog, { category: parseOption(args, "--category", "") })
    console.log("id\tcategory\tmode\tname")
    console.log(formatRecipeList(recipes))
    return
  }

  if (action === "show") {
    const recipe = requireRecipe(positionalArgs(args)[0], catalog)
    printRecipe(recipe)
    return
  }

  if (action === "plan" || action === "run") {
    const recipe = requireRecipe(positionalArgs(args, new Set(["--name", "--output", "--node-manager", "--ecosystem"]))[0], catalog)
    const name = parseOption(args, "--name", recipe.name)
    const nodeManager = parseOption(args, "--node-manager", detectNodePackageManager(process.cwd()))
    const ecosystem = parseOption(args, "--ecosystem", "auto")
    const outputPath = parseOption(args, "--output", "")
    const force = hasFlag(args, "--force")

    if (action === "plan" && !outputPath && !hasFlag(args, "--write")) {
      console.log(renderRecipePlan({ recipe, cwd: process.cwd(), packageRoot, name, nodeManager, ecosystem }))
      appendHarnessHistory({
        cwd: process.cwd(),
        action: "recipe.plan.preview",
        subject: recipe.id,
        details: { name, execute: false }
      })
      return
    }

    const planPath = writeRecipePlan({
      recipe,
      cwd: process.cwd(),
      packageRoot,
      name,
      outputPath,
      nodeManager,
      ecosystem,
      force
    })
    const packs = recipePacks(recipe, { cwd: process.cwd(), packageRoot })
    const commands = collectPackCommands(packs, { cwd: process.cwd(), nodeManager, ecosystem })
    const history = appendHarnessHistory({
      cwd: process.cwd(),
      action: `recipe.${action}`,
      subject: recipe.id,
      details: {
        name,
        plan: path.relative(process.cwd(), planPath),
        execute: action === "run" && hasFlag(args, "--execute"),
        packs: packs.map((pack) => pack.id)
      }
    })

    console.log(`Created recipe plan: ${path.relative(process.cwd(), planPath)}`)
    console.log(`Recorded history: ${history.entry.id}`)

    if (commands.length > 0) {
      console.log("Install commands:")
      for (const command of commands) {
        console.log(`  ${commandLineForDisplay(command)}`)
      }
    }

    if (action === "run" && hasFlag(args, "--execute")) {
      const recipeStatus = runRecipeCommands(recipe, { cwd: process.cwd(), name })
      if (recipeStatus !== 0) {
        process.exit(recipeStatus)
      }
      const status = runInstallCommands(commands, process.cwd())
      process.exit(status)
    }

    if (action === "run") {
      console.log("Run again with --execute to install declared packages.")
    }
    return
  }

  console.error(`Unknown recipe command: ${action}`)
  process.exit(1)
}

function createGuide(args) {
  const catalog = loadRecipeCatalog({ cwd: process.cwd(), packageRoot })
  const goal = parseOption(args, "--goal", positionalArgs(args, new Set(["--goal"]))[0] || "")
  console.log(renderGuide({ recipes: catalog.recipes, goal }))
  appendHarnessHistory({
    cwd: process.cwd(),
    action: "guide",
    subject: goal || "default",
    details: { goal }
  })
}

function listTemplates() {
  const templateRoot = path.join(packageRoot, "templates")
  if (!fs.existsSync(templateRoot)) {
    console.log("No templates found.")
    return
  }

  const templates = fs
    .readdirSync(templateRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b))

  for (const template of templates) {
    console.log(template)
  }
}

function createTemplateCommand(action, args) {
  if (!action || action === "list") {
    listTemplates()
    return
  }

  if (action === "use") {
    const templateId = positionalArgs(args)[0]
    const targetArg = positionalArgs(args)[1] ?? "."
    if (!templateId) {
      console.error("Template id is required.")
      process.exit(1)
    }

    const source = `templates/${templateId}`
    const absoluteSource = resolvePackagePath(source)
    if (!fs.existsSync(absoluteSource)) {
      console.error(`Unknown template: ${templateId}`)
      process.exit(1)
    }

    const targetRoot = path.resolve(process.cwd(), targetArg)
    const plan = buildCopyPlan([{ from: source, to: "." }], targetRoot)
    writeCopyPlan(plan, hasFlag(args, "--force"))
    const history = appendHarnessHistory({
      cwd: process.cwd(),
      action: "template.use",
      subject: templateId,
      details: { target: path.relative(process.cwd(), targetRoot) || "." }
    })

    console.log(`Copied template ${templateId} to ${path.relative(process.cwd(), targetRoot) || "."}`)
    console.log(`Recorded history: ${history.entry.id}`)
    return
  }

  console.error(`Unknown template command: ${action}`)
  process.exit(1)
}

function createHistoryCommand(action, args) {
  if (!action || action === "list") {
    const limit = Number.parseInt(parseOption(args, "--limit", "20"), 10)
    const entries = readHarnessHistory({ cwd: process.cwd(), limit: Number.isFinite(limit) ? limit : 20 })
    if (entries.length === 0) {
      console.log("No harness history found.")
      return
    }

    console.log("id\ttimestamp\taction\tsubject")
    for (const entry of entries) {
      console.log(`${entry.id}\t${entry.timestamp}\t${entry.action}\t${entry.subject}`)
    }
    return
  }

  if (action === "show") {
    const id = positionalArgs(args)[0]
    if (!id) {
      console.error("History entry id is required.")
      process.exit(1)
    }

    const entry = findHistoryEntry({ cwd: process.cwd(), id })
    if (!entry) {
      console.error(`History entry not found: ${id}`)
      process.exit(1)
    }

    console.log(JSON.stringify(entry, null, 2))
    return
  }

  console.error(`Unknown history command: ${action}`)
  process.exit(1)
}

function uniqueValues(items) {
  return [...new Set(items.filter(Boolean))]
}

function stackPackIdsFromArgs(catalog, args) {
  const packOptions = new Set(["--preset", "--packs", "--model", "--output", "--node-manager", "--ecosystem", "--category", "--surface", "--name", "--api-key-env", "--description"])
  const preset = parseOption(args, "--preset", "")
  const explicitPacks = [
    ...parseCsvOption(args, "--packs", []),
    ...positionalArgs(args, packOptions)
  ]
  const packIds = preset ? [...presetPackIds(catalog, preset), ...explicitPacks] : explicitPacks

  if (hasFlag(args, "--openrouter") && !packIds.includes("ai:openrouter")) {
    packIds.push("ai:openrouter")
  }

  return uniqueValues(packIds)
}

function printStackPack(pack) {
  console.log(`${pack.id}`)
  console.log(`Name: ${pack.name}`)
  console.log(`Category: ${pack.category}`)
  console.log(`Surfaces: ${(pack.surfaces || []).join(", ")}`)
  console.log(`Risk: ${pack.risk || "low"}`)
  console.log(`Summary: ${pack.summary}`)
  console.log(`Skills: ${(pack.skills || []).join(", ")}`)
  console.log(`Policies: ${(pack.policies || []).join(", ")}`)
  console.log(`Quality gates: ${(pack.quality_gates || []).join(", ")}`)
}

function createStackCommand(action, args) {
  const catalog = loadStackCatalog({ cwd: process.cwd(), packageRoot })

  if (!action || action === "list") {
    const filters = {
      category: parseOption(args, "--category", ""),
      surface: parseOption(args, "--surface", "")
    }
    const packs = listStackPacks(catalog, filters)
    console.log("id\tcategory\tsurfaces\trisk\tname")
    console.log(formatPackList(packs))
    return
  }

  if (action === "show") {
    const packId = positionalArgs(args)[0]
    if (!packId) {
      console.error("Stack pack id is required.")
      process.exit(1)
    }

    const pack = findStackPack(catalog, packId)
    if (!pack) {
      console.error(`Unknown stack pack: ${packId}`)
      process.exit(1)
    }

    printStackPack(pack)
    return
  }

  if (action === "plan" || action === "add") {
    const packIds = stackPackIdsFromArgs(catalog, args)
    if (packIds.length === 0) {
      console.error("At least one stack pack or --preset is required.")
      process.exit(1)
    }

    const packs = requireStackPacks(catalog, packIds)
    const model = parseOption(args, "--model", defaultOpenRouterModel)
    const nodeManager = parseOption(args, "--node-manager", detectNodePackageManager(process.cwd()))
    const ecosystem = parseOption(args, "--ecosystem", "auto")
    const openrouter = hasFlag(args, "--openrouter") || packIds.includes("ai:openrouter")
    const outputPath = parseOption(args, "--output", "")
    const title = parseOption(args, "--name", "C.A.S.A Stack Plan")
    const force = hasFlag(args, "--force")

    if (action === "plan" && !outputPath) {
      console.log(renderStackPlan({ title, packs, cwd: process.cwd(), nodeManager, ecosystem, openrouter, model }))
      appendHarnessHistory({
        cwd: process.cwd(),
        action: "stack.plan.preview",
        subject: packIds.join(","),
        details: { title, execute: false, packs: packIds }
      })
      return
    }

    const planPath = writeStackPlan({
      cwd: process.cwd(),
      title,
      slug: title,
      packs,
      outputPath,
      nodeManager,
      ecosystem,
      openrouter,
      model,
      force
    })

    console.log(`Created stack plan: ${path.relative(process.cwd(), planPath)}`)
    const history = appendHarnessHistory({
      cwd: process.cwd(),
      action: `stack.${action}`,
      subject: packIds.join(","),
      details: {
        title,
        plan: path.relative(process.cwd(), planPath),
        execute: action === "add" && hasFlag(args, "--execute"),
        packs: packIds
      }
    })
    console.log(`Recorded history: ${history.entry.id}`)

    if (openrouter) {
      const apiKeyEnv = parseOption(args, "--api-key-env", "OPENROUTER_API_KEY")
      const config = writeOpenRouterConfig({ cwd: process.cwd(), model, apiKeyEnv, force: true })
      console.log(`Created AI config: ${path.relative(process.cwd(), config.modelRouterPath)}`)
      console.log(`Created env example: ${path.relative(process.cwd(), config.envExamplePath)}`)
    }

    const commands = collectPackCommands(packs, { cwd: process.cwd(), nodeManager, ecosystem })
    if (commands.length > 0) {
      console.log("Install commands:")
      for (const command of commands) {
        console.log(`  ${commandLineForDisplay(command)}`)
      }
    }

    if (action === "add" && hasFlag(args, "--execute")) {
      const status = runInstallCommands(commands, process.cwd())
      process.exit(status)
    }

    return
  }

  console.error(`Unknown stack command: ${action}`)
  process.exit(1)
}

function findSkillRoot() {
  const candidates = [
    path.join(process.cwd(), ".casa/capabilities/skills"),
    path.join(packageRoot, ".casa/capabilities/skills")
  ]

  return candidates.find((candidate) => fs.existsSync(candidate))
}

function skillDescription(skillPath) {
  const content = fs.readFileSync(skillPath, "utf8")
  const descriptionMatch = content.match(/^description:\s*(.+)$/m)
  return descriptionMatch ? descriptionMatch[1] : ""
}

function listSkills() {
  const skillRoot = findSkillRoot()
  if (!skillRoot) {
    console.error("Missing skills directory: .casa/capabilities/skills")
    process.exit(1)
  }

  const skills = fs
    .readdirSync(skillRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => fs.existsSync(path.join(skillRoot, entry.name, "SKILL.md")))
    .map((entry) => {
      const skillPath = path.join(skillRoot, entry.name, "SKILL.md")
      return `${entry.name}\t${skillDescription(skillPath)}`
    })
    .sort((a, b) => a.localeCompare(b))

  console.log("name\tdescription")
  for (const skill of skills) {
    console.log(skill)
  }
}

function appendSkillRegistry(skillName) {
  const registryPath = ".casa/registry/skills.yaml"
  if (!fs.existsSync(registryPath)) {
    return
  }

  const registry = fs.readFileSync(registryPath, "utf8")
  if (registry.includes(`name: ${skillName}`)) {
    return
  }

  fs.appendFileSync(registryPath, `  - name: ${skillName}\n    path: .casa/capabilities/skills/${skillName}/SKILL.md\n`)
}

function removeSkillRegistry(skillName) {
  const registryPath = ".casa/registry/skills.yaml"
  if (!fs.existsSync(registryPath)) {
    return
  }

  const lines = fs.readFileSync(registryPath, "utf8").split("\n")
  const nextLines = []

  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].trim() === `- name: ${skillName}`) {
      index += 1
      continue
    }
    nextLines.push(lines[index])
  }

  fs.writeFileSync(registryPath, nextLines.join("\n").replace(/\n*$/, "\n"))
}

function localSkillPath(skillName) {
  return path.join(".casa/capabilities/skills", skillName, "SKILL.md")
}

function auditLocalSkill(skillName) {
  const skillPath = localSkillPath(skillName)
  if (!fs.existsSync(skillPath)) {
    console.error(`Skill not found: ${skillName}`)
    process.exit(1)
  }

  const manifestPath = path.join(".casa/capabilities/skills", skillName, "casa.skill.json")
  const manifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
    : { name: skillName, permissions: [] }
  return {
    skillName,
    audit: auditSkillContent(fs.readFileSync(skillPath, "utf8"), manifest)
  }
}

function printAuditResult(result) {
  console.log(`${result.skillName}: ${result.audit.blockers.length} blocker(s), ${result.audit.warnings.length} warning(s)`)
  for (const finding of result.audit.findings) {
    console.log(`- ${finding.severity}: ${finding.message}`)
  }
}

async function createSkillCommand(action, args) {
  if (!action || action === "list") {
    listSkills()
    return
  }

  if (action === "search") {
    const query = positionalArgs(args, new Set(["--limit"]))[0] || ""
    const limit = Number.parseInt(parseOption(args, "--limit", "10"), 10)
    const config = loadSkillMarketplaceConfig({ cwd: process.cwd(), packageRoot })
    try {
      const results = await searchGithubSkills(query, { limit: Number.isFinite(limit) ? limit : 10, config })
      console.log("source\tstars\tbranch\ttrust\tdescription")
      console.log(formatSkillSearchResults(results))
    } catch (error) {
      console.error(error.message)
      process.exit(1)
    }
    return
  }

  if (action === "inspect") {
    const source = positionalArgs(args, new Set(["--ref"]))[0]
    try {
      const inspection = await inspectGithubSkill(source, { ref: parseOption(args, "--ref", "") })
      console.log(renderSkillInspection(inspection))
    } catch (error) {
      console.error(error.message)
      process.exit(1)
    }
    return
  }

  if (action === "install") {
    const source = positionalArgs(args, new Set(["--ref"]))[0]
    try {
      const inspection = await inspectGithubSkill(source, { ref: parseOption(args, "--ref", "") })
      const installed = installInspectedSkill(inspection, {
        cwd: process.cwd(),
        force: hasFlag(args, "--force"),
        allowRisk: hasFlag(args, "--allow-risk")
      })
      appendSkillRegistry(inspection.skillName)
      if (!hasFlag(args, "--no-generate")) {
        writeAdapterFiles(buildAdapterFiles())
      }
      const history = appendHarnessHistory({
        cwd: process.cwd(),
        action: "skill.install",
        subject: inspection.skillName,
        details: {
          source,
          commit: inspection.resolved.commit,
          audit: installed ? inspection.audit : null,
          generatedAdapters: !hasFlag(args, "--no-generate")
        }
      })

      console.log(`Installed skill: ${inspection.skillName}`)
      console.log(`Pinned commit: ${inspection.resolved.commit}`)
      console.log(`Updated lockfile: ${path.relative(process.cwd(), installed.lockPath)}`)
      console.log(`Recorded history: ${history.entry.id}`)
    } catch (error) {
      console.error(error.message)
      process.exit(1)
    }
    return
  }

  if (action === "new" || action === "add") {
    const slug = ensureSafeSlug(args[0] ?? "")
    const description = parseOption(args, "--description", `Use when working on ${slug.replace(/-/g, " ")} tasks.`)
    const skillDir = path.join(".casa/capabilities/skills", slug)
    const skillPath = path.join(skillDir, "SKILL.md")
    const force = hasFlag(args, "--force")

    if (fs.existsSync(skillPath) && !force) {
      console.error(`Skill already exists: ${skillPath}`)
      process.exit(1)
    }

    fs.mkdirSync(skillDir, { recursive: true })
    fs.writeFileSync(skillPath, `---
name: ${slug}
description: ${description}
---

You are the C.A.S.A ${slug.replace(/-/g, " ")} specialist.

Workflow:
1. Read \`casa.manifest.yaml\`.
2. Read the relevant spec in \`.casa/specs\`.
3. Follow relevant standards and policies in \`.casa/kernel\`.
4. Use the smallest safe implementation path.
5. Update tests, docs and examples when behavior changes.
6. End with validation evidence.
`)

    appendSkillRegistry(slug)

    if (!hasFlag(args, "--no-generate")) {
      writeAdapterFiles(buildAdapterFiles())
      console.log("Generated adapters from updated skills.")
    }

    console.log(`Created skill: ${skillPath}`)
    const history = appendHarnessHistory({
      cwd: process.cwd(),
      action: "skill.new",
      subject: slug,
      details: { path: skillPath, generatedAdapters: !hasFlag(args, "--no-generate") }
    })
    console.log(`Recorded history: ${history.entry.id}`)
    return
  }

  if (action === "audit") {
    const target = positionalArgs(args)[0]
    if (!target) {
      const skillRoot = findSkillRoot()
      const skills = fs
        .readdirSync(skillRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort((a, b) => a.localeCompare(b))
      let blockers = 0
      let warnings = 0
      for (const skillName of skills) {
        const result = auditLocalSkill(skillName)
        blockers += result.audit.blockers.length
        warnings += result.audit.warnings.length
        printAuditResult(result)
      }
      appendHarnessHistory({
        cwd: process.cwd(),
        action: "skill.audit",
        subject: "all",
        details: { blockers, warnings }
      })
      if (blockers > 0) {
        process.exit(1)
      }
      return
    }

    if (target.includes("/")) {
      try {
        const inspection = await inspectGithubSkill(target, { ref: parseOption(args, "--ref", "") })
        printAuditResult({ skillName: inspection.skillName, audit: inspection.audit })
        appendHarnessHistory({
          cwd: process.cwd(),
          action: "skill.audit.remote",
          subject: target,
          details: {
            commit: inspection.resolved.commit,
            blockers: inspection.audit.blockers.length,
            warnings: inspection.audit.warnings.length
          }
        })
        if (inspection.audit.blockers.length > 0) {
          process.exit(1)
        }
      } catch (error) {
        console.error(error.message)
        process.exit(1)
      }
      return
    }

    const result = auditLocalSkill(target)
    printAuditResult(result)
    appendHarnessHistory({
      cwd: process.cwd(),
      action: "skill.audit",
      subject: target,
      details: {
        blockers: result.audit.blockers.length,
        warnings: result.audit.warnings.length
      }
    })
    if (result.audit.blockers.length > 0) {
      process.exit(1)
    }
    return
  }

  if (action === "update") {
    const skillName = positionalArgs(args)[0]
    const lock = readSkillsLock(process.cwd())
    const locked = lock.skills[skillName]
    if (!locked) {
      console.error(`Skill is not locked as an external install: ${skillName}`)
      process.exit(1)
    }

    const source = [locked.owner, locked.repo, locked.path].filter(Boolean).join("/")
    try {
      const inspection = await inspectGithubSkill(parseGitHubSkillSource(source, { ref: locked.ref }))
      if (inspection.resolved.commit === locked.commit && !hasFlag(args, "--force")) {
        console.log(`Skill is already current at ${locked.commit}`)
        return
      }
      const installed = installInspectedSkill(inspection, {
        cwd: process.cwd(),
        force: true,
        allowRisk: hasFlag(args, "--allow-risk")
      })
      appendSkillRegistry(inspection.skillName)
      if (!hasFlag(args, "--no-generate")) {
        writeAdapterFiles(buildAdapterFiles())
      }
      const history = appendHarnessHistory({
        cwd: process.cwd(),
        action: "skill.update",
        subject: inspection.skillName,
        details: {
          previousCommit: locked.commit,
          commit: inspection.resolved.commit,
          generatedAdapters: !hasFlag(args, "--no-generate")
        }
      })
      console.log(`Updated skill: ${inspection.skillName}`)
      console.log(`Pinned commit: ${inspection.resolved.commit}`)
      console.log(`Updated lockfile: ${path.relative(process.cwd(), installed.lockPath)}`)
      console.log(`Recorded history: ${history.entry.id}`)
    } catch (error) {
      console.error(error.message)
      process.exit(1)
    }
    return
  }

  if (action === "remove") {
    const skillName = positionalArgs(args)[0]
    if (!skillName) {
      console.error("Skill name is required.")
      process.exit(1)
    }

    const skillDir = path.join(".casa/capabilities/skills", skillName)
    if (!fs.existsSync(skillDir)) {
      console.error(`Skill not found: ${skillName}`)
      process.exit(1)
    }

    fs.rmSync(skillDir, { recursive: true, force: true })
    removeSkillRegistry(skillName, { cwd: process.cwd() })
    removeLockedSkill(skillName, { cwd: process.cwd() })
    if (!hasFlag(args, "--no-generate")) {
      writeAdapterFiles(buildAdapterFiles())
    }
    const history = appendHarnessHistory({
      cwd: process.cwd(),
      action: "skill.remove",
      subject: skillName,
      details: { generatedAdapters: !hasFlag(args, "--no-generate") }
    })
    console.log(`Removed skill: ${skillName}`)
    console.log(`Recorded history: ${history.entry.id}`)
    return
  }

  console.error(`Unknown skill command: ${action}`)
  process.exit(1)
}

function createAiCommand(action, args) {
  if (action !== "configure") {
    console.error("Usage: casa ai configure openrouter [--model model] [--api-key-env OPENROUTER_API_KEY]")
    process.exit(1)
  }

  const provider = args[0]
  if (provider !== "openrouter") {
    console.error("Only OpenRouter is supported by this command.")
    process.exit(1)
  }

  if (args.includes("--api-key") || args.includes("--key")) {
    console.error("Do not pass raw API keys to C.A.S.A. Use --api-key-env and set the value in your local environment.")
    process.exit(1)
  }

  const model = parseOption(args, "--model", defaultOpenRouterModel)
  const apiKeyEnv = parseOption(args, "--api-key-env", "OPENROUTER_API_KEY")
  const config = writeOpenRouterConfig({ cwd: process.cwd(), model, apiKeyEnv, force: true })

  console.log(`OpenRouter base URL: ${openRouterBaseUrl}`)
  console.log(`Model: ${model}`)
  console.log(`API key env var: ${apiKeyEnv}`)
  console.log(`Created AI config: ${path.relative(process.cwd(), config.modelRouterPath)}`)
  console.log(`Created env example: ${path.relative(process.cwd(), config.envExamplePath)}`)
  const history = appendHarnessHistory({
    cwd: process.cwd(),
    action: "ai.configure",
    subject: "openrouter",
    details: {
      model,
      apiKeyEnv,
      config: path.relative(process.cwd(), config.modelRouterPath),
      envExample: path.relative(process.cwd(), config.envExamplePath)
    }
  })
  console.log(`Recorded history: ${history.entry.id}`)
}

async function askChoice(rl, question, choices, fallback) {
  console.log(question)
  for (const choice of choices) {
    console.log(`  ${choice.id}: ${choice.name} - ${choice.summary}`)
  }

  const answer = (await rl.question(`Choose [${fallback}]: `)).trim()
  return answer || fallback
}

async function createCompose(args) {
  const catalog = loadStackCatalog({ cwd: process.cwd(), packageRoot })
  const packOptions = new Set(["--preset", "--packs", "--model", "--output", "--node-manager", "--ecosystem", "--category", "--surface", "--name", "--api-key-env"])
  let name = parseOption(args, "--name", "Application Stack")
  let preset = parseOption(args, "--preset", "")
  let packIds = [
    ...parseCsvOption(args, "--packs", []),
    ...positionalArgs(args, packOptions)
  ]
  let openrouter = hasFlag(args, "--openrouter")
  let model = parseOption(args, "--model", defaultOpenRouterModel)

  if (!preset && packIds.length === 0) {
    if (!process.stdin.isTTY) {
      console.error("Non-interactive compose requires --preset or --packs.")
      process.exit(1)
    }

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    try {
      preset = await askChoice(rl, "Select an application preset.", catalog.presets, "web-saas")
      const nameAnswer = (await rl.question(`Application name [${name}]: `)).trim()
      if (nameAnswer) {
        name = nameAnswer
      }
      const openrouterAnswer = (await rl.question("Configure OpenRouter? [y/N]: ")).trim().toLowerCase()
      openrouter = ["y", "yes", "s", "sim"].includes(openrouterAnswer)
      if (openrouter) {
        const modelAnswer = (await rl.question(`OpenRouter model [${model}]: `)).trim()
        if (modelAnswer) {
          model = modelAnswer
        }
      }
    } finally {
      rl.close()
    }
  }

  if (preset) {
    packIds = [...presetPackIds(catalog, preset), ...packIds]
  }
  if (openrouter && !packIds.includes("ai:openrouter")) {
    packIds.push("ai:openrouter")
  }

  packIds = uniqueValues(packIds)
  const packs = requireStackPacks(catalog, packIds)
  const title = `${name} Stack Plan`
  const force = hasFlag(args, "--force")
  const nodeManager = parseOption(args, "--node-manager", detectNodePackageManager(process.cwd()))
  const ecosystem = parseOption(args, "--ecosystem", "auto")
  const outputPath = parseOption(args, "--output", "")
  const planPath = writeStackPlan({
    cwd: process.cwd(),
    title,
    slug: name,
    packs,
    outputPath,
    nodeManager,
    ecosystem,
    openrouter,
    model,
    force
  })
  const specPath = writeCompositionSpec({ cwd: process.cwd(), name, slug: name, packs, model, force })

  console.log(`Created stack plan: ${path.relative(process.cwd(), planPath)}`)
  console.log(`Created composition spec: ${path.relative(process.cwd(), specPath)}`)
  const history = appendHarnessHistory({
    cwd: process.cwd(),
    action: "compose",
    subject: name,
    details: {
      plan: path.relative(process.cwd(), planPath),
      spec: path.relative(process.cwd(), specPath),
      packs: packIds,
      openrouter: openrouter || packIds.includes("ai:openrouter")
    }
  })
  console.log(`Recorded history: ${history.entry.id}`)

  if (openrouter || packIds.includes("ai:openrouter")) {
    const apiKeyEnv = parseOption(args, "--api-key-env", "OPENROUTER_API_KEY")
    const config = writeOpenRouterConfig({ cwd: process.cwd(), model, apiKeyEnv, force: true })
    console.log(`Created AI config: ${path.relative(process.cwd(), config.modelRouterPath)}`)
    console.log(`Created env example: ${path.relative(process.cwd(), config.envExamplePath)}`)
  }
}

const [command, subcommand, ...rest] = process.argv.slice(2)

if (!command || command === "help" || command === "--help" || command === "-h") {
  printHelp()
  process.exit(0)
}

if (command === "init") {
  createInit([subcommand, ...rest].filter(Boolean))
  process.exit(0)
}

if (command === "commands" || command === "cmd") {
  printCommands()
  process.exit(0)
}

if (command === "doctor") {
  runNodeScript("casa-doctor.mjs")
}

if (command === "check") {
  runCheck()
}

if (command === "generate" && subcommand === "adapters") {
  runNodeScript("generate-adapters.mjs", rest)
}

if (command === "compose") {
  await createCompose([subcommand, ...rest].filter(Boolean))
  process.exit(0)
}

if (command === "stack") {
  createStackCommand(subcommand, rest)
  process.exit(0)
}

if (command === "recipe") {
  createRecipeCommand(subcommand, rest)
  process.exit(0)
}

if (command === "guide") {
  createGuide([subcommand, ...rest].filter(Boolean))
  process.exit(0)
}

if (command === "template") {
  createTemplateCommand(subcommand, rest)
  process.exit(0)
}

if (command === "history") {
  createHistoryCommand(subcommand, rest)
  process.exit(0)
}

if (command === "skill") {
  await createSkillCommand(subcommand, rest)
  process.exit(0)
}

if (command === "ai") {
  createAiCommand(subcommand, rest)
  process.exit(0)
}

if (command === "mission" && subcommand === "new") {
  createMission(rest)
  process.exit(0)
}

if (command === "capsule" && subcommand === "list") {
  listMarkdownDirectory(".casa/context-capsules", "context capsules")
  process.exit(0)
}

if (command === "gate" && subcommand === "list") {
  listMarkdownDirectory(".casa/quality-gates", "quality gates")
  process.exit(0)
}

console.error(`Unknown command: ${[command, subcommand, ...rest].filter(Boolean).join(" ")}`)
printHelp()
process.exit(1)
