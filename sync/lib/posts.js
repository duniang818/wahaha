import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "../..");
export const DOCS_DIR = path.join(ROOT, "docs");
export const OUT_DIR = path.join(ROOT, "sync/out");

export function loadEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

function walkMd(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walkMd(p, acc);
    else if (/\.(md|mdx)$/i.test(name)) acc.push(p);
  }
  return acc;
}

export function listPosts() {
  return walkMd(DOCS_DIR).map(filePath => {
    try {
      return readPost(filePath);
    } catch {
      return null;
    }
  }).filter(Boolean);
}

/**
 * @param {string} slugOrPath
 */
export function readPost(slugOrPath) {
  let filePath = slugOrPath;
  if (!path.isAbsolute(filePath) && !fs.existsSync(filePath)) {
    const all = walkMd(DOCS_DIR);
    const base = slugOrPath.replace(/\.(md|mdx)$/i, "");
    filePath = all.find(
      p =>
        path.basename(p).replace(/\.(md|mdx)$/i, "") === base ||
        p.replace(/\\/g, "/").endsWith(`/${base}.md`) ||
        p.replace(/\\/g, "/").endsWith(`/${base}.mdx`)
    );
    if (!filePath) {
      const direct = [
        path.join(DOCS_DIR, slugOrPath),
        path.join(DOCS_DIR, `${slugOrPath}.md`),
        path.join(DOCS_DIR, "blog/posts", `${slugOrPath}.md`),
      ];
      filePath = direct.find(p => fs.existsSync(p));
    }
  }
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error(`找不到文章: ${slugOrPath}（在 docs/ 下）`);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  let frontmatter = {};
  let body = raw.trim();
  if (match) {
    frontmatter = parseSimpleYaml(match[1]);
    body = match[2].trim();
  }

  const rel = path.relative(DOCS_DIR, filePath).replace(/\\/g, "/");
  const slug = path.basename(filePath).replace(/\.(md|mdx)$/i, "");
  const isPrivatePath = rel.startsWith("private/");

  return {
    slug,
    filePath,
    rel,
    frontmatter,
    body,
    raw,
    isPrivatePath,
  };
}

/** 作者本机发布权限校验 */
export function assertCanPublish(post, { allowPrivate = false } = {}) {
  const vis = String(post.frontmatter.visibility || "public").toLowerCase();
  if (post.isPrivatePath || vis === "private") {
    if (!allowPrivate) {
      throw new Error(
        `拒绝发布：${post.rel} 为私密内容（visibility=private 或 docs/private/）。公开平台仅允许 public。`
      );
    }
  }
  if (post.frontmatter.draft === true || post.frontmatter.draft === "true") {
    throw new Error(`拒绝发布：${post.rel} 仍为 draft。`);
  }
  return true;
}

export function allowedPlatforms(post) {
  const raw = post.frontmatter.platforms;
  if (!raw) return ["wechat", "xhs", "csdn", "zhihu", "feishu"];
  if (Array.isArray(raw)) return raw.map(String);
  return String(raw)
    .split(/[,，\s]+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function parseSimpleYaml(text) {
  /** @type {Record<string, any>} */
  const data = {};
  let currentListKey = null;

  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;

    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && currentListKey) {
      data[currentListKey].push(unquote(listItem[1].trim()));
      continue;
    }

    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    const rawVal = kv[2].trim();
    currentListKey = null;

    if (rawVal === "") {
      data[key] = [];
      currentListKey = key;
      continue;
    }
    if (rawVal === "true") data[key] = true;
    else if (rawVal === "false") data[key] = false;
    else if (/^-?\d+(\.\d+)?$/.test(rawVal)) data[key] = Number(rawVal);
    else data[key] = unquote(rawVal);
  }
  return data;
}

function unquote(s) {
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    return s.slice(1, -1);
  }
  return s;
}

export function ensureOutDir() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(path.join(OUT_DIR, "logs"), { recursive: true });
  return OUT_DIR;
}

export function markdownToPlain(md) {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~>#-]+/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function getSiteUrl() {
  return (process.env.SITE_URL || "https://duniang818.github.io/wahaha").replace(
    /\/$/,
    ""
  );
}

export function appendLog(line) {
  ensureOutDir();
  const f = path.join(OUT_DIR, "logs", "publish.log");
  fs.appendFileSync(f, `[${new Date().toISOString()}] ${line}\n`, "utf8");
}
