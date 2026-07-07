/** Batch auditing. Runs the audit across many URLs with limited concurrency. */
import { fetchSite } from "./fetch-site.js";
import { audit } from "./audit.js";
import type { AuditReport } from "./types.js";

export interface BatchResult {
  target: string;
  report: AuditReport | null;
  /** Set when the site could not be fetched or audited. */
  error?: string;
}

/** Audits every URL in the list, a few at a time, and preserves input order. */
export async function auditMany(
  targets: string[],
  concurrency = 5,
  onProgress?: (done: number, total: number, target: string) => void,
): Promise<BatchResult[]> {
  const results: BatchResult[] = new Array(targets.length);
  let next = 0;
  let done = 0;

  async function worker(): Promise<void> {
    while (next < targets.length) {
      const i = next++;
      const target = targets[i];
      try {
        const ctx = await fetchSite(target);
        results[i] = { target, report: audit(ctx) };
      } catch (err) {
        results[i] = { target, report: null, error: (err as Error).message };
      }
      done++;
      onProgress?.(done, targets.length, target);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, targets.length) }, worker),
  );
  return results;
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Renders batch results as CSV, one row per site plus a column per check. */
export function toCsv(results: BatchResult[]): string {
  const checkIds = results.find((r) => r.report)?.report!.findings.map((f) => f.id) ?? [];
  const header = ["target", "origin", "score", "max_score", "grade", ...checkIds, "error"];
  const rows = results.map((r) => {
    if (!r.report) {
      return [r.target, "", "", "", "", ...checkIds.map(() => ""), r.error ?? "unknown error"];
    }
    const byId = new Map(r.report.findings.map((f) => [f.id, f.score]));
    return [
      r.target,
      r.report.origin,
      String(r.report.score),
      String(r.report.maxScore),
      r.report.grade,
      ...checkIds.map((id) => String(byId.get(id) ?? "")),
      "",
    ];
  });
  return [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n") + "\n";
}
