import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import process from "node:process"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const cliPath = path.join(scriptDir, "casa.mjs")
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "casa-cli-test-"))

function run(args, cwd, options = {}) {
  const result = spawnSync(process.execPath, [cliPath, ...args], {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  })

  const shouldFail = options.shouldFail === true
  if (!shouldFail && result.status !== 0) {
    console.error(`Command failed: casa ${args.join(" ")}`)
    console.error(result.stdout)
    console.error(result.stderr)
    process.exit(result.status ?? 1)
  }

  if (shouldFail && result.status === 0) {
    console.error(`Command should have failed: casa ${args.join(" ")}`)
    console.error(result.stdout)
    process.exit(1)
  }

  return result
}

function assertExists(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`Expected file to exist: ${filePath}`)
    process.exit(1)
  }
}

try {
  const help = run(["--help"], tempRoot)
  if (!help.stdout.includes("casa init")) {
    console.error("CLI help must include init command.")
    process.exit(1)
  }
  if (!help.stdout.includes("casa commands")) {
    console.error("CLI help must include commands command.")
    process.exit(1)
  }

  const commands = run(["commands"], tempRoot)
  if (!commands.stdout.includes("./casa doctor")) {
    console.error("CLI commands output must include local shortcuts.")
    process.exit(1)
  }

  const initHelp = run(["init", "--help"], tempRoot)
  if (!initHelp.stdout.includes("C.A.S.A init")) {
    console.error("Init help must be command-specific.")
    process.exit(1)
  }

  const projectRoot = path.join(tempRoot, "greenfield-app")
  run(["init", projectRoot, "--mode", "greenfield"], tempRoot)

  assertExists(path.join(projectRoot, "AGENTS.md"))
  assertExists(path.join(projectRoot, "casa.manifest.yaml"))
  assertExists(path.join(projectRoot, ".casa/mission-control/mission-template.md"))
  assertExists(path.join(projectRoot, ".agents/casa-agent-guide.md"))
  assertExists(path.join(projectRoot, ".codex/skills/casa-skill-router/SKILL.md"))
  assertExists(path.join(projectRoot, ".cursor/rules/00-casa-context.mdc"))
  assertExists(path.join(projectRoot, "casa"))
  assertExists(path.join(projectRoot, "casa.cmd"))
  assertExists(path.join(projectRoot, ".casa/commands.md"))

  run(["doctor"], projectRoot)
  run(["check"], projectRoot)
  run(["generate", "adapters", "--check"], projectRoot)

  run(["mission", "new", "invoice-dashboard", "--title", "Invoice Dashboard", "--mode", "greenfield"], projectRoot)
  assertExists(path.join(projectRoot, `.casa/runtime/missions/${new Date().toISOString().slice(0, 10)}-invoice-dashboard.md`))

  run(["init", projectRoot], tempRoot, { shouldFail: true })

  const adapterProjectRoot = path.join(tempRoot, "adapter-app")
  run(["init", adapterProjectRoot, "--adapters", "claude,github-copilot,kilo-code"], tempRoot)
  assertExists(path.join(adapterProjectRoot, "CLAUDE.md"))
  assertExists(path.join(adapterProjectRoot, ".claude/settings.json"))
  assertExists(path.join(adapterProjectRoot, ".github/copilot-instructions.md"))
  assertExists(path.join(adapterProjectRoot, "kilo.jsonc"))

  console.log("C.A.S.A CLI smoke tests passed.")
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true })
}
