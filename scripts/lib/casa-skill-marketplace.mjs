import crypto from "node:crypto"
import fs from "node:fs"
import https from "node:https"
import path from "node:path"

const userAgent = "casa-cli"
const allowedInstallExtensions = new Set([".md", ".json"])

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"))
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`)
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex")
}

function normalizeSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function stripLeadingSlash(value = "") {
  return value.replace(/^\/+/, "").replace(/\/+$/, "")
}

function joinRemotePath(...parts) {
  return parts
    .map((part) => stripLeadingSlash(part || ""))
    .filter(Boolean)
    .join("/")
}

function requestJson(url) {
  return requestText(url).then((text) => JSON.parse(text))
}

function requestText(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers: { "User-Agent": userAgent, Accept: "application/vnd.github+json" } }, (response) => {
      const chunks = []

      response.on("data", (chunk) => chunks.push(chunk))
      response.on("end", () => {
        const body = Buffer.concat(chunks).toString("utf8")
        if ((response.statusCode || 500) >= 400) {
          reject(new Error(`HTTP ${response.statusCode}: ${url}`))
          return
        }
        resolve(body)
      })
    })

    request.on("error", reject)
    request.setTimeout(15000, () => {
      request.destroy(new Error(`Request timed out: ${url}`))
    })
  })
}

function parseGitHubUrl(input) {
  const url = new URL(input)
  if (url.hostname !== "github.com") {
    throw new Error("Only github.com URLs are supported.")
  }

  const parts = url.pathname.split("/").filter(Boolean)
  const [owner, repo, marker, ref, ...rest] = parts
  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL.")
  }

  return {
    owner,
    repo,
    ref: marker === "tree" || marker === "blob" ? ref : "",
    skillPath: marker === "tree" || marker === "blob" ? rest.join("/") : ""
  }
}

export function parseGitHubSkillSource(source, options = {}) {
  if (!source) {
    throw new Error("Skill source is required.")
  }

  if (source.startsWith("https://github.com/")) {
    const parsed = parseGitHubUrl(source)
    return {
      ...parsed,
      ref: options.ref || parsed.ref || ""
    }
  }

  const parts = source.split("/").filter(Boolean)
  const [owner, repo, ...rest] = parts
  if (!owner || !repo) {
    throw new Error("Use owner/repo or owner/repo/path for GitHub skills.")
  }

  return {
    owner,
    repo,
    ref: options.ref || "",
    skillPath: rest.join("/")
  }
}

export function loadSkillMarketplaceConfig({ cwd = process.cwd(), packageRoot = process.cwd() } = {}) {
  const candidates = [
    path.join(cwd, ".casa/registry/skill-marketplace.json"),
    path.join(packageRoot, ".casa/registry/skill-marketplace.json")
  ]
  const configPath = candidates.find((candidate) => fs.existsSync(candidate))

  if (!configPath) {
    throw new Error("Missing skill marketplace config: .casa/registry/skill-marketplace.json")
  }

  return {
    ...readJson(configPath),
    path: configPath
  }
}

export async function searchGithubSkills(query, { limit = 10, config } = {}) {
  const topics = config?.github?.topics || ["casa-skill"]
  const topicQuery = topics.map((topic) => `topic:${topic}`).join(" ")
  const q = [query, topicQuery].filter(Boolean).join(" ").trim()
  let response = await requestJson(`https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&per_page=${encodeURIComponent(String(limit))}`)
  let trust = "topic"

  if ((response.items || []).length === 0 && query) {
    response = await requestJson(`https://api.github.com/search/repositories?q=${encodeURIComponent(`${query} skill`)}&per_page=${encodeURIComponent(String(limit))}`)
    trust = "unverified"
  }

  return (response.items || []).map((repo) => ({
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description || "",
    stars: repo.stargazers_count || 0,
    defaultBranch: repo.default_branch || "main",
    url: repo.html_url,
    source: repo.full_name,
    trust
  }))
}

export async function resolveGithubRef(source) {
  const repoUrl = `https://api.github.com/repos/${source.owner}/${source.repo}`
  const repo = await requestJson(repoUrl)
  const ref = source.ref || repo.default_branch || "main"
  const branchUrl = `https://api.github.com/repos/${source.owner}/${source.repo}/commits/${encodeURIComponent(ref)}`
  const commit = await requestJson(branchUrl)

  return {
    owner: source.owner,
    repo: source.repo,
    ref,
    commit: commit.sha,
    defaultBranch: repo.default_branch || "main",
    htmlUrl: repo.html_url
  }
}

