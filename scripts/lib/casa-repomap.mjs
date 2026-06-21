import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"

// Zero-dependency repo-map compiler. Scans real source files and extracts top-level
// symbols and import edges with regex (not a full AST), ranks files by inbound imports,
// and emits a token-budgeted map plus code-intelligence JSON. Opt-in via `casa context build`.

const ignoredDirs = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
  ".nuxt",
  "vendor",
  "__pycache__",
  ".casa",
  ".codex",
  ".cursor",
  ".claude",
  ".agents",
  ".windsurf",
  ".continue",
  ".trae"
])

const jsExtensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]
const sourceExtensions = new Set([...jsExtensions, ".py", ".go"])

function walk(dir, root, files) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".") {
      if (ignoredDirs.has(entry.name)) {
        continue
      }
    }
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) {
        continue
      }
      walk(full, root, files)
    } else if (entry.isFile() && sourceExtensions.has(path.extname(entry.name))) {
      files.push(path.relative(root, full).split(path.sep).join("/"))
    }
  }
}

function matchAll(content, regex) {
  const out = []
  let match
  while ((match = regex.exec(content)) !== null) {
    out.push(match[1])
  }
  return out
}

function extractSymbols(content, ext) {
  if (ext === ".py") {
    return {
      symbols: [...matchAll(content, /^class\s+([A-Za-z0-9_]+)/gm), ...matchAll(content, /^def\s+([A-Za-z0-9_]+)/gm)],
      exported: matchAll(content, /^(?:class|def)\s+([A-Za-z0-9_]+)/gm)
    }
  }
  if (ext === ".go") {
    return {
      symbols: [...matchAll(content, /^func\s+([A-Za-z0-9_]+)/gm), ...matchAll(content, /^type\s+([A-Za-z0-9_]+)/gm)],
      exported: matchAll(content, /^(?:func|type)\s+([A-Z][A-Za-z0-9_]*)/gm)
    }
  }
  const exported = [
    ...matchAll(content, /export\s+(?:default\s+)?(?:async\s+)?function\s+([A-Za-z0-9_$]+)/g),
    ...matchAll(content, /export\s+(?:default\s+)?class\s+([A-Za-z0-9_$]+)/g),
    ...matchAll(content, /export\s+(?:const|let|var)\s+([A-Za-z0-9_$]+)/g)
  ]
  const all = [
    ...exported,
    ...matchAll(content, /^(?:async\s+)?function\s+([A-Za-z0-9_$]+)/gm),
    ...matchAll(content, /^class\s+([A-Za-z0-9_$]+)/gm)
  ]
  return { symbols: [...new Set(all)], exported: [...new Set(exported)] }
}

function extractImports(content, ext) {
  if (ext === ".py") {
    return [...matchAll(content, /^\s*import\s+([A-Za-z0-9_.]+)/gm), ...matchAll(content, /^\s*from\s+([A-Za-z0-9_.]+)\s+import/gm)]
  }
  if (ext === ".go") {
    return matchAll(content, /"([^"]+)"/g)
  }
  return [
    ...matchAll(content, /import\s+[^;]*?from\s+["']([^"']+)["']/g),
    ...matchAll(content, /require\(\s*["']([^"']+)["']\s*\)/g),
    ...matchAll(content, /import\(\s*["']([^"']+)["']\s*\)/g)
  ]
}

function resolveRelative(fromFile, spec, fileSet) {
  if (!spec.startsWith(".")) {
    return null
  }
  const base = path.posix.join(path.posix.dirname(fromFile), spec)
  const candidates = [base, ...jsExtensions.map((ext) => base + ext), ...jsExtensions.map((ext) => path.posix.join(base, `index${ext}`))]
  return candidates.find((candidate) => fileSet.has(candidate)) || null
}

