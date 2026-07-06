# 2. Ship a command-line tool that reads raw HTML for the first version

- Status: Accepted
- Date: 2026-07-07

## Context

The auditor could start as a browser extension, a hosted web app, or a command-line tool. It could render pages with a headless browser or simply fetch the raw HTML. The more capable options cost more time to build and more infrastructure to run.

## Decision

Build the first version as a Node command-line tool that fetches raw HTML, without a headless browser. Each check is a self-contained module registered in `src/audit.ts`. The score is derived from that registry, so adding a check does not require changing the scoring logic.

## Consequences

- The tool is quick to build, needs no hosting, and can be run in a CI pipeline through its exit codes.
- It cannot see content added by client-side JavaScript. This is a known limitation, noted in the roadmap for a later version.
- A future web interface can reuse the same `audit()` core without changes.
