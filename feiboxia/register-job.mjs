#!/usr/bin/env node
/** 在 Actions 开始时写入 pending 任务状态，供小组件轮询 */
import { writeJobStatus } from "./lib/job-status.js";
import { ROOT } from "./lib/tenant.js";

const raw = process.env.CLIENT_PAYLOAD || "{}";
const p = JSON.parse(raw);
const type = String(p.job_type || p.type || "job");
const jobId = String(p.job_id || `${type}-${Date.now().toString(36)}`);

const labels = {
  "md-import": "Markdown 导入",
  publish: "发送/重新发送",
  manage: "拉取/撤销",
};

writeJobStatus(ROOT, jobId, {
  type,
  status: "pending",
  progress: 5,
  phase: "排队",
  message: `GitHub Actions 已接收「${labels[type] || type}」任务…`,
  mode: String(p.mode || p.action || ""),
  title: String(p.title || ""),
  docToken: p.doc_token || null,
});

console.log(`registered job ${jobId} type=${type}`);
