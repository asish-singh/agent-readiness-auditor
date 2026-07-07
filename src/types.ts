/** Shared types for the auditor. */

export interface SiteContext {
  /** Normalized origin, e.g. "https://example.com" */
  origin: string;
  /** Raw HTML of the landing page. */
  html: string;
  /** Contents of /robots.txt, or null if missing. */
  robotsTxt: string | null;
  /** Contents of /llms.txt, or null if missing. */
  llmsTxt: string | null;
  /** Contents of /sitemap.xml, or null if missing. */
  sitemapXml?: string | null;
  /** Additional crawled pages beyond the landing page. */
  pages?: { url: string; html: string }[];
}

export type Severity = "pass" | "warn" | "fail";

export interface Finding {
  /** Machine id, e.g. "llms-txt-present". */
  id: string;
  /** Human-readable check name. */
  title: string;
  severity: Severity;
  /** Points awarded out of `max` for this check. */
  score: number;
  max: number;
  /** One-line explanation of the result. */
  detail: string;
  /** Actionable next step when not a full pass. */
  remediation?: string;
}

export interface Check {
  id: string;
  title: string;
  run(ctx: SiteContext): Finding;
}

export interface AuditReport {
  origin: string;
  score: number;
  maxScore: number;
  grade: string;
  findings: Finding[];
}
