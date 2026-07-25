#!/usr/bin/env node
/** 在 Actions 开始时写入 pending 任务状态，供小组件轮询 */
import { writeJobStatus } from "./lib/job-status.js";
import { ROOT } from "./lib/tenant.js";

const raw = process.env.CLIENT_PAYLOAD || "{}";
const p = JSON.parse(raw);
const jobId = String(p.job_id || `md-${Date.now().toString(36)}`);

writeJobStatus(ROOT, jobId, {
  type: "md-import",
  status: "pending",
  progress: 5,
  phase: "排队",
  message: "GitHub Actions 已接收任务…",
  mode: String(p.mode || "overwrite"),
  title: String(p.title || ""),
  docToken: p.doc_token || null,
});

console.log(`registered job ${jobId}`);
