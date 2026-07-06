# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com); versioning is [SemVer](https://semver.org).

## [0.1.0] - 2026-07-07
### Added
- Initial MVP: fetch a site and audit it for AI-agent readiness and safety.
- Five checks: hidden prompt-injection, `llms.txt`, `robots.txt` AI stance, structured data, accountability surface.
- Weighted scoring (0–100) with letter grades A–F.
- Human-readable and `--json` report output.
- CI-friendly exit codes (`2` on hard safety failure).
