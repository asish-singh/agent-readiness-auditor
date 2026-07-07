import type { Check, Finding, SiteContext } from "../types.js";

/**
 * Informational check (0 points): does the site advertise an MCP server or
 * other agent-facing endpoint? Conventions are young, so this detects and
 * reports without scoring, exactly so early movers are not punished for
 * guessing differently. See the decision in issue #2.
 */
const SIGNALS = [/modelcontextprotocol/i, /mcp[\s._-]?server/i, /\/mcp\b/i, /\.well-known\/mcp/i];

export const mcpSignalCheck: Check = {
  id: "mcp-signal",
  title: "Agent endpoint advertised (informational)",
  run(ctx: SiteContext): Finding {
    const base = { id: this.id, title: this.title, max: 0 } as const;
    const sources = [ctx.llmsTxt ?? "", ctx.robotsTxt ?? ""];
    const detected = sources.some((s) => SIGNALS.some((re) => re.test(s)));
    if (detected) {
      return {
        ...base,
        severity: "pass",
        score: 0,
        detail: "The site advertises an MCP or agent-facing endpoint. No points at stake; conventions are still forming.",
      };
    }
    return {
      ...base,
      severity: "pass",
      score: 0,
      detail: "No MCP or agent endpoint advertised. Informational only; no points deducted.",
    };
  },
};
