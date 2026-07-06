# 1. Record architecture decisions

- Status: Accepted
- Date: 2026-07-07

## Context

Small projects accumulate decisions ("why a CLI?", "why fetch-only?") that get
lost. Reviewers and future-me need the *why*, not just the *what* in the diff.

## Decision

Keep short Architecture Decision Records (ADRs) in `docs/adr/`, numbered and
append-only. One file per significant, hard-to-reverse decision.

## Consequences

- Decisions are traceable and citable in issues/PRs.
- Superseded ADRs stay in history rather than being edited away.
