import { test } from "node:test";
import assert from "node:assert/strict";
import { toCsv } from "../src/batch.js";
import type { BatchResult } from "../src/batch.js";

const okResult: BatchResult = {
  target: "example.com",
  report: {
    origin: "https://example.com",
    score: 55,
    maxScore: 100,
    grade: "C",
    findings: [
      { id: "prompt-injection-hidden", title: "t", severity: "pass", score: 40, max: 40, detail: "d" },
      { id: "llms-txt-present", title: "t", severity: "warn", score: 15, max: 15, detail: "d" },
    ],
  },
};

const failedResult: BatchResult = {
  target: "unreachable.example",
  report: null,
  error: 'fetch failed, "timeout"',
};

test("toCsv renders one row per site with a column per check", () => {
  const csv = toCsv([okResult, failedResult]);
  const [header, row1, row2] = csv.trim().split("\n");
  assert.equal(
    header,
    "target,origin,score,max_score,grade,prompt-injection-hidden,llms-txt-present,error",
  );
  assert.equal(row1, "example.com,https://example.com,55,100,C,40,15,");
  assert.ok(row2.startsWith("unreachable.example,,,,,,,"));
});

test("toCsv escapes quotes and commas in error messages", () => {
  const csv = toCsv([failedResult]);
  assert.ok(csv.includes('"fetch failed, ""timeout"""'));
});
