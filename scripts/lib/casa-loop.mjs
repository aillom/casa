import fs from "node:fs"
import path from "node:path"
import { parseFrontmatter, runSensors } from "./casa-verify.mjs"

const specsRoot = ".casa/specs"
const reserved = new Set(["templates", "generated"])
const phases = ["spec", "plan", "tasks"]
const phaseFiles = { spec: "spec.md", plan: "plan.md", tasks: "tasks.md" }

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function normalizeSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function unitDir(cwd, slug) {
  return path.join(cwd, specsRoot, slug)
}

function phasePath(cwd, slug, phase) {
  return path.join(unitDir(cwd, slug), phaseFiles[phase])
}

function countPlaceholders(content) {
  const matches = content.match(/<[^>\n]+>/g)
  return matches ? matches.length : 0
}

export function isEars(text) {
  const normalized = text.trim()
  if (!/the system shall/i.test(normalized)) {
    return false
  }
  if (/^if\b/i.test(normalized) && !/\bthen\b/i.test(normalized)) {
    return false
  }
  return true
}

export function parseAcceptanceCriteria(content) {
  const criteria = []
  const regex = /^- (AC\d+):\s*(.+)$/gm
  let match
  while ((match = regex.exec(content)) !== null) {
    const text = match[2].trim()
    criteria.push({ id: match[1], text, ears: isEars(text) })
  }
  return criteria
}

function parseTaskAcRefs(content) {
  const body = content.replace(/^---\n[\s\S]*?\n---/, "")
  const matches = body.match(/AC\d+/g)
  return matches ? [...new Set(matches)] : []
}

export function readPhase(cwd, slug, phase) {
  const filePath = phasePath(cwd, slug, phase)
  if (!fs.existsSync(filePath)) {
    return { phase, exists: false, status: null, placeholders: 0, ready: false, meta: {} }
  }

  const content = fs.readFileSync(filePath, "utf8")
  const meta = parseFrontmatter(content)
  const placeholders = countPlaceholders(content)
  const status = typeof meta.status === "string" ? meta.status : "draft"

  return {
    phase,
    exists: true,
    status,
    placeholders,
    ready: status === "ready" && placeholders === 0,
    meta
  }
}

function specTitle(cwd, slug) {
  const spec = readPhase(cwd, slug, "spec")
  return spec.exists && typeof spec.meta.title === "string" && spec.meta.title
    ? spec.meta.title
    : slug.replace(/-/g, " ")
}

function specTemplate({ slug, title, mode }) {
  return `---
slug: ${slug}
title: ${title}
phase: spec
status: draft
mode: ${mode}
created: ${today()}
---

# Spec: ${title}

> Gate to advance: remove every \`<...>\` placeholder and set \`status: ready\`, then run \`casa spec plan ${slug}\`.

## Goal

<what this feature must achieve>

## Users

- <user type>

## Functional Requirements

- <requirement>

## Non-Functional Requirements

- Performance: <target>
- Security: <requirement>
- Observability: <requirement>

## Acceptance Criteria

> EARS format with stable ids. Tasks and tests reference them as \`(AC1)\`.

- AC1: WHEN <event or condition> THE SYSTEM SHALL <expected response>
- AC2: IF <error condition> THEN THE SYSTEM SHALL <safe response>

## Risks and Questions

- <risk or open question>

## Out of Scope

- <item>
`
}

function planTemplate({ slug, title }) {
  return `---
slug: ${slug}
title: ${title}
phase: plan
status: draft
created: ${today()}
---

# Plan: ${title}

> Gate to advance: remove every \`<...>\` placeholder and set \`status: ready\`, then run \`casa spec tasks ${slug}\`.

## Approach

<high-level approach>

## Affected Areas

- <module, file or boundary>

## Architecture and Boundaries

<dependency direction, API contracts, data model changes>

## Sensors To Run

- <sensor id, for example lint, typecheck, test>

## Risk

- Level: <low | medium | high | critical>
- Protected paths touched: <none or paths>
`
}

