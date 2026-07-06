# 1. Record architecture decisions

- Status: Accepted
- Date: 2026-07-07

## Context

Even small projects build up decisions, such as why the tool is a command-line program or why it reads raw HTML. These reasons are easy to lose. Reviewers and future maintainers need to know why a choice was made, not just what changed in the code.

## Decision

Keep short architecture decision records (ADRs) in `docs/adr/`. Number them in order and add to them rather than rewriting them. Write one file per significant, hard-to-reverse decision.

## Consequences

- Decisions can be traced and referenced from issues and pull requests.
- When a decision is replaced, the old record stays in history rather than being deleted.
