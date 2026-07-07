import * as cheerio from "cheerio";
import type { Check, Finding, SiteContext } from "../types.js";

/**
 * Phrases that, when found in hidden page content, are classic attempts to
 * hijack an AI agent reading the page (indirect prompt injection).
 */
const STRONG_PHRASES = [
  "ignore previous instructions",
  "ignore all previous",
  "ignore prior instructions",
  "disregard the above",
  "disregard previous",
  "reveal your instructions",
  "do not tell the user",
];

/**
 * Weaker signals that appear in ordinary writing about AI ("as an AI", a news
 * caption mentioning a system prompt). These only count inside deliberately
 * hidden elements, never in attributes or comments, to avoid flagging
 * journalism and documentation as attacks.
 */
const WEAK_PHRASES = ["new instructions:", "you are now", "system prompt", "as an ai"];

const HIDDEN_CONTENT_PHRASES = [...STRONG_PHRASES, ...WEAK_PHRASES];

/**
 * Normalizes text before phrase matching so unicode tricks can't slip
 * payloads past the detector: zero-width characters are stripped and
 * compatibility forms (fullwidth letters, ligatures) are folded to ASCII.
 */
function normalize(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[\u200B-\u200F\u2060\uFEFF\u00AD]/g, "")
    .toLowerCase();
}

/** Heuristics for content a human can't see but an agent still parses. */
function isHidden(style: string | undefined, el: cheerio.Cheerio<any>): boolean {
  const s = (style || "").toLowerCase();
  if (s.includes("display:none") || s.includes("display: none")) return true;
  if (s.includes("visibility:hidden") || s.includes("visibility: hidden")) return true;
  if (/font-size:\s*0/.test(s)) return true;
  if (/opacity:\s*0(?![.\d])/.test(s)) return true;
  // Off-screen positioning: large negative offsets or text-indent.
  if (/(?:left|top|right|bottom):\s*-\d{3,}/.test(s)) return true;
  if (/text-indent:\s*-\d{3,}/.test(s)) return true;
  if (el.attr("hidden") !== undefined) return true;
  if (el.attr("aria-hidden") === "true") return true;
  return false;
}

/** Attributes agents read that humans rarely see rendered. */
const SHADOW_ATTRS = ["alt", "title", "aria-label", "aria-description"];

function scanHtml(html: string, hits: Set<string>): void {
  const $ = cheerio.load(html);

  // Hidden DOM content.
  $("[style], [hidden], [aria-hidden]").each((_, node) => {
    const el = $(node);
    if (!isHidden(el.attr("style"), el)) return;
    const text = normalize(el.text());
    for (const phrase of HIDDEN_CONTENT_PHRASES) {
      if (text.includes(phrase)) hits.add(phrase);
    }
  });

  // Attribute payloads (alt, title, aria-label) on any element.
  $("*").each((_, node) => {
    const el = $(node);
    for (const attr of SHADOW_ATTRS) {
      const value = el.attr(attr);
      if (!value) continue;
      const text = normalize(value);
      for (const phrase of STRONG_PHRASES) {
        if (text.includes(phrase)) hits.add(`${phrase} (in ${attr} attribute)`);
      }
    }
  });

  // HTML comments, which agents parsing raw HTML still read.
  const comments = html.match(/<!--([\s\S]*?)-->/g) ?? [];
  for (const c of comments) {
    const text = normalize(c);
    for (const phrase of STRONG_PHRASES) {
      if (text.includes(phrase)) hits.add(`${phrase} (in HTML comment)`);
    }
  }
}

/**
 * Scans hidden DOM content, shadow attributes, HTML comments, and every
 * crawled page for indirect prompt-injection payloads, the core agentic-web
 * safety risk. Visible marketing copy is intentionally ignored.
 */
export const promptInjectionCheck: Check = {
  id: "prompt-injection-hidden",
  title: "No hidden prompt-injection payloads",
  run(ctx: SiteContext): Finding {
    const base = { id: this.id, title: this.title, max: 40 } as const;
    const hits = new Set<string>();
    const pages = [ctx.html, ...(ctx.pages ?? []).map((p) => p.html)];
    for (const html of pages) scanHtml(html, hits);

    if (hits.size === 0) {
      return {
        ...base,
        severity: "pass",
        score: 40,
        detail: `No injection-style phrases found in hidden content across ${pages.length} page(s).`,
      };
    }
    return {
      ...base,
      severity: "fail",
      score: 0,
      detail: `Hidden content contains injection-style phrases: ${[...hits].join("; ")}.`,
      remediation:
        "Remove hidden text targeting AI agents. This is the top indirect-prompt-injection risk.",
    };
  },
};
