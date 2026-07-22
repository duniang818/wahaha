#!/usr/bin/env node
/**
 * 飞书台账自动化：一键操作=立即发布 → 仅标记「待发博客」
 * （不调用公网 HTTP；真正发布靠本机 npm run feiboxia:ship）
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { loadLocalCms } from "./lib/tenant.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const cms = loadLocalCms();
if (!cms?.baseToken) {
  console.error("缺少 sync/feishu-cms.json");
  process.exit(1);
}

const wf = {
  client_token: `feiboxia-mark-${Date.now()}`,
  title: "飞博虾标记待发",
  steps: [
    {
      id: "trigger",
      type: "SetRecordTrigger",
      title: "一键操作改为立即发布",
      next: "mark",
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
      id: "mark",
      type: "SetRecordAction",
      title: "标记为待发博客",
      next: null,
      data: {
        table_name: "文章",
        max_set_record_num: 1,
        ref_info: { step_id: "trigger" },
        field_values: [
          {
            field_name: "状态",
            value: [{ value_type: "option", value: { name: "待发博客" } }],
          },
          {
            field_name: "发布结果",
            value: [
              {
                value_type: "text",
                value: "已标记待发：请本机执行 npm run feiboxia:ship",
              },
            ],
          },
        ],
      },
    },
  ],
};

const f = path.join(__dirname, "data/workflow-mark.json");
fs.mkdirSync(path.dirname(f), { recursive: true });
fs.writeFileSync(f, JSON.stringify(wf, null, 2), "utf8");

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
    "@feiboxia/data/workflow-mark.json",
  ],
  { encoding: "utf8", shell: true, cwd: root, maxBuffer: 10 * 1024 * 1024 }
);
console.log(r.stdout || r.stderr);
const j = (() => {
  try {
    return JSON.parse(r.stdout || "{}");
  } catch {
    return {};
  }
})();
const wid = j?.data?.workflow_id;
if (wid) {
  spawnSync(
    "lark-cli",
    [
      "base",
      "+workflow-enable",
      "--as",
      "user",
      "--base-token",
      cms.baseToken,
      "--workflow-id",
      wid,
    ],
    { encoding: "utf8", shell: true, cwd: root }
  );
  console.log("✓ 已启用「飞博虾标记待发」", wid);
  console.log("请在台账自动化中停用旧的「飞博虾立即发布」（含 localhost HTTP）工作流。");
}
process.exit(r.status ?? 1);
