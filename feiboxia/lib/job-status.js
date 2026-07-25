/**
 * 飞博虾异步任务状态（供小组件轮询 feiboxia/queue/jobs/{jobId}.json）
 */
import fs from "node:fs";
import path from "node:path";

export function jobFilePath(root, jobId) {
  return path.join(root, "feiboxia/queue/jobs", `${jobId}.json`);
}

export function writeJobStatus(root, jobId, patch) {
  if (!jobId) return null;
  const file = jobFilePath(root, jobId);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  let prev = {};
  if (fs.existsSync(file)) {
    try {
      prev = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      prev = {};
    }
  }
  const next = {
    ...prev,
    ...patch,
    jobId,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(file, JSON.stringify(next, null, 2), "utf8");
  return next;
}