function tasksTemplate({ slug, title }) {
  return `---
slug: ${slug}
title: ${title}
phase: tasks
status: draft
created: ${today()}
---

# Tasks: ${title}

> Gate to advance: remove every \`<...>\` placeholder and set \`status: ready\`, then run \`casa spec implement ${slug}\`.

## Tasks

- [ ] (AC1) <task that satisfies AC1>
- [ ] (AC2) <task that satisfies AC2>

## Validation

- [ ] Required sensors pass via \`casa verify --changed\`
- [ ] Evidence recorded in the mission
`
}

function requireReady(cwd, slug, phase) {
  const doc = readPhase(cwd, slug, phase)
  if (!doc.exists) {
    throw new Error(`Gate blocked: ${phase} for "${slug}" does not exist yet. Run the earlier phase first.`)
  }
  if (!doc.ready) {
    const reason =
      doc.status !== "ready"
        ? "set `status: ready` in its frontmatter"
        : `remove ${doc.placeholders} remaining \`<...>\` placeholder(s)`
    throw new Error(
      `Gate blocked: ${phase} for "${slug}" is not ready. Edit ${specsRoot}/${slug}/${phaseFiles[phase]} (${reason}) and re-run.`
    )
  }

  if (phase === "spec") {
    const criteria = parseAcceptanceCriteria(fs.readFileSync(phasePath(cwd, slug, "spec"), "utf8"))
    if (criteria.length === 0) {
      throw new Error(
        `Gate blocked: spec for "${slug}" has no acceptance criteria with ids (expected "- AC1: ... THE SYSTEM SHALL ..."). Run \`casa spec check ${slug}\`.`
      )
    }
    const invalid = criteria.filter((ac) => !ac.ears)
    if (invalid.length > 0) {
      throw new Error(
        `Gate blocked: spec for "${slug}" has ${invalid.length} acceptance criterion(a) not in EARS form. Run \`casa spec check ${slug}\`.`
      )
    }
  }

  return doc
}

export function createSpec({ cwd = process.cwd(), slug, title = "", mode = "greenfield", force = false }) {
  const normalized = normalizeSlug(slug)
  if (!normalized) {
    throw new Error("Spec slug is required.")
  }
  if (reserved.has(normalized)) {
    throw new Error(`Reserved name cannot be a work unit: ${normalized}`)
  }

  const filePath = phasePath(cwd, normalized, "spec")
  if (fs.existsSync(filePath) && !force) {
    throw new Error(`Spec already exists: ${path.relative(cwd, filePath)}`)
  }

  fs.mkdirSync(unitDir(cwd, normalized), { recursive: true })
  fs.writeFileSync(filePath, specTemplate({ slug: normalized, title: title || normalized.replace(/-/g, " "), mode }))
  return { slug: normalized, filePath }
}

export function createPlan({ cwd = process.cwd(), slug, force = false }) {
  const normalized = normalizeSlug(slug)
  requireReady(cwd, normalized, "spec")

  const filePath = phasePath(cwd, normalized, "plan")
  if (fs.existsSync(filePath) && !force) {
    throw new Error(`Plan already exists: ${path.relative(cwd, filePath)}`)
  }

  fs.writeFileSync(filePath, planTemplate({ slug: normalized, title: specTitle(cwd, normalized) }))
  return { slug: normalized, filePath }
}

export function createTasks({ cwd = process.cwd(), slug, force = false }) {
  const normalized = normalizeSlug(slug)
  requireReady(cwd, normalized, "spec")
  requireReady(cwd, normalized, "plan")

  const filePath = phasePath(cwd, normalized, "tasks")
  if (fs.existsSync(filePath) && !force) {
    throw new Error(`Tasks already exist: ${path.relative(cwd, filePath)}`)
  }

  fs.writeFileSync(filePath, tasksTemplate({ slug: normalized, title: specTitle(cwd, normalized) }))
  return { slug: normalized, filePath }
}

