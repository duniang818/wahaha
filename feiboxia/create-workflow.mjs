#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { defaultTenantId, getTenant, publicBaseUrl } from "./lib/tenant.js";
import { loadLocalCms } from "./lib/tenant.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const cms = loadLocalCms();
const summary = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data/fields-summary.json"), "utf8")
);
const by = Object.fromEntries(summary.map(f => [f.name, f.id]));
const tenant = getTenant(defaultTenantId());
const pub = publicBaseUrl();
const secret = tenant.webhookSecret;
const R = name => `$.trigger.${by[name]}`;

const wf = {
  client_token: `feiboxia-now-${Date.now()}`,
  title: "飞博虾立即发布",
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
            value: [{ value_type: "option", value: { name: "立即发布" } }],
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
          { value_type: "ref", value: R("飞书文档") },
          { value_type: "text", value: '","title":"' },
          { value_type: "ref", value: R("标题") },
          { value_type: "text", value: '","slug":"' },
          { value_type: "ref", value: R("slug") },
          { value_type: "text", value: '","nav_dir":"' },
          { value_type: "ref", value: R("导航栏目") },
          { value_type: "text", value: '","tags":"' },
          { value_type: "ref", value: R("标签") },
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
            value: [{ value_type: "option", value: { name: "已发博客" } }],
          },
          {
            field_name: "一键操作",
            value: [{ value_type: "option", value: { name: "（无）" } }],
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

const wfFile = path.join(__dirname, "data/workflow-now.json");
fs.writeFileSync(wfFile, JSON.stringify(wf, null, 2), "utf8");

const r = spawnSync(
  "lark-cli",
  [
    "base",
    "+workflow-create",
    "--as",
    "user",
    "--base-token",
    cms.baseToken,
    "--json",
    "@feiboxia/data/workflow-now.json",
  ],
  { encoding: "utf8", shell: true, cwd: root, maxBuffer: 10 * 1024 * 1024 }
);
console.log(r.stdout || "");
if (r.stderr) console.error(r.stderr);
process.exit(r.status ?? 1);
