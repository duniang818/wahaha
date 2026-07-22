#!/usr/bin/env node
/**
 * 从「渡娘博客台账」读取「待发博客」记录，一键写入博客并可推送。
 *
 * 用法:
 *   npm run feishu:cms-publish
 *   npm run feishu:cms-publish -- --push
 *   npm run feishu:cms-publish -- --all-pending --push
 *   npm run feishu:cms-publish -- --dry-run
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { loadEnv, ROOT } from "./lib/posts.js";
import { getLarkStatus, runLark } from "./lib/lark.js";

loadEnv();

const CFG = path.join(ROOT, "sync/feishu-cms.json");
const args = process.argv.slice(2);
const push = args.includes("--push");
const dryRun = args.includes("--dry-run");
const allPending = args.includes("--all-pending");

function cellText(v) {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (Array.isArray(v)) {
    return v
      .map(x => {
        if (typeof x === "string") return x;
        if (x?.text) return x.text;
        if (x?.name) return x.name;
        if (x?.link) return x.link;
        return "";
      })
      .filter(Boolean)
      .join("");
  }
  if (typeof v === "object") {
    if (v.text) return String(v.text);
    if (v.name) return String(v.name);
    if (v.link) return String(v.link);
    if (v.url) return String(v.url);
  }
  return String(v);
}

function cellSelect(v) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return cellSelect(v[0]);
  if (v?.name) return String(v.name);
  if (v?.text) return String(v.text);
  return cellText(v);
}

if (!fs.existsSync(CFG)) {
  console.error("尚未创建台账。请先运行: npm run feishu:cms-init");
  process.exit(1);
}

const cfg = JSON.parse(fs.readFileSync(CFG, "utf8"));
if (!cfg.baseToken) {
  console.error("sync/feishu-cms.json 缺少 baseToken");
  process.exit(1);
}

const st = getLarkStatus();
if (!st.ok) {
  console.error(st.message || "飞书未就绪");
  process.exit(1);
}

const tableRef = cfg.tableId || cfg.tableName || "文章";
console.log("正在读取台账「待发博客」…");

const list = runLark([
  "base",
  "+record-list",
  "--as",
  "user",
  "--base-token",
  cfg.baseToken,
  "--table-id",
  tableRef,
  "--filter-json",
  JSON.stringify({
    logic: "and",
    conditions: [["状态", "intersects", ["待发博客"]]],
  }),
  "--limit",
  "50",
  "--format",
  "json",
]);

let payload;
try {
  payload = JSON.parse(list.stdout || "{}");
} catch {
  console.error(list.stdout || list.stderr);
  process.exit(1);
}

if (list.status !== 0 || payload.ok === false) {
  console.error(JSON.stringify(payload, null, 2) || list.stderr);
  process.exit(list.status || 1);
}

const records =
  payload?.data?.items ||
  payload?.data?.records ||
  payload?.data?.record_result_items ||
  [];

if (!records.length) {
  console.log("没有状态为「待发博客」的记录。请在飞书台账里改状态后再试。");
  process.exit(0);
}

const normalized = records.map(r => {
  const fields = r.fields || r.record?.fields || r;
  const recordId = r.record_id || r.id || r.record?.record_id;
  return {
    recordId,
    title: cellText(fields["标题"]),
    docUrl: cellText(fields["飞书文档"]),
    slug: cellText(fields["slug"]),
    dir: cellText(fields["写入目录"]) || "blog/posts",
    tags: cellText(fields["标签"]),
    platforms: cellText(fields["外站平台"]),
    status: cellSelect(fields["状态"]),
  };
}).filter(r => r.docUrl);

if (!normalized.length) {
  console.log("有待发记录，但「飞书文档」链接为空。");
  process.exit(1);
}

console.log(`候选 ${normalized.length} 篇：`);
normalized.forEach((r, i) => {
  console.log(`  ${i + 1}. ${r.title || "(无标题)"}  ${r.docUrl}`);
});

const targets = allPending ? normalized : [normalized[0]];
if (!allPending && normalized.length > 1) {
  console.log("\n默认只发第 1 篇。全部发布请加 --all-pending");
}

let failed = 0;
for (const item of targets) {
  console.log(`\n======== ${item.title || item.docUrl} ========`);
  if (dryRun) {
    console.log(`[dry-run] 将 from-feishu: ${item.docUrl}`);
    continue;
  }

  const fargs = [item.docUrl];
  if (item.slug) fargs.push("--slug", item.slug);
  if (item.dir) fargs.push("--dir", item.dir);
  if (item.tags) fargs.push("--tags", item.tags);
  if (push) fargs.push("--push");
  if (item.platforms) fargs.push("--also", item.platforms);

  const r = spawnSync(
    process.execPath,
    [path.join(ROOT, "sync/feishu-to-blog.js"), ...fargs],
    { cwd: ROOT, stdio: "inherit" }
  );

  if (r.status !== 0) {
    failed += 1;
    continue;
  }

  // 更新台账状态 → 已发博客
  if (item.recordId) {
    const mapFile = path.join(ROOT, "sync/feishu-map.json");
    let blogPath = "";
    try {
      const map = JSON.parse(fs.readFileSync(mapFile, "utf8"));
      const hit = Object.values(map).find(
        m => m.url === item.docUrl || m.slug === item.slug
      );
      blogPath = hit?.path || "";
    } catch {
      /* ignore */
    }

    const upsert = runLark([
      "base",
      "+record-upsert",
      "--as",
      "user",
      "--base-token",
      cfg.baseToken,
      "--table-id",
      tableRef,
      "--record-id",
      item.recordId,
      "--json",
      JSON.stringify({
        状态: "已发博客",
        ...(blogPath ? { 博客路径: blogPath } : {}),
      }),
    ]);
    if (upsert.status !== 0) {
      console.warn("台账状态更新失败（文章可能已写入博客）:");
      console.warn(upsert.stdout || upsert.stderr);
    } else {
      console.log("台账状态已更新为「已发博客」");
    }
  }
}

process.exit(failed ? 1 : 0);
