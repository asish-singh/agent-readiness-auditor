# Agent Readiness Auditor

[![npm version](https://img.shields.io/npm/v/agent-readiness-auditor.svg)](https://www.npmjs.com/package/agent-readiness-auditor)
[![CI](https://github.com/asish-singh/agent-readiness-auditor/actions/workflows/ci.yml/badge.svg)](https://github.com/asish-singh/agent-readiness-auditor/actions/workflows/ci.yml)

A command-line tool that scans a website and scores how well it works with, and how well it defends against, automated AI agents.

## What problem this solves

AI assistants increasingly visit websites on a person's behalf: reading pages, following instructions found on them, and taking actions. This creates two practical issues for site owners:

1. **Safety.** A page can contain text that is hidden from human visitors but still read by an AI agent. That hidden text can carry instructions designed to hijack the agent. This is known as indirect prompt injection.
2. **Readability for machines.** Sites are usually built for human eyes. Agents do better when a site also publishes machine-readable signals about its content and its rules.

Standard SEO tools measure how well a site works for search engines. This tool measures something different: how well a site works for AI agents, and whether it is safe for them to read.

## Research built with this tool

[The State of the Agentic Web, 2026](reports/2026-state-of-the-agentic-web/) audits 84 prominent sites across seven categories with this tool, and its [second edition](reports/2026-state-of-the-agentic-web/second-edition.md) reruns the study with the deeper nine check audit. Among the findings, no audited site carries hidden prompt injection content even under attribute level and multi page scanning, only 13% publish the FAQ structured data AI answers quote, no site advertises an MCP endpoint, and nearly one in five prominent sites refuses automated visitors entirely, including several AI companies. The data and method are published for anyone to reproduce.

## What it checks

The tool fetches the landing page, robots.txt, llms.txt, and the sitemap, then crawls a few key pages and runs nine checks, producing a score from 0 to 100 and a letter grade from A to F. Safety is weighted highest on purpose, because a readable site that can hijack an agent is worse than one that is simply hard to read.

| Check | Points | What it looks for |
|---|---|---|
| Hidden prompt-injection text | 40 | Agent-hijacking phrases in content humans cannot see, across every crawled page. Detects CSS hiding (`display:none`, `opacity:0`, off-screen positioning), zero-width unicode obfuscation, `alt`/`title`/`aria-label` attribute payloads, and HTML comments. |
| `llms.txt` file | 12 | A published file that gives agents a curated map of the site. See [llmstxt.org](https://llmstxt.org). |
| `robots.txt` stance on AI crawlers | 12 | Explicit allow or disallow rules for AI crawlers such as GPTBot and ClaudeBot. |
| Structured data (JSON-LD) | 12 | Machine-readable data that lets agents understand page content directly. |
| Accountability links | 9 | Reachable contact, privacy, terms, or about links. |
| Sitemap | 5 | A reachable /sitemap.xml so crawlers can discover the whole site. |
| Answerability | 5 | FAQ, QA, or HowTo structured data, the content shapes AI answers quote most readily. |
| Meta robots | 5 | No accidental `noindex`/`noai` directives hiding the site from indexes. |
| MCP signal | 0 | Informational only: whether the site advertises an MCP or agent-facing endpoint. Unscored while conventions are young. |

## Example output

```
$ npx agent-readiness-auditor example.com

  Agent readiness audit for https://example.com

  ✅ No hidden prompt-injection payloads  (40/40)
  ⚠️  llms.txt present                     (0/12)
  ⚠️  robots.txt addresses AI crawlers     (0/12)
  ⚠️  Machine-readable structured data     (0/12)
  ⚠️  Accountability surface present       (0/9)
  ⚠️  Sitemap present                      (0/5)
  ⚠️  Content structured for AI answers    (0/5)
  ✅ No accidental index blocking          (5/5)
  ✅ Agent endpoint advertised (informational)  (0/0)

  Score: 45/100 (45%)   Grade D
```

Each line shows the check result, its score, and (when a check does not fully pass) a suggested fix.

## Quick start

If you have [Node.js](https://nodejs.org) 18 or newer installed, you can run the tool in one line without installing anything:

```bash
npx agent-readiness-auditor example.com
npx agent-readiness-auditor example.com --json
```

Use a bare domain (`example.com`) or a full URL (`https://example.com`). The `--json` flag prints machine-readable output for use in scripts.

## Auditing many sites at once

Batch mode reads a text file with one URL per line (lines starting with `#` are ignored) and audits them a few at a time.

```bash
agent-audit --batch sites.txt          # a report per site
agent-audit --batch sites.txt --csv    # one CSV row per site
agent-audit --batch sites.txt --json   # structured results
```

The CSV has a column for each check, which makes it easy to open in a spreadsheet or feed into an analysis.

## Using it in GitHub Actions

The repo doubles as a GitHub Action, so any project can audit its own site on every push or on a schedule and fail the build if a hard safety problem appears.

```yaml
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: 20
  - uses: asish-singh/agent-readiness-auditor@v0.4.1
    with:
      url: example.com
      fail-on: safety   # or "never" to report without failing
```

An unreachable site produces a warning, not a failure, since bot protection on CI runners is an infrastructure issue rather than a safety one. This repo uses the action on itself every Monday in [audit-site.yml](.github/workflows/audit-site.yml).

## Using it from an AI assistant (MCP)

The auditor ships with a server for the Model Context Protocol, the standard that lets AI assistants use external tools. Once connected, you can simply ask your assistant to audit a site for you.

For Claude Code, one command connects it.

```bash
claude mcp add agent-readiness-auditor -- npx -y agent-readiness-auditor mcp
```

For Claude Desktop, add this to the `mcpServers` section of the configuration file.

```json
{
  "agent-readiness-auditor": {
    "command": "npx",
    "args": ["-y", "agent-readiness-auditor", "mcp"]
  }
}
```

The server exposes one tool, `audit_site`, which takes a URL and returns the same scores and findings as the command line.

## Running from source

To work on the code or run it from a local copy:

```bash
git clone https://github.com/asish-singh/agent-readiness-auditor.git
cd agent-readiness-auditor
npm install
npm run audit -- example.com          # human-readable report
npm run audit -- example.com --json   # JSON output
```

The `--` in the command passes the URL to the tool rather than to npm.

To install a global `agent-audit` command from your local copy:

```bash
npm run build   # compile TypeScript into dist/
npm link        # register the global command
```

You can then run `agent-audit example.com` from any folder. To remove it later, run `npm unlink -g agent-readiness-auditor`.

## Installing from GitHub Packages

The package is also published to GitHub Packages as a scoped mirror, `@asish-singh/agent-readiness-auditor`. For most people the npm install above is simpler. Use GitHub Packages only if your organization standardizes on it, since it requires authentication even for public packages.

To install from it, create a GitHub personal access token with the `read:packages` scope, then point the scope at the GitHub registry:

```bash
echo "@asish-singh:registry=https://npm.pkg.github.com" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> .npmrc
npm install @asish-singh/agent-readiness-auditor
```

## Exit codes

The tool sets its exit code so it can be used in automated pipelines:

- `0`: the audit ran and found no hard safety failure.
- `2`: a hard safety failure was found (for example, hidden prompt-injection text). Use this to fail a build.
- `1`: the tool could not complete the audit (for example, the site was unreachable).

## How the code is organized

Each check lives in its own file under `src/checks/` and returns a structured result. All checks are registered in a single list in `src/audit.ts`, and the total score is derived from that list, so adding a new check does not require changing the scoring logic. Architecture decisions are recorded in [`docs/adr/`](docs/adr/), product decisions in [`docs/decisions/`](docs/decisions/), planned work in [`ROADMAP.md`](ROADMAP.md), and the go-to-market plan in [`LAUNCH.md`](LAUNCH.md).

## Background

This tool grew out of the [Agentic Web Governance Pack](https://github.com/asish-singh/agentic-web-governance-pack), a set of guidelines for how websites should behave toward AI agents. This project turns several of those guidelines into checks that can be run and measured.

## License

MIT. See [LICENSE](LICENSE).
