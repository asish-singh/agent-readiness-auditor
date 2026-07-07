# Decision record. The false positive that almost named a newsroom

*July 7, 2026, written the day it happened.*

## What happened

While rerunning the State of the Agentic Web study with the new v0.4.0 audit, one result jumped out. A major news site appeared to fail the safety check, meaning the tool believed the site carried hidden content designed to hijack AI agents. That would have been the single most newsworthy finding of the study, a household name news outlet flagged for prompt injection.

## The decision point

The exciting path was to publish. The correct path was to distrust the result precisely because it was exciting. A tech news site writes about AI constantly, and a detector that matches phrases will eventually meet an article about the very thing it detects.

Investigation took ten minutes. The trigger was an image caption (an alt attribute) containing the phrase "as an AI", ordinary journalism describing a picture, not an attack. The detector, newly taught to read alt text, had no way to tell reporting about prompt injection from prompt injection itself.

## What changed

The fix distinguishes phrase strength by context. Unambiguous attack directives ("ignore previous instructions", "reveal your instructions") count anywhere. Weak phrases that occur in normal writing about AI ("as an AI", "system prompt") now count only inside deliberately hidden elements, where no innocent explanation exists. The fix shipped as v0.4.1 with regression tests (one asserting the news caption case passes, one asserting hidden weak phrases still fail), and the study was rerun on the fixed detector before anything was published.

## Why this is written down

Three lessons worth keeping.

1. **The most interesting result is the one to verify first.** Excitement and error look identical until you check.
2. **A safety tool's false positives are its own kind of harm.** Wrongly naming a site as dangerous damages trust in the site and the tool. Precision is a feature of the accusation, not just the detection.
3. **Disclose the wobble.** The second edition's method section describes this episode in public. A study that admits and documents its near miss is more credible than one that appears to have had none.
