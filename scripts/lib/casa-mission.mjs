import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { parseFrontmatter, runSensors } from "./casa-verify.mjs"

const missionsRoot = ".casa/runtime/missions"
const statuses = ["proposed", "planned", "active", "review", "done", "blocked"]
const transitions = {
  start: { from: ["planned", "proposed", "blocked"], to: "active" },
  advance: { from: ["active"], to: "review" },
  close: { from: ["review"], to: "done" }
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function nowIso() {
  return new Date().toISOString()
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex")
}

export function normalizeSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function missionDir(cwd) {
  return path.join(cwd, missionsRoot)
}

function missionPath(cwd, id) {
  return path.join(missionDir(cwd), `${id}.md`)
}

function evidencePath(cwd, id) {
  return path.join(missionDir(cwd), `${id}.evidence.jsonl`)
}

export function policyHash(cwd = process.cwd()) {
  const roots = [".casa/kernel/policies", ".casa/kernel/risk-model"]
  const parts = []
  for (const root of roots) {
    const dir = path.join(cwd, root)
    if (!fs.existsSync(dir)) {
      continue
    }
    for (const fileName of fs.readdirSync(dir).sort((a, b) => a.localeCompare(b))) {
      if (fileName.endsWith(".md")) {
        parts.push(`${root}/${fileName}\n${fs.readFileSync(path.join(dir, fileName), "utf8")}`)
      }
    }
  }
  return sha256(parts.join("\n---\n")).slice(0, 16)
}

export function resolveMissionId(cwd, idOrSlug) {
  const raw = String(idOrSlug || "")
  if (!raw) {
    return null
  }

  const dir = missionDir(cwd)
  if (!fs.existsSync(dir)) {
    return null
  }
  if (fs.existsSync(missionPath(cwd, raw))) {
    return raw
  }

  const ids = fs
    .readdirSync(dir)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => fileName.replace(/\.md$/, ""))

  const slug = normalizeSlug(raw)
  const matches = ids.filter((id) => id === raw || id.endsWith(`-${slug}`)).sort((a, b) => a.localeCompare(b))
  return matches.length > 0 ? matches[matches.length - 1] : null
}

export function readMission(cwd, id) {
  const filePath = missionPath(cwd, id)
  if (!fs.existsSync(filePath)) {
    return null
  }
  const meta = parseFrontmatter(fs.readFileSync(filePath, "utf8"))
  return {
    id,
    filePath,
    status: typeof meta.status === "string" ? meta.status : "planned",
    title: typeof meta.title === "string" ? meta.title : id,
    mode: typeof meta.mode === "string" ? meta.mode : "",
    meta
  }
}

export function createMission({ cwd = process.cwd(), slug, title = "", mode = "greenfield", spec = "" }) {
  const normalized = normalizeSlug(slug)
  if (!normalized) {
    throw new Error("Mission slug is required.")
  }

  const templatePath = path.join(cwd, ".casa/mission-control/mission-template.md")
  if (!fs.existsSync(templatePath)) {
    throw new Error("Missing mission template: .casa/mission-control/mission-template.md")
  }

  const id = `${today()}-${normalized}`
  const filePath = missionPath(cwd, id)
  if (fs.existsSync(filePath)) {
    throw new Error(`Mission already exists: ${path.relative(cwd, filePath)}`)
  }

  const resolvedTitle = title || normalized.replace(/-/g, " ")
  const body = fs
    .readFileSync(templatePath, "utf8")
    .replace("- ID:", `- ID: ${id}`)
    .replace("- Title:", `- Title: ${resolvedTitle}`)
    .replace("- Mode: greenfield | brownfield | hybrid", `- Mode: ${mode}`)
    .replace("- Status: proposed | planned | active | blocked | review | done", "- Status: planned (tracked in frontmatter)")

  const frontmatter = `---\nid: ${id}\ntitle: ${resolvedTitle}\nmode: ${mode}\nstatus: planned\nspec: ${spec}\ncreated: ${today()}\n---\n\n`

  fs.mkdirSync(missionDir(cwd), { recursive: true })
  fs.writeFileSync(filePath, frontmatter + body)
  return { id, filePath }
}

function setStatus(cwd, id, status) {
  const filePath = missionPath(cwd, id)
  const content = fs.readFileSync(filePath, "utf8")
  const updated = content.replace(/(^---\n[\s\S]*?\nstatus: )([^\n]*)/, `$1${status}`)
  fs.writeFileSync(filePath, updated)
}

export function readEvidence(cwd, id) {
  const filePath = evidencePath(cwd, id)
  if (!fs.existsSync(filePath)) {
    return []
  }
  return fs
    .readFileSync(filePath, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line))
}

export function recordEvidence({ cwd = process.cwd(), id, type = "note", note = "", verify = false, strict = false }) {
  const mission = readMission(cwd, id)
  if (!mission) {
    throw new Error(`Mission not found: ${id}`)
  }

  const entry = {
    timestamp: nowIso(),
    missionId: id,
    missionStatus: mission.status,
    type,
    note,
    policyHash: policyHash(cwd)
  }

  if (verify) {
    const verification = runSensors({ cwd, strict })
    entry.gateResults = verification.results.map((result) => ({ id: result.id, status: result.status }))
    entry.gateSummary = {
      passed: verification.passed,
      failed: verification.failed,
      skipped: verification.skipped,
      ok: verification.ok
    }
  }

  fs.mkdirSync(missionDir(cwd), { recursive: true })
  fs.appendFileSync(evidencePath(cwd, id), `${JSON.stringify(entry)}\n`)
  return entry
}

export function transitionMission({ cwd = process.cwd(), id, action }) {
  const mission = readMission(cwd, id)
  if (!mission) {
    throw new Error(`Mission not found: ${id}`)
  }

  const rule = transitions[action]
  if (!rule) {
    throw new Error(`Unknown mission action: ${action}`)
  }
  if (!rule.from.includes(mission.status)) {
    throw new Error(`Cannot ${action} mission "${id}" from status "${mission.status}" (expected ${rule.from.join(" or ")}).`)
  }

  if (action === "close" && readEvidence(cwd, id).length === 0) {
    throw new Error(`Cannot close mission "${id}": record evidence first with \`casa mission evidence ${id}\`.`)
  }

  setStatus(cwd, id, rule.to)
  if (action === "close") {
    recordEvidence({ cwd, id, type: "close", note: "Mission closed" })
  }
  return { id, status: rule.to }
}

export function listMissions({ cwd = process.cwd() } = {}) {
  const dir = missionDir(cwd)
  if (!fs.existsSync(dir)) {
    return []
  }
  return fs
    .readdirSync(dir)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => fileName.replace(/\.md$/, ""))
    .sort((a, b) => a.localeCompare(b))
    .map((id) => {
      const mission = readMission(cwd, id)
      return { id, status: mission.status, title: mission.title, evidence: readEvidence(cwd, id).length }
    })
}

export function auditMissions({ cwd = process.cwd() } = {}) {
  const failures = []
  for (const mission of listMissions({ cwd })) {
    if (!statuses.includes(mission.status)) {
      failures.push(`Mission "${mission.id}" has invalid status "${mission.status}"`)
    }
    if (mission.status === "done" && mission.evidence === 0) {
      failures.push(`Mission "${mission.id}" is marked done but has no evidence ledger`)
    }
  }
  return failures
}
