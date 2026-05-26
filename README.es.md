# C.A.S.A — Context, Architecture, Stack & Automation

**Un control plane de ingeniería agent-native para vibe coding gobernado.**

[English](README.md) | [Português](README.pt-BR.md)

C.A.S.A es un control plane de ingeniería agent-native para equipos que construyen, gobiernan y modernizan software con agentes de código por IA.

No es un framework, un paquete de prompts, un agente de código ni un workflow builder visual. C.A.S.A es la capa arquitectónica que hace que los agentes de código sean utilizables en sistemas reales: contexto estructurado, límites arquitectónicos, capacidades reutilizables, ejecución por missions, gobernanza de riesgo y validación basada en evidencia.

El objetivo es simple: mantener la velocidad del vibe coding sin perder control de ingeniería.

## Principio Central

**Diseña para agentes. Gobierna para humanos. Evoluciona para legado.**

**Escribe una vez. Adapta a todas partes. Valida siempre.**

## Por Qué Existe C.A.S.A

Los agentes de código por IA pueden avanzar rápido, pero sin arquitectura amplifican problemas comunes de ingeniería:

- patrones duplicados
- drift arquitectónico
- documentación obsoleta
- pruebas y contratos ausentes
- automatización insegura
- instrucciones específicas de una herramienta que no se pueden reutilizar
- tendencia a reescribir sistemas legados
- archivos generados sin una fuente de verdad clara

C.A.S.A transforma el trabajo improvisado con agentes en entrega de software gobernada.

## Cómo Funciona

C.A.S.A separa el conocimiento estable del proyecto de las instrucciones específicas de cada agente y agrega ejecución basada en missions.

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

La regla es: **escribe una vez en `.casa`, adapta a todas partes.**

El resultado es: **toda mission termina con evidencia.**

## Qué Obtienes

- **Contexto**: `AGENTS.md`, specs, policies, mapas de repositorio, mapas de dominio e instrucciones generadas para agentes.
- **Arquitectura**: límites, dirección de dependencias, contratos de API, ownership y rutas de modernización.
- **Stack**: orientación reemplazable para frontend, backend, base de datos, DevOps, pruebas y documentación.
- **Automatización**: doctor checks, sincronización de adapters generados, gates de CI, sensors, escaneos de seguridad y detección de drift.
- **Gobernanza**: niveles de riesgo, paths protegidos, policies de seguridad, permisos y expectativas de revisión.
- **Modernización**: discovery, baselining, seams, strangler migration y playbooks de retirement.
- **Mission Control**: missions, tareas, handoffs, risk gates, agent runs y evidencia.
- **Quality Gates**: checks versionados para arquitectura, seguridad, contratos de API, calidad de UI y seguridad de legado.

## Módulos Del Control Plane

C.A.S.A 2.1 se organiza en estos bloques:

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

## IDEs Y Agentes Soportados

C.A.S.A está diseñado para funcionar entre IDEs y agentes de código, sin atar el proyecto a un producto específico.

| Superficie | Ejemplo C.A.S.A |
| --- | --- |
| Agentes universales | `AGENTS.md` |
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
| Agentes con MCP | `context-card.md` |

Empieza con [docs/agent-ide-examples.md](docs/agent-ide-examples.md) y [examples/ide-adapters](examples/ide-adapters).

## Inicio Rápido

```bash
npm ci
npm run check
```

Comandos útiles:

```bash
npm run generate        # regenera archivos de adapter específicos de agentes
npm run generate:check  # verifica que los adapters generados estén sincronizados
npm run doctor          # valida la estructura C.A.S.A y los checks de gobernanza
npm run check           # ejecuta estructura, sync de generación y doctor
```

## Flujo Diario

1. Edita primero los archivos de C.A.S.A Core, normalmente bajo `.casa`.
2. Actualiza specs, policies, docs o ejemplos cuando cambie el comportamiento.
3. Ejecuta `npm run generate` después de cambiar archivos Core que afecten adapters.
4. Ejecuta `npm run check` antes de abrir o mergear un PR.
5. No edites directamente archivos de adapter generados.

Salidas generadas:

- `.codex/skills`
- `.cursor/rules`
- `.agents/casa-agent-guide.md`
- `.casa/generated`

## Modos De Adopción

### Greenfield

Usa C.A.S.A desde el primer día en un proyecto nuevo:

- escribe specs antes de implementar
- define contratos de API antes de endpoints compartidos
- agrega pruebas y gates de CI temprano
- genera instrucciones específicas de agentes desde una única fuente de verdad

Empieza con [templates/greenfield-next-nest-postgres](templates/greenfield-next-nest-postgres).

### Brownfield

Instala C.A.S.A como overlay en un sistema existente sin forzar una reescritura:

