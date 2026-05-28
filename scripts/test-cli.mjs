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
  if (!help.stdout.includes("casa compose")) {
    console.error("CLI help must include compose command.")
    process.exit(1)
  }
  if (!help.stdout.includes("casa stack list")) {
    console.error("CLI help must include stack command.")
    process.exit(1)
  }
  if (!help.stdout.includes("casa recipe list")) {
    console.error("CLI help must include recipe command.")
    process.exit(1)
  }
  if (!help.stdout.includes("casa history list")) {
    console.error("CLI help must include history command.")
    process.exit(1)
  }
  if (!help.stdout.includes("casa skill search")) {
    console.error("CLI help must include skill marketplace command.")
    process.exit(1)
  }

  const commands = run(["commands"], tempRoot)
  if (!commands.stdout.includes("./casa doctor")) {
    console.error("CLI commands output must include local shortcuts.")
    process.exit(1)
  }
  if (!commands.stdout.includes("./casa compose")) {
    console.error("CLI commands output must include stack composition shortcuts.")
    process.exit(1)
  }
  if (!commands.stdout.includes("./casa recipe list")) {
    console.error("CLI commands output must include recipe shortcuts.")
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

  const stackList = run(["stack", "list"], projectRoot)
  if (!stackList.stdout.includes("frontend:react-app") || !stackList.stdout.includes("ai:openrouter")) {
    console.error("Stack list must include core stack packs.")
    process.exit(1)
  }

  const stackPlan = run(["stack", "plan", "frontend:react-app", "security:web-baseline"], projectRoot)
  if (!stackPlan.stdout.includes("React App Foundation") || !stackPlan.stdout.includes("Install Commands")) {
    console.error("Stack plan must render selected packs and install commands.")
    process.exit(1)
  }

  const recipeList = run(["recipe", "list"], projectRoot)
  if (!recipeList.stdout.includes("create-web-saas") || !recipeList.stdout.includes("prepare-docker-deploy")) {
    console.error("Recipe list must include core recipes.")
    process.exit(1)
  }

  const recipeShow = run(["recipe", "show", "add-openrouter-ai"], projectRoot)
  if (!recipeShow.stdout.includes("OpenRouter")) {
    console.error("Recipe show must display recipe details.")
    process.exit(1)
  }

  run(["recipe", "plan", "create-web-saas", "--name", "Recipe App", "--write"], projectRoot)
  assertExists(path.join(projectRoot, `.casa/runtime/recipes/${new Date().toISOString().slice(0, 10)}-create-web-saas.md`))

  const guide = run(["guide", "--goal", "deploy"], projectRoot)
  if (!guide.stdout.includes("prepare-docker-deploy") || !guide.stdout.includes("C.A.S.A Terminal Guide")) {
    console.error("Guide must suggest matching recipes.")
    process.exit(1)
  }

  const templateList = run(["template", "list"], projectRoot)
  if (!templateList.stdout.includes("greenfield-next-nest-postgres")) {
    console.error("Template list must include package templates.")
    process.exit(1)
  }

  const appName = "Test App"
  run(["compose", "--preset", "ai-fullstack", "--name", appName, "--openrouter", "--model", "openai/gpt-5.2"], projectRoot)
  assertExists(path.join(projectRoot, `.casa/runtime/stack-plans/${new Date().toISOString().slice(0, 10)}-test-app.md`))
  assertExists(path.join(projectRoot, ".casa/specs/generated/test-app/spec.md"))
  assertExists(path.join(projectRoot, ".casa/ai/model-router.yaml"))
  assertExists(path.join(projectRoot, ".casa/ai/openrouter.env.example"))

  const skillList = run(["skill", "list"], projectRoot)
  if (!skillList.stdout.includes("stack-composer") || !skillList.stdout.includes("ai-integration-engineer")) {
    console.error("Skill list must include stack and AI skills.")
    process.exit(1)
  }

  const skillAudit = run(["skill", "audit", "stack-composer"], projectRoot)
  if (!skillAudit.stdout.includes("stack-composer: 0 blocker")) {
    console.error("Skill audit must report local skill findings.")
    process.exit(1)
  }

  run(["skill", "new", "temporary-marketplace-test", "--description", "Use for CLI remove smoke tests.", "--no-generate"], projectRoot)
  assertExists(path.join(projectRoot, ".casa/capabilities/skills/temporary-marketplace-test/SKILL.md"))
  run(["skill", "remove", "temporary-marketplace-test", "--no-generate"], projectRoot)
  if (fs.existsSync(path.join(projectRoot, ".casa/capabilities/skills/temporary-marketplace-test/SKILL.md"))) {
    console.error("Skill remove must delete the local skill.")
    process.exit(1)
  }

  const history = run(["history", "list"], projectRoot)
  if (!history.stdout.includes("recipe.plan") || !history.stdout.includes("compose")) {
    console.error("History list must include recorded harness actions.")
    process.exit(1)
  }

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
