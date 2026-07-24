#!/usr/bin/env node
/**
 * 将 Markdown 转为可编辑飞书 docx 正文（覆盖 / 追加 / 新建）
 *
 * 环境变量 CLIENT_PAYLOAD 或 feiboxia/queue/md-import.json
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT } from "./lib/tenant.js";
import { sendFeishuText } from "./lib/feishu-notify.js";

const MAX_CHARS = Number(process.env.FEIBOXIA_MD_IMPORT_MAX || 900_000);

function loadPayload() {
  if (process.env.CLIENT_PAYLOAD) {
    return JSON.parse(process.env.CLIENT_PAYLOAD);
  }
  const f = path.join(ROOT, "feiboxia/queue/md-import.json");
  if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, "utf8"));
  throw new Error("缺少 CLIENT_PAYLOAD");
}

function runLark(args, { allowFail = false } = {}) {
  const r = spawnSync("lark-cli", args, {
    encoding: "utf8",
    cwd: ROOT,
    env: process.env,
  });
  const out = `${r.stdout || ""}${r.stderr || ""}`.trim();
  if (r.status !== 0 && !allowFail) {
    throw new Error(out || `lark-cli 失败: ${args.join(" ")}`);
  }
  return { code: r.status ?? 0, out };
}

function parseJsonMaybe(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

const payload = loadPayload();
const mode = String(payload.mode || payload.action || "overwrite").toLowerCase();
let markdown = String(payload.markdown || "");
if (payload.markdown_b64) {
  markdown = Buffer.from(String(payload.markdown_b64), "base64").toString("utf8");
}
if (!markdown.trim()) {
  throw new Error("Markdown 内容为空");
}
if (markdown.length > MAX_CHARS) {
  throw new Error(`Markdown 过长（${markdown.length} 字符，上限 ${MAX_CHARS}）`);
}

const docToken = payload.doc_token || "";
const title = String(payload.title || payload.name || "导入的 Markdown").trim();
const queueDir = path.join(ROOT, "feiboxia/queue");
fs.mkdirSync(queueDir, { recursive: true });
const mdFile = path.join(queueDir, "import.md");
fs.writeFileSync(mdFile, markdown, "utf8");

let result = { mode, docToken, ok: false, message: "" };

if (mode === "new") {
  const args = [
    "drive",
    "+import",
    "--type",
    "docx",
    "--file",
    mdFile,
    "--as",
    "bot",
    "--name",
    title,
  ];
  if (payload.folder_token) {
    args.push("--folder-token", String(payload.folder_token));
  }
  const { out } = runLark(args);
  const j = parseJsonMaybe(out);
  const token =
    j?.data?.token ||
    j?.data?.file?.token ||
    j?.token ||
    j?.file_token ||
    "";
  const url = token ? `https://my.feishu.cn/docx/${token}` : "";
  result = {
    mode,
    ok: true,
    message: url ? `已新建飞书文档：${url}` : "已新建飞书文档",
    newDocToken: token,
    newDocUrl: url,
  };
} else {
  if (!docToken) {
    throw new Error("覆盖/追加模式需要 doc_token（请在本篇飞书文档内打开飞博虾）");
  }
  const command = mode === "append" ? "append" : "overwrite";
  runLark([
    "docs",
    "+update",
    "--doc",
    docToken,
    "--command",
    command,
    "--doc-format",
    "markdown",
    "--content",
    `@${mdFile}`,
    "--as",
    "bot",
  ]);
  result = {
    mode,
    docToken,
    ok: true,
    message:
      command === "append"
        ? "已将 Markdown 追加到当前文档末尾，可在飞书中继续编辑"
        : "已用 Markdown 覆盖当前文档正文，可在飞书中继续编辑",
  };
}

fs.writeFileSync(
  path.join(queueDir, "md-import.last.json"),
  JSON.stringify({ ...result, handledAt: new Date().toISOString(), title }, null, 2),
  "utf8"
);

console.log(result.message);

try {
  await sendFeishuText(`【飞博虾】Markdown 导入 · 成功\n${title}\n${result.message}`);
} catch (e) {
  console.warn("飞书通知跳过:", e.message || e);
}

process.exit(0);
