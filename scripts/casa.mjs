#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(scriptDir, "..")

function printHelp() {
  console.log(`C.A.S.A CLI

Usage:
  casa init [target-dir] [--mode greenfield|brownfield|hybrid] [--adapters codex,cursor,generic,claude,...|all] [--force]
  casa doctor
  casa check
  casa generate adapters [--check]
  casa mission new <slug> [--title "Title"] [--mode greenfield|brownfield|hybrid]
  casa capsule list
  casa gate list

Commands:
  init                Install the C.A.S.A control-plane overlay into a project.
  doctor              Validate C.A.S.A structure and governance.
  check               Run structure check, adapter sync check and doctor.
  generate adapters   Generate agent-specific adapter outputs.
  mission new         Create a mission file from the mission template.
  capsule list        List available context capsules.
  gate list           List available quality gates.
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
    fs.copyFileSync(file.sourcePath, file.targetPath)
  }
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
  const plan = buildCopyPlan(sources, targetRoot)

  fs.mkdirSync(targetRoot, { recursive: true })
  writeCopyPlan(plan, force)

  console.log(`Installed C.A.S.A in ${path.relative(process.cwd(), targetRoot) || "."}`)
  console.log(`Mode: ${mode}`)
  console.log("Next:")
  console.log("  casa doctor")
  console.log("  casa mission new first-mission --title \"First Mission\"")
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

const [command, subcommand, ...rest] = process.argv.slice(2)

if (!command || command === "help" || command === "--help" || command === "-h") {
  printHelp()
  process.exit(0)
}

if (command === "init") {
  createInit([subcommand, ...rest].filter(Boolean))
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
