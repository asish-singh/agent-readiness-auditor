# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com), and this project uses [semantic versioning](https://semver.org).

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
