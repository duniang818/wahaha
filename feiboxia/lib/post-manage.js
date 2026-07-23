/**
 * 作者博文管理：移动栏目、改标签、删除（仅本机/CI + GitHub PAT 触发）
 */
import fs from "node:fs";
import path from "node:path";
import { normalizeNavDir } from "./publish.js";
import { extractDocToken, yamlEscape } from "./feishu-doc.js";
import { ROOT } from "./tenant.js";

const DOCS = path.join(ROOT, "docs");
const MAP_FILE = path.join(ROOT, "sync/feishu-map.json");

const NAV_LABEL = {
  "blog/posts": "博客",
  education: "教育",
  travel: "旅行",
  tech: "技术",
  life: "生活",
  feiboxia: "飞博虾",
};

function navLabelFromDir(navDir) {
  const d = String(navDir || "blog/posts").replace(/^\/+|\/+$/g, "");
  return NAV_LABEL[d] || NAV_LABEL[d.split("/")[0]] || "其他";
}

function walkMarkdown(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === "private") continue;
      walkMarkdown(p, out);
    } else if (name.endsWith(".md")) {
      out.push(p);
    }
  }
  return out;
}

function parseFrontmatter(text) {
  if (!text.startsWith("---")) return { meta: {}, body: text };
  const end = text.indexOf("\n---", 3);
  if (end < 0) return { meta: {}, body: text };
  const raw = text.slice(4, end).trim();
  const body = text.slice(end + 4).replace(/^\n/, "");
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

function stringifyFrontmatter(meta) {
  const lines = ["---"];
  for (const [key, val] of Object.entries(meta)) {
    if (Array.isArray(val)) {
      lines.push(`${key}:`);
      for (const item of val) lines.push(`  - ${yamlEscape(item)}`);
    } else if (val !== undefined && val !== null) {
      lines.push(`${key}: ${yamlEscape(String(val))}`);
    }
  }
  lines.push("---", "");
  return lines.join("\n");
}

export function findPost({ slug, docUrl, docToken } = {}) {
  const token = docToken || extractDocToken(docUrl || "");
  const files = walkMarkdown(DOCS);
  for (const file of files) {
    const rel = path.relative(DOCS, file).replace(/\\/g, "/");
    const baseSlug = path.basename(rel, ".md");
    const head = fs.readFileSync(file, "utf8").slice(0, 1400);
    if (slug && baseSlug === slug) {
      return { file, rel, slug: baseSlug, navDir: path.dirname(rel).replace(/\\/g, "/") };
    }
    if (token && head.includes(token)) {
      return { file, rel, slug: baseSlug, navDir: path.dirname(rel).replace(/\\/g, "/") };
    }
  }
  return null;
}

function loadMap() {
  if (!fs.existsSync(MAP_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(MAP_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveMap(map) {
  fs.mkdirSync(path.dirname(MAP_FILE), { recursive: true });
  fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2), "utf8");
}

function rmDirSafe(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

/** 移动栏目 / 更新标签（不改正文，正文仍以飞书为准） */
export function movePost({ slug, docUrl, docToken, navDir, tags }) {
  const hit = findPost({ slug, docUrl, docToken });
  if (!hit) throw new Error(`未找到博文：${slug || docToken || docUrl}`);

  const text = fs.readFileSync(hit.file, "utf8");
  const { meta, body } = parseFrontmatter(text);
  const newNavDir = normalizeNavDir(navDir || hit.navDir);
  const newNavLabel = navLabelFromDir(newNavDir);
  const oldNavLabel = navLabelFromDir(hit.navDir);

  meta.nav = newNavLabel;

  if (tags !== undefined && tags !== null) {
    const tagList = (Array.isArray(tags) ? tags : String(tags).split(/[,，]/))
      .map(t => String(t).trim())
      .filter(Boolean);
    meta.tags = [newNavLabel, ...tagList.filter(t => t !== newNavLabel && t !== oldNavLabel)];
    if (meta.tags.length === 1) meta.tags.push("飞博虾");
  } else if (Array.isArray(meta.tags)) {
    meta.tags = [newNavLabel, ...meta.tags.filter(t => t !== oldNavLabel && t !== newNavLabel)];
    if (!meta.tags.includes("飞博虾")) meta.tags.push("飞博虾");
  }

  const newRel = `${newNavDir}/${hit.slug}.md`;
  const newFile = path.join(DOCS, newRel);
  const content = stringifyFrontmatter(meta) + body;

  const oldAsset = path.join(DOCS, hit.navDir, "assets", hit.slug);
  const newAsset = path.join(DOCS, newNavDir, "assets", hit.slug);

  fs.mkdirSync(path.dirname(newFile), { recursive: true });
  fs.writeFileSync(newFile, content, "utf8");
  if (newFile !== hit.file) fs.unlinkSync(hit.file);

  if (fs.existsSync(oldAsset)) {
    fs.mkdirSync(path.dirname(newAsset), { recursive: true });
    if (fs.existsSync(newAsset)) rmDirSafe(newAsset);
    fs.renameSync(oldAsset, newAsset);
  }

  const map = loadMap();
  const docId = meta.feishu_doc || docToken || extractDocToken(docUrl || "");
  if (docId && map[docId]) {
    map[docId] = {
      ...map[docId],
      slug: hit.slug,
      path: newRel,
      navDir: newNavDir,
      updatedAt: new Date().toISOString(),
      via: "post-manage-move",
    };
    saveMap(map);
  }

  return { slug: hit.slug, from: hit.rel, to: newRel, navDir: newNavDir, tags: meta.tags };
}

/** 删除博文文件与配图（飞书文档保留，可重新发布） */
export function deletePost({ slug, docUrl, docToken }) {
  const hit = findPost({ slug, docUrl, docToken });
  if (!hit) throw new Error(`未找到博文：${slug || docToken || docUrl}`);

  const text = fs.readFileSync(hit.file, "utf8");
  const { meta } = parseFrontmatter(text);
  const docId = meta.feishu_doc || docToken || extractDocToken(docUrl || "");

  fs.unlinkSync(hit.file);
  rmDirSafe(path.join(DOCS, hit.navDir, "assets", hit.slug));

  const map = loadMap();
  if (docId && map[docId]) {
    map[docId] = {
      ...map[docId],
      deletedAt: new Date().toISOString(),
      path: null,
      via: "post-manage-delete",
    };
    saveMap(map);
  }

  return { slug: hit.slug, deleted: hit.rel, docId };
}

/** 从博客 Pages URL 解析 nav_dir + slug */
export function parseBlogPostUrl(postUrl, siteUrl = "") {
  try {
    const u = new URL(String(postUrl || "").trim());
    let p = u.pathname;
    if (siteUrl) {
      try {
        const base = new URL(siteUrl).pathname.replace(/\/+$/, "");
        if (base && base !== "/" && p.startsWith(base)) p = p.slice(base.length);
      } catch {
        /* ignore */
      }
    }
    p = p.replace(/^\/+|\/+$/g, "");
    if (!p) return null;
    const parts = p.split("/").filter(Boolean);
    if (!parts.length) return null;
    const slug = parts[parts.length - 1];
    const navDir = parts.slice(0, -1).join("/") || "blog/posts";
    return { slug, navDir, rel: `${navDir}/${slug}.md` };
  } catch {
    return null;
  }
}

export function findPostByBlogUrl(postUrl, siteUrl = "") {
  const parsed = parseBlogPostUrl(postUrl, siteUrl);
  if (!parsed) throw new Error("无法解析博文 URL");

  const file = path.join(DOCS, parsed.rel);
  if (fs.existsSync(file)) {
    return {
      file,
      rel: parsed.rel,
      slug: parsed.slug,
      navDir: parsed.navDir,
    };
  }
  const hit = findPost({ slug: parsed.slug });
  if (hit) return hit;
  throw new Error(`未找到线上博文：${parsed.rel}`);
}

/** 飞书无绑定、线上有：将当前飞书文档绑定到已有博文（不改正文） */
export function pullBindPost({ postUrl, docUrl, docToken, siteUrl }) {
  const hit = findPostByBlogUrl(postUrl, siteUrl);
  const text = fs.readFileSync(hit.file, "utf8");
  const { meta, body } = parseFrontmatter(text);
  const docId = docToken || extractDocToken(docUrl || "");
  if (!docId) throw new Error("缺少飞书 doc_token");

  meta.feishu_doc = docId;
  if (docUrl) meta.feishu_url = docUrl;

  fs.writeFileSync(hit.file, stringifyFrontmatter(meta) + body, "utf8");

  const map = loadMap();
  map[docId] = {
    ...(map[docId] || {}),
    slug: hit.slug,
    path: hit.rel,
    title: meta.title || hit.slug,
    url: docUrl,
    navDir: hit.navDir,
    pulledAt: new Date().toISOString(),
    via: "post-manage-pull",
  };
  saveMap(map);

  return {
    slug: hit.slug,
    rel: hit.rel,
    navDir: hit.navDir,
    title: meta.title,
    tags: meta.tags,
  };
}

/** 按线上 URL 撤销（删除博文文件） */
export function revokePostByUrl({ postUrl, siteUrl }) {
  const hit = findPostByBlogUrl(postUrl, siteUrl);
  return deletePost({ slug: hit.slug });
}

export function listPosts() {
  return walkMarkdown(DOCS)
    .map(file => {
      const rel = path.relative(DOCS, file).replace(/\\/g, "/");
      const { meta } = parseFrontmatter(fs.readFileSync(file, "utf8"));
      return {
        slug: path.basename(rel, ".md"),
        rel,
        title: meta.title || path.basename(rel, ".md"),
        nav: meta.nav || navLabelFromDir(path.dirname(rel)),
        tags: meta.tags || [],
        feishu_doc: meta.feishu_doc || "",
      };
    })
    .sort((a, b) => String(a.title).localeCompare(String(b.title), "zh-CN"));
}
