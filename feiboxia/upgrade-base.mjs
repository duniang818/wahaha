#!/usr/bin/env node
/**
 * 升级现有台账为飞博虾字段 +「立即发布」自动化
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  defaultTenantId,
  getTenant,
  loadLocalCms,
  publicBaseUrl,
  upsertTenant,
} from "./lib/tenant.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cms = loadLocalCms();
if (!cms?.baseToken || !cms?.tableId) {
  console.error("缺少 sync/feishu-cms.json，请先 npm run feishu:cms-init");
  process.exit(1);
}

upsertTenant(defaultTenantId(), {
  baseToken: cms.baseToken,
  tableId: cms.tableId,
});
const tenant = getTenant(defaultTenantId());
const pub = publicBaseUrl();
const secret = tenant.webhookSecret;

function runLark(args) {
  return spawnSync("lark-cli", args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    maxBuffer: 10 * 1024 * 1024,
    cwd: path.resolve(__dirname, ".."),
  });
}

function parseJson(r) {
  try {
    return JSON.parse(r.stdout || "{}");
  } catch {
    return { ok: false, raw: r.stdout, err: r.stderr };
  }
}

console.log("飞博虾台账升级");
console.log(`Base: ${cms.url}`);
console.log(`回调: ${pub}/api/v1/publish`);

const extraFields = [
  {
    file: "field-nav.json",
    spec: {
      type: "select",
      name: "导航栏目",
      multiple: false,
      options: [
        { name: "blog/posts" },
        { name: "education" },
        { name: "travel" },
        { name: "tech" },
        { name: "life" },
      ],
    },
  },
  {
    file: "field-action.json",
    spec: {
      type: "select",
      name: "一键操作",
      multiple: false,
      options: [
        { name: "（无）", hue: "Gray" },
        { name: "立即发布", hue: "Orange" },
      ],
    },
  },
  {
    file: "field-schedule.json",
    spec: {
      type: "datetime",
      name: "定时发布时间",
      style: { format: "yyyy/MM/dd HH:mm" },
    },
  },
  {
    file: "field-result.json",
    spec: { type: "text", name: "发布结果" },
  },
];

const dataDir = path.join(__dirname, "data");
fs.mkdirSync(dataDir, { recursive: true });

for (const { file, spec } of extraFields) {
  const abs = path.join(dataDir, file);
  fs.writeFileSync(abs, JSON.stringify(spec), "utf8");
  const rel = path.relative(path.resolve(__dirname, ".."), abs).replace(/\\/g, "/");
  const r = runLark([
    "base",
    "+field-create",
    "--as",
    "user",
    "--base-token",
    cms.baseToken,
    "--table-id",
    cms.tableId,
    "--json",
    `@${rel}`,
  ]);
  const p = parseJson(r);
  const blob = `${JSON.stringify(p)}${r.stderr || ""}`;
  if (r.status === 0 && p.ok !== false) console.log(`✓ 字段 ${spec.name}`);
  else if (/exist|已存在|duplicate|same name|FieldNameDuplicated/i.test(blob))
    console.log(`· 字段已存在: ${spec.name}`);
  else console.warn(`! 字段 ${spec.name}:`, (p.error?.message || blob).slice(0, 280));
}

const fieldsRes = runLark([
  "base",
  "+field-list",
  "--as",
  "user",
  "--base-token",
  cms.baseToken,
  "--table-id",
  cms.tableId,
  "--format",
  "json",
]);
const fieldsPayload = parseJson(fieldsRes);
const fields = fieldsPayload?.data?.fields || [];
const byName = Object.fromEntries(fields.map(f => [f.name, f.id]));

function ref(name) {
  const id = byName[name];
  if (!id) throw new Error(`找不到字段: ${name}`);
  return `$.trigger.${id}`;
}

let workflowNow;
try {
  workflowNow = {
    client_token: `feiboxia-now-${Date.now()}`,
    title: "飞博虾·立即发布",
    steps: [
      {
        id: "trigger",
        type: "SetRecordTrigger",
        title: "一键操作改为立即发布",
        next: "http",
        data: {
          table_name: "文章",
          record_watch_conjunction: "and",
          record_watch_info: [],
          field_watch_info: [
            {
              field_name: "一键操作",
              operator: "is",
              value: [
                { value_type: "option", value: { name: "立即发布" } },
              ],
            },
          ],
          trigger_control_list: [],
          condition_list: null,
        },
      },
      {
        id: "http",
        type: "HTTPClientAction",
        title: "调用飞博虾发布接口",
        next: "reset",
        data: {
          method: "POST",
          url: [{ value_type: "text", value: `${pub}/api/v1/publish` }],
          headers: [
            {
              key: "Content-Type",
              value: [{ value_type: "text", value: "application/json" }],
            },
            {
              key: "Authorization",
              value: [{ value_type: "text", value: `Bearer ${secret}` }],
            },
          ],
          body_type: "raw",
          raw_body: [
            {
              value_type: "text",
              value: `{"tenant_id":"${defaultTenantId()}","record_id":"`,
            },
            { value_type: "ref", value: "$.trigger.recordId" },
            { value_type: "text", value: '","doc_url":"' },
            { value_type: "ref", value: ref("飞书文档") },
            { value_type: "text", value: '","title":"' },
            { value_type: "ref", value: ref("标题") },
            { value_type: "text", value: '","slug":"' },
            { value_type: "ref", value: ref("slug") },
            { value_type: "text", value: '","nav_dir":"' },
            {
              value_type: "ref",
              value: byName["导航栏目"] ? ref("导航栏目") : ref("写入目录"),
            },
            { value_type: "text", value: '","tags":"' },
            { value_type: "ref", value: ref("标签") },
            { value_type: "text", value: '","push":true}' },
          ],
          response_type: "json",
          response_value:
            '{"ok":true,"success":true,"message":"发布成功","path":"x.md"}',
        },
      },
      {
        id: "reset",
        type: "SetRecordAction",
        title: "回写状态与结果",
        next: null,
        data: {
          table_name: "文章",
          max_set_record_num: 1,
          ref_info: { step_id: "trigger" },
          field_values: [
            {
              field_name: "状态",
              value: [
                { value_type: "option", value: { name: "已发博客" } },
              ],
            },
            {
              field_name: "一键操作",
              value: [
                { value_type: "option", value: { name: "（无）" } },
              ],
            },
            {
              field_name: "发布结果",
              value: [{ value_type: "ref", value: "$.http.body.message" }],
            },
          ],
        },
      },
    ],
  };
} catch (e) {
  console.error("构造工作流失败:", e.message);
  process.exit(1);
}

const wfFile = path.join(__dirname, "data/workflow-now.json");
const wfRel = path
  .relative(path.resolve(__dirname, ".."), wfFile)
  .replace(/\\/g, "/");
fs.writeFileSync(wfFile, JSON.stringify(workflowNow, null, 2), "utf8");

const create = runLark([
  "base",
  "+workflow-create",
  "--as",
  "user",
  "--base-token",
  cms.baseToken,
  "--json",
  `@${wfRel}`,
]);
const created = parseJson(create);
if (create.status === 0 && created.ok !== false) {
  const wid =
    created?.data?.workflow_id ||
    created?.data?.id ||
    created?.data?.workflow?.workflow_id;
  console.log("✓ 已创建工作流「飞博虾·立即发布」", wid || "");
  if (wid) {
    const en = runLark([
      "base",
      "+workflow-enable",
      "--as",
      "user",
      "--base-token",
      cms.baseToken,
      "--workflow-id",
      String(wid),
    ]);
    console.log(en.status === 0 ? "✓ 工作流已启用" : "! 请在飞书里手动启用自动化");
    if (en.status !== 0) console.log(en.stdout || en.stderr);
  }
} else {
  console.warn("! 工作流创建未成功，可在飞书台账 → 自动化 手动配置");
  console.warn(JSON.stringify(created.error || created, null, 2).slice(0, 800));
}

if (/127\.0\.0\.1|localhost/.test(pub)) {
  console.log(`
⚠ 回调是本机地址，飞书云端点不到。
  · 公网按钮：ngrok http 8787 → 设 FEIBOXIA_PUBLIC_URL 后重跑 upgrade
  · 本机傻瓜流：npm run feiboxia + 台账改「立即发布」前先用本机 scan/助手
`);
}

console.log(`
用法：
1. npm run feiboxia
2. 台账填文档链接 → 「一键操作」= 立即发布
3. 定时：填「定时发布时间」+ 状态=待发博客，然后 npm run feiboxia:scan
`);
