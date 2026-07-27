#!/usr/bin/env node
/**
 * 将推断出的 title/date/nav/tags 写回缺失 frontmatter 的 Markdown
 * 已有字段不覆盖（除非 --force）
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const force = process.argv.includes("--force");

// 先构建索引拿到 warnings / inferred
spawnSync(process.execPath, [path.join(ROOT, "scripts/build-posts-index.mjs")], {
  cwd: ROOT,
  stdio: "inherit",
});

const index = JSON.parse(
  fs.readFileSync(path.join(ROOT, "docs/javascripts/posts-index.json"), "utf8")
);

function yamlEscape(s) {
  const t = String(s);
  if (/[:#{}[\],&*?|>!%@`]/.test(t) || /^\s|\s$/.test(t)) {
    return `"${t.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return t;
}

function upsertFrontmatter(text, patch) {
  if (!text.startsWith("---")) {
    const lines = ["---"];
    for (const [k, v] of Object.entries(patch)) {
      if (Array.isArray(v)) {
        lines.push(`${k}:`);
        v.forEach(item => lines.push(`  - ${yamlEscape(item)}`));
      } else {
        lines.push(`${k}: ${yamlEscape(v)}`);
      }
    }
    lines.push("---", "", text.replace(/^\uFEFF/, ""));
    return lines.join("\n");
  }

  const end = text.indexOf("\n---", 3);
  if (end < 0) return text;
  const raw = text.slice(4, end);
  const body = text.slice(end + 4);
  const keys = new Set();
  for (const line of raw.split("\n")) {
    const m = line.match(/^([a-zA-Z0-9_ ]+):/);
    if (m) keys.add(m[1].trim());
  }

  const add = [];
  for (const [k, v] of Object.entries(patch)) {
    if (!force && keys.has(k)) continue;
    if (Array.isArray(v)) {
      add.push(`${k}:`);
      v.forEach(item => add.push(`  - ${yamlEscape(item)}`));
    } else {
      add.push(`${k}: ${yamlEscape(v)}`);
    }
  }
  if (!add.length) return text;

  let newRaw = raw.trimEnd();
  if (force) {
    // 简单：追加缺失；force 时仍只补缺失键（避免破坏复杂 YAML）
  }
  newRaw = `${newRaw}\n${add.join("\n")}\n`;
  return `---\n${newRaw}---${body}`;
}

let changed = 0;
for (const p of index.posts || []) {
  const rel = String(p.path || "").replace(/^docs\//, "");
  if (!rel) continue;
  const full = path.join(ROOT, "docs", rel);
  if (!fs.existsSync(full)) continue;
  const text = fs.readFileSync(full, "utf8");
  const next = upsertFrontmatter(text, {
    title: p.title,
    date: p.date,
    nav: p.nav,
    tags: p.tags,
  });
  if (next !== text) {
    fs.writeFileSync(full, next, "utf8");
    changed += 1;
    console.log("✓", rel);
  }
}

spawnSync(process.execPath, [path.join(ROOT, "scripts/build-posts-index.mjs")], {
  cwd: ROOT,
  stdio: "inherit",
});
console.log(`写回 ${changed} 个文件的 frontmatter`);
