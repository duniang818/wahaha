#!/usr/bin/env node
/**
 * 作者博文管理（移动 / 删除 / 改标签 / 拉取 / 撤销）
 * 由飞博虾小组件 repository_dispatch 或本机 scripts/manage-post.mjs 触发
 */
import fs from "node:fs";
import path from "node:path";
import { deletePost, movePost, listPosts, pullBindPost, revokePostByUrl } from "./lib/post-manage.js";
import { ROOT } from "./lib/tenant.js";
import { writeJobStatus } from "./lib/job-status.js";

function loadPayload() {
  if (process.env.CLIENT_PAYLOAD) {
    return JSON.parse(process.env.CLIENT_PAYLOAD);
  }
  const f = path.join(ROOT, "feiboxia/queue/doc-manage.json");
  if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, "utf8"));
  throw new Error("缺少 CLIENT_PAYLOAD");
}

const payload = loadPayload();
const action = String(payload.action || "").toLowerCase();
const jobId = String(payload.job_id || `mgr-${Date.now().toString(36)}`);

function job(patch) {
  return writeJobStatus(ROOT, jobId, {
    type: "manage",
    action,
    title: String(payload.title || payload.post_url || ""),
    docToken: payload.doc_token || null,
    ...patch,
  });
}

job({
  status: "running",
  progress: 15,
  phase: "开始",
  message: `正在执行「${action}」…`,
});

console.log("博文管理:", action, payload.slug || payload.doc_token);

let result = null;

try {
  if (action === "move" || action === "retag") {
    job({ progress: 50, phase: "更新", message: "正在移动栏目/更新标签…" });
    result = movePost({
      slug: payload.slug,
      docUrl: payload.doc_url,
      docToken: payload.doc_token,
      navDir: payload.nav_dir,
      tags: payload.tags,
    });
    console.log("✓ 已移动/更新", result.to, result.tags?.join(","));
  } else if (action === "delete") {
    job({ progress: 50, phase: "删除", message: "正在删除博文…" });
    result = deletePost({
      slug: payload.slug,
      docUrl: payload.doc_url,
      docToken: payload.doc_token,
    });
    console.log("✓ 已删除", result.deleted);
  } else if (action === "pull") {
    job({ progress: 50, phase: "拉取", message: "正在绑定飞书文档与线上博文…" });
    result = pullBindPost({
      postUrl: payload.post_url,
      docUrl: payload.doc_url,
      docToken: payload.doc_token,
      siteUrl: payload.site_url,
    });
    console.log("✓ 已拉取绑定", result.rel);
  } else if (action === "revoke") {
    job({ progress: 50, phase: "撤销", message: "正在删除线上博文…" });
    result = revokePostByUrl({
      postUrl: payload.post_url,
      siteUrl: payload.site_url,
    });
    console.log("✓ 已撤销", result.deleted);
  } else if (action === "list") {
    result = listPosts();
    console.log(JSON.stringify(result, null, 2));
    job({ status: "success", progress: 100, phase: "完成", message: "列表已输出" });
    process.exit(0);
  } else {
    throw new Error(`未知 action: ${action}（支持 move / delete / pull / revoke / retag / list）`);
  }

  fs.mkdirSync(path.join(ROOT, "feiboxia/queue"), { recursive: true });
  fs.writeFileSync(
    path.join(ROOT, "feiboxia/queue/doc-manage.last.json"),
    JSON.stringify({ ...payload, jobId, result, handledAt: new Date().toISOString() }, null, 2),
    "utf8"
  );

  const okMsg =
    action === "pull"
      ? `已拉取绑定 ${result?.rel || ""}`
      : action === "revoke"
        ? `已撤销删除 ${result?.deleted || payload.post_url || ""}`
        : `已完成 ${action}`;

  job({
    status: "success",
    progress: 100,
    phase: "完成",
    message: okMsg.trim(),
    blogUrl: payload.post_url || "",
  });

  console.log("完成", action);
} catch (e) {
  const msg = e?.message || String(e);
  job({ status: "failure", progress: 100, phase: "失败", message: msg });
  console.error(msg);
  process.exit(1);
}
