#!/usr/bin/env node
/**
 * 本机测试：从飞书文档重新发布到 docs/（含图片 Blocks 拉取）
 *
 * 用法：
 *   node feiboxia/test-publish.mjs <飞书文档URL或token> [slug]
 *
 * 需要环境变量：
 *   FEISHU_APP_ID
 *   FEISHU_APP_SECRET
 *
 * 示例：
 *   node feiboxia/test-publish.mjs https://my.feishu.cn/docx/OGj3dcxuxowNetxgQudc771znhr
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractDocToken } from "./lib/feishu-doc.js";
import { ROOT } from "./lib/tenant.js";

const docArg = process.argv[2];
const slugArg = process.argv[3] || "";

if (!docArg) {
  console.error(`
用法: node feiboxia/test-publish.mjs <飞书文档URL或token> [slug]

需要:
  FEISHU_APP_ID / FEISHU_APP_SECRET（飞书开放平台应用凭证）
  文档已分享给该应用（或应用有文档读权限）

发布后本地预览:
  npm run dev
  打开 http://127.0.0.1:8000/wahaha/blog/posts/<slug>/
`);
  process.exit(1);
}

const appId = process.env.FEISHU_APP_ID || "";
const appSecret = process.env.FEISHU_APP_SECRET || "";
if (!appId || !appSecret) {
  console.error("请设置 FEISHU_APP_ID 和 FEISHU_APP_SECRET 环境变量。");
  console.error("可在 GitHub 仓库 Secrets 同名变量处查看，或飞书开放平台应用凭证页复制。");
  process.exit(1);
}

const token = extractDocToken(docArg) || docArg;
const docUrl = docArg.startsWith("http")
  ? docArg
  : `https://my.feishu.cn/docx/${token}`;

const payload = {
  action: "republish",
  mode: "publish",
  title: "飞书带图发布测试",
  doc_url: docUrl,
  doc_token: token,
  nav_dir: "blog/posts",
  slug: slugArg || `feishu-img-test-${Date.now().toString(36)}`,
  tags: "博客,测试",
  platforms: "blog",
  github_repo: "duniang818/wahaha",
  site_url: "https://duniang818.github.io/wahaha/",
  base_token: process.env.FEISHU_BASE_TOKEN || "",
  table_id: process.env.FEISHU_TABLE_ID || "",
};

console.log("测试发布:", payload.doc_url);
console.log("slug:", payload.slug);

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "ci-doc-publish.mjs");
const r = spawnSync(process.execPath, [script], {
  cwd: ROOT,
  stdio: "inherit",
  env: { ...process.env, CLIENT_PAYLOAD: JSON.stringify(payload) },
  shell: process.platform === "win32",
});

if (r.status !== 0) process.exit(r.status ?? 1);

console.log(`
✓ 发布脚本执行完成。

下一步:
  1. 检查 docs/blog/posts/${payload.slug}.md 是否含 ![](assets/...) 图片路径
  2. 检查 docs/blog/posts/assets/${payload.slug}/ 下是否有图片文件
  3. npm run dev
  4. 打开 http://127.0.0.1:8000/wahaha/blog/posts/${payload.slug}/
`);
