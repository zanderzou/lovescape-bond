import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const preview = join(root, "dist", "private-ja-preview");
const production = join(root, "dist", "client");
const paths = [
  "/ja/", "/ja/blog/", "/ja/about/", "/ja/contact/",
  "/ja/editorial-policy/", "/ja/privacy/", "/ja/terms/",
  "/ja/blog/lovescape-vs-candy-ai/",
  "/ja/blog/lovescape-vs-ourdream-ai/",
  "/ja/blog/lovescape-vs-girlfriendgpt/",
  "/ja/blog/lovescape-vs-dreamgf/",
  "/ja/blog/lovescape-vs-swipey-ai/",
];
const competitorHosts = {
  "lovescape-vs-candy-ai": "candy.ai",
  "lovescape-vs-ourdream-ai": "ourdream.ai",
  "lovescape-vs-girlfriendgpt": "www.gptgirlfriend.online",
  "lovescape-vs-dreamgf": "dreamgf.ai",
  "lovescape-vs-swipey-ai": "swipey.ai",
};

const fileFor = (base, path) => join(base, path.slice(1), "index.html");
const escaped = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
let internalLinksChecked = 0;

for (const path of paths) {
  const html = await readFile(fileFor(preview, path), "utf8");
  assert.match(html, /<html lang="ja">/, `${path}: document language`);
  assert.match(html, /<meta name="robots" content="noindex,nofollow">/, `${path}: preview gate`);
  assert.match(html, /<meta property="og:locale" content="ja_JP">/, `${path}: social language`);
  assert.match(html, /"inLanguage":"ja"/, `${path}: structured data language`);
  assert.match(html, new RegExp(`<link rel="canonical" href="https://lovescape\\.bond${escaped(path)}">`), `${path}: self-canonical`);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${path}: one H1`);
  assert.match(html, /<title>[^<]+<\/title>/, `${path}: title`);
  assert.match(html, /<meta name="description" content="[^"]+">/, `${path}: description`);
  assert.ok((html.match(/[\u3040-\u30ff\u3400-\u9fff]/g) || []).length > 120, `${path}: substantive Japanese body`);
  assert.doesNotMatch(html, /hreflang="ja"/, `${path}: unpublished locale must not claim alternate status`);
  assert.match(html, /非公開プレビュー/, `${path}: visible private badge`);
  assert.match(html, /アクセス解析の設定/, `${path}: Japanese analytics settings`);
  assert.match(html, /解析を許可/, `${path}: Japanese analytics consent`);
  assert.match(html, /許可しない/, `${path}: Japanese analytics refusal`);
  assert.match(html, /href="\/ja\/privacy\/"/, `${path}: Japanese privacy link`);
  assert.match(html, /rel="sponsored nofollow noopener noreferrer"/, `${path}: labeled referral`);

  for (const [, href] of html.matchAll(/href="(\/ja\/[^"#?]*)"/g)) {
    await access(fileFor(preview, href));
    internalLinksChecked++;
  }

  const slug = path.split("/").filter(Boolean).at(-1);
  if (competitorHosts[slug]) {
    assert.match(html, /href="https:\/\/(?:help\.)?lovescape\.com\//, `${path}: direct Lovescape source`);
    assert.match(html, new RegExp(`href="https://(?:www\\.)?${escaped(competitorHosts[slug])}/`), `${path}: direct competitor source`);
  }
}

const home = await readFile(fileFor(preview, "/ja/"), "utf8");
assert.match(home, /<title>Lovescape<\/title>/, "exact-keyword home title");
assert.match(home, /<h1[^>]*>Lovescape<\/h1>/, "exact-keyword home H1");

const previewSitemap = await readFile(join(preview, "sitemap-0.xml"), "utf8");
assert.doesNotMatch(previewSitemap, /\/ja\//, "private preview cannot add indexed sitemap URLs");
const productionSitemap = await readFile(join(production, "sitemap-0.xml"), "utf8");
assert.doesNotMatch(productionSitemap, /\/ja\//, "production sitemap cannot add Japanese URLs");
await assert.rejects(access(join(production, "ja", "index.html")), "production cannot contain Japanese homepage");
const productionPages = await readdir(production, { recursive: true });
assert.equal(productionPages.filter((file) => file.endsWith("index.html")).length, 12, "production retains exactly 12 indexable English HTML pages");
assert.ok(productionPages.includes("404.html"), "production retains its English 404 page");

console.log(`Private Japanese preview audit passed: ${paths.length}/12 noindex pages, ${internalLinksChecked} internal links; production still English-only.`);
