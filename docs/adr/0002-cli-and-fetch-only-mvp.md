# 2. Ship a fetch-only CLI for the MVP

- Status: Accepted
- Date: 2026-07-07

## Context

The auditor could start as a browser extension, a hosted web app, or a CLI. It
could render pages with a headless browser or just fetch raw HTML. More capable
options cost more time and infra.

## Decision

Ship the MVP as a **Node CLI** that **fetches raw HTML** (no headless browser).
Each check is a self-contained module registered in `src/audit.ts`; scoring is
derived from the registry, so adding a check needs no scoring changes.

## Consequences

- Fast to build, zero infra, trivially CI-embeddable via exit codes.
- Cannot see content injected by client-side JS — documented as a known
  limitation and revisited in v0.2 (see ROADMAP).
- A web UI (v0.4) can import the same `audit()` core unchanged.
