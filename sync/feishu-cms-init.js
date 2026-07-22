#!/usr/bin/env node
/**
 * 创建「渡娘博客台账」飞书多维表格（文章管理中心）
 *
 * 用法: npm run feishu:cms-init
 */
import fs from "node:fs";
import path from "node:path";
import { loadEnv, ROOT } from "./lib/posts.js";
import { getLarkStatus, runLark } from "./lib/lark.js";

loadEnv();

const CFG = path.join(ROOT, "sync/feishu-cms.json");

if (fs.existsSync(CFG)) {
  const existing = JSON.parse(fs.readFileSync(CFG, "utf8"));
  console.log("已存在台账配置 sync/feishu-cms.json：");
  console.log(JSON.stringify(existing, null, 2));
  console.log("\n若要重建，先删除该文件再运行本命令。");
  process.exit(0);
}

const st = getLarkStatus();
if (!st.ok) {
  console.error(st.message || "飞书未就绪");
  process.exit(1);
}

const fields = [
  { type: "text", name: "标题" },
  { type: "text", name: "飞书文档", style: { type: "url" } },
  { type: "text", name: "slug" },
  {
    type: "select",
    name: "状态",
    multiple: false,
    options: [
      { name: "草稿", hue: "Gray" },
      { name: "待发博客", hue: "Orange" },
      { name: "已发博客", hue: "Green" },
      { name: "待发外站", hue: "Blue" },
      { name: "已完成", hue: "Purple" },
    ],
  },
  { type: "text", name: "写入目录" },
  { type: "text", name: "标签" },
  { type: "text", name: "外站平台" },
  { type: "text", name: "博客路径" },
  { type: "text", name: "备注" },
];

const fieldsFile = path.join(ROOT, "sync/out/cms-fields.json");
fs.mkdirSync(path.dirname(fieldsFile), { recursive: true });
fs.writeFileSync(fieldsFile, JSON.stringify(fields), "utf8");

console.log("正在创建飞书多维表格「渡娘博客台账」…");
const create = runLark([
  "base",
  "+base-create",
  "--as",
  "user",
  "--name",
  "渡娘博客台账",
  "--table-name",
  "文章",
  "--fields",
  `@${fieldsFile}`,
  "--json",
]);

let payload;
try {
  payload = JSON.parse(create.stdout || "{}");
} catch {
  console.error(create.stdout || create.stderr);
  process.exit(1);
}

if (create.status !== 0 || payload.ok === false) {
  console.error(JSON.stringify(payload, null, 2) || create.stderr);
  console.error("\n若权限不足，请执行: lark-cli auth login --domain base");
  process.exit(create.status || 1);
}

const data = payload.data || {};
const baseToken =
  data.base?.base_token ||
  data.app_token ||
  data.base_token ||
  data.token ||
  data.app?.app_token ||
  "";
const tableId =
  data.table?.id ||
  data.table_id ||
  data.default_table_id ||
  data.tables?.[0]?.table_id ||
  data.table?.table_id ||
  "";
const url =
  data.base?.url ||
  data.url ||
  data.app?.url ||
  (baseToken ? `https://feishu.cn/base/${baseToken}` : "");

const cfg = {
  baseToken,
  tableId,
  url,
  tableName: "文章",
  createdAt: new Date().toISOString(),
  raw: data,
};

fs.writeFileSync(CFG, JSON.stringify(cfg, null, 2), "utf8");
console.log(`
✓ 台账已创建
- 打开: ${url || "(见飞书云空间「渡娘博客台账」)"}
- 本机配置: sync/feishu-cms.json

下一步：
1. 在飞书写好云文档
2. 台账新增一行：填「飞书文档」链接，状态选「待发博客」
3. npm run blog →「从台账一键发布到博客」
`);
