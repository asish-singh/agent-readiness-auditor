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

/** How many pages beyond the landing page the crawl visits. */
const EXTRA_PAGES = 4;

/** Picks up to `limit` same-origin page URLs from the sitemap, else from landing-page links. */
function pickPageUrls(origin: string, sitemapXml: string | null, html: string, limit: number): string[] {
  const urls: string[] = [];
  const seen = new Set<string>([origin, `${origin}/`]);
  const add = (raw: string) => {
    try {
      const u = new URL(raw, origin);
      const clean = `${u.origin}${u.pathname}`;
      if (u.origin !== origin || seen.has(clean)) return;
      if (/\.(png|jpe?g|gif|svg|css|js|pdf|xml|ico|webp|mp4|zip)$/i.test(u.pathname)) return;
      seen.add(clean);
      urls.push(clean);
    } catch {}
  };
  if (sitemapXml) {
    for (const m of sitemapXml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)) {
      if (urls.length >= limit) break;
      add(m[1]);
    }
  }
  if (urls.length < limit) {
    for (const m of html.matchAll(/<a\s[^>]*href=["']([^"'#]+)["']/gi)) {
      if (urls.length >= limit) break;
      add(m[1]);
    }
  }
  return urls;
}

/**
 * Fetches the landing page, robots.txt, llms.txt, sitemap.xml, and a few
 * additional pages (from the sitemap when available, else landing-page links).
 */
export async function fetchSite(input: string): Promise<SiteContext> {
  const origin = normalizeOrigin(input);
  const [page, robots, llms, sitemap] = await Promise.all([
    getText(origin),
    getText(`${origin}/robots.txt`),
    getText(`${origin}/llms.txt`),
    getText(`${origin}/sitemap.xml`),
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
  const pageUrls = pickPageUrls(origin, sitemap.text, page.text, EXTRA_PAGES);
  const fetched = await Promise.all(pageUrls.map((u) => getText(u)));
  const pages = pageUrls
    .map((url, i) => ({ url, html: fetched[i].text }))
    .filter((p): p is { url: string; html: string } => p.html !== null);
  return {
    origin,
    html: page.text,
    robotsTxt: robots.text,
    llmsTxt: llms.text,
    sitemapXml: sitemap.text,
    pages,
  };
}
