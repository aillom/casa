#!/usr/bin/env node
// C.A.S.A MCP server (stdio, zero-dependency).
// Exposes the C.A.S.A control plane to MCP-aware agents as Resources, Tools and Prompts.
// Transport: newline-delimited JSON-RPC 2.0 over stdio. Only JSON-RPC is written to stdout.
import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { loadSensors, runSensors } from "./lib/casa-verify.mjs"

const cwd = process.cwd()
const DEFAULT_PROTOCOL = "2024-11-05"

function manifestVersion() {
  const manifestPath = path.join(cwd, "casa.manifest.yaml")
  if (fs.existsSync(manifestPath)) {
    const match = fs.readFileSync(manifestPath, "utf8").match(/^version:\s*(.+)$/m)
    if (match) {
      return match[1].trim()
    }
  }
  return "0.0.0"
}

const SERVER = { name: "casa-mcp", version: manifestVersion() }

function readIf(relativePath) {
  const filePath = path.join(cwd, relativePath)
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null
}

function listDir(relativePath, predicate) {
  const dir = path.join(cwd, relativePath)
  if (!fs.existsSync(dir)) {
    return []
  }
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(predicate)
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b))
}

function skillEntries() {
  return listDir(".casa/capabilities/skills", (entry) => entry.isDirectory())
    .filter((name) => fs.existsSync(path.join(cwd, ".casa/capabilities/skills", name, "SKILL.md")))
    .map((name) => {
      const content = readIf(`.casa/capabilities/skills/${name}/SKILL.md`) || ""
      const description = (content.match(/^description:\s*(.+)$/m) || [, ""])[1]
      return { name, description }
    })
}

function capsuleNames() {
  return listDir(".casa/context-capsules", (entry) => entry.isDirectory()).filter((name) =>
    fs.existsSync(path.join(cwd, ".casa/context-capsules", name, "capsule.md"))
  )
}

function gateNames() {
  return listDir(".casa/quality-gates", (entry) => entry.isFile() && entry.name.endsWith(".md")).map((name) =>
    name.replace(/\.md$/, "")
  )
}

function policyNames() {
  return listDir(".casa/kernel/policies", (entry) => entry.isFile() && entry.name.endsWith(".md")).map((name) =>
    name.replace(/\.md$/, "")
  )
}

// ---- Resources ----

function resourceList() {
  const resources = []
  if (fs.existsSync(path.join(cwd, "casa.manifest.yaml"))) {
    resources.push({ uri: "casa://manifest", name: "C.A.S.A manifest", mimeType: "text/yaml" })
  }
  for (const name of capsuleNames()) {
    resources.push({ uri: `casa://capsule/${name}`, name: `Context capsule: ${name}`, mimeType: "text/markdown" })
  }
  for (const name of gateNames()) {
    resources.push({ uri: `casa://gate/${name}`, name: `Quality gate: ${name}`, mimeType: "text/markdown" })
  }
  for (const name of policyNames()) {
    resources.push({ uri: `casa://policy/${name}`, name: `Policy: ${name}`, mimeType: "text/markdown" })
  }
  for (const file of listDir(".casa/context/repo-map", (entry) => entry.isFile() && entry.name.endsWith(".md"))) {
    resources.push({ uri: `casa://repo-map/${file.replace(/\.md$/, "")}`, name: `Repo map: ${file}`, mimeType: "text/markdown" })
  }
  return resources
}

function resourceRead(uri) {
  const map = [
    [/^casa:\/\/manifest$/, () => readIf("casa.manifest.yaml")],
    [/^casa:\/\/capsule\/(.+)$/, (m) => readIf(`.casa/context-capsules/${m[1]}/capsule.md`)],
    [/^casa:\/\/gate\/(.+)$/, (m) => readIf(`.casa/quality-gates/${m[1]}.md`)],
    [/^casa:\/\/policy\/(.+)$/, (m) => readIf(`.casa/kernel/policies/${m[1]}.md`)],
    [/^casa:\/\/repo-map\/(.+)$/, (m) => readIf(`.casa/context/repo-map/${m[1]}.md`)]
  ]
  for (const [pattern, resolver] of map) {
    const match = uri.match(pattern)
    if (match) {
      const text = resolver(match)
      if (text === null) {
        throw rpcError(-32002, `Resource not found: ${uri}`)
      }
      return { contents: [{ uri, mimeType: "text/markdown", text }] }
    }
  }
  throw rpcError(-32002, `Unknown resource uri: ${uri}`)
}

// ---- Tools ----