async function fetchRaw(owner, repo, commit, filePath) {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${commit}/${filePath}`
  return requestText(url)
}

async function fetchOptionalRaw(owner, repo, commit, filePath) {
  try {
    return await fetchRaw(owner, repo, commit, filePath)
  } catch {
    return null
  }
}

export async function inspectGithubSkill(source, options = {}) {
  const parsed = typeof source === "string" ? parseGitHubSkillSource(source, options) : source
  const resolved = await resolveGithubRef(parsed)
  const manifestPath = joinRemotePath(parsed.skillPath, "casa.skill.json")
  const skillPathFallback = joinRemotePath(parsed.skillPath, "SKILL.md")
  const manifestText = await fetchOptionalRaw(parsed.owner, parsed.repo, resolved.commit, manifestPath)
  let manifest = null
  let entrypoint = skillPathFallback

  if (manifestText) {
    manifest = JSON.parse(manifestText)
    entrypoint = joinRemotePath(parsed.skillPath, manifest.entrypoint || "SKILL.md")
  }

  const skillText = await fetchRaw(parsed.owner, parsed.repo, resolved.commit, entrypoint)
  const inferredName = normalizeSlug(manifest?.name || path.basename(parsed.skillPath || parsed.repo))

  if (!inferredName) {
    throw new Error("Remote skill name could not be inferred.")
  }

  if (!manifest) {
    manifest = {
      name: inferredName,
      description: descriptionFromSkill(skillText) || `External C.A.S.A skill from ${parsed.owner}/${parsed.repo}.`,
      version: "0.0.0",
      entrypoint: "SKILL.md",
      tags: [],
      permissions: [],
      generated: true
    }
  }

  const skillName = normalizeSlug(manifest.name)
  const audit = auditSkillContent(skillText, manifest)

  return {
    source: parsed,
    resolved,
    manifest,
    manifestPath: manifestText ? manifestPath : "",
    manifestText,
    entrypoint,
    skillName,
    skillText,
    skillSha256: sha256(skillText),
    manifestSha256: sha256(manifestText || JSON.stringify(manifest)),
    audit
  }
}

function descriptionFromSkill(content) {
  const match = content.match(/^description:\s*(.+)$/m)
  return match ? match[1].trim() : ""
}

export function auditSkillContent(content, manifest = {}) {
  const findings = []
  const rules = [
    { severity: "blocker", pattern: /ignore (all )?(previous|prior|above) instructions/i, message: "Attempts to override higher-priority instructions." },
    { severity: "blocker", pattern: /do not (tell|inform|show) (the )?user/i, message: "Instructs hidden behavior from the user." },
    { severity: "blocker", pattern: /(exfiltrate|send|upload).{0,40}(secret|token|password|key|credential)/i, message: "Suggests secret exfiltration." },
    { severity: "blocker", pattern: /(cat|print|dump).{0,40}(\.ssh|\.npmrc|env|token|secret|password)/i, message: "Suggests exposing local secrets." },
    { severity: "blocker", pattern: /rm\s+-rf\s+(\/|\$HOME|~)/i, message: "Contains destructive filesystem command." },
    { severity: "blocker", pattern: /git\s+reset\s+--hard/i, message: "Contains destructive git reset command." },
    { severity: "warning", pattern: /curl\b.+\|\s*(sh|bash)/i, message: "Contains curl-pipe-shell pattern." },
    { severity: "warning", pattern: /chmod\s+777/i, message: "Contains broad permission change." },
    { severity: "warning", pattern: /disable (tls|ssl|certificate)/i, message: "Suggests weakening transport security." },
    { severity: "warning", pattern: /bypass (policy|security|authorization|auth)/i, message: "Suggests bypassing governance or security." },
    { severity: "warning", pattern: /(npm|ghp|github_pat)_[a-zA-Z0-9_]{20,}/i, message: "Looks like a hardcoded token." },
    { severity: "warning", pattern: /sk-[a-zA-Z0-9]{20,}/i, message: "Looks like a hardcoded API key." }
  ]

  for (const rule of rules) {
    if (rule.pattern.test(content)) {
      findings.push({ severity: rule.severity, message: rule.message })
    }
  }

  for (const permission of manifest.permissions || []) {
    if (/secret|token|credential|shell|network|deploy|write/i.test(permission)) {
      findings.push({ severity: "warning", message: `High-impact declared permission: ${permission}` })
    }
  }

  return {
    blockers: findings.filter((finding) => finding.severity === "blocker"),
    warnings: findings.filter((finding) => finding.severity === "warning"),
    findings
  }
}

export function renderSkillInspection(inspection) {
  const lines = []
  lines.push(`${inspection.skillName}`)
  lines.push(`Source: ${inspection.source.owner}/${inspection.source.repo}${inspection.source.skillPath ? `/${inspection.source.skillPath}` : ""}`)
  lines.push(`Ref: ${inspection.resolved.ref}`)
  lines.push(`Commit: ${inspection.resolved.commit}`)
  lines.push(`Entrypoint: ${inspection.entrypoint}`)
  lines.push(`Description: ${inspection.manifest.description || ""}`)
  lines.push(`Version: ${inspection.manifest.version || "unknown"}`)
  lines.push(`Permissions: ${(inspection.manifest.permissions || []).join(", ") || "none"}`)
  lines.push(`Audit: ${inspection.audit.blockers.length} blocker(s), ${inspection.audit.warnings.length} warning(s)`)
  for (const finding of inspection.audit.findings) {
    lines.push(`- ${finding.severity}: ${finding.message}`)
  }
  return lines.join("\n")
}

function lockfilePath(cwd) {
  return path.join(cwd, ".casa/registry/skills.lock.json")
}

export function readSkillsLock(cwd = process.cwd()) {
  const targetPath = lockfilePath(cwd)
  if (!fs.existsSync(targetPath)) {
    return { version: "0.1.0", skills: {} }
  }
  return readJson(targetPath)
}

export function writeSkillsLock(cwd, lock) {
  writeJson(lockfilePath(cwd), lock)
}

export function installInspectedSkill(inspection, { cwd = process.cwd(), force = false, allowRisk = false } = {}) {
  if (inspection.audit.blockers.length > 0 && !allowRisk) {
    throw new Error("Skill audit found blocker(s). Re-run with --allow-risk only after manual review.")
  }

  const ext = path.extname(inspection.entrypoint)
  if (!allowedInstallExtensions.has(ext)) {
    throw new Error(`Unsupported skill entrypoint extension: ${ext}`)
  }

  const skillDir = path.join(cwd, ".casa/capabilities/skills", inspection.skillName)
  const skillPath = path.join(skillDir, "SKILL.md")
  const manifestPath = path.join(skillDir, "casa.skill.json")

  if (fs.existsSync(skillPath) && !force) {
    throw new Error(`Skill already exists: .casa/capabilities/skills/${inspection.skillName}/SKILL.md`)
  }

  fs.mkdirSync(skillDir, { recursive: true })
  fs.writeFileSync(skillPath, inspection.skillText.trimEnd() + "\n")
  writeJson(manifestPath, {
    ...inspection.manifest,
    name: inspection.skillName,
    external: true,
    source: {
      type: "github",
      owner: inspection.source.owner,
      repo: inspection.source.repo,
      path: inspection.source.skillPath,
      ref: inspection.resolved.ref,
      commit: inspection.resolved.commit,
      entrypoint: inspection.entrypoint
    }
  })

  const lock = readSkillsLock(cwd)
  lock.skills[inspection.skillName] = {
    type: "github",
    external: true,
    owner: inspection.source.owner,
    repo: inspection.source.repo,
    path: inspection.source.skillPath,
    ref: inspection.resolved.ref,
    commit: inspection.resolved.commit,
    entrypoint: inspection.entrypoint,
    version: inspection.manifest.version || "0.0.0",
    description: inspection.manifest.description || "",
    installed_at: new Date().toISOString(),
    skill_sha256: inspection.skillSha256,
    manifest_sha256: inspection.manifestSha256,
    audit: {
      blockers: inspection.audit.blockers.length,
      warnings: inspection.audit.warnings.length
    }
  }
  writeSkillsLock(cwd, lock)

  return {
    skillDir,
    skillPath,
    manifestPath,
    lockPath: lockfilePath(cwd)
  }
}

export function removeLockedSkill(skillName, { cwd = process.cwd() } = {}) {
  const lock = readSkillsLock(cwd)
  delete lock.skills[skillName]
  writeSkillsLock(cwd, lock)
}

export function formatSkillSearchResults(results) {
  return results
    .map((result) => `${result.source}\t${result.stars}\t${result.defaultBranch}\t${result.trust}\t${result.description}`)
    .join("\n")
}
