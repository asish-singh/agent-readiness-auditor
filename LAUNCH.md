# Go-to-market plan

This document records how this tool is positioned, who it is for, and how it reaches them. It is a living document: the plan came first, and results are added as they arrive.

## Positioning

**For** site owners and developers who expect AI agents to visit their sites, **agent-readiness-auditor** is a command-line audit tool **that** scores how well a site works with, and defends against, AI agents. **Unlike** SEO tools, which measure visibility to search engines, it measures safety and readability for a new class of automated visitors, and it weights safety highest.

One-line pitch: *"Lighthouse, but for AI agents."*

## Target users, in order

1. **Developers adding AI-agent readiness to a site.** Reached through npm search, GitHub topics, and the `llms.txt` community. They want a fast, scriptable check.
2. **Teams wiring safety checks into CI.** Reached through the exit-code design (exit code `2` on a hard safety failure fails a build) and, later, a GitHub Action wrapper (see [ROADMAP](ROADMAP.md) v0.3).
3. **Writers and analysts covering the agentic web.** The tool produces a concrete, quotable score, which makes it citable in articles about prompt injection and agent safety.

## Why free and open source

The tool's value depends on the checks being trustworthy, and trust requires inspectable checks. Open source is the product strategy, not a concession. Distribution through `npx` means the cost of trying it is one command with nothing installed, the lowest possible barrier for target user number one.

## Channels and sequencing

| Stage | Channel | Status |
|---|---|---|
| 1 | npm publish plus public GitHub repo | ✅ Done (v0.1.2 live) |
| 2 | GitHub topics and community discoverability | In progress |
| 3 | Write-ups on how the scoring was designed ([docs/decisions](docs/decisions/)) | In progress |
| 4 | GitHub Action on the Actions marketplace | Planned (v0.3) |
| 5 | MCP server so AI assistants can run audits directly | Planned (v0.5) |
| 6 | Web front end with shareable report links | Planned (v0.4) |

## Success measures

- npm weekly downloads (baseline: just launched)
- GitHub stars and issues opened by people other than the author
- Sites that cite their audit score or fix issues the tool surfaced

Results will be recorded here as they come in, including the unimpressive ones. A GTM plan without real numbers is just marketing copy.
