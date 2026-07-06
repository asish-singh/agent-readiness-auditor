import type { SiteContext } from "./types.js";

const UA = "agent-readiness-auditor/0.1 (+https://github.com/asish-singh/agent-readiness-auditor)";

/** Normalizes user input into a proper https origin. */
export function normalizeOrigin(input: string): string {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return new URL(url).origin;
}

async function getText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow" });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Fetches the landing page plus robots.txt and llms.txt for a target site. */
export async function fetchSite(input: string): Promise<SiteContext> {
  const origin = normalizeOrigin(input);
  const [html, robotsTxt, llmsTxt] = await Promise.all([
    getText(origin),
    getText(`${origin}/robots.txt`),
    getText(`${origin}/llms.txt`),
  ]);
  if (html === null) {
    throw new Error(`Could not fetch ${origin} — is the URL reachable?`);
  }
  return { origin, html, robotsTxt, llmsTxt };
}
