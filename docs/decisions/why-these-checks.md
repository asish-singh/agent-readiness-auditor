# Product decision: what to score, and why safety outweighs everything else

*Written after shipping v0.1. This is a product decision record — the architecture equivalents live in [`docs/adr/`](../adr/).*

## The problem

"Is this website ready for AI agents?" is a vague question. Turning it into a 0–100 score forced three concrete decisions: which signals to measure, how to weight them, and what to deliberately leave out.

## Decision 1: five checks, not fifteen

The MVP ships five checks: hidden prompt-injection text, `llms.txt`, `robots.txt` stance on AI crawlers, structured data, and accountability links. The selection rule was strict: a check made the cut only if it was (a) measurable from a single page fetch with no browser rendering, (b) actionable — the fix fits in one suggestion line, and (c) backed by a public standard or a documented attack pattern, not personal taste.

Several tempting checks failed that rule. Page speed is already Lighthouse's job. Content quality is subjective. JavaScript-rendered content requires a headless browser, which triples the tool's weight for a minority of the value (recorded in [ADR-0002](../adr/0002-cli-and-fetch-only-mvp.md)).

## Decision 2: safety is 40% of the score

Prompt-injection detection is worth 40 points; every other check is 15. The reasoning: the four readability checks make a site *more useful* to agents, but hidden injection text makes a site *dangerous* to them — it can hijack an agent into acting against its user. A site that is easy to read and unsafe is worse than a site that is hard to read and safe, and the weighting has to encode that or the score misleads.

This also drove the exit-code design: a hard safety failure returns exit code `2`, so a CI pipeline can fail a build on safety alone, regardless of the total score.

## Decision 3: grades, not just numbers

The tool prints both a score and a letter grade (A–F). Scores are for machines and trend lines; grades are for humans deciding whether to care. "Grade D" produces a reaction that "40/100" does not. This is a communication decision as much as a scoring one — the audience for the output line includes people who will never read the docs.

## What I'd revisit

- The 40/15/15/15/15 split is a defensible starting point, not a measured one. If real-world audits show, say, `llms.txt` adoption becoming a strong differentiator, the weights should shift — which is why a config file for weights is on the [roadmap](../../ROADMAP.md) (v0.2).
- "Accountability links" is the softest check of the five. It stays because agents (and their users) need someone to contact when things go wrong, but its definition will tighten as norms emerge.