export function buildRepoMap({ cwd = process.cwd(), mapTokens = 50 } = {}) {
  const files = []
  walk(cwd, cwd, files)
  files.sort((a, b) => a.localeCompare(b))
  const fileSet = new Set(files)

  const symbolsIndex = {}
  const apiSurface = {}
  const edges = []
  const external = {}
  const inDegree = Object.fromEntries(files.map((file) => [file, 0]))

  for (const file of files) {
    const ext = path.extname(file)
    let content
    try {
      content = fs.readFileSync(path.join(cwd, file), "utf8")
    } catch {
      continue
    }
    const { symbols, exported } = extractSymbols(content, ext)
    symbolsIndex[file] = symbols
    if (exported.length > 0) {
      apiSurface[file] = exported
    }
    for (const spec of extractImports(content, ext)) {
      const target = resolveRelative(file, spec, fileSet)
      if (target) {
        edges.push({ from: file, to: target })
        inDegree[target] = (inDegree[target] || 0) + 1
      } else if (!spec.startsWith(".")) {
        const pkg = spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]
        external[pkg] = (external[pkg] || 0) + 1
      }
    }
  }

  const ranked = [...files].sort((a, b) => {
    const byDegree = (inDegree[b] || 0) - (inDegree[a] || 0)
    if (byDegree !== 0) {
      return byDegree
    }
    const bySymbols = (symbolsIndex[b]?.length || 0) - (symbolsIndex[a]?.length || 0)
    return bySymbols !== 0 ? bySymbols : a.localeCompare(b)
  })

  return {
    fileCount: files.length,
    files,
    ranked: ranked.slice(0, mapTokens),
    symbolsIndex,
    apiSurface,
    edges,
    external,
    inDegree
  }
}

function generatedNote() {
  return "<!-- Generated by `casa context build`. Edit source code and rebuild. -->\n\n"
}

function renderModules(map) {
  const lines = [generatedNote() + "# Repo Map", ""]
  lines.push(`Generated by \`casa context build\` from ${map.fileCount} source file(s).`)
  lines.push("")
  lines.push("## Modules (ranked by inbound imports)")
  lines.push("")
  if (map.ranked.length === 0) {
    lines.push("No source files detected.")
  } else {
    for (const file of map.ranked) {
      const symbols = (map.symbolsIndex[file] || []).slice(0, 8).join(", ")
      lines.push(`- \`${file}\` (in:${map.inDegree[file] || 0})${symbols ? ` - ${symbols}` : ""}`)
    }
  }
  lines.push("")
  return lines.join("\n")
}

function renderDependencyMap(map, cwd) {
  const lines = [generatedNote() + "# Dependency Map", ""]
  const pkgPath = path.join(cwd, "package.json")
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"))
      lines.push("## Declared dependencies", "")
      lines.push(`- Runtime: ${Object.keys(pkg.dependencies || {}).length}`)
      lines.push(`- Development: ${Object.keys(pkg.devDependencies || {}).length}`)
      lines.push("")
    } catch {
      // ignore malformed package.json
    }
  }
  const topExternal = Object.entries(map.external).sort((a, b) => b[1] - a[1]).slice(0, 20)
  if (topExternal.length > 0) {
    lines.push("## Most-imported external packages", "")
    for (const [pkg, count] of topExternal) {
      lines.push(`- ${pkg} (${count})`)
    }
    lines.push("")
  }
  lines.push("## Internal import edges (sample)", "")
  if (map.edges.length === 0) {
    lines.push("No internal import edges detected.")
  } else {
    for (const edge of map.edges.slice(0, 40)) {
      lines.push(`- \`${edge.from}\` -> \`${edge.to}\``)
    }
    if (map.edges.length > 40) {
      lines.push(`- ...and ${map.edges.length - 40} more`)
    }
  }
  lines.push("")
  return lines.join("\n")
}

const lockPath = ".casa/context/code-intelligence/repomap.lock.json"

function digestOfMap(map) {
  const payload = JSON.stringify({ files: map.files, symbols: map.symbolsIndex, edges: map.edges })
  return crypto.createHash("sha256").update(payload).digest("hex").slice(0, 16)
}

