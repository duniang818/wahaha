#!/usr/bin/env node
/**
 * 将 feiboxia/queue/*.md 落到 docs/，并移入 queue/done/
 * 供本机或 GitHub Actions 使用（不需要飞书登录）。
 *
 *   npm run feiboxia:apply
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT } from "./lib/tenant.js";

const QUEUE = path.join(ROOT, "feiboxia/queue");
const DONE = path.join(QUEUE, "done");
const DOCS = path.join(ROOT, "docs");

fs.mkdirSync(DONE, { recursive: true });

if (!fs.existsSync(QUEUE)) {
  console.log("无 queue 目录");
  process.exit(0);
}

const files = fs
  .readdirSync(QUEUE)
  .filter(n => n.endsWith(".json") && n !== "status.json");

if (!files.length) {
  console.log("队列为空，无需应用。");
  process.exit(0);
}

let applied = 0;
const results = [];

for (const name of files) {
  const metaPath = path.join(QUEUE, name);
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  const mdPath = path.join(QUEUE, `${meta.slug}.md`);
  if (!fs.existsSync(mdPath)) {
    console.warn(`缺正文: ${meta.slug}.md`);
    continue;
  }
  const content = fs.readFileSync(mdPath, "utf8");
  const rel = meta.path || `${meta.navDir || "blog/posts"}/${meta.slug}.md`;
  const out = path.join(DOCS, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, content, "utf8");

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  fs.renameSync(metaPath, path.join(DONE, `${stamp}-${name}`));
  fs.renameSync(mdPath, path.join(DONE, `${stamp}-${meta.slug}.md`));

  console.log(`✓ docs/${rel}`);
  results.push({ path: rel, title: meta.title, slug: meta.slug });
  applied += 1;
}

fs.writeFileSync(
  path.join(QUEUE, "status.json"),
  JSON.stringify(
    {
      appliedAt: new Date().toISOString(),
      count: applied,
      results,
    },
    null,
    2
  ),
  "utf8"
);

console.log(`应用完成 ${applied} 篇`);
