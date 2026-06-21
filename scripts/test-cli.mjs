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

  const generatedAgents = fs.readFileSync(path.join(projectRoot, "AGENTS.md"), "utf8")
  if (!generatedAgents.includes("Generated from C.A.S.A Core") || !generatedAgents.includes("## Core principles")) {
    console.error("AGENTS.md must be generated from the C.A.S.A core (with principles and protected paths).")
    process.exit(1)
  }

  const verifyAll = run(["verify"], projectRoot)
  if (!verifyAll.stdout.includes("Result:")) {
    console.error("casa verify must print a sensor result summary.")
    process.exit(1)
  }

  const sensorDir = path.join(projectRoot, ".casa/governance/sensors")
  fs.writeFileSync(path.join(sensorDir, "smoke-pass.sensor.md"), `---\nid: smoke-pass\ncommand: node -e "process.exit(0)"\n---\n\n# Sensor: smoke pass\n`)
  const verifyPass = run(["verify", "--sensors", "smoke-pass"], projectRoot)
  if (!verifyPass.stdout.includes("PASS") || !verifyPass.stdout.includes("smoke-pass")) {
    console.error("casa verify must run and pass an executable sensor command.")
    process.exit(1)
  }

  fs.writeFileSync(path.join(sensorDir, "smoke-fail.sensor.md"), `---\nid: smoke-fail\ncommand: node -e "process.exit(1)"\n---\n\n# Sensor: smoke fail\n`)
  const verifyFail = run(["verify", "--sensors", "smoke-fail"], projectRoot, { shouldFail: true })
  if (!verifyFail.stdout.includes("FAIL")) {
    console.error("casa verify must report and block on a failing sensor command.")
    process.exit(1)
  }

  run(["verify", "--sensors", "does-not-exist"], projectRoot, { shouldFail: true })

  fs.rmSync(path.join(sensorDir, "smoke-pass.sensor.md"))
  fs.rmSync(path.join(sensorDir, "smoke-fail.sensor.md"))

  // R3: spec -> plan -> tasks -> implement loop with gates
  run(["spec", "new", "demo-feature", "--title", "Demo Feature"], projectRoot)
  const demoDir = path.join(projectRoot, ".casa/specs/demo-feature")
  assertExists(path.join(demoDir, "spec.md"))

  run(["spec", "plan", "demo-feature"], projectRoot, { shouldFail: true })

  fs.writeFileSync(
    path.join(demoDir, "spec.md"),
    `---\nslug: demo-feature\ntitle: Demo Feature\nphase: spec\nstatus: ready\nmode: greenfield\ncreated: 2026-06-21\n---\n\n# Spec: Demo Feature\n\n## Goal\n\nProvide a demo feature.\n\n## Acceptance Criteria\n\n- AC1: WHEN a user opens the demo THE SYSTEM SHALL render it.\n\n## Risks and Questions\n\n- None.\n`
  )
  run(["spec", "plan", "demo-feature"], projectRoot)
  assertExists(path.join(demoDir, "plan.md"))

  run(["spec", "tasks", "demo-feature"], projectRoot, { shouldFail: true })

  fs.writeFileSync(
    path.join(demoDir, "plan.md"),
    `---\nslug: demo-feature\ntitle: Demo Feature\nphase: plan\nstatus: ready\ncreated: 2026-06-21\n---\n\n# Plan: Demo Feature\n\n## Approach\n\nBuild it simply.\n\n## Sensors To Run\n\n- test\n`
  )
  run(["spec", "tasks", "demo-feature"], projectRoot)
  assertExists(path.join(demoDir, "tasks.md"))

  run(["spec", "implement", "demo-feature"], projectRoot, { shouldFail: true })

  fs.writeFileSync(
    path.join(demoDir, "tasks.md"),
    `---\nslug: demo-feature\ntitle: Demo Feature\nphase: tasks\nstatus: ready\ncreated: 2026-06-21\n---\n\n# Tasks: Demo Feature\n\n## Tasks\n\n- [ ] Implement the demo feature.\n\n## Validation\n\n- [ ] Required sensors pass.\n`
  )
  const implement = run(["spec", "implement", "demo-feature"], projectRoot)
  if (!implement.stdout.includes("Implement gate passed") || !implement.stdout.includes("Result:")) {
    console.error("casa spec implement must pass the gate and run sensors when all phases are ready.")
    process.exit(1)
  }

  const specStatus = run(["spec", "status", "demo-feature"], projectRoot)
  if (!specStatus.stdout.includes("ready")) {
    console.error("casa spec status must report ready phases.")
    process.exit(1)
  }

  run(["doctor"], projectRoot)

  // R4: EARS acceptance criteria + requirement-id traceability
  const specCheck = run(["spec", "check", "demo-feature"], projectRoot)
  if (!specCheck.stdout.includes("AC1: EARS")) {
    console.error("casa spec check must validate EARS acceptance criteria.")
    process.exit(1)
  }

  fs.writeFileSync(
    path.join(demoDir, "tasks.md"),
    `---\nslug: demo-feature\ntitle: Demo Feature\nphase: tasks\nstatus: ready\ncreated: 2026-06-21\n---\n\n# Tasks: Demo Feature\n\n## Tasks\n\n- [ ] (AC1) Render the demo.\n\n## Validation\n\n- [ ] Required sensors pass.\n`
  )
  const specCheckCovered = run(["spec", "check", "demo-feature"], projectRoot)
  if (!specCheckCovered.stdout.includes("AC1: covered by a task")) {
    console.error("casa spec check must report acceptance-criterion coverage from tasks.")
    process.exit(1)
  }

  run(["spec", "new", "bad-ears", "--title", "Bad Ears"], projectRoot)
  fs.writeFileSync(
    path.join(projectRoot, ".casa/specs/bad-ears/spec.md"),
    `---\nslug: bad-ears\ntitle: Bad Ears\nphase: spec\nstatus: ready\nmode: greenfield\ncreated: 2026-06-21\n---\n\n# Spec: Bad Ears\n\n## Goal\n\nDemonstrate a non-EARS criterion.\n\n## Acceptance Criteria\n\n- AC1: the user can do things\n\n## Risks and Questions\n\n- None.\n`
  )
  run(["spec", "check", "bad-ears"], projectRoot, { shouldFail: true })
  run(["spec", "plan", "bad-ears"], projectRoot, { shouldFail: true })

  // R5: deterministic enforcement (deny-first settings + PreToolUse guard)
  const claudeSettings = JSON.parse(fs.readFileSync(path.join(projectRoot, ".claude/settings.json"), "utf8"))
  const denyList = claudeSettings.permissions?.deny || []
  if (!denyList.includes("Edit(.casa/kernel/policies/**)") || !denyList.includes("Read(.env)")) {
    console.error(".claude/settings.json must deny edits to protected paths and reads of secrets.")
    process.exit(1)
  }
  if (!JSON.stringify(claudeSettings.hooks || {}).includes("protected-path-guard.mjs")) {
    console.error(".claude/settings.json must wire the PreToolUse protected-path guard.")
    process.exit(1)
  }

  const guardPath = path.join(projectRoot, ".casa/governance/hooks/protected-path-guard.mjs")
  assertExists(guardPath)

  const guardBlocked = spawnSync(process.execPath, [guardPath], {
    cwd: projectRoot,
    encoding: "utf8",
    input: JSON.stringify({ tool_name: "Edit", tool_input: { file_path: ".casa/kernel/policies/secure-coding.md" } })
  })
  if (guardBlocked.status !== 2) {
    console.error("protected-path guard must block edits to protected paths with exit code 2.")
    process.exit(1)
  }

  const guardAllowed = spawnSync(process.execPath, [guardPath], {
    cwd: projectRoot,
    encoding: "utf8",
    input: JSON.stringify({ tool_name: "Edit", tool_input: { file_path: "src/app.ts" } })
  })
  if (guardAllowed.status !== 0) {
    console.error("protected-path guard must allow edits to non-protected paths.")
    process.exit(1)
  }

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

  // R6: mission runtime state machine + evidence ledger
  const missionId = `${new Date().toISOString().slice(0, 10)}-invoice-dashboard`
  run(["mission", "new", "invoice-dashboard", "--title", "Invoice Dashboard", "--mode", "greenfield"], projectRoot)
  assertExists(path.join(projectRoot, `.casa/runtime/missions/${missionId}.md`))

  run(["mission", "close", "invoice-dashboard"], projectRoot, { shouldFail: true })
  run(["mission", "start", "invoice-dashboard"], projectRoot)
  run(["mission", "advance", "invoice-dashboard"], projectRoot)
  run(["mission", "close", "invoice-dashboard"], projectRoot, { shouldFail: true })

  const missionEvidence = run(["mission", "evidence", "invoice-dashboard", "--note", "verified locally", "--verify"], projectRoot)
  if (!missionEvidence.stdout.includes("policyHash")) {
    console.error("casa mission evidence must record a policy hash.")
    process.exit(1)
  }
  assertExists(path.join(projectRoot, `.casa/runtime/missions/${missionId}.evidence.jsonl`))

  run(["mission", "close", "invoice-dashboard"], projectRoot)
  const missionStatusOut = run(["mission", "status", "invoice-dashboard"], projectRoot)
  if (!missionStatusOut.stdout.includes("status: done")) {
    console.error("casa mission close must transition the mission to done after evidence.")
    process.exit(1)
  }

  // R7: MCP stdio server
  const mcpPath = path.join(scriptDir, "casa-mcp.mjs")
  const mcpInput = [
    JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2024-11-05" } }),
    JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list" }),
    JSON.stringify({ jsonrpc: "2.0", id: 3, method: "resources/list" }),
    JSON.stringify({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "casa_list_skills", arguments: {} } })
  ].join("\n") + "\n"
  const mcp = spawnSync(process.execPath, [mcpPath], { cwd: projectRoot, encoding: "utf8", input: mcpInput })
  const mcpMessages = mcp.stdout.trim().split("\n").filter(Boolean).map((line) => JSON.parse(line))
  const initResponse = mcpMessages.find((message) => message.id === 1)
  if (!initResponse || initResponse.result?.serverInfo?.name !== "casa-mcp") {
    console.error("casa-mcp must answer initialize with serverInfo.name casa-mcp.")
    process.exit(1)
  }
  const toolsResponse = mcpMessages.find((message) => message.id === 2)
  if (!toolsResponse || !toolsResponse.result.tools.some((tool) => tool.name === "casa_list_skills")) {
    console.error("casa-mcp tools/list must include casa_list_skills.")
    process.exit(1)
  }
  const resourcesResponse = mcpMessages.find((message) => message.id === 3)
  if (!resourcesResponse || !resourcesResponse.result.resources.some((resource) => resource.uri === "casa://manifest")) {
    console.error("casa-mcp resources/list must include casa://manifest.")
    process.exit(1)
  }
  const callResponse = mcpMessages.find((message) => message.id === 4)
  if (!callResponse || !callResponse.result.content?.[0]?.text?.includes("casa-skill-router")) {
    console.error("casa-mcp tools/call casa_list_skills must return the skill list.")
    process.exit(1)
  }

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
