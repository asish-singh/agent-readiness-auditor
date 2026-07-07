import * as cheerio from "cheerio";
import type { Check, Finding, SiteContext } from "../types.js";

/** Signals that a site offers agents/users a way to establish accountability. */
const CONTACT_HINTS = ["contact", "privacy", "terms", "about"];

/**
 * Checks for basic accountability surface: a reachable contact/privacy/terms
 * path. Drawn from the transparency baseline in the agentic-web governance work.
 */
export const transparencyCheck: Check = {
  id: "transparency-contact",
  title: "Accountability surface present",
  run(ctx: SiteContext): Finding {
    const base = { id: this.id, title: this.title, max: 9 } as const;
    const $ = cheerio.load(ctx.html);
    const found = new Set<string>();

    $("a[href]").each((_, node) => {
      const href = ($(node).attr("href") || "").toLowerCase();
      for (const hint of CONTACT_HINTS) {
        if (href.includes(hint)) found.add(hint);
      }
    });

    if (found.size >= 2) {
      return {
        ...base,
        severity: "pass",
        score: 9,
        detail: `Accountability links present: ${[...found].join(", ")}.`,
      };
    }
    if (found.size === 1) {
      return {
        ...base,
        severity: "warn",
        score: 5,
        detail: `Only one accountability link found: ${[...found].join(", ")}.`,
        remediation: "Add contact, privacy, and terms links so agents can establish accountability.",
      };
    }
    return {
      ...base,
      severity: "warn",
      score: 0,
      detail: "No contact/privacy/terms links found on the landing page.",
      remediation: "Add contact, privacy, and terms links reachable from the landing page.",
    };
  },
};
