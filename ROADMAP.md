# Roadmap

Planned in milestones. Each ships independently and is demoable on its own.

## v0.1 — MVP (current)
- [x] Fetch landing page + `robots.txt` + `llms.txt`
- [x] Five checks: prompt-injection, llms.txt, robots AI stance, structured data, accountability
- [x] Weighted scoring + letter grade
- [x] Human-readable and `--json` output
- [x] CI-friendly exit codes

## v0.2 — Depth
- [ ] Crawl a handful of internal pages, not just the landing page
- [ ] Expand the prompt-injection corpus (unicode tricks, off-screen positioning, `alt`/`title` attributes)
- [ ] Unit tests per check with fixture HTML
- [ ] `--config` file to tune weights and thresholds

## v0.3 — Distribution
- [ ] Publish to npm as `agent-audit`
- [ ] GitHub Action wrapper (`uses: asish-singh/agent-readiness-auditor@v0.3`)
- [ ] Batch mode: audit a list of URLs → CSV

## v0.4 — Web UI
- [ ] Single-page Astro/Cloudflare front end (reuse existing stack)
- [ ] Shareable report permalinks, edge-cached like the transcriber

## Non-goals (for now)
- Rendering JS-heavy SPAs (fetch-only for the MVP; document the limitation)
- Auth-gated pages
- Scoring subjective content quality
