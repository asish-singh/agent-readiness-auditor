import * as cheerio from "cheerio";
import type { Check, Finding, SiteContext } from "../types.js";

/**
 * Checks for machine-readable structured data (JSON-LD / schema.org), which
 * lets agents understand a page's entities rather than guessing from prose.
 */
export const structuredDataCheck: Check = {
  id: "structured-data",
  title: "Machine-readable structured data",
  run(ctx: SiteContext): Finding {
    const base = { id: this.id, title: this.title, max: 15 } as const;
    const $ = cheerio.load(ctx.html);
    const jsonLd = $('script[type="application/ld+json"]').length;

    if (jsonLd > 0) {
      return {
        ...base,
        severity: "pass",
        score: 15,
        detail: `Found ${jsonLd} JSON-LD block(s), so agents can parse page entities.`,
      };
    }
    return {
      ...base,
      severity: "warn",
      score: 0,
      detail: "No JSON-LD structured data found.",
      remediation:
        "Add schema.org JSON-LD so agents extract entities reliably instead of scraping prose.",
    };
  },
};