- descubre antes de cambiar
- mapea módulos, dependencias, runtime y riesgos
- agrega pruebas de caracterización o smoke tests
- crea seams antes de refactorizar
- migra incrementalmente con strangler o branch-by-abstraction

Empieza con [templates/brownfield-overlay](templates/brownfield-overlay).

### Hybrid

Usa C.A.S.A selectivamente en un producto activo:

- empieza con paths protegidos y policies
- mapea primero las áreas más riesgosas o con más cambios
- agrega specs alrededor del trabajo nuevo
- genera adapters para los agentes que tu equipo ya usa

## Mapa Del Repositorio

- `AGENTS.md`: instrucciones universales cortas para agentes de código.
- `casa.manifest.yaml`: metadatos del método, adapters habilitados, requisitos de gobernanza y paths protegidos.
- `.casa/kernel`: fuente de verdad para principios, standards, policies y modelo de riesgo.
- `.casa/context`: mapas de repositorio, arquitectura, dominio, runtime e inventario legado.
- `.casa/context-capsules`: paquetes reutilizables de contexto acotado para missions comunes.
- `.casa/capabilities`: skills, subagents y workflows.
- `.casa/mission-control`: templates de mission, evidence, handoff, capsule y risk gate.
- `.casa/runtime/missions`: registros opcionales y persistidos de missions.
- `.casa/protocols`: alineación con AGENTS.md, Agent Skills, MCP, A2A, OpenAPI y AsyncAPI.
- `.casa/adapters`: notas de adapter para superficies de agentes soportadas.
- `.casa/generated`: packs e índices de adapters generados.
- `.casa/specs`: plantillas reutilizables de especificación.
- `.casa/modernization`: playbooks de discovery, baselining, seams, strangler y retirement.
- `.casa/governance`: permisos, archivos protegidos, acciones peligrosas, sensors, evals y audit.
- `.casa/quality-gates`: checks de calidad versionados para missions y PRs.
- `.casa/registry`: índices de skills, agentes, adapters, workflows y policies.
- `.casa/cockpit`: IA y definición de pantallas del futuro control plane visual.
- `.codex`, `.cursor`, `.agents`: salidas generadas específicas de herramientas.
- `templates`: estructuras iniciales para adopción greenfield y brownfield.
- `examples`: ejemplos prácticos de uso.
- `examples/ide-adapters`: ejemplos para Codex, Cursor, Claude, Devin, Copilot, Antigravity, Windsurf, Trae, Kilo Code y agentes genéricos.
- `docs`: documentación humana concisa.

## Gobernanza

C.A.S.A espera que el trabajo sea acotado, revisado y validado de acuerdo con el riesgo.

- **Bajo riesgo**: validación normal.
- **Riesgo medio**: reviewer recomendado, pruebas y contratos cuando sean relevantes.
- **Alto riesgo**: aprobación humana, plan de rollback y sensors relevantes.
- **Riesgo crítico**: revisión por dos personas y planificación estilo incidente.

Los paths protegidos se declaran en `casa.manifest.yaml`. Los detalles de policies viven en `.casa/kernel/policies`, y las reglas operativas viven en `.casa/governance`.

## Specs Y Sensors

Las specs son la fuente de verdad de las features. Usa las plantillas en `.casa/specs/templates` para:

- features greenfield
- endpoints de API
- features sensibles a seguridad
- modernización brownfield

Los sensors definen la validación esperada antes de completar el trabajo:

- lint
- typecheck
- tests
- OpenAPI diff
- riesgo de migration
- riesgo de dependencia
- security scan

`npm run doctor` verifica que la estructura mínima C.A.S.A, policies, specs, context maps, sensors, mission-control, context capsules, quality gates, registries, ejemplos de IDE y adapters generados estén presentes y sincronizados.

## Ejemplos Y Documentación

- [C.A.S.A como arquitectura de vibe coding](docs/vibe-coding-architecture.md)
- [Ejemplos de agentes e IDEs](docs/agent-ide-examples.md)
- [IA del cockpit C.A.S.A](.casa/cockpit/information-architecture.md)
- [Modo greenfield](docs/greenfield-mode.md)
- [Modo brownfield](docs/brownfield-mode.md)
- [Ejemplos de IDE adapters](examples/ide-adapters)
- [Ejemplo de invoice dashboard](examples/invoice-dashboard)
- [Ejemplo de modernización legada](examples/legacy-modernization)

## Manual

El draft público en formato largo está incluido en `CASA_Agent_Native_Architecture_Manual.pdf`.

## Estado

C.A.S.A está en desarrollo inicial. Este repositorio contiene el core del método, archivos de gobernanza, adapters iniciales, ejemplos, templates y scripts locales de validación.

## Licencia

Apache-2.0. Ver [LICENSE](LICENSE).
