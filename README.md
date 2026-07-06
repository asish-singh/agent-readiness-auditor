# Agent-Readiness Auditor

**Scan any website and score how ready — and how safe — it is for AI agents.**

As agents start browsing, reading, and acting on the web, sites need to be legible to them *and* defended against them. This tool audits both in one pass and prints a graded report.

```
$ npx agent-audit freeyoutubetranscribe.com

  ✅ No hidden prompt-injection payloads  (40/40)
  ✅ llms.txt present                     (15/15)
  ✅ robots.txt addresses AI crawlers     (15/15)
  ✅ Machine-readable structured data     (15/15)
  ✅ Accountability surface present       (15/15)

  Score: 100/100 (100%) — Grade A
```

## What it checks

| Check | Points | Why it matters |
|---|---|---|
| **Hidden prompt-injection payloads** | 40 | The #1 agentic-web safety risk — hidden text that hijacks an agent reading the page. |
| **`llms.txt` present** | 15 | Gives agents a curated map of the site ([llmstxt.org](https://llmstxt.org)). |
| **`robots.txt` AI stance** | 15 | Explicit allow/disallow rules for AI crawlers (GPTBot, ClaudeBot, …). |
| **Structured data (JSON-LD)** | 15 | Lets agents parse entities instead of scraping prose. |
| **Accountability surface** | 15 | Reachable contact/privacy/terms — the transparency baseline. |

Safety is weighted highest on purpose: a readable site that can hijack an agent is worse than an unreadable one.

## Usage

```bash
npm install
npm run audit -- example.com        # human-readable report
npm run audit -- example.com --json # machine-readable, for CI
```

Exit codes: `0` clean · `2` a hard safety failure was found · `1` error. The non-zero-on-fail behavior makes it drop-in for CI pipelines.

## Design

This project turns the ideas in my [Agentic Web Governance Pack](https://github.com/asish-singh/agentic-web-governance-pack)
into an executable check. Architecture decisions are recorded in [`docs/adr/`](docs/adr/); the plan lives in [`ROADMAP.md`](ROADMAP.md).

## License

MIT © Asish Singh
