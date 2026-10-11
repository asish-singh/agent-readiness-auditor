import type { Check, Finding, SiteContext } from "../types.js";
import { AI_CATALOG_PATH, describeEntries, hasUntypedMcpEntry, parseAiCatalog } from "../ai-catalog.js";

/**
 * Informational check (0 points): does the site advertise an MCP server or
 * other agent-facing endpoint? Conventions are young, so this detects and
 * reports without scoring, exactly so early movers are not punished for
 * guessing differently. See the decision in issue #2.
 *
 * The strongest signal is an AI Catalog at /.well-known/ai-catalog.json, the
 * discovery document adopted by MCP Server Cards (SEP-2127). A catalog that
 * fails validation is reported as a warning so the owner can fix it, still
 * without costing points. Mentions in llms.txt or robots.txt are the weaker,
 * informal fallback.
 */
const SIGNALS = [/modelcontextprotocol/i, /mcp[\s._-]?server/i, /\/mcp\b/i, /\.well-known\/mcp/i];

export const mcpSignalCheck: Check = {
  id: "mcp-signal",
  title: "Agent endpoint advertised (informational)",
  run(ctx: SiteContext): Finding {
    const base = { id: this.id, title: this.title, max: 0, score: 0 } as const;

    const catalog = ctx.aiCatalog ? parseAiCatalog(ctx.aiCatalog) : null;
    if (catalog?.valid) {
      const untyped = hasUntypedMcpEntry(catalog.entries);
      return {
        ...base,
        severity: "pass",
        ...(untyped
          ? {
              remediation:
                'An entry names MCP but is not typed as a server card, so clients following SEP-2127 will not recognise it. List the server with type "application/mcp-server-card+json" and a url pointing at its server card.',
            }
          : {}),
        detail:
          `Publishes an AI Catalog at ${AI_CATALOG_PATH} (spec ${catalog.specVersion}) listing ` +
          `${describeEntries(catalog.entries)}. Agents can discover its endpoints without guessing.`,
      };
    }
    if (catalog) {
      return {
        ...base,
        severity: "warn",
        detail:
          `Serves ${AI_CATALOG_PATH}, but it does not follow the AI Catalog spec ` +
          `(${catalog.problems.slice(0, 3).join("; ")}${catalog.problems.length > 3 ? "; and more" : ""}).`,
        remediation:
          "Fix the catalog so agents can rely on it. It needs a specVersion such as \"1.0\" and an entries array, and each entry needs an identifier, a type, and exactly one of url or data. See https://ai-catalog.io/spec/.",
      };
    }

    const sources = [ctx.llmsTxt ?? "", ctx.robotsTxt ?? ""];
    if (sources.some((s) => SIGNALS.some((re) => re.test(s)))) {
      return {
        ...base,
        severity: "pass",
        detail:
          "The site advertises an MCP or agent-facing endpoint in llms.txt or robots.txt. No points at stake; " +
          `publishing ${AI_CATALOG_PATH} would make it discoverable by standard clients.`,
      };
    }
    return {
      ...base,
      severity: "pass",
      detail: "No MCP or agent endpoint advertised. Informational only; no points deducted.",
    };
  },
};
