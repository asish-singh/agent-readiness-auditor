import * as cheerio from "cheerio";
import type { Check, Finding, SiteContext } from "../types.js";

/** Schema.org types that AI answers quote most readily. */
const ANSWER_TYPES = /"@type"\s*:\s*"(FAQPage|QAPage|HowTo)"/;

/**
 * Checks whether the site publishes content in the shapes AI assistants
 * actually cite: FAQ, Q&A, or HowTo structured data, or at least
 * question-styled headings.
 */
export const answerabilityCheck: Check = {
  id: "answerability",
  title: "Content structured for AI answers",
  run(ctx: SiteContext): Finding {
    const base = { id: this.id, title: this.title, max: 5 } as const;
    const pages = [ctx.html, ...(ctx.pages ?? []).map((p) => p.html)];

    for (const html of pages) {
      const $ = cheerio.load(html);
      const hit = $('script[type="application/ld+json"]')
        .toArray()
        .some((n) => ANSWER_TYPES.test($(n).text()));
      if (hit) {
        return {
          ...base,
          severity: "pass",
          score: 5,
          detail: "Found FAQ/QA/HowTo structured data, the format AI answers quote most readily.",
        };
      }
    }

    const questionHeadings = pages.some((html) => {
      const $ = cheerio.load(html);
      return $("h1,h2,h3")
        .toArray()
        .some((n) => /\?\s*$/.test($(n).text().trim()));
    });
    if (questionHeadings) {
      return {
        ...base,
        severity: "warn",
        score: 2,
        detail: "Question-styled headings found, but no FAQ/QA/HowTo structured data.",
        remediation: "Mark up your FAQ or how-to content with schema.org FAQPage or HowTo JSON-LD.",
      };
    }
    return {
      ...base,
      severity: "warn",
      score: 0,
      detail: "No FAQ/QA/HowTo structured data or question-styled content found.",
      remediation:
        "Publish a FAQ or how-to page with schema.org markup; it is the content AI answers cite most.",
    };
  },
};
