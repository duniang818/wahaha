#!/usr/bin/env node
/** @deprecated 请使用 register-job.mjs；保留兼容旧 workflow */
process.env.CLIENT_PAYLOAD = (() => {
  const p = JSON.parse(process.env.CLIENT_PAYLOAD || "{}");
  p.job_type = p.job_type || "md-import";
  return JSON.stringify(p);
})();
await import("./register-job.mjs");
