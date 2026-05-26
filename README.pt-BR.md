# C.A.S.A — Context, Architecture, Stack & Automation

**A camada de arquitetura para vibe coding governado.**

[English](README.md) | [Español](README.es.md)

C.A.S.A é um método de arquitetura agent-native para equipes que constroem, governam e modernizam software com agentes de código por IA.

Ele não é um framework, um pacote de prompts nem um único starter template. C.A.S.A é uma camada operacional que entrega contexto estruturado, limites arquiteturais, capacidades reutilizáveis, governança de risco e gates de validação para agentes.

O objetivo é simples: manter a velocidade do vibe coding sem perder controle de engenharia.

## Princípio Central

**Projete para agentes. Governe para humanos. Evolua para legado.**

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

C.A.S.A separa conhecimento estável do projeto das instruções específicas de cada agente.

```text
.casa Core
  -> specs
  -> policies
  -> standards
  -> skills
  -> workflows
  -> context maps
  -> governance sensors

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

## O Que Você Recebe

- **Contexto**: `AGENTS.md`, specs, policies, mapas de repositório, mapas de domínio e instruções geradas para agentes.
- **Arquitetura**: limites, direção de dependências, contratos de API, ownership e caminhos de modernização.
- **Stack**: orientação substituível para frontend, backend, banco de dados, DevOps, testes e documentação.
- **Automação**: doctor checks, sync de adapters gerados, gates de CI, sensors, scans de segurança e detecção de drift.
- **Governança**: níveis de risco, paths protegidos, policies de segurança, permissões e expectativas de review.
- **Modernização**: discovery, baseline, seams, strangler migration e playbooks de retirement.

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

```bash
npm ci
npm run check
```

Comandos úteis:

```bash
npm run generate        # regenera arquivos de adapter específicos de agentes
npm run generate:check  # verifica se os adapters gerados estão sincronizados
npm run doctor          # valida estrutura C.A.S.A e checks de governança
npm run check           # roda estrutura, sync de geração e doctor
```

## Fluxo Diário

1. Edite primeiro os arquivos do C.A.S.A Core, normalmente em `.casa`.
2. Atualize specs, policies, docs ou exemplos quando comportamento mudar.
3. Rode `npm run generate` após mudar arquivos Core que afetam adapters.
4. Rode `npm run check` antes de abrir ou mergear um PR.
5. Não edite arquivos de adapter gerados diretamente.

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
- `.casa/capabilities`: skills, subagents e workflows.
- `.casa/protocols`: alinhamento com AGENTS.md, Agent Skills, MCP, A2A, OpenAPI e AsyncAPI.
- `.casa/adapters`: notas de adapter para superfícies de agentes suportadas.
- `.casa/generated`: packs e índices de adapters gerados.
- `.casa/specs`: templates reutilizáveis de especificação.
- `.casa/modernization`: playbooks de discovery, baselining, seams, strangler e retirement.
- `.casa/governance`: permissões, arquivos protegidos, ações perigosas, sensors, evals e audit.
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

`npm run doctor` verifica se a estrutura mínima C.A.S.A, policies, specs, context maps, sensors, exemplos de IDE e adapters gerados estão presentes e sincronizados.

## Exemplos E Documentação

- [C.A.S.A como arquitetura de vibe coding](docs/vibe-coding-architecture.md)
- [Exemplos de agentes e IDEs](docs/agent-ide-examples.md)
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
