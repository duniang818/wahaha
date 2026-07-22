#!/usr/bin/env node
/**
 * 飞博虾定时扫描：状态=待发博客 且 定时发布时间已到 → 自动发布
 * 可挂 Windows 计划任务 / cron，或由服务进程定时调用。
 *
 *   npm run feiboxia:scan
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLocalCms } from "./lib/tenant.js";
import { defaultTenantId, getTenant } from "./lib/tenant.js";
import { publishArticle } from "./lib/publish.js";

const cms = loadLocalCms();
if (!cms?.baseToken) {
  console.error("无台账配置");
  process.exit(1);
}

function runLark(args) {
  return spawnSync("lark-cli", args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    maxBuffer: 10 * 1024 * 1024,
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

const list = runLark([
  "base",
  "+record-list",
  "--as",
  "user",
  "--base-token",
  cms.baseToken,
  "--table-id",
  cms.tableId || "文章",
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

const records = payload?.data?.items || payload?.data?.records || [];
const now = Date.now();
const tenant = getTenant(defaultTenantId());
let done = 0;

for (const r of records) {
  const fields = r.fields || r.record?.fields || {};
  const recordId = r.record_id || r.id;
  const scheduleRaw = fields["定时发布时间"];
  let due = null;
  if (typeof scheduleRaw === "number") due = scheduleRaw;
  else if (scheduleRaw) {
    const t = Date.parse(cellText(scheduleRaw));
    if (!Number.isNaN(t)) due = t;
  }
  // 无定时时间则跳过（等用户点立即发布）；有定时且未到点也跳过
  if (due == null) continue;
  if (due > now) {
    console.log(`未到点: ${cellText(fields["标题"])} @ ${new Date(due).toLocaleString()}`);
    continue;
  }

  const docUrl = cellText(fields["飞书文档"]);
  if (!docUrl) continue;

  console.log(`发布: ${cellText(fields["标题"]) || docUrl}`);
  try {
    const result = await publishArticle(
      {
        doc_url: docUrl,
        title: cellText(fields["标题"]),
        slug: cellText(fields["slug"]),
        nav_dir: cellSelect(fields["导航栏目"]) || cellText(fields["写入目录"]),
        tags: cellText(fields["标签"]),
        push: true,
      },
      tenant
    );

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
      recordId,
      "--json",
      JSON.stringify({
        状态: "已发博客",
        发布结果: result.message,
        博客路径: result.path,
        一键操作: "（无）",
      }),
    ]);
    done += 1;
  } catch (e) {
    console.error("失败:", e.message || e);
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
      recordId,
      "--json",
      JSON.stringify({ 发布结果: `失败: ${e.message || e}` }),
    ]);
  }
}

console.log(`扫描完成，成功 ${done} 篇`);
