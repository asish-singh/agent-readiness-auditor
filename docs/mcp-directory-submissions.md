# Getting the MCP server listed in directories

The MCP server ships inside the npm package (see the README). Listing it in public directories is a distribution task. This file records where to submit and the exact content to use, so a listing takes minutes.

## 1. The official MCP registry

The canonical registry at registry.modelcontextprotocol.io. The repo contains a ready `server.json`, and package.json carries the required `mcpName` field.

Steps (requires a GitHub sign in, so a human runs them).

```bash
brew install mcp-publisher
cd agent-readiness-auditor
npm version patch && git push --follow-tags   # ships mcpName inside the npm package
# update the two version fields in server.json to match, then
mcp-publisher login github
mcp-publisher publish
```

## 2. Community directories

These accept submissions through a form or a pull request. Suggested listing content follows.

| Directory | Where |
|---|---|
| mcp.so | Submit form on the site |
| PulseMCP | Submit form on the site |
| Smithery | Sign in with GitHub and add the server |

**Name.** Agent Readiness Auditor

**Description.** Audits any website for AI agent readiness and safety. One tool, audit_site, fetches a site and scores hidden prompt injection risk, llms.txt, the robots.txt stance on AI crawlers, structured data, and accountability links, returning a graded report with suggested fixes.

**Install command.**

```bash
claude mcp add agent-readiness-auditor -- npx -y --package=agent-readiness-auditor agent-audit-mcp
```

**Config block (for clients that use JSON config).**

```json
{
  "agent-readiness-auditor": {
    "command": "npx",
    "args": ["-y", "--package=agent-readiness-auditor", "agent-audit-mcp"]
  }
}
```