export function implementWorkUnit({ cwd = process.cwd(), slug, changed = false, strict = false }) {
  const normalized = normalizeSlug(slug)
  requireReady(cwd, normalized, "spec")
  requireReady(cwd, normalized, "plan")
  requireReady(cwd, normalized, "tasks")

  const verification = runSensors({ cwd, changed, strict })
  return { slug: normalized, verification }
}

export function checkWorkUnit({ cwd = process.cwd(), slug }) {
  const normalized = normalizeSlug(slug)
  const errors = []
  const warnings = []

  const specFile = phasePath(cwd, normalized, "spec")
  if (!fs.existsSync(specFile)) {
    return { slug: normalized, exists: false, errors: [`Spec not found for "${normalized}"`], warnings, criteria: [], coverage: [] }
  }

  const criteria = parseAcceptanceCriteria(fs.readFileSync(specFile, "utf8"))
  if (criteria.length === 0) {
    errors.push("Spec has no acceptance criteria with stable ids (expected `- AC1: ... THE SYSTEM SHALL ...`)")
  }

  const seen = new Set()
  for (const ac of criteria) {
    if (seen.has(ac.id)) {
      errors.push(`Duplicate acceptance criterion id: ${ac.id}`)
    }
    seen.add(ac.id)
    if (!ac.ears) {
      errors.push(`${ac.id} is not in EARS form (expected "... THE SYSTEM SHALL ..."): ${ac.text}`)
    }
  }

  const coverage = []
  const tasksFile = phasePath(cwd, normalized, "tasks")
  if (fs.existsSync(tasksFile)) {
    const refs = parseTaskAcRefs(fs.readFileSync(tasksFile, "utf8"))
    const ids = new Set(criteria.map((ac) => ac.id))
    for (const ref of refs) {
      if (!ids.has(ref)) {
        errors.push(`Tasks reference unknown acceptance criterion: ${ref}`)
      }
    }
    for (const ac of criteria) {
      const covered = refs.includes(ac.id)
      coverage.push({ id: ac.id, covered })
      if (!covered) {
        warnings.push(`Acceptance criterion ${ac.id} has no task referencing it`)
      }
    }
  }

  return { slug: normalized, exists: true, errors, warnings, criteria, coverage }
}

export function workUnitStatus({ cwd = process.cwd(), slug }) {
  const normalized = normalizeSlug(slug)
  return {
    slug: normalized,
    phases: phases.map((phase) => {
      const doc = readPhase(cwd, normalized, phase)
      return {
        phase: doc.phase,
        exists: doc.exists,
        status: doc.status,
        ready: doc.ready,
        placeholders: doc.placeholders
      }
    })
  }
}

export function listWorkUnits({ cwd = process.cwd() } = {}) {
  const root = path.join(cwd, specsRoot)
  if (!fs.existsSync(root)) {
    return []
  }

  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !reserved.has(entry.name))
    .filter((entry) => fs.existsSync(path.join(root, entry.name, "spec.md")))
    .map((entry) => workUnitStatus({ cwd, slug: entry.name }))
    .sort((a, b) => a.slug.localeCompare(b.slug))
}

export function auditWorkUnits({ cwd = process.cwd() } = {}) {
  const root = path.join(cwd, specsRoot)
  const failures = []
  if (!fs.existsSync(root)) {
    return failures
  }

  const dirs = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !reserved.has(entry.name))

  for (const dir of dirs) {
    const slug = dir.name
    const has = (phase) => fs.existsSync(phasePath(cwd, slug, phase))

    if (has("plan") && !has("spec")) {
      failures.push(`Work unit "${slug}" has plan.md without spec.md`)
    }
    if (has("tasks") && !has("plan")) {
      failures.push(`Work unit "${slug}" has tasks.md without plan.md`)
    }

    for (const phase of phases) {
      if (has(phase)) {
        const meta = parseFrontmatter(fs.readFileSync(phasePath(cwd, slug, phase), "utf8"))
        if (meta.phase && meta.phase !== phase) {
          failures.push(`Work unit "${slug}": ${phaseFiles[phase]} declares phase "${meta.phase}"`)
        }
      }
    }
  }

  return failures
}
