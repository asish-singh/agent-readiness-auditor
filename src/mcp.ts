#!/usr/bin/env node
/**
 * MCP server entry point. Exposes the audit engine to AI assistants over
 * the Model Context Protocol (stdio transport), so an assistant can run
 * an audit when a user asks for one in plain language.
 */
import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const { version } = createRequire(import.meta.url)("../package.json");
import { fetchSite } from "./fetch-site.js";
import { audit } from "./audit.js";
import type { AuditReport } from "./types.js";

function summarize(report: AuditReport): string {
  const pct = Math.round((report.score / report.maxScore) * 100);
  const lines = report.findings.map((f) => {
    const status = f.severity === "pass" ? "PASS" : f.severity === "warn" ? "WARN" : "FAIL";
    const fix = f.remediation ? ` Suggested fix. ${f.remediation}` : "";
    return `${status} ${f.title} (${f.score}/${f.max}). ${f.detail}${fix}`;
  });
  return [
    `Agent readiness audit for ${report.origin}`,
    `Score ${report.score}/${report.maxScore} (${pct}%), grade ${report.grade}.`,
    ...lines,
  ].join("\n");
}

const server = new McpServer({
  name: "agent-readiness-auditor",
  version,
});

server.registerTool(
  "audit_site",
  {
    title: "Audit a website for AI agent readiness",
    description:
      "Fetches a website (crawling multiple pages) and scores how well it works with, and defends against, AI agents. " +
      "Runs nine checks: hidden prompt injection text, llms.txt, the robots.txt stance on AI crawlers, " +
      "structured data, accountability links, sitemap, content structured for AI answers, " +
      "accidental index blocking, and whether an agent endpoint (such as MCP) is advertised. " +
      "Returns a score out of 100, a letter grade, and a finding for each check with a suggested fix.",
    inputSchema: {
      url: z
        .string()
        .describe("The site to audit, as a bare domain (example.com) or full URL"),
    },
  },
  async ({ url }) => {
    try {
      const ctx = await fetchSite(url);
      const report = audit(ctx);
      return {
        content: [
          { type: "text", text: summarize(report) },
          { type: "text", text: JSON.stringify(report, null, 2) },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `The audit could not be completed. ${(err as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
