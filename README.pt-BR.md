# C.A.S.A — Context, Architecture, Stack & Automation

**Um control plane de engenharia agent-native e AI coding agent harness para vibe coding governado.**

[English](README.md) | [Español](README.es.md)

C.A.S.A é um control plane de engenharia agent-native para equipes que constroem, governam e modernizam software com agentes de código por IA.

Ele não é um framework, um pacote de prompts, um agente de código nem um workflow builder visual. C.A.S.A é a camada arquitetural que torna agentes de código utilizáveis em sistemas reais: contexto estruturado, limites arquiteturais, capacidades reutilizáveis, execução por missions, governança de risco e validação baseada em evidência.

Ele também pode ser descrito como um **AI coding agent harness**: uma camada versionada no repositório que entrega contexto, comandos, adapters, policies, missions e validation gates para agentes operarem com menos chute e mais evidência.

O objetivo é simples: manter a velocidade do vibe coding sem perder controle de engenharia.

## Princípio Central

**Projete para agentes. Governe para humanos. Evolua para legado.**

**Escreva uma vez. Adapte para todos os lugares. Valide sempre.**

## Por Que C.A.S.A Existe

Agentes de código por IA conseguem avançar rápido, mas sem arquitetura eles amplificam problemas comuns de engenharia:

- padrões duplicados
- drift arquitetural
- documentação desatualizada
- testes e contratos ausentes
- automação insegura
- instruções específicas de ferramenta que não são reutilizáveis
- comportamento de reescrita em sistemas legados
- arquivos gerados sem fonte de verdade clara

C.A.S.A transforma trabalho improvisado com agentes em entrega de software governada.

## Como Funciona

C.A.S.A separa conhecimento estável do projeto das instruções específicas de cada agente e adiciona execução baseada em missions.

```text
.casa Core
  -> specs
  -> policies
  -> standards
  -> skills
  -> workflows
  -> context maps
  -> governance sensors
  -> quality gates
  -> mission templates
  -> context capsules

Adapter generation
  -> Codex skills
  -> Cursor rules
  -> Claude memory and agents
  -> Devin knowledge
  -> Copilot instructions
  -> Antigravity rules and workflows
  -> Windsurf rules
  -> Trae context
  -> Kilo Code instructions
  -> generic agent guides
```

A regra é: **escreva uma vez em `.casa`, adapte para todos os lugares.**

O resultado é: **toda mission termina com evidência.**

## O Que Você Recebe

- **Contexto**: `AGENTS.md`, specs, policies, mapas de repositório, mapas de domínio e instruções geradas para agentes.
- **Arquitetura**: limites, direção de dependências, contratos de API, ownership e caminhos de modernização.
- **Stack**: orientação substituível para frontend, backend, banco de dados, DevOps, testes e documentação.
- **Composição de Stack**: packs governados de instalação para web, mobile, desktop, backend, banco, admin, segurança e provedores de IA.
- **Harness de Terminal**: receitas, templates, histórico e comandos guiados para criação de software pelo terminal.
- **Marketplace de Skills**: busca, inspeção, auditoria e instalação de skills do GitHub com commit fixado.
- **Automação**: doctor checks, sync de adapters gerados, gates de CI, sensors, scans de segurança e detecção de drift.
- **Governança**: níveis de risco, paths protegidos, policies de segurança, permissões e expectativas de review.
- **Modernização**: discovery, baseline, seams, strangler migration e playbooks de retirement.
- **Mission Control**: missions, tarefas, handoffs, risk gates, agent runs e evidência.
- **Quality Gates**: checks versionados para arquitetura, segurança, contratos de API, qualidade de UI e segurança de legado.

## Módulos Do Control Plane

C.A.S.A 2.1 é organizado nestes blocos:

1. Kernel
2. Context Fabric
3. Capability Layer
4. Mission Control
5. Protocol Layer
6. Governance Engine
7. Modernization Layer
8. Adapter Layer
9. Evidence Ledger
10. Quality Gates

## IDEs E Agentes Suportados

C.A.S.A foi desenhado para funcionar entre IDEs e agentes de código, sem prender o projeto a um produto específico.