const tools = {
  casa_list_skills: {
    description: "List C.A.S.A capability skills with their descriptions.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    run: () => textResult(skillEntries().map((skill) => `- ${skill.name}: ${skill.description}`).join("\n") || "No skills found.")
  },
  casa_list_capsules: {
    description: "List reusable C.A.S.A context capsules.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    run: () => textResult(capsuleNames().map((name) => `- ${name}`).join("\n") || "No capsules found.")
  },
  casa_get_capsule: {
    description: "Return the markdown content of a C.A.S.A context capsule.",
    inputSchema: { type: "object", properties: { name: { type: "string" } }, required: ["name"], additionalProperties: false },
    run: (args) => {
      const content = readIf(`.casa/context-capsules/${args.name}/capsule.md`)
      if (content === null) {
        throw rpcError(-32602, `Unknown capsule: ${args.name}`)
      }
      return textResult(content)
    }
  },
  casa_list_quality_gates: {
    description: "List C.A.S.A quality gates.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    run: () => textResult(gateNames().map((name) => `- ${name}`).join("\n") || "No quality gates found.")
  },
  casa_list_sensors: {
    description: "List C.A.S.A governance sensors and how each resolves (detect, command or manual).",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    run: () =>
      textResult(
        loadSensors({ cwd })
          .map((sensor) => `- ${sensor.id}: ${sensor.manual ? "manual" : sensor.detect || sensor.command || "unset"}`)
          .join("\n") || "No sensors found."
      )
  },
  casa_verify: {
    description: "Run C.A.S.A governance sensors and return pass/fail results. Executes the configured sensor commands.",
    inputSchema: {
      type: "object",
      properties: {
        sensors: { type: "array", items: { type: "string" } },
        changed: { type: "boolean" }
      },
      additionalProperties: false
    },
    run: (args) => {
      const { results, passed, failed, skipped } = runSensors({
        cwd,
        ids: Array.isArray(args.sensors) ? args.sensors : [],
        changed: args.changed === true,
        capture: true
      })
      const lines = results.map((result) => `${result.status.toUpperCase()} ${result.id}${result.detail ? ` - ${result.detail}` : ""}`)
      lines.push(`Result: ${passed} passed, ${failed} failed, ${skipped} skipped`)
      return textResult(lines.join("\n"), failed > 0)
    }
  }
}

function toolList() {
  return Object.entries(tools).map(([name, tool]) => ({
    name,
    description: tool.description,
    inputSchema: tool.inputSchema
  }))
}

// ---- Prompts ----

const prompts = {
  casa_spec: {
    description: "C.A.S.A greenfield feature spec template (EARS acceptance criteria).",
    file: ".casa/specs/templates/greenfield-feature/spec.md"
  },
  casa_mission: {
    description: "C.A.S.A mission template (goal, scope, agents, risk, evidence).",
    file: ".casa/mission-control/mission-template.md"
  }
}

function promptList() {
  return Object.entries(prompts).map(([name, prompt]) => ({ name, description: prompt.description }))
}

function promptGet(name) {
  const prompt = prompts[name]
  if (!prompt) {
    throw rpcError(-32602, `Unknown prompt: ${name}`)
  }
  const text = readIf(prompt.file)
  if (text === null) {
    throw rpcError(-32002, `Prompt source not found: ${prompt.file}`)
  }
  return {
    description: prompt.description,
    messages: [{ role: "user", content: { type: "text", text } }]
  }
}

// ---- JSON-RPC plumbing ----

function textResult(text, isError = false) {
  return { content: [{ type: "text", text: text || "" }], isError }
}

function rpcError(code, message) {
  const error = new Error(message)
  error.rpcCode = code
  return error
}

function handle(request) {
  const { method, params = {} } = request
  switch (method) {
    case "initialize":
      return {
        protocolVersion: typeof params.protocolVersion === "string" ? params.protocolVersion : DEFAULT_PROTOCOL,
        capabilities: { tools: {}, resources: {}, prompts: {} },
        serverInfo: SERVER
      }
    case "ping":
      return {}
    case "tools/list":
      return { tools: toolList() }
    case "tools/call": {
      const tool = tools[params.name]
      if (!tool) {
        throw rpcError(-32602, `Unknown tool: ${params.name}`)
      }
      return tool.run(params.arguments || {})
    }
    case "resources/list":
      return { resources: resourceList() }
    case "resources/read":
      return resourceRead(params.uri)
    case "prompts/list":
      return { prompts: promptList() }
    case "prompts/get":
      return promptGet(params.name)
    default:
      throw rpcError(-32601, `Method not found: ${method}`)
  }
}

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`)
}

function handleLine(line) {
  let request
  try {
    request = JSON.parse(line)
  } catch {
    return
  }

  // Notifications have no id and expect no response.
  const isNotification = request.id === undefined || request.id === null

  try {
    const result = handle(request)
    if (!isNotification) {
      send({ jsonrpc: "2.0", id: request.id, result })
    }
  } catch (error) {
    if (!isNotification) {
      send({ jsonrpc: "2.0", id: request.id, error: { code: error.rpcCode || -32603, message: error.message } })
    }
  }
}

let buffer = ""
process.stdin.setEncoding("utf8")
process.stdin.on("data", (chunk) => {
  buffer += chunk
  let index
  while ((index = buffer.indexOf("\n")) !== -1) {
    const line = buffer.slice(0, index).trim()
    buffer = buffer.slice(index + 1)
    if (line) {
      handleLine(line)
    }
  }
})
process.stdin.on("end", () => process.exit(0))
