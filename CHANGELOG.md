# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com), and this project uses [semantic versioning](https://semver.org).

## [0.4.4] - 2026-07-08
### Fixed
- `npx agent-readiness-auditor` now works as documented. The package ships commands named agent-audit and agent-audit-mcp, and npx could not choose between them when invoked by package name, so a command named after the package itself now runs the audit.

## [0.4.3] - 2026-07-08
### Changed
- The MCP tool description now names all nine checks and the multi page crawl, so assistants know the full scope of the audit before running it.

## [0.4.2] - 2026-07-07
### Fixed
- The MCP server now reports the real package version instead of a hardcoded one.

### Added
- A decision record on the study's near miss false positive, docs/decisions/the-false-positive.md.

## [0.4.1] - 2026-07-07
### Fixed
- Detection precision. Weak phrases that occur in ordinary writing about AI ("as an AI", "system prompt") now only count inside deliberately hidden elements. Attribute and comment scanning requires unambiguous directive phrases, so news captions and documentation are no longer flagged as attacks.

## [0.4.0] - 2026-07-07
### Added
- Multi page crawling. The audit now also fetches the sitemap and up to four key pages, and the safety check scans all of them.
- Deeper prompt injection detection: off screen CSS positioning, zero width unicode obfuscation, `alt`/`title`/`aria-label` attribute payloads, and HTML comments.
- Four new checks: sitemap presence (5 points), answerability via FAQ/QA/HowTo structured data (5), accidental `noindex`/`noai` blocking (5), and an unscored informational MCP endpoint signal.

### Changed
- Weights rebalanced so the total stays 100: llms.txt, robots.txt stance, and structured data are now 12 points each, accountability links 9. Safety remains 40.

## [0.3.0] - 2026-07-07
### Added
- A composite GitHub Action, so any repository can audit a site in its own pipeline with `uses: asish-singh/agent-readiness-auditor@v0.3.0`. It fails the build on a hard safety failure, warns on unreachable sites, and has a `fail-on: never` reporting mode.

### Changed
- The scheduled live site audit workflow now uses the Action itself.

## [0.2.0] - 2026-07-07
### Added
- An MCP server (`agent-audit-mcp`), so AI assistants can run audits through the Model Context Protocol. It exposes one tool, `audit_site`.
- Batch mode. `agent-audit --batch sites.txt` audits a list of URLs with limited concurrency and can output per site reports, JSON, or CSV with one column per check.

## [0.1.1] - 2026-07-07
### Added
- Unit tests covering scoring, grade boundaries, hidden prompt-injection detection, and URL handling.
- Continuous integration that builds and tests on every push.
- A release workflow that publishes to npm when a version tag is pushed.

### Changed
- The fetcher now sends a browser-compatible user agent and reports the HTTP status when a request fails, so blocked or unreachable sites are easier to diagnose.

## [0.1.0] - 2026-07-07
### Added
- First release: fetch a site and audit it for AI-agent readiness and safety.
- Five checks: hidden prompt injection, `llms.txt`, `robots.txt` AI stance, structured data, and accountability links.
- Weighted scoring from 0 to 100 with letter grades A to F.
- Human-readable and JSON report output.
- Exit codes suitable for CI, including code 2 on a hard safety failure.