| Superfície | Exemplo C.A.S.A |
| --- | --- |
| Agentes universais | `AGENTS.md` |
| Codex | `.codex/skills/*/SKILL.md` |
| Cursor | `.cursor/rules/*.mdc` |
| Claude Code | `CLAUDE.md`, `.claude/settings.json`, `.claude/agents/*.md` |
| Devin | `knowledge/*.md` |
| GitHub Copilot | `.github/copilot-instructions.md`, `.github/instructions/*.instructions.md` |
| Antigravity | `.agents/rules/*.md`, `.agents/workflows/*.md` |
| Windsurf | `.windsurf/rules/*.md` |
| Trae | `AGENTS.md`, `.agents/*.md`, `.trae/mcp.json` |
| Kilo Code | `AGENTS.md`, `CONTEXT.md`, `kilo.jsonc` |
| Continue | `.continue/rules/*.md` |
| Agentes CLI genéricos | `AGENT-GUIDE.md` |
| Web chat genérico | `casa-system-prompt.md` |
| Agentes com MCP | `context-card.md` |

Comece por [docs/agent-ide-examples.md](docs/agent-ide-examples.md) e [examples/ide-adapters](examples/ide-adapters).

## Início Rápido

### Projeto Novo

```bash
mkdir my-app
cd my-app
npx @aillomai/casa init --mode greenfield
./casa doctor
./casa mission new first-feature --title "First Feature" --mode greenfield
```

### Projeto Existente

Na raiz do repositório existente:

```bash
cd existing-app
npx @aillomai/casa init --mode brownfield
./casa doctor
./casa mission new legacy-discovery --title "Legacy Discovery" --mode brownfield
```

Use `--force` apenas quando quiser sobrescrever arquivos C.A.S.A já existentes.

### Este Repositório

```bash
npm ci
./casa check
```

C.A.S.A expõe uma CLI local pequena:

```bash
./casa init ../my-app --mode greenfield
./casa doctor
./casa check
./casa commands
./casa generate adapters
./casa generate adapters --check
./casa compose --preset ai-fullstack --openrouter --model openai/gpt-5.2
./casa stack list
./casa stack add frontend:react-app security:web-baseline
./casa guide --goal "build and deploy a SaaS"
./casa recipe plan create-web-saas --name "Customer Portal"
./casa skill search stripe
./casa template list
./casa history list
./casa ai configure openrouter --model openai/gpt-5.2
./casa mission new invoice-dashboard --title "Invoice Dashboard" --mode greenfield
./casa capsule list
./casa gate list
```

O pacote npm expõe a mesma interface via `npx @aillomai/casa ...`.
Projetos inicializados também recebem o atalho local `./casa` e `.casa/commands.md`.

As instruções de publicação estão em [docs/publishing.md](docs/publishing.md).

## Fluxo Diário

1. Edite primeiro os arquivos do C.A.S.A Core, normalmente em `.casa`.
2. Atualize specs, policies, docs ou exemplos quando comportamento mudar.
3. Rode `./casa generate adapters` após mudar arquivos Core que afetam adapters.
4. Use `./casa compose` ou `./casa stack add` antes de instalar novas dependências de app.
5. Rode `./casa check` antes de abrir ou mergear um PR.
6. Não edite arquivos de adapter gerados diretamente.

Saídas geradas incluem:

- `.codex/skills`
- `.cursor/rules`
- `.agents/casa-agent-guide.md`
- `.casa/generated`

## Modos De Adoção

### Greenfield

Use C.A.S.A desde o primeiro dia em um projeto novo:

- escreva specs antes da implementação
- defina contratos de API antes de endpoints compartilhados
- adicione testes e gates de CI cedo
- gere instruções específicas de agentes a partir de uma única fonte de verdade

Comece por [templates/greenfield-next-nest-postgres](templates/greenfield-next-nest-postgres).

### Brownfield

Instale C.A.S.A como overlay em um sistema existente sem forçar uma reescrita:

- descubra antes de alterar
- mapeie módulos, dependências, runtime e riscos
- adicione testes de caracterização ou smoke tests
- crie seams antes de refatorar
- migre incrementalmente com strangler ou branch-by-abstraction

Comece por [templates/brownfield-overlay](templates/brownfield-overlay).

### Hybrid

Use C.A.S.A seletivamente em um produto vivo:

- comece por paths protegidos e policies
- mapeie primeiro as áreas mais arriscadas ou com mais mudanças
- adicione specs em novos trabalhos
- gere adapters para os agentes que sua equipe já usa

## Mapa Do Repositório

