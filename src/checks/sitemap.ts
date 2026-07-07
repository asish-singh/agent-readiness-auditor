import type { Check, Finding, SiteContext } from "../types.js";

/**
 * Checks for a sitemap, which tells crawlers (search and AI alike) what the
 * site contains beyond the landing page. Full credit for a reachable
 * /sitemap.xml; partial credit if robots.txt references one we could not fetch.
 */
export const sitemapCheck: Check = {
  id: "sitemap-present",
  title: "Sitemap present",
  run(ctx: SiteContext): Finding {
    const base = { id: this.id, title: this.title, max: 5 } as const;
    if (ctx.sitemapXml && ctx.sitemapXml.trim().length > 0) {
      return {
        ...base,
        severity: "pass",
        score: 5,
        detail: "Found /sitemap.xml, so crawlers can discover the whole site.",
      };
    }
    if (ctx.robotsTxt && /sitemap:/i.test(ctx.robotsTxt)) {
      return {
        ...base,
        severity: "warn",
        score: 3,
        detail: "robots.txt references a sitemap, but /sitemap.xml itself was not reachable.",
        remediation: "Make sure the sitemap URL in robots.txt is live and correct.",
      };
    }
    return {
      ...base,
      severity: "warn",
      score: 0,
      detail: "No sitemap found.",
      remediation: "Publish a /sitemap.xml and reference it from robots.txt.",
    };
  },
};
