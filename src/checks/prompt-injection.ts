import * as cheerio from "cheerio";
import type { Check, Finding, SiteContext } from "../types.js";

/**
 * Phrases that, when found in hidden page content, are classic attempts to
 * hijack an AI agent reading the page (indirect prompt injection).
 */
const INJECTION_PHRASES = [
  "ignore previous instructions",
  "ignore all previous",
  "disregard the above",
  "you are now",
  "system prompt",
  "as an ai",
  "reveal your instructions",
  "do not tell the user",
];

/** Heuristics for content a human can't see but an agent still parses. */
function isHidden(style: string | undefined, el: cheerio.Cheerio<any>): boolean {
  const s = (style || "").toLowerCase();
  if (s.includes("display:none") || s.includes("display: none")) return true;
  if (s.includes("visibility:hidden") || s.includes("visibility: hidden")) return true;
  if (/font-size:\s*0/.test(s)) return true;
  if (/opacity:\s*0/.test(s)) return true;
  if (el.attr("hidden") !== undefined) return true;
  if (el.attr("aria-hidden") === "true") return true;
  return false;
}

/**
 * Scans hidden DOM content for indirect prompt-injection payloads — the core
 * "agentic web" safety risk. Visible marketing copy is intentionally ignored.
 */
export const promptInjectionCheck: Check = {
  id: "prompt-injection-hidden",
  title: "No hidden prompt-injection payloads",
  run(ctx: SiteContext): Finding {
    const base = { id: this.id, title: this.title, max: 40 } as const;
    const $ = cheerio.load(ctx.html);
    const hits: string[] = [];

    $("[style], [hidden], [aria-hidden]").each((_, node) => {
      const el = $(node);
      if (!isHidden(el.attr("style"), el)) return;
      const text = el.text().toLowerCase();
      for (const phrase of INJECTION_PHRASES) {
        if (text.includes(phrase)) hits.push(phrase);
      }
    });

    if (hits.length === 0) {
      return {
        ...base,
        severity: "pass",
        score: 40,
        detail: "No injection-style phrases found in hidden page content.",
      };
    }
    return {
      ...base,
      severity: "fail",
      score: 0,
      detail: `Hidden content contains injection-style phrases: ${[...new Set(hits)].join("; ")}.`,
      remediation:
        "Remove hidden text targeting AI agents. This is the top indirect-prompt-injection risk.",
    };
  },
};