- `AGENTS.md`: instruções universais curtas para agentes de código.
- `casa.manifest.yaml`: metadados do método, adapters habilitados, requisitos de governança e paths protegidos.
- `.casa/kernel`: fonte de verdade para princípios, standards, policies e modelo de risco.
- `.casa/context`: mapas de repositório, arquitetura, domínio, runtime e inventário legado.
- `.casa/context-capsules`: pacotes reutilizáveis de contexto escopado para missions comuns.
- `.casa/capabilities`: skills, subagents e workflows.
- `.casa/mission-control`: templates de mission, evidence, handoff, capsule e risk gate.
- `.casa/runtime/missions`: registros opcionais e persistidos de missions.
- `.casa/protocols`: alinhamento com AGENTS.md, Agent Skills, MCP, A2A, OpenAPI e AsyncAPI.
- `.casa/adapters`: notas de adapter para superfícies de agentes suportadas.
- `.casa/generated`: packs e índices de adapters gerados.
- `.casa/specs`: templates reutilizáveis de especificação.
- `.casa/modernization`: playbooks de discovery, baselining, seams, strangler e retirement.
- `.casa/governance`: permissões, arquivos protegidos, ações perigosas, sensors, evals e audit.
- `.casa/quality-gates`: checks de qualidade versionados para missions e PRs.
- `.casa/registry`: índices de skills, agentes, adapters, workflows e policies.
- `.casa/registry/stacks.json`: packs governados de stack para frontend, backend, banco, segurança, mobile, desktop, admin e IA.
- `.casa/registry/recipes.json`: receitas prontas de terminal para criação de software, segurança, banco, IA e deploy.
- `.casa/registry/skill-marketplace.json`: configuração de confiança para marketplace de skills remotas.
- `.casa/registry/skills.lock.json`: instalações externas de skills fixadas por commit.
- `.casa/cockpit`: IA e definição de telas do futuro control plane visual.
- `.codex`, `.cursor`, `.agents`: saídas geradas específicas de ferramentas.
- `templates`: estruturas iniciais para adoção greenfield e brownfield.
- `examples`: exemplos práticos de uso.
- `examples/ide-adapters`: exemplos para Codex, Cursor, Claude, Devin, Copilot, Antigravity, Windsurf, Trae, Kilo Code e agentes genéricos.
- `docs`: documentação humana concisa.

## Governança

C.A.S.A espera que o trabalho seja escopado, revisado e validado de acordo com o risco.

- **Baixo risco**: validação normal.
- **Médio risco**: reviewer recomendado, testes e contratos quando relevante.
- **Alto risco**: aprovação humana, plano de rollback e sensors relevantes.
- **Risco crítico**: review por duas pessoas e planejamento em estilo de incidente.

Paths protegidos são declarados em `casa.manifest.yaml`. Detalhes de policies ficam em `.casa/kernel/policies`, e regras operacionais ficam em `.casa/governance`.

## Specs E Sensors

Specs são a fonte de verdade de features. Use os templates em `.casa/specs/templates` para:

- features greenfield
- endpoints de API
- features sensíveis a segurança
- modernização brownfield

Sensors definem a validação esperada antes da conclusão:

- lint
- typecheck
- testes
- OpenAPI diff
- risco de migration
- risco de dependência
- security scan

`./casa doctor` verifica se a estrutura mínima C.A.S.A, policies, specs, context maps, sensors, mission-control, context capsules, quality gates, registries e adapters gerados estão presentes e sincronizados. Neste repositório-fonte, ele também valida os exemplos de IDE.

## Exemplos E Documentação

- [C.A.S.A como arquitetura de vibe coding](docs/vibe-coding-architecture.md)
- [CLI C.A.S.A](docs/cli.md)
- [Harness C.A.S.A](docs/harness.md)
- [Marketplace de skills](docs/skill-marketplace.md)
- [Composição de stack](docs/stack-composition.md)
- [Publicação no npm](docs/publishing.md)
- [Exemplos de agentes e IDEs](docs/agent-ide-examples.md)
- [IA do cockpit C.A.S.A](.casa/cockpit/information-architecture.md)
- [Modo greenfield](docs/greenfield-mode.md)
- [Modo brownfield](docs/brownfield-mode.md)
- [Exemplos de IDE adapters](examples/ide-adapters)
- [Exemplo de invoice dashboard](examples/invoice-dashboard)
- [Exemplo de modernização legada](examples/legacy-modernization)

## Manual

O draft público em formato longo está incluído em `CASA_Agent_Native_Architecture_Manual.pdf`.

## Status

C.A.S.A está em desenvolvimento inicial. Este repositório contém o core do método, arquivos de governança, adapters iniciais, exemplos, templates e scripts locais de validação.

## Licença

Apache-2.0. Veja [LICENSE](LICENSE).
