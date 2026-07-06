#!/usr/bin/env node
import { fetchSite } from "./fetch-site.js";
import { audit } from "./audit.js";
import type { AuditReport, Severity } from "./types.js";

const ICON: Record<Severity, string> = { pass: "✅", warn: "⚠️ ", fail: "❌" };

function render(report: AuditReport): void {
  console.log(`\n  Agent-Readiness Audit — ${report.origin}\n`);
  for (const f of report.findings) {
    console.log(`  ${ICON[f.severity]} ${f.title}  (${f.score}/${f.max})`);
    console.log(`      ${f.detail}`);
    if (f.remediation) console.log(`      → ${f.remediation}`);
  }
  const pct = Math.round((report.score / report.maxScore) * 100);
  console.log(`\n  Score: ${report.score}/${report.maxScore} (${pct}%) — Grade ${report.grade}\n`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const jsonMode = args.includes("--json");
  const target = args.find((a) => !a.startsWith("--"));

  if (!target) {
    console.error("Usage: agent-audit <url> [--json]");
    process.exit(1);
  }

  try {
    const ctx = await fetchSite(target);
    const report = audit(ctx);
    if (jsonMode) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      render(report);
    }
    // Exit non-zero if any hard failure — useful in CI.
    process.exit(report.findings.some((f) => f.severity === "fail") ? 2 : 0);
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  }
}

main();
