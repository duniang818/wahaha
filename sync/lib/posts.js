import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "../..");
export const POSTS_DIR = path.join(ROOT, "src/content/posts");
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

/**
 * @param {string} slugOrPath
 * @returns {{ slug: string, filePath: string, frontmatter: Record<string, any>, body: string, raw: string }}
 */
export function readPost(slugOrPath) {
  let filePath = slugOrPath;
  if (!path.isAbsolute(filePath) && !fs.existsSync(filePath)) {
    const candidates = [
      path.join(POSTS_DIR, slugOrPath),
      path.join(POSTS_DIR, `${slugOrPath}.md`),
      path.join(POSTS_DIR, `${slugOrPath}.mdx`),
    ];
    filePath = candidates.find(p => fs.existsSync(p));
  }
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error(`找不到文章: ${slugOrPath}（请放在 src/content/posts/）`);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    throw new Error(`文章缺少 YAML frontmatter: ${filePath}`);
  }

  const frontmatter = parseSimpleYaml(match[1]);
  const body = match[2].trim();
  const slug = path.basename(filePath).replace(/\.(md|mdx)$/i, "");

  return { slug, filePath, frontmatter, body, raw };
}

/** 极简 YAML 解析：足够覆盖 AstroPaper frontmatter 常用字段 */
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
  return (process.env.SITE_URL || "https://duniang818.github.io").replace(
    /\/$/,
    ""
  );
}
