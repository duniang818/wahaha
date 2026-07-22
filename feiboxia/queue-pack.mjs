#!/usr/bin/env node
/**
 * 飞博虾：把台账中「待发博客」或「一键操作=立即发布」打包进 feiboxia/queue/
 * 不需要公网回调——本机有飞书登录即可。
 *
 *   npm run feiboxia:pack
 *   npm run feiboxia:ship   # pack + git push，触发 Actions 应用
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLocalCms, ROOT } from "./lib/tenant.js";
import {
  fetchFeishuMarkdown,
  markdownFromFeishu,
  slugify,
  buildPostMarkdown,
  extractDocToken,
} from "./lib/feishu-doc.js";
import { normalizeNavDir } from "./lib/publish.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const QUEUE = path.join(ROOT, "feiboxia/queue");
const cms = loadLocalCms();
if (!cms?.baseToken) {
  console.error("缺少 sync/feishu-cms.json");
  process.exit(1);
}

function runLark(args) {
  return spawnSync("lark-cli", args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    maxBuffer: 20 * 1024 * 1024,
  });
}

function cellText(v) {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (Array.isArray(v)) {
    return v
      .map(x => x?.text || x?.name || x?.link || (typeof x === "string" ? x : ""))
      .filter(Boolean)
      .join("");
  }
  if (typeof v === "object") return String(v.text || v.name || v.link || v.url || "");
  return String(v);
}

function cellSelect(v) {
  if (Array.isArray(v)) return cellSelect(v[0]);
  if (v && typeof v === "object") return String(v.name || v.text || "");
  return cellText(v);
}

fs.mkdirSync(QUEUE, { recursive: true });
fs.writeFileSync(path.join(QUEUE, ".gitkeep"), "", "utf8");

const listPending = runLark([
  "base",
  "+record-list",
  "--as",
  "user",
  "--base-token",
  cms.baseToken,
  "--table-id",
  cms.tableId || "文章",
  "--limit",
  "80",
  "--format",
  "json",
]);

let payload;
try {
  payload = JSON.parse(listPending.stdout || "{}");
} catch {
  console.error(listPending.stdout || listPending.stderr);
  process.exit(1);
}

const records = payload?.data?.items || payload?.data?.records || [];
const candidates = [];

for (const r of records) {
  const fields = r.fields || r.record?.fields || {};
  const recordId = r.record_id || r.id;
  const status = cellSelect(fields["状态"]);
  const action = cellSelect(fields["一键操作"]);
  const docUrl = cellText(fields["飞书文档"]);
  if (!docUrl) continue;
  if (status === "待发博客" || action === "立即发布") {
    candidates.push({
      recordId,
      docUrl,
      title: cellText(fields["标题"]),
      slug: cellText(fields["slug"]),
      nav: cellSelect(fields["导航栏目"]) || cellText(fields["写入目录"]),
      tags: cellText(fields["标签"]),
      status,
      action,
    });
  }
}

if (!candidates.length) {
  console.log("没有待打包稿件（状态=待发博客 或 一键操作=立即发布）。");
  process.exit(0);
}

console.log(`待打包 ${candidates.length} 篇`);
let packed = 0;

for (const item of candidates) {
  try {
    const fetched = fetchFeishuMarkdown(item.docUrl);
    const parsed = markdownFromFeishu(fetched.content);
    const title = item.title || parsed.title || "未命名";
    const slug =
      item.slug ||
      slugify(title) ||
      `feiboxia-${(fetched.docId || extractDocToken(item.docUrl)).slice(0, 10)}`;
    const navDir = normalizeNavDir(item.nav);
    const built = buildPostMarkdown({
      title,
      body: parsed.body,
      slug,
      tags: item.tags || "飞博虾",
      docId: fetched.docId,
      docUrl: item.docUrl,
      navDir,
    });

    const meta = {
      recordId: item.recordId,
      title,
      slug,
      navDir,
      path: built.rel,
      docUrl: item.docUrl,
      docId: fetched.docId,
      packedAt: new Date().toISOString(),
    };

    fs.writeFileSync(
      path.join(QUEUE, `${slug}.json`),
      JSON.stringify(meta, null, 2),
      "utf8"
    );
    fs.writeFileSync(path.join(QUEUE, `${slug}.md`), built.content, "utf8");
    console.log(`✓ ${slug} → feiboxia/queue/`);

    if (item.recordId) {
      runLark([
        "base",
        "+record-upsert",
        "--as",
        "user",
        "--base-token",
        cms.baseToken,
        "--table-id",
        cms.tableId || "文章",
        "--record-id",
        item.recordId,
        "--json",
        JSON.stringify({
          发布结果: "已入队 feiboxia/queue，等待 GitHub/本机应用",
          一键操作: "（无）",
          博客路径: built.rel,
        }),
      ]);
    }
    packed += 1;
  } catch (e) {
    console.error(`✗ ${item.docUrl}:`, e.message || e);
  }
}

const status = {
  packedAt: new Date().toISOString(),
  count: packed,
  hint: "push 本目录后由 Actions 应用，或 npm run feiboxia:apply",
};
fs.writeFileSync(path.join(QUEUE, "status.json"), JSON.stringify(status, null, 2));
console.log(`\n完成打包 ${packed} 篇。下一步：npm run feiboxia:ship 或 git push`);
