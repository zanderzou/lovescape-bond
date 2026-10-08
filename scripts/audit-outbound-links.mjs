import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "dist", "client");
const referral = "https://www.playbox.com/?ref=zanderzou";
const failures = [];
const htmlFiles = [];

function walk(folder) {
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith(".html")) htmlFiles.push(file);
  }
}

walk(out);
const articles = htmlFiles.filter((file) => path.relative(out, file).replaceAll("\\", "/").startsWith("blog/lovescape-vs-"));
const added = readdirSync(path.join(root,"src/content/blog")).filter(f=>f.endsWith(".md")&&!/^lovescape-vs-(candy-ai|dreamgf|girlfriendgpt|ourdream-ai|swipey-ai)\.md$/.test(f)).length;
if (articles.length !== 5 + added) failures.push(`expected five comparisons, found ${articles.length}`);

for (const file of htmlFiles) {
  const rel = path.relative(out, file).replaceAll("\\", "/");
  const html = readFileSync(file, "utf8");

  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = match[1].match(/\bhref="([^"]+)"/i)?.[1];
    if (href !== referral) continue;
    const label = match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const accepted = ['Open official Lovescape','Get Started','Verify live checkout','Open the safety checklist','Browse all research','Visit official Lovescape'];
    if (!label.includes("Playbox") && !accepted.includes(label)) failures.push(`${rel}: referral label is misleading`);
    const rels = match[1].match(/\brel="([^"]+)"/i)?.[1] ?? "";
    if (!rels.includes("sponsored") || !rels.includes("nofollow")) failures.push(`${rel}: referral missing sponsored/nofollow`);
  }

  if (articles.includes(file)) {
    const sourceSection = html.match(/<section class="sources" id="sources">([\s\S]*?)<\/section>/i)?.[1];
    if (!sourceSection) {
      failures.push(`${rel}: missing source section`);
      continue;
    }
    const sources = [...sourceSection.matchAll(/<a\b[^>]*href="([^"]+)"/gi)].map((item) => item[1]);
    if (sources.length < 3) failures.push(`${rel}: too few linked primary sources`);
    for (const href of sources) {
      if (!href.startsWith("https://") || href === referral) failures.push(`${rel}: source points to ${href}`);
    }
  }
}

const privacy = readFileSync(path.join(out, "privacy", "index.html"), "utf8");
if (!privacy.includes('href="https://policies.google.com/privacy"')) failures.push("privacy: Google policy link was rewritten");
const home = readFileSync(path.join(out, "index.html"), "utf8");
if (!home.includes('href="https://lovescape.com/"')) failures.push("home: official Lovescape link was rewritten");
if (!home.includes(`href="${referral}"`)) failures.push("home: labeled referral was lost");

if (failures.length) {
  console.error(`Outbound-link audit failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log(`Outbound-link audit passed: ${articles.length} source-linked comparisons, ${htmlFiles.length} HTML pages.`);
