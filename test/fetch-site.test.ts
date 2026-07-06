import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeOrigin } from "../src/fetch-site.js";

test("normalizeOrigin adds https:// when the scheme is missing", () => {
  assert.equal(normalizeOrigin("example.com"), "https://example.com");
});

test("normalizeOrigin strips paths and query strings down to the origin", () => {
  assert.equal(normalizeOrigin("https://example.com/blog?x=1"), "https://example.com");
});

test("normalizeOrigin preserves an explicit http:// scheme", () => {
  assert.equal(normalizeOrigin("http://example.com"), "http://example.com");
});

test("normalizeOrigin trims surrounding whitespace", () => {
  assert.equal(normalizeOrigin("  example.com  "), "https://example.com");
});
