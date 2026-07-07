#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fetchSite } from "./fetch-site.js";
import { audit } from "./audit.js";
import { auditMany, toCsv } from "./batch.js";
import type { AuditReport, Severity } from "./types.js";

const ICON: Record<Severity, string> = { pass: "✅", warn: "⚠️ ", fail: "❌" };

function render(report: AuditReport): void {
  console.log(`\n  Agent readiness audit for ${report.origin}\n`);
  for (const f of report.findings) {
    console.log(`  ${ICON[f.severity]} ${f.title}  (${f.score}/${f.max})`);
    console.log(`      ${f.detail}`);
    if (f.remediation) console.log(`      Fix: ${f.remediation}`);
  }
  const pct = Math.round((report.score / report.maxScore) * 100);
  console.log(`\n  Score: ${report.score}/${report.maxScore} (${pct}%)   Grade ${report.grade}\n`);
}

function usage(): never {
  console.error("Usage: agent-audit <url> [--json]");
  console.error("       agent-audit --batch <file> [--json | --csv]");
  process.exit(1);
}

async function runBatch(file: string, jsonMode: boolean, csvMode: boolean): Promise<void> {
  const targets = readFileSync(file, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  if (targets.length === 0) {
    console.error(`No URLs found in ${file}. One URL per line; # starts a comment.`);
    process.exit(1);
  }
  const results = await auditMany(targets, 5, (done, total, target) => {
    if (!jsonMode && !csvMode) console.error(`  [${done}/${total}] ${target}`);
  });
  if (csvMode) {
    process.stdout.write(toCsv(results));
  } else if (jsonMode) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    for (const r of results) {
      if (r.report) render(r.report);
      else console.log(`\n  Could not audit ${r.target}: ${r.error}\n`);
    }
  }
  process.exit(results.some((r) => r.report?.findings.some((f) => f.severity === "fail")) ? 2 : 0);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const jsonMode = args.includes("--json");
  const csvMode = args.includes("--csv");
  const batchIdx = args.indexOf("--batch");

  if (batchIdx !== -1) {
    const file = args[batchIdx + 1];
    if (!file || file.startsWith("--")) usage();
    await runBatch(file, jsonMode, csvMode);
    return;
  }

  const target = args.find((a: string) => !a.startsWith("--"));
  if (!target) usage();

  try {
    const ctx = await fetchSite(target);
    const report = audit(ctx);
    if (jsonMode) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      render(report);
    }
    // Exit non-zero if any hard failure, which is useful in CI.
    process.exit(report.findings.some((f) => f.severity === "fail") ? 2 : 0);
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  }
}

main();
