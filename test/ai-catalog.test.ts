import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describeEntries, hasUntypedMcpEntry, parseAiCatalog } from "../src/ai-catalog.js";
import { mcpSignalCheck } from "../src/checks/mcp-signal.js";
import type { SiteContext } from "../src/types.js";

// Real catalogs served by github.com and buildkite.com on 2026-10-11.
const github = readFileSync(new URL("./fixtures/ai-catalog-github.json", import.meta.url), "utf8");
const buildkite = readFileSync(new URL("./fixtures/ai-catalog-buildkite.json", import.meta.url), "utf8");

function ctx(extra: Partial<SiteContext> = {}): SiteContext {
  return { origin: "https://t.example", html: "", robotsTxt: null, llmsTxt: null, ...extra };
}

test("live catalogs from GitHub and Buildkite validate", () => {
  const gh = parseAiCatalog(github);
  assert.ok(gh?.valid, gh?.problems.join("; "));
  assert.equal(gh.specVersion, "1.0");
  assert.equal(gh.entries[0].type, "application/mcp-server-card+json");

  const bk = parseAiCatalog(buildkite);
  assert.ok(bk?.valid, bk?.problems.join("; "));
  assert.equal(bk.hostName, "Buildkite");
});

test("an HTML soft 404 is not mistaken for a catalog", () => {
  assert.equal(parseAiCatalog("<!doctype html><title>Not found</title>"), null);
  assert.equal(parseAiCatalog("[]"), null);
  assert.equal(parseAiCatalog("OK"), null);
});

test("an empty entries array is valid", () => {
  const r = parseAiCatalog('{"specVersion":"1.0","entries":[]}');
  assert.ok(r?.valid);
  assert.equal(describeEntries(r.entries), "no entries");
});

test("required fields are enforced", () => {
  const r = parseAiCatalog('{"entries":{}}');
  assert.equal(r?.valid, false);
  assert.ok(r.problems.some((p) => p.includes("specVersion")));
  assert.ok(r.problems.some((p) => p.includes("entries")));

  const badVersion = parseAiCatalog('{"specVersion":"1","entries":[]}');
  assert.equal(badVersion?.valid, false);
  const future = parseAiCatalog('{"specVersion":"2.0","entries":[]}');
  assert.equal(future?.valid, false);
  const noHostName = parseAiCatalog('{"specVersion":"1.0","host":{},"entries":[]}');
  assert.equal(noHostName?.valid, false);
});

test("each entry needs identifier, type, and exactly one of url or data", () => {
  const both = parseAiCatalog(
    '{"specVersion":"1.0","entries":[{"identifier":"a","type":"t","url":"https://x","data":{}}]}',
  );
  assert.equal(both?.valid, false);
  const neither = parseAiCatalog('{"specVersion":"1.0","entries":[{"identifier":"a","type":"t"}]}');
  assert.equal(neither?.valid, false);
  const inline = parseAiCatalog('{"specVersion":"1.0","entries":[{"identifier":"a","type":"t","data":{"x":1}}]}');
  assert.ok(inline?.valid);
  const noType = parseAiCatalog('{"specVersion":"1.0","entries":[{"identifier":"a","url":"https://x"}]}');
  assert.equal(noType?.valid, false);
});

test("identifier and version pairs must be unique", () => {
  const dup = parseAiCatalog(
    '{"specVersion":"1.0","entries":[{"identifier":"a","type":"t","url":"u"},{"identifier":"a","type":"t","url":"v"}]}',
  );
  assert.equal(dup?.valid, false);
  const versioned = parseAiCatalog(
    '{"specVersion":"1.0","entries":[{"identifier":"a","type":"t","url":"u","version":"1"},{"identifier":"a","type":"t","url":"v","version":"2"}]}',
  );
  assert.ok(versioned?.valid);
});

test("entry tally reads naturally", () => {
  const e = (type: string) => ({ identifier: type + Math.random(), type });
  assert.equal(
    describeEntries([e("application/mcp-server-card+json"), e("application/a2a-agent-card+json"), e("application/a2a-agent-card+json")]),
    "1 MCP server card and 2 A2A agent cards",
  );
});

test("mcp-signal prefers a valid catalog and never changes the score", () => {
  const f = mcpSignalCheck.run(ctx({ aiCatalog: buildkite }));
  assert.equal(f.severity, "pass");
  assert.equal(f.max, 0);
  assert.equal(f.score, 0);
  assert.ok(f.detail.includes("1 MCP server card"));
});

test("mcp-signal warns on a malformed catalog, still without points", () => {
  const f = mcpSignalCheck.run(ctx({ aiCatalog: '{"entries":[]}' }));
  assert.equal(f.severity, "warn");
  assert.equal(f.max, 0);
  assert.ok(f.remediation);
});

test("mcp-signal ignores a soft 404 and falls back to llms.txt mentions", () => {
  const f = mcpSignalCheck.run(ctx({ aiCatalog: "<html></html>", llmsTxt: "## MCP server\n- /mcp" }));
  assert.equal(f.severity, "pass");
  assert.ok(f.detail.includes("advertises"));
});

test("plural of entry reads correctly", () => {
  const e = (i: number) => ({ identifier: "x" + i, type: "text/plain" });
  assert.equal(describeEntries([e(1), e(2)]), "2 other entries");
  assert.equal(describeEntries([e(1)]), "1 other entry");
});

test("an MCP server listed without the server card type is flagged", () => {
  assert.equal(hasUntypedMcpEntry([{ identifier: "urn:air:supabase.com:mcp:server", type: "application/json" }]), true);
  assert.equal(
    hasUntypedMcpEntry([{ identifier: "urn:air:github.com:mcp:github-mcp-server", type: "application/mcp-server-card+json" }]),
    false,
  );
  assert.equal(hasUntypedMcpEntry([{ identifier: "urn:air:example.com:api:rest", type: "application/json" }]), false);
  const f = mcpSignalCheck.run(
    ctx({ aiCatalog: '{"specVersion":"1.0","entries":[{"identifier":"urn:air:s.com:mcp:server","type":"application/json","url":"https://s.com/mcp"}]}' }),
  );
  assert.equal(f.severity, "pass");
  assert.ok(f.remediation?.includes("server card"));
});
