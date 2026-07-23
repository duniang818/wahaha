#!/usr/bin/env node
/**
 * 构建首页文章索引（导航=主标签，筛选仅展示导航级标签）
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = path.join(ROOT, "docs");
const OUT = path.join(DOCS, "javascripts", "posts-index.json");
const OUT_PREVIEW = path.join(DOCS, "javascripts", "posts-index-preview.json");

/** 顶部导航 ↔ 主标签（一致） */
const NAV_TAGS = ["博客", "教育", "旅行", "技术", "生活", "飞博虾", "其他"];

const DIR_TO_NAV = {
  "blog/posts": "博客",
  education: "教育",
  travel: "旅行",
  tech: "技术",
  life: "生活",
  feiboxia: "飞博虾",
};

const SKIP_DIRS = new Set(["private", "javascripts", "stylesheets"]);
const SKIP_FILES = new Set([
  "index.md",
  "blog-index.md",
  "gitfork-index.md",
  "todos-index.md",
  "tools-index.md",
  "analysis-index.md",
  "life-index.md",
  "car-index.md",
]);

function parseFrontmatter(text) {
  if (!text.startsWith("---")) return { meta: {}, body: text };
  const end = text.indexOf("\n---", 3);
  if (end < 0) return { meta: {}, body: text };
  const raw = text.slice(4, end).trim();
  const body = text.slice(end + 4);
  const meta = {};
  let listKey = null;
  for (const line of raw.split("\n")) {
    if (/^\s*-\s+/.test(line) && listKey) {
      meta[listKey] = meta[listKey] || [];
      meta[listKey].push(line.replace(/^\s*-\s+/, "").trim().replace(/^["']|["']$/g, ""));
      continue;
    }
    const m = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    const val = m[2].trim();
    if (val === "") {
      listKey = key;
      meta[key] = [];
    } else {
      listKey = null;
      meta[key] = val.replace(/^["']|["']$/g, "");
    }
  }
  return { meta, body };
}

function inferNav(rel, meta) {
  if (meta.nav && NAV_TAGS.includes(meta.nav)) return meta.nav;
  const dir = path.dirname(rel).replace(/\\/g, "/");
  if (DIR_TO_NAV[dir]) return DIR_TO_NAV[dir];
  const top = dir.split("/")[0];
  if (DIR_TO_NAV[top]) return DIR_TO_NAV[top];
  return "其他";
}

function normalizeTags(nav, meta) {
  const raw = Array.isArray(meta.tags)
    ? meta.tags
    : meta.tags
      ? [meta.tags]
      : [];
  const cleaned = raw.map(t => String(t).trim()).filter(Boolean);
  const merged = [nav, ...cleaned.filter(t => t !== nav && NAV_TAGS.includes(t) === false)];
  return [...new Set(merged)];
}

function excerpt(meta, body) {
  if (meta.description) return String(meta.description);
  const plain = body
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[#>*`_~-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > 140 ? `${plain.slice(0, 140)}…` : plain;
}

function thumb(meta, body, rel) {
  if (meta.image) return String(meta.image);
  const m = body.match(/!\[[^\]]*]\(([^)]+)\)/);
  if (!m) return "";
  let u = m[1].trim().replace(/^["']|["']$/g, "");
  if (u.startsWith("http")) return u;
  const dir = path.dirname(rel).replace(/\\/g, "/");
  return `${dir}/${u}`.replace(/\/+/g, "/");
}

function walk(dir, base = "", out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const full = path.join(dir, name);
    const rel = base ? `${base}/${name}` : name;
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      walk(full, rel, out);
    } else if (name.endsWith(".md") && !SKIP_FILES.has(name)) {
      out.push(rel.replace(/\\/g, "/"));
    }
  }
  return out;
}

const posts = [];
for (const rel of walk(DOCS)) {
  const text = fs.readFileSync(path.join(DOCS, rel), "utf8");
  const { meta, body } = parseFrontmatter(text);
  if (String(meta.draft || "").toLowerCase() === "true") continue;
  if (String(meta.visibility || "public").toLowerCase() === "private") continue;

  const nav = inferNav(rel, meta);
  const tags = normalizeTags(nav, meta);
  const slugPath = rel.replace(/\.md$/, "");

  posts.push({
    title: meta.title || path.basename(rel, ".md"),
    url: `/${slugPath}/`,
    date: meta.date || "",
    nav,
    tags,
    excerpt: excerpt(meta, body),
    thumb: thumb(meta, body, rel),
  });
}

posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));

const navTagsPresent = NAV_TAGS.filter(t => posts.some(p => p.nav === t));

fs.mkdirSync(path.dirname(OUT), { recursive: true });
const payload = {
  generatedAt: new Date().toISOString(),
  navTags: navTagsPresent.length ? navTagsPresent : NAV_TAGS.filter(t => t !== "飞博虾"),
  posts,
};
fs.writeFileSync(OUT, JSON.stringify(payload, null, 2), "utf8");
fs.writeFileSync(
  OUT_PREVIEW,
  JSON.stringify(
    {
      generatedAt: payload.generatedAt,
      navTags: payload.navTags,
      total: posts.length,
      posts: posts.slice(0, 3),
    },
    null,
    2
  ),
  "utf8"
);
console.log(
  `✓ posts-index.json · ${posts.length} 篇 · preview 3 篇 · 导航标签 ${navTagsPresent.length} 个`
);
