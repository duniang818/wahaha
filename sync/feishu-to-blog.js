#!/usr/bin/env node
/**
 * 飞书编辑 → 一键发布到博客（作者本机）
 *
 * 流程：
 * 1. 用 lark-cli 拉取飞书云文档（Markdown）
 * 2. 写入 docs/（默认 blog/posts/）
 * 3. 可选：git commit + push 触发 GitHub Pages
 * 4. 可选：继续同步微信/小红书/CSDN/知乎
 *
 * 用法:
 *   npm run from-feishu -- "<飞书文档URL或token>"
 *   npm run from-feishu -- "<URL>" --slug my-post --dir blog/posts --push
 *   npm run from-feishu -- "<URL>" --push --also wechat,xhs
 *   npm run from-feishu -- --list   # 查看已绑定的飞书文档
 *
 * 前置: lark-cli auth login --as user（需文档读权限）
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ROOT,
  DOCS_DIR,
  loadEnv,
  ensureOutDir,
  appendLog,
  OUT_DIR,
} from "./lib/posts.js";

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

if (hasFlag("--list")) {
  const map = loadMap();
  console.log(JSON.stringify(map, null, 2));
  process.exit(0);
}

const docArg =
  args.find(a => !a.startsWith("--") && a !== getFlag("--slug") && a !== getFlag("--dir") && a !== getFlag("--also") && a !== getFlag("--title") && a !== getFlag("--tags")) ||
  null;

if (!docArg) {
  console.error(`用法:
  npm run from-feishu -- "<飞书文档URL或token>" [--slug 文件名] [--dir blog/posts] [--push] [--also wechat,xhs]
  npm run from-feishu -- --list`);
  process.exit(1);
}

const which = spawnSync("lark-cli", ["--version"], {
  encoding: "utf8",
  shell: process.platform === "win32",
});
if (which.error || which.status !== 0) {
  console.error("未找到 lark-cli。请先安装并登录：\n  lark-cli auth login");
  process.exit(1);
}

console.log("正在从飞书拉取文档…");
const fetch = spawnSync(
  "lark-cli",
  [
    "docs",
    "+fetch",
    "--api-version",
    "v2",
    "--as",
    "user",
    "--doc",
    docArg,
    "--doc-format",
    "markdown",
    "--json",
  ],
  { encoding: "utf8", shell: process.platform === "win32", maxBuffer: 20 * 1024 * 1024 }
);

if (fetch.status !== 0) {
  console.error(fetch.stdout || "");
  console.error(fetch.stderr || "");
  console.error(`
拉取失败。请检查：
1) lark-cli auth login（用户身份）
2) 当前账号对该文档有阅读权限
3) URL/token 是否正确
`);
  process.exit(fetch.status || 1);
}

let payload;
try {
  payload = JSON.parse(fetch.stdout || "{}");
} catch {
  console.error("无法解析 lark-cli 输出:", fetch.stdout?.slice(0, 500));
  process.exit(1);
}

if (payload.ok === false) {
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

const content =
  payload?.data?.document?.content ||
  payload?.data?.content ||
  payload?.content ||
  "";
const docId =
  payload?.data?.document?.document_id ||
  extractDocToken(docArg) ||
  "unknown";

if (!content || !String(content).trim()) {
  console.error("飞书返回内容为空。");
  process.exit(1);
}

const parsed = markdownFromFeishu(String(content));
const title =
  getFlag("--title") ||
  parsed.title ||
  `飞书文章-${docId.slice(0, 8)}`;
const slug =
  getFlag("--slug") ||
  slugify(title) ||
  `feishu-${docId.slice(0, 10)}`;
const dirRel = (getFlag("--dir") || "blog/posts").replace(/^\/+|\/+$/g, "");
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
    [
      "git",
      [
        "commit",
        "-m",
        `docs: 从飞书同步《${title}》`,
      ],
    ],
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
    [
      path.join(ROOT, "sync/publish-all.js"),
      slug,
      "--to",
      also,
    ],
    { cwd: ROOT, stdio: "inherit" }
  );
  if (r.status !== 0) process.exit(r.status || 1);
}

console.log(`
完成。
- 本地预览: npm run dev → 打开对应文章
- 仅写入未推送: 确认后执行 git push，或下次加 --push
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
  // strip possible wrapper fences from CLI
  if (text.startsWith("```")) {
    text = text.replace(/^```\w*\n?/, "").replace(/\n?```$/, "");
  }
  let title = "";
  const h1 = text.match(/^#\s+(.+)$/m);
  if (h1) title = h1[1].trim();
  // XML title fallback if somehow returned
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
