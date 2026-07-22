#!/usr/bin/env node
/**
 * 飞书编辑 → 一键发布到博客（作者本机）
 *
 * 用法:
 *   npm run from-feishu -- "<飞书文档URL或token>"
 *   npm run from-feishu -- "<URL>" --slug my-post --dir blog/posts --push
 *   npm run from-feishu -- "<URL>" --push --also wechat,xhs
 *   npm run from-feishu -- --list
 *   npm run from-feishu -- --check   # 检查飞书 CLI / 登录状态
 *
 * 前置: lark-cli config init + lark-cli auth login --domain docs
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  ROOT,
  DOCS_DIR,
  loadEnv,
  ensureOutDir,
  appendLog,
  OUT_DIR,
} from "./lib/posts.js";
import { getLarkStatus, fetchDocMarkdown } from "./lib/lark.js";

loadEnv();

const MAP_FILE = path.join(ROOT, "sync/feishu-map.json");
const args = process.argv.slice(2);

function getFlag(name) {
  const i = args.indexOf(name);
  if (i < 0) return null;
  return args[i + 1] || null;
}

function hasFlag(name) {
  return args.includes(name);
}

if (hasFlag("--check")) {
  const st = getLarkStatus();
  console.log(JSON.stringify(st, null, 2));
  process.exit(st.ok ? 0 : 1);
}

if (hasFlag("--list")) {
  const map = loadMap();
  console.log(JSON.stringify(map, null, 2));
  process.exit(0);
}

const docArg =
  args.find(
    a =>
      !a.startsWith("--") &&
      a !== getFlag("--slug") &&
      a !== getFlag("--dir") &&
      a !== getFlag("--also") &&
      a !== getFlag("--title") &&
      a !== getFlag("--tags")
  ) || null;

if (!docArg) {
  console.error(`用法:
  npm run from-feishu -- "<飞书文档URL或token>" [--slug 文件名] [--dir blog/posts] [--push] [--also wechat,xhs]
  npm run from-feishu -- --list
  npm run from-feishu -- --check`);
  process.exit(1);
}

const st = getLarkStatus();
if (!st.ok) {
  console.error(`
飞书未就绪，无法拉取文档。

${st.message || ""}

建议步骤：
1) lark-cli config init --new     # 创建/绑定飞书应用（浏览器完成）
2) lark-cli auth login --domain docs
3) 确认文档对当前账号可读，再重试本命令
`);
  process.exit(1);
}

console.log("正在从飞书拉取文档…");
const fetched = fetchDocMarkdown(docArg);
if (!fetched.ok) {
  console.error(fetched.error || "");
  if (fetched.stdout) console.error(fetched.stdout);
  if (fetched.stderr) console.error(fetched.stderr);
  console.error(`
拉取失败。请检查：
1) lark-cli auth login --domain docs
2) 当前账号对该文档有阅读权限
3) URL/token 是否正确（docx / wiki 均可）
`);
  process.exit(1);
}

const content = fetched.content;
const docId = fetched.docId || extractDocToken(docArg) || "unknown";

if (!content.trim()) {
  console.error("飞书返回内容为空。");
  process.exit(1);
}

const parsed = markdownFromFeishu(content);
const title =
  getFlag("--title") || parsed.title || `飞书文章-${docId.slice(0, 8)}`;
const slug =
  getFlag("--slug") || slugify(title) || `feishu-${docId.slice(0, 10)}`;
const dirRel = (
  getFlag("--dir") ||
  process.env.FEISHU_DEFAULT_DIR ||
  "blog/posts"
).replace(/^\/+|\/+$/g, "");
const outRel = `${dirRel}/${slug}.md`;
const outPath = path.join(DOCS_DIR, outRel);

const tagsRaw = getFlag("--tags");
const tags = tagsRaw
  ? tagsRaw.split(/[,，]/).map(s => s.trim()).filter(Boolean)
  : ["飞书同步"];

const visibility = hasFlag("--private") ? "private" : "public";
const today = new Date().toISOString().slice(0, 10);

const front = [
  "---",
  `title: ${yamlEscape(title)}`,
  "author: 渡娘",
  `date: ${today}`,
  `visibility: ${visibility}`,
  "draft: false",
  `feishu_doc: ${docId}`,
  `feishu_url: ${normalizeDocUrl(docArg, docId)}`,
  "platforms:",
  "  - wechat",
  "  - xhs",
  "  - csdn",
  "  - zhihu",
  "tags:",
  ...tags.map(t => `  - ${t}`),
  "description: 从飞书一键同步",
  "---",
  "",
].join("\n");

const body = parsed.body.replace(/^\s*#\s+.+\n+/, "").trim();
const fileContent = `${front}${body}\n`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, fileContent, "utf8");
console.log(`已写入博客: docs/${outRel}`);

ensureOutDir();
fs.writeFileSync(
  path.join(OUT_DIR, `${slug}.from-feishu.md`),
  fileContent,
  "utf8"
);

const map = loadMap();
map[docId] = {
  slug,
  path: outRel,
  title,
  url: normalizeDocUrl(docArg, docId),
  updatedAt: new Date().toISOString(),
};
fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2), "utf8");
appendLog(`FROM-FEISHU ${docId} -> ${outRel}`);

if (hasFlag("--push")) {
  console.log("\n正在提交并推送到 GitHub Pages…");
  const cmds = [
    ["git", ["add", path.join("docs", outRel), "sync/feishu-map.json"]],
    ["git", ["commit", "-m", `docs: 从飞书同步《${title}》`]],
    ["git", ["push", "origin", "HEAD"]],
  ];
  for (const [cmd, cargs] of cmds) {
    const r = spawnSync(cmd, cargs, {
      cwd: ROOT,
      encoding: "utf8",
      shell: process.platform === "win32",
      stdio: "inherit",
    });
    if (r.status !== 0 && cmd === "git" && cargs[0] === "commit") {
      console.log("（无变更或提交跳过）");
    } else if (r.status !== 0 && cargs[0] !== "commit") {
      console.error("推送失败（多为网络）。本地文件已写好，可稍后 git push。");
      process.exit(r.status || 1);
    }
  }
  console.log("已推送，等待 Actions 部署后即可在线访问。");
}

const also = getFlag("--also");
if (also) {
  console.log("\n继续同步外站平台…");
  const r = spawnSync(
    process.execPath,
    [path.join(ROOT, "sync/publish-all.js"), slug, "--to", also],
    { cwd: ROOT, stdio: "inherit" }
  );
  if (r.status !== 0) process.exit(r.status || 1);
}

console.log(`
完成。
- 本地预览: npm run dev
- 线上: https://duniang818.github.io/wahaha/
- 绑定表: sync/feishu-map.json
`);

function loadMap() {
  if (!fs.existsSync(MAP_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(MAP_FILE, "utf8"));
  } catch {
    return {};
  }
}

function extractDocToken(input) {
  const m = String(input).match(/\/(?:docx|doc|wiki)\/([A-Za-z0-9]+)/);
  if (m) return m[1];
  if (/^[A-Za-z0-9_-]+$/.test(String(input))) return String(input);
  return "";
}

function normalizeDocUrl(input, docId) {
  if (/^https?:\/\//i.test(String(input))) return String(input);
  return `https://feishu.cn/docx/${docId}`;
}

function markdownFromFeishu(md) {
  let text = md.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```\w*\n?/, "").replace(/\n?```$/, "");
  }
  let title = "";
  const h1 = text.match(/^#\s+(.+)$/m);
  if (h1) title = h1[1].trim();
  const xt = text.match(/<title>([^<]+)<\/title>/i);
  if (!title && xt) title = xt[1].trim();
  return { title, body: text };
}

function slugify(title) {
  return String(title)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function yamlEscape(s) {
  if (/[:#{}[\],&*?|<>=!%@`]/.test(s) || /\s/.test(s)) {
    return `"${String(s).replace(/"/g, '\\"')}"`;
  }
  return s;
}
