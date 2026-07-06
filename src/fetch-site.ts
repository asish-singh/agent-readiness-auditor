import type { SiteContext } from "./types.js";

// A browser-compatible UA. Many sites (esp. behind Cloudflare) challenge or
// block unknown bot user-agents, which would make the audit fail to fetch even
// legible pages. We identify honestly via the header comment in the repo.
const UA =
  "Mozilla/5.0 (compatible; agent-readiness-auditor/0.1; +https://github.com/asish-singh/agent-readiness-auditor)";

/** Normalizes user input into a proper https origin. */
export function normalizeOrigin(input: string): string {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return new URL(url).origin;
}

interface FetchResult {
  text: string | null;
  status: number | null; // HTTP status, or null if the request never completed
}

async function getText(url: string): Promise<FetchResult> {
  try {
    const res = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow" });
    if (!res.ok) return { text: null, status: res.status };
    return { text: await res.text(), status: res.status };
  } catch {
    return { text: null, status: null };
  }
}

/** Fetches the landing page plus robots.txt and llms.txt for a target site. */
export async function fetchSite(input: string): Promise<SiteContext> {
  const origin = normalizeOrigin(input);
  const [page, robots, llms] = await Promise.all([
    getText(origin),
    getText(`${origin}/robots.txt`),
    getText(`${origin}/llms.txt`),
  ]);
  if (page.text === null) {
    const reason =
      page.status === null
        ? "the request failed (network error, DNS, or timeout)"
        : `the server returned HTTP ${page.status}` +
          (page.status === 403 || page.status === 401
            ? " (the site likely blocks automated clients, for example Cloudflare bot protection)"
            : "");
    throw new Error(`Could not fetch ${origin}: ${reason}.`);
  }
  return { origin, html: page.text, robotsTxt: robots.text, llmsTxt: llms.text };
}
