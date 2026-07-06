import type { Check, Finding, SiteContext } from "../types.js";

/** Known AI crawler user-agents worth having an explicit stance on. */
const AI_AGENTS = [
  "GPTBot",
  "ClaudeBot",
  "Claude-Web",
  "Google-Extended",
  "PerplexityBot",
  "CCBot",
  "Bytespider",
];

/**
 * Checks whether robots.txt takes an explicit position on AI crawlers.
 * Having a stance (allow OR disallow) is the signal. Silence is the problem.
 */
export const robotsAiCheck: Check = {
  id: "robots-ai-stance",
  title: "robots.txt addresses AI crawlers",
  run(ctx: SiteContext): Finding {
    const base = { id: this.id, title: this.title, max: 15 } as const;
    if (!ctx.robotsTxt) {
      return {
        ...base,
        severity: "warn",
        score: 0,
        detail: "No /robots.txt found.",
        remediation:
          "Add a /robots.txt and declare rules for AI user-agents (e.g. GPTBot, ClaudeBot).",
      };
    }
    const mentioned = AI_AGENTS.filter((a) =>
      ctx.robotsTxt!.toLowerCase().includes(a.toLowerCase()),
    );
    if (mentioned.length > 0) {
      return {
        ...base,
        severity: "pass",
        score: 15,
        detail: `robots.txt explicitly names AI agents: ${mentioned.join(", ")}.`,
      };
    }
    return {
      ...base,
      severity: "warn",
      score: 5,
      detail: "robots.txt exists but takes no explicit stance on AI crawlers.",
      remediation:
        "Add allow/disallow rules for AI user-agents so your intent is unambiguous.",
    };
  },
};
