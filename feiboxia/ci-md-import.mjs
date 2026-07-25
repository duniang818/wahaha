#!/usr/bin/env node
/**
 * 将 Markdown 转为可编辑飞书 docx 正文（覆盖 / 追加 / 新建）
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT } from "./lib/tenant.js";
import { sendFeishuText } from "./lib/feishu-notify.js";
import { writeJobStatus } from "./lib/job-status.js";

const MAX_CHARS = Number(process.env.FEIBOXIA_MD_IMPORT_MAX || 900_000);

function loadPayload() {
  if (process.env.CLIENT_PAYLOAD) {
    return JSON.parse(process.env.CLIENT_PAYLOAD);
  }
  const f = path.join(ROOT, "feiboxia/queue/md-import.json");
  if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, "utf8"));
  throw new Error("缺少 CLIENT_PAYLOAD");
}

function runLark(args) {
  const r = spawnSync("lark-cli", args, {
    encoding: "utf8",
    cwd: ROOT,
    env: process.env,
  });
  const out = `${r.stdout || ""}${r.stderr || ""}`.trim();
  if (r.status !== 0) {
    throw new Error(out || `lark-cli 失败: ${args.join(" ")}`);
  }
  return out;
}

function parseJsonMaybe(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

const payload = loadPayload();
const jobId = String(payload.job_id || `md-${Date.now().toString(36)}`);
const mode = String(payload.mode || payload.action || "overwrite").toLowerCase();
const docToken = payload.doc_token || "";
const title = String(payload.title || payload.name || "导入的 Markdown").trim();

function job(patch) {
  return writeJobStatus(ROOT, jobId, {
    type: "md-import",
    mode,
    title,
    docToken: docToken || null,
    ...patch,
  });
}

job({
  status: "running",
  progress: 8,
  phase: "任务已开始",
  message: "正在解析 Markdown…",
});

let markdown = String(payload.markdown || "");
if (payload.markdown_b64) {
  markdown = Buffer.from(String(payload.markdown_b64), "base64").toString("utf8");
}
if (!markdown.trim()) {
  job({ status: "failure", progress: 100, phase: "失败", message: "Markdown 内容为空" });
  process.exit(1);
}
if (markdown.length > MAX_CHARS) {
  job({
    status: "failure",
    progress: 100,
    phase: "失败",
    message: `Markdown 过长（${markdown.length} 字符）`,
  });
  process.exit(1);
}

const queueDir = path.join(ROOT, "feiboxia/queue");
fs.mkdirSync(queueDir, { recursive: true });
const mdFile = path.join(queueDir, "import.md");
fs.writeFileSync(mdFile, markdown, "utf8");

job({ progress: 25, phase: "写入临时文件", message: "正在连接飞书…" });

let result = { ok: false, message: "", newDocUrl: "", newDocToken: "" };

try {
  if (mode === "new") {
    job({ progress: 45, phase: "导入为 docx", message: "正在创建新飞书文档…" });
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
    const out = runLark(args);
    const j = parseJsonMaybe(out);
    const token =
      j?.data?.token ||
      j?.data?.file?.token ||
      j?.token ||
      j?.file_token ||
      "";
    const url = token ? `https://my.feishu.cn/docx/${token}` : "";
    result = {
      ok: true,
      message: url ? `已新建飞书文档` : "已新建飞书文档（未解析到链接）",
      newDocToken: token,
      newDocUrl: url,
    };
  } else {
    if (!docToken) {
      throw new Error("覆盖/追加模式需要 doc_token（请在本篇飞书文档内打开飞博虾）");
    }
    const command = mode === "append" ? "append" : "overwrite";
    job({
      progress: 55,
      phase: command === "append" ? "追加正文" : "覆盖正文",
      message: "正在写入飞书 docx…",
    });
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
    const url = docToken ? `https://my.feishu.cn/docx/${docToken}` : "";
    result = {
      ok: true,
      message:
        command === "append"
          ? "已将 Markdown 追加到当前文档末尾"
          : "已用 Markdown 覆盖当前文档正文",
      newDocUrl: url,
      newDocToken: docToken,
    };
  }

  job({
    status: "success",
    progress: 100,
    phase: "完成",
    message: result.message,
    newDocUrl: result.newDocUrl || "",
    newDocToken: result.newDocToken || "",
  });

  fs.writeFileSync(
    path.join(queueDir, "md-import.last.json"),
    JSON.stringify(
      { ...result, mode, jobId, handledAt: new Date().toISOString(), title },
      null,
      2
    ),
    "utf8"
  );

  console.log(result.message, result.newDocUrl || "");

  try {
    const lines = [
      "【飞博虾】Markdown 导入 · 成功",
      title,
      result.message,
      result.newDocUrl || "",
    ].filter(Boolean);
    await sendFeishuText(lines.join("\n"));
  } catch (e) {
    console.warn("飞书通知跳过:", e.message || e);
  }

  process.exit(0);
} catch (e) {
  const msg = e.message || String(e);
  job({ status: "failure", progress: 100, phase: "失败", message: msg });
  console.error(msg);
  try {
    await sendFeishuText(`【飞博虾】Markdown 导入 · 失败\n${title}\n${msg}`);
  } catch {
    /* ignore */
  }
  process.exit(1);
}
