#!/usr/bin/env node
/**
 * 作者博文管理（移动 / 删除 / 改标签）
 * 由飞博虾小组件 repository_dispatch 或本机 scripts/manage-post.mjs 触发
 */
import fs from "node:fs";
import path from "node:path";
import { deletePost, movePost, listPosts } from "./lib/post-manage.js";
import { ROOT } from "./lib/tenant.js";

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
console.log("博文管理:", action, payload.slug || payload.doc_token);

let result = null;

if (action === "move" || action === "retag") {
  result = movePost({
    slug: payload.slug,
    docUrl: payload.doc_url,
    docToken: payload.doc_token,
    navDir: payload.nav_dir,
    tags: payload.tags,
  });
  console.log("✓ 已移动/更新", result.to, result.tags?.join(","));
} else if (action === "delete") {
  result = deletePost({
    slug: payload.slug,
    docUrl: payload.doc_url,
    docToken: payload.doc_token,
  });
  console.log("✓ 已删除", result.deleted);
} else if (action === "list") {
  result = listPosts();
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
} else {
  throw new Error(`未知 action: ${action}（支持 move / delete / retag / list）`);
}

fs.mkdirSync(path.join(ROOT, "feiboxia/queue"), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, "feiboxia/queue/doc-manage.last.json"),
  JSON.stringify({ ...payload, result, handledAt: new Date().toISOString() }, null, 2),
  "utf8"
);

console.log("完成", action);
