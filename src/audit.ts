import type { AuditReport, Check, SiteContext } from "./types.js";
import { llmsTxtCheck } from "./checks/llms-txt.js";
import { robotsAiCheck } from "./checks/robots-ai.js";
import { promptInjectionCheck } from "./checks/prompt-injection.js";
import { structuredDataCheck } from "./checks/structured-data.js";
import { transparencyCheck } from "./checks/transparency.js";

/** Registry of all checks. Add new checks here; the score total adjusts automatically. */
export const CHECKS: Check[] = [
  promptInjectionCheck,
  llmsTxtCheck,
  robotsAiCheck,
  structuredDataCheck,
  transparencyCheck,
];

function gradeFor(pct: number): string {
  if (pct >= 90) return "A";
  if (pct >= 75) return "B";
  if (pct >= 60) return "C";
  if (pct >= 40) return "D";
  return "F";
}

/** Runs every registered check against a fetched site and aggregates a score. */
export function audit(ctx: SiteContext): AuditReport {
  const findings = CHECKS.map((c) => c.run(ctx));
  const score = findings.reduce((s, f) => s + f.score, 0);
  const maxScore = findings.reduce((s, f) => s + f.max, 0);
  const pct = maxScore === 0 ? 0 : (score / maxScore) * 100;
  return {
    origin: ctx.origin,
    score,
    maxScore,
    grade: gradeFor(pct),
    findings,
  };
}
