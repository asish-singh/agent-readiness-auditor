import * as cheerio from "cheerio";
import type { Check, Finding, SiteContext } from "../types.js";

/**
 * Checks the landing page's meta robots directives for values that remove
 * the site from search and AI indexes, which is usually an accident left
 * over from a staging deploy.
 */
export const metaRobotsCheck: Check = {
  id: "meta-robots",
  title: "No accidental index blocking",
  run(ctx: SiteContext): Finding {
    const base = { id: this.id, title: this.title, max: 5 } as const;
    const $ = cheerio.load(ctx.html);
    const content = (
      $('meta[name="robots"]').attr("content") || ""
    ).toLowerCase();

    const blocking = ["noindex", "none", "noai", "noimageai"].filter((d) =>
      content.includes(d),
    );
    if (blocking.length > 0) {
      return {
        ...base,
        severity: "warn",
        score: 0,
        detail: `The landing page's meta robots tag blocks indexing: ${blocking.join(", ")}.`,
        remediation:
          "Remove the blocking directive unless it is deliberate; it hides the site from search and AI answers alike.",
      };
    }
    return {
      ...base,
      severity: "pass",
      score: 5,
      detail: "No blocking meta robots directives on the landing page.",
    };
  },
};