function renderRepoMapFiles(map, cwd) {
  return [
    { targetPath: ".casa/context/repo-map/modules.md", content: renderModules(map) },
    { targetPath: ".casa/context/repo-map/dependency-map.md", content: renderDependencyMap(map, cwd) },
    {
      targetPath: ".casa/context/code-intelligence/symbols.index.json",
      content: `${JSON.stringify(map.symbolsIndex, null, 2)}\n`
    },
    {
      targetPath: ".casa/context/code-intelligence/dependency-graph.json",
      content: `${JSON.stringify({ nodes: map.files, edges: map.edges, external: map.external }, null, 2)}\n`
    },
    {
      targetPath: ".casa/context/code-intelligence/api-surface.json",
      content: `${JSON.stringify(map.apiSurface, null, 2)}\n`
    }
  ]
}

export function repoMapFiles({ cwd = process.cwd(), mapTokens = 50 } = {}) {
  return renderRepoMapFiles(buildRepoMap({ cwd, mapTokens }), cwd)
}

export function repoMapDigest({ cwd = process.cwd() } = {}) {
  return digestOfMap(buildRepoMap({ cwd, mapTokens: 100000 }))
}

export function writeRepoMap({ cwd = process.cwd(), mapTokens = 50 } = {}) {
  const map = buildRepoMap({ cwd, mapTokens })
  const outputs = renderRepoMapFiles(map, cwd)
  for (const file of outputs) {
    const targetPath = path.join(cwd, file.targetPath)
    fs.mkdirSync(path.dirname(targetPath), { recursive: true })
    fs.writeFileSync(targetPath, file.content)
  }

  const digest = digestOfMap(map)
  const lockTarget = path.join(cwd, lockPath)
  fs.mkdirSync(path.dirname(lockTarget), { recursive: true })
  fs.writeFileSync(lockTarget, `${JSON.stringify({ digest, fileCount: map.fileCount }, null, 2)}\n`)

  return { outputs: [...outputs.map((file) => file.targetPath), lockPath], map, digest }
}

export function repoMapFreshness({ cwd = process.cwd() } = {}) {
  const lockTarget = path.join(cwd, lockPath)
  if (!fs.existsSync(lockTarget)) {
    return { state: "missing" }
  }
  let lock
  try {
    lock = JSON.parse(fs.readFileSync(lockTarget, "utf8"))
  } catch {
    return { state: "missing" }
  }
  const current = repoMapDigest({ cwd })
  return { state: current === lock.digest ? "fresh" : "stale", expected: lock.digest, current }
}

export function writeLegacyInventory({ cwd = process.cwd(), map } = {}) {
  const built = map || buildRepoMap({ cwd, mapTokens: 100000 })
  const hotspots = [...built.files]
    .filter((file) => (built.inDegree[file] || 0) > 0)
    .sort((a, b) => (built.inDegree[b] || 0) - (built.inDegree[a] || 0))
    .slice(0, 10)

  const lines = ["<!-- Generated by `casa init --mode brownfield`. Review and refine. -->", "", "# Legacy Inventory", ""]
  lines.push(`Discovered ${built.fileCount} source file(s).`, "")
  lines.push("## High fan-in modules (change with care)", "")
  if (hotspots.length === 0) {
    lines.push("No high fan-in modules detected yet. Re-run `casa context build` after discovery.")
  } else {
    for (const file of hotspots) {
      lines.push(`- \`${file}\` (imported by ${built.inDegree[file]} module(s))`)
    }
  }
  lines.push(
    "",
    "## Risks and unknowns",
    "",
    "- Confirm characterization or smoke tests exist for the modules above before changing them.",
    "- Document runtime, data ownership and external integrations.",
    "- Add seams before refactoring high fan-in modules.",
    ""
  )

  const target = path.join(cwd, ".casa/context/legacy-inventory/risks.md")
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, lines.join("\n"))
  return target
}
