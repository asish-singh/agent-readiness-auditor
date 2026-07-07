# Product decision. What to score, and why safety outweighs everything else

*Written after shipping v0.1. This is a product decision record. The architecture equivalents live in [`docs/adr/`](../adr/).*

## The problem

"Is this website ready for AI agents?" is a vague question. Turning it into a score out of 100 forced three concrete decisions. Which signals to measure, how to weight them, and what to deliberately leave out.

## Decision 1. Five checks, not fifteen

The MVP ships five checks. Hidden prompt injection text, llms.txt, the robots.txt stance on AI crawlers, structured data, and accountability links. The selection rule was strict. A check made the cut only if it was measurable from a single page fetch with no browser rendering, actionable enough that the fix fits in one suggestion line, and backed by a public standard or a documented attack pattern rather than personal taste.

Several tempting checks failed that rule. Page speed is already Lighthouse's job. Content quality is subjective. Content rendered with JavaScript requires a headless browser, which triples the tool's weight for a minority of the value (recorded in [ADR 0002](../adr/0002-cli-and-fetch-only-mvp.md)).

## Decision 2. Safety is 40% of the score

Prompt injection detection is worth 40 points; every other check is worth 15. The reasoning goes like this. The four readability checks make a site *more useful* to agents, but hidden injection text makes a site *dangerous* to them, because it can hijack an agent into acting against its user. A site that is easy to read and unsafe is worse than a site that is hard to read and safe, and the weighting has to encode that or the score misleads.

This also drove the exit code design. A hard safety failure returns exit code 2, so a CI pipeline can fail a build on safety alone, regardless of the total score.

## Decision 3. Grades, not just numbers

The tool prints both a score and a letter grade from A to F. Scores are for machines and trend lines; grades are for humans deciding whether to care. "Grade D" produces a reaction that "40/100" does not. This is a communication decision as much as a scoring one, because the audience for that output line includes people who will never read the docs.

## What I'd revisit

- The split of 40/15/15/15/15 is a defensible starting point, not a measured one. If real world audits show that, say, llms.txt adoption becomes a strong differentiator, the weights should shift. That is why a config file for weights is on the [roadmap](../../ROADMAP.md) for v0.2.
- "Accountability links" is the softest check of the five. It stays because agents (and their users) need someone to contact when things go wrong, but its definition will tighten as norms emerge.
