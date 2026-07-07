# The State of the Agentic Web, 2026

*A study of how 84 prominent websites treat AI agents, run on July 7, 2026 with [agent-readiness-auditor](https://github.com/asish-singh/agent-readiness-auditor) v0.2.0. A [second edition](second-edition.md) with a deeper nine check instrument ran later the same day. The raw data is in [results.csv](results.csv) and the site list in [sites.txt](sites.txt). Anyone can reproduce the study with one command, documented below.*

## Summary

AI assistants increasingly visit websites on behalf of their users. This study measured how ready the web's most prominent sites are for that traffic, across seven categories (AI companies, major SaaS, developer platforms, news and media, government and institutions, retail, and finance).

Five findings stand out.

1. **No audited site carried hidden prompt injection content.** All 69 sites that could be audited passed the safety check cleanly. The most feared risk of the agentic web is, at least on its front doors, not yet a mainstream reality.
2. **Nearly one in five sites simply refuses automated visitors.** 15 of 84 sites (18%) returned an access denied response to a politely identified automated client. Notably, that group includes several AI companies themselves. The strictest bouncers are the people building the guests.
3. **The llms.txt standard has real but minority adoption.** 25 of 69 audited sites (36%) publish one. Adoption is strongest among SaaS and developer platforms and nearly absent among government and news sites.
4. **Almost everyone has a robots.txt, almost nobody addresses AI in it.** Only 18 of 69 sites (26%) give AI crawlers explicit rules. The rest leave agents to guess from rules written for a search engine era.
5. **SaaS companies are the best prepared category and governments the least.** Major SaaS averaged 84 of 100. Government and institutional sites averaged 65, with two scoring in the D range.

## The scoreboard

Average score of audited sites, by category.

| Category | Average score | Sites refusing automated access |
|---|---|---|
| Major SaaS | 84 | 1 of 20 |
| Developer platforms | 80 | 1 of 10 |
| News and media | 78 | 3 of 12 |
| AI companies | 74 | 3 of 10 |
| Retail and consumer | 73 | 4 of 12 |
| Finance | 72 | 2 of 10 |
| Government and institutions | 65 | 1 of 10 |

Overall average, 76.6 of 100. Grade distribution, 18 As, 31 Bs, 15 Cs, 5 Ds, and no Fs.

## The honor roll

Four sites earned a perfect 100. **monday.com**, **calendly.com**, **netlify.com**, and **cloudflare.com**. Each passed the safety check, publishes llms.txt, addresses AI crawlers explicitly in robots.txt, serves structured data, and presents a full accountability surface.

Fourteen more earned an A, among them Stripe, Shopify, Atlassian, Asana, Vercel, PayPal, Target, and (alone among the AI labs' own sites that allow auditing) Cohere and DeepMind.

Sites that scored poorly are not named individually here; the point of the study is the state of the web, not a wall of shame. Category averages tell that story, and the full data is in the CSV for anyone who wants it.

## The irony finding

Of the ten AI company sites in the study, three could not be audited at all because they block automated clients outright. The companies whose agents browse the web for millions of users are, as a group, the least willing to let an automated client read their own homepages. There are defensible reasons (these sites are heavily targeted by scrapers), but the double standard is worth naming as the industry writes its norms for agent access.

## Method

- **Instrument.** agent-readiness-auditor v0.2.0, which fetches a site's landing page, robots.txt, and llms.txt, then scores five checks. Hidden prompt injection content (40 points), llms.txt (15), the robots.txt stance on AI crawlers (15), structured data (15), and accountability links (15). The weighting rationale is documented in [the product decision record](../../docs/decisions/why-these-checks.md).
- **Sample.** 84 sites chosen to represent seven categories of prominent, high traffic destinations. The list is curated, not algorithmic, and is published in full in [sites.txt](sites.txt).
- **Run.** One batch invocation on July 7, 2026 from a residential network. Sites returning access denied or errors are reported as unauditable rather than scored.

Reproduce it yourself.

```bash
npx agent-readiness-auditor --batch sites.txt --csv > results.csv
```

## Limitations, stated plainly

- The auditor reads raw HTML only. Sites that render everything with client side JavaScript may under score on structured data.
- A landing page is a front door, not a whole building. Hidden injection content could exist on deeper pages this study did not visit.
- Blocking one polite automated client does not prove a site blocks all agents; some sites allowlist known AI crawlers while refusing unknown ones.
- Scores reflect a single day. Sites change, and this study is designed to be rerun.

## What site owners should take from this

The gap between an average site and a perfect score is usually two afternoons of work. Publish an llms.txt, write three lines about AI crawlers into robots.txt, and add structured data to the landing page. The safety bar, for now, is being cleared by everyone. The readability bar is where the web is quietly sorting itself into sites agents can work with and sites they will route around.
