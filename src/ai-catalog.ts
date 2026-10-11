/**
 * Parser for the AI Catalog document a site serves at
 * /.well-known/ai-catalog.json. The catalog is the discovery entry point
 * adopted by MCP Server Cards (SEP-2127): it lists the agent-facing
 * artifacts a host offers, such as MCP server cards and A2A agent cards.
 * Spec: https://ai-catalog.io/spec/
 */

export const AI_CATALOG_PATH = "/.well-known/ai-catalog.json";

export const MCP_SERVER_CARD = "application/mcp-server-card+json";
export const A2A_AGENT_CARD = "application/a2a-agent-card+json";
export const NESTED_CATALOG = "application/ai-catalog+json";

/** Highest catalog major version this parser understands. */
const SUPPORTED_MAJOR = 1;

export interface AiCatalogEntry {
  identifier: string;
  type: string;
  displayName?: string;
}

export interface AiCatalogResult {
  /** True when the document satisfies every required rule of the spec. */
  valid: boolean;
  specVersion: string | null;
  hostName: string | null;
  /** Entries that carry the required fields, even if others are malformed. */
  entries: AiCatalogEntry[];
  /** Human-readable reasons the document is not valid. */
  problems: string[];
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Parses and validates a catalog. Returns null when the text is not a JSON
 * object at all, which is how sites that answer every path with an HTML page
 * (a "soft 404") are told apart from sites that publish a broken catalog.
 */
export function parseAiCatalog(text: string): AiCatalogResult | null {
  let doc: unknown;
  try {
    doc = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isObject(doc)) return null;

  const problems: string[] = [];
  let specVersion: string | null = null;
  if (typeof doc.specVersion !== "string") {
    problems.push("specVersion is missing or not a string");
  } else if (!/^\d+\.\d+$/.test(doc.specVersion)) {
    specVersion = doc.specVersion;
    problems.push(`specVersion "${doc.specVersion}" is not in Major.Minor form`);
  } else {
    specVersion = doc.specVersion;
    const major = Number(doc.specVersion.split(".")[0]);
    if (major > SUPPORTED_MAJOR) problems.push(`specVersion ${doc.specVersion} is newer than this auditor understands`);
  }

  let hostName: string | null = null;
  if (doc.host !== undefined) {
    if (isObject(doc.host) && typeof doc.host.displayName === "string") hostName = doc.host.displayName;
    else problems.push("host is present but has no displayName");
  }

  const entries: AiCatalogEntry[] = [];
  if (!Array.isArray(doc.entries)) {
    problems.push("entries is missing or not an array");
  } else {
    const seen = new Set<string>();
    doc.entries.forEach((raw, i) => {
      const where = `entry ${i + 1}`;
      if (!isObject(raw)) {
        problems.push(`${where} is not an object`);
        return;
      }
      const { identifier, type } = raw;
      if (typeof identifier !== "string" || identifier === "") problems.push(`${where} has no identifier`);
      if (typeof type !== "string" || type === "") problems.push(`${where} has no type`);
      const hasUrl = raw.url !== undefined;
      const hasData = raw.data !== undefined;
      if (hasUrl === hasData) problems.push(`${where} must have exactly one of url or data`);
      if (hasUrl && typeof raw.url !== "string") problems.push(`${where} url is not a string`);
      if (typeof identifier === "string" && identifier !== "" && typeof type === "string" && type !== "") {
        // The identifier and version pair must be unique within a catalog.
        const key = `${identifier}\u0000${typeof raw.version === "string" ? raw.version : ""}`;
        if (seen.has(key)) problems.push(`${where} repeats identifier ${identifier}`);
        seen.add(key);
        entries.push({
          identifier,
          type,
          ...(typeof raw.displayName === "string" ? { displayName: raw.displayName } : {}),
        });
      }
    });
  }

  return { valid: problems.length === 0, specVersion, hostName, entries, problems };
}

/** Plain-language tally of entry types, e.g. "1 MCP server card and 2 A2A agent cards". */
export function describeEntries(entries: AiCatalogEntry[]): string {
  if (entries.length === 0) return "no entries";
  const count = (t: string) => entries.filter((e) => e.type === t).length;
  const plural = (n: number, word: string) =>
    `${n} ${n === 1 ? word : word.endsWith("entry") ? word.slice(0, -1) + "ies" : word + "s"}`;
  const parts: string[] = [];
  const mcp = count(MCP_SERVER_CARD);
  const a2a = count(A2A_AGENT_CARD);
  const nested = count(NESTED_CATALOG);
  const other = entries.length - mcp - a2a - nested;
  if (mcp) parts.push(plural(mcp, "MCP server card"));
  if (a2a) parts.push(plural(a2a, "A2A agent card"));
  if (nested) parts.push(plural(nested, "nested catalog"));
  if (other) parts.push(plural(other, "other entry"));
  return parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/**
 * True when a catalog seems to list an MCP server without using the server
 * card type, for example a generic application/json entry whose identifier
 * names MCP. Clients that look for server cards will not find such a server.
 */
export function hasUntypedMcpEntry(entries: AiCatalogEntry[]): boolean {
  return (
    !entries.some((e) => e.type === MCP_SERVER_CARD) &&
    entries.some((e) => /(^|[:/._-])mcp([:/._-]|$)/i.test(e.identifier))
  );
}
