# The State of the Agentic Web, Second Edition

*A rerun of the [original study](README.md) with a substantially deeper instrument, agent-readiness-auditor v0.4.1, on July 7, 2026. Same 84 sites, same categories, but the audit now crawls up to five pages per site instead of one, detects four additional hiding techniques for prompt injection, and scores four new signals. Raw data in [results-second-edition.csv](results-second-edition.csv).*

## Why a second edition

The first edition read only each site's landing page and ran five checks. Fair questions followed. Would hidden prompt injection show up on deeper pages? Does the web look better or worse under a stricter lens? The instrument grew (nine checks, multi page crawling, unicode and attribute level injection detection), so the study was rerun the same day the deeper tool shipped. Where the first edition measured the front door, this one walks partway into the building.

## The five findings

1. **The safety result survives a much harder test.** Even scanning roughly five pages per site, checking image alt text, tooltips, HTML comments, and unicode obfuscation tricks, not one audited site carries hidden prompt injection content. The agentic web's most feared attack is still not visible on the mainstream web's surface.

2. **Nobody is perfect anymore.** Under the first edition, four sites scored 100. Under the deeper audit, none do, and five sites lost their A grade. The new bar that almost everyone misses is answerability. Only 9 of 69 sites (13%) publish FAQ or HowTo structured data, the exact content shapes AI assistants quote when composing answers. The web has learned to be readable; it has not learned to be quotable.

3. **Two government portals hide themselves by accident.** The audit found landing pages carrying noindex directives at two of the ten government and institutional sites studied, which quietly removes them from search and AI answers alike. This is the digital equivalent of locking the front door and forgetting you did it. No commercial site in the study made this mistake.

4. **The MCP doorway stands unadvertised.** Zero of 69 sites advertise a Model Context Protocol or agent facing endpoint. The standard that lets AI assistants use websites as tools is growing quickly among developers, yet not one prominent site signals support for it where agents would look. First movers here will have the channel to themselves.

5. **The averages barely moved, which is itself the story.** The overall average is 77.3 versus 76.6 in the first edition, on a rebalanced but comparable 100 point scale. The web did not get better or worse in a day; the measurement got sharper, and sharper measurement redistributed the top. Leaders under the old test (Calendly at 98, monday.com, Netlify, and Cloudflare at 95) remain leaders under the new one, they just no longer look finished.

## Grade distribution

13 As, 33 Bs, 18 Cs, 5 Ds, no Fs, and the same 15 sites still refuse automated visitors entirely (their absence is unchanged from the first edition, including three AI companies).

## What changed in the instrument

| | First edition | Second edition |
|---|---|---|
| Checks | 5 | 9 |
| Pages read per site | 1 | Up to 5 |
| Injection techniques detected | CSS hiding | CSS hiding, off screen positioning, zero width unicode, alt/title/aria attributes, HTML comments |
| New signals | | Sitemap, answerability, accidental noindex, MCP endpoint (informational, unscored) |

One honest note on method. During this rerun the deeper detector initially flagged a news site over an image caption that merely mentioned AI. That was a false positive, it was fixed before publication (weak phrases now count only inside deliberately hidden content), and the fix shipped as v0.4.1 with regression tests. Studies should say these things out loud.

## Reproduce it

```bash
npx agent-readiness-auditor --batch sites.txt --csv > results.csv
```

The site list is unchanged from the [first edition](sites.txt). Sites scoring poorly are aggregated rather than named, as before; the full data is in the CSV for anyone who wants it.
