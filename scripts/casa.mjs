#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const scriptDir = path.dirname(fileURLToPath(import.meta.url))

function printHelp() {
  console.log(`C.A.S.A CLI

Usage:
  casa doctor
  casa check
  casa generate adapters [--check]
  casa mission new <slug> [--title "Title"] [--mode greenfield|brownfield|hybrid]
  casa capsule list
  casa gate list

Commands:
  doctor              Validate C.A.S.A structure and governance.
  check               Run structure check, adapter sync check and doctor.
  generate adapters   Generate agent-specific adapter outputs.
  mission new         Create a mission file from the mission template.
  capsule list        List available context capsules.
  gate list           List available quality gates.
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
