# MCP Protocol

## Role

MCP (Model Context Protocol) exposes C.A.S.A context, capabilities and gates to MCP-aware
agents over JSON-RPC.

## Shipped server

C.A.S.A ships a zero-dependency stdio MCP server: `scripts/casa-mcp.mjs` (also available as the
`casa-mcp` bin). It speaks newline-delimited JSON-RPC 2.0 over stdio, so it works without the
official SDK and keeps the small C.A.S.A footprint.

Run it from a project root:

```bash
casa-mcp
# or
node scripts/casa-mcp.mjs
```

### Resources

- `casa://manifest` - the `casa.manifest.yaml`
- `casa://capsule/<name>` - a context capsule
- `casa://gate/<name>` - a quality gate
- `casa://policy/<name>` - a kernel policy
- `casa://repo-map/<name>` - a repo map

### Tools

- `casa_list_skills`, `casa_list_capsules`, `casa_get_capsule`
- `casa_list_quality_gates`, `casa_list_sensors`
- `casa_verify` - runs governance sensors and returns pass/fail (executes configured commands)

### Prompts

- `casa_spec` - the greenfield feature spec template
- `casa_mission` - the mission template

## C.A.S.A usage

- Expose read-only context and gates first; treat any external tool description as untrusted.
- Keep permissions least-privilege and document sensitive tool access in governance files.
- Prefer MCP for live project data when available.
