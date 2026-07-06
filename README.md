# Agent-Readiness Auditor

**Scan any website and score how ready — and how safe — it is for AI agents.**

As agents start browsing, reading, and acting on the web, sites need to be legible to them *and* defended against them. This tool audits both in one pass and prints a graded report.

## Executive summary

**The problem.** SEO tools ask "is this site good for Google?" Nobody was asking the new question: *"is this site ready for — and safe from — AI agents that read and act on it?"* Agents now visit pages, follow their instructions, and take actions on a user's behalf. That opens a fresh attack surface (hidden text that hijacks the agent) and a fresh legibility gap (agents guessing at content humans designed for eyeballs).

**What this does.** `agent-audit` fetches any URL and scores it 0–100 across five checks — weighted so **safety dominates**. The headline check hunts for *indirect prompt injection*: text hidden from humans (`display:none`, `opacity:0`, `aria-hidden`) but still read by an AI, containing hijack phrases like "ignore previous instructions." The other four measure agent legibility (`llms.txt`, AI-crawler rules in `robots.txt`, JSON-LD structured data, and an accountability surface).

**Why it matters.** It returns a non-zero exit code on a hard safety failure, so it drops straight into CI to *block a deploy* that would ship an agent-hijacking page. It's the executable version of the governance ideas in my [Agentic Web Governance Pack](https://github.com/asish-singh/agentic-web-governance-pack) — theory turned into an enforceable check.

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

## Run it in your own terminal

**Requirements:** [Node.js](https://nodejs.org) 18 or newer (`node --version` to check) and `git`.

**1. Clone and install**

```bash
git clone https://github.com/asish-singh/agent-readiness-auditor.git
cd agent-readiness-auditor
npm install
```

**2. Audit any site**

```bash
npm run audit -- example.com          # human-readable report
npm run audit -- example.com --json   # machine-readable JSON (for CI / tooling)
```

> The `--` matters: it passes the URL to the tool instead of to npm. You can pass a bare domain (`example.com`) or a full URL (`https://example.com`).

**3. (Optional) Install it as a global `agent-audit` command**

So you can run it from any folder, without `cd`-ing into the project:

```bash
npm run build     # compile TypeScript → dist/
npm link          # register the global command
```

Then, from anywhere:

```bash
agent-audit stripe.com
agent-audit stripe.com --json
```

(To remove it later: `npm unlink -g agent-readiness-auditor`.)

### Reading the results

Each check prints `✅ pass`, `⚠️ warn`, or `❌ fail` with its score; a `→` line gives the fix when something falls short. The footer shows total score, percent, and an A–F grade.

**Exit codes:** `0` clean · `2` a hard safety failure was found · `1` error. The non-zero-on-fail behavior makes it drop-in for CI pipelines — fail the build if a page would hijack an agent.

## Design

This project turns the ideas in my [Agentic Web Governance Pack](https://github.com/asish-singh/agentic-web-governance-pack)
into an executable check. Architecture decisions are recorded in [`docs/adr/`](docs/adr/); the plan lives in [`ROADMAP.md`](ROADMAP.md).

## License

MIT © Asish Singh
