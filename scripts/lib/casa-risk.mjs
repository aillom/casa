import fs from "node:fs"
import path from "node:path"

// Mechanical risk classification derived from casa.manifest.yaml protected_paths plus
// sensitive-area heuristics. Turns the prose risk model into a path -> tier function.

const tierOrder = ["low", "medium", "high", "critical"]
const criticalKeywords = [
  "kernel/policies",
  "kernel/risk-model",
  "contracts/openapi",
  "/auth/",
  "/security/",
  "/migrations/",
  "secrets"
]

function readProtectedPaths(cwd) {
  const manifestPath = path.join(cwd, "casa.manifest.yaml")
  if (!fs.existsSync(manifestPath)) {
    return []
  }
  const lines = fs.readFileSync(manifestPath, "utf8").split("\n")
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

function globToRegex(glob) {
  const translated = glob
    .replace(/[.+^$()|[\]\\]/g, "\\$&")
    .replace(/\{/g, "(")
    .replace(/\}/g, ")")
    .replace(/,/g, "|")
    .replace(/\*\*\/?/g, " ")
    .replace(/\*/g, "[^/]*")
    .replace(/ /g, ".*")
    .replace(/\?/g, ".")
  return new RegExp(`^${translated}$`)
}

function hasSensitiveKeyword(rel) {
  const padded = `/${rel}`
  return criticalKeywords.some((keyword) => padded.includes(keyword) || rel.includes(keyword))
}

export function assessPath(cwd, filePath) {
  const rel = String(filePath).replace(/^\.\//, "").split(path.sep).join("/")
  const protectedPaths = readProtectedPaths(cwd)
  const matched = protectedPaths.find((glob) => globToRegex(glob).test(rel))

  if (matched) {
    const critical = hasSensitiveKeyword(rel) || criticalKeywords.some((keyword) => matched.includes(keyword))
    return { path: rel, tier: critical ? "critical" : "high", protected: true, reason: `matches protected path "${matched}"` }
  }
  if (hasSensitiveKeyword(rel)) {
    return { path: rel, tier: "high", protected: false, reason: "matches a sensitive area" }
  }
  if (/\.(ts|tsx|js|jsx|mjs|cjs|py|go|rb|php|java|cs)$/.test(rel)) {
    return { path: rel, tier: "medium", protected: false, reason: "source file" }
  }
  return { path: rel, tier: "low", protected: false, reason: "no protected match" }
}

export function highestTier(assessments) {
  return assessments.reduce((max, assessment) => (tierOrder.indexOf(assessment.tier) > tierOrder.indexOf(max) ? assessment.tier : max), "low")
}

export function requiredOversight(tier) {
  switch (tier) {
    case "critical":
      return "Two-person review, change plan and rollback"
    case "high":
      return "Human approval and rollback plan"
    case "medium":
      return "Reviewer recommended; tests and contracts when relevant"
    default:
      return "Normal validation"
  }
}

export function needsSegregatedApproval(tier) {
  return tier === "high" || tier === "critical"
}
