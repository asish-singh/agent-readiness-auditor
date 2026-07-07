# Roadmap

Work is planned in milestones. Each milestone can ship on its own.

## v0.1: Minimum viable product (current)
- [x] Fetch the landing page plus `robots.txt` and `llms.txt`
- [x] Five checks: prompt injection, `llms.txt`, `robots.txt` AI stance, structured data, accountability
- [x] Weighted scoring with a letter grade
- [x] Human-readable and JSON output
- [x] Exit codes suitable for CI
- [x] Unit tests
- [x] Published to npm

## v0.2: More depth
- [ ] Crawl a few internal pages, not just the landing page
- [ ] Expand prompt-injection detection (unicode tricks, off-screen positioning, `alt` and `title` attributes)
- [ ] A config file to adjust weights and thresholds

## v0.3: Wider distribution
- [ ] A GitHub Action wrapper so other repos can run the audit in their own pipelines
- [x] Batch mode, audit a list of URLs and output CSV (shipped early, in v0.2.0)

## v0.4: Web interface
- [ ] A single-page web front end
- [ ] Shareable report links

## v0.5: Model Context Protocol (MCP)

MCP is the emerging standard that lets AI assistants connect to external tools. Two separate opportunities, tracked as issues:

- [x] Expose the auditor as an MCP server, so an AI assistant can run an audit on request (shipped early, in v0.2.0)
- [ ] Add a scoring signal for whether a site advertises its own MCP or agent-facing endpoints

## Out of scope for now
- Rendering pages that rely heavily on client-side JavaScript (the current version reads raw HTML only)
- Pages behind a login
- Judging subjective content quality
