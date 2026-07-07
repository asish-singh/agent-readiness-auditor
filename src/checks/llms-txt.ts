import type { Check, Finding, SiteContext } from "../types.js";

/**
 * Checks for an llms.txt file, the emerging convention for giving AI agents
 * a curated, machine-friendly map of a site. See https://llmstxt.org.
 */
export const llmsTxtCheck: Check = {
  id: "llms-txt-present",
  title: "llms.txt present",
  run(ctx: SiteContext): Finding {
    const base = { id: this.id, title: this.title, max: 12 } as const;
    if (ctx.llmsTxt && ctx.llmsTxt.trim().length > 0) {
      return {
        ...base,
        severity: "pass",
        score: 12,
        detail: "Found /llms.txt, so agents get a curated map of the site.",
      };
    }
    return {
      ...base,
      severity: "warn",
      score: 0,
      detail: "No /llms.txt found.",
      remediation:
        "Add an /llms.txt listing your key pages so agents index the right content. See https://llmstxt.org.",
    };
  },
};
