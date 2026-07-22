#!/usr/bin/env node
/**
 * 一键：校验文章 → 导出/同步飞书、微信、小红书。
 * GitHub Pages 仍由 git push + Actions 负责；本脚本专注多平台内容同步。
 *
 * 用法: node sync/publish-all.js <slug>
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv, readPost } from "./lib/posts.js";

loadEnv();

const slug = process.argv[2];
if (!slug) {
  console.error("用法: npm run publish:all -- <文章slug>");
  process.exit(1);
}

const post = readPost(slug);
console.log(`准备发布: ${post.frontmatter.title || post.slug}`);
console.log(`文件: ${post.filePath}\n`);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scripts = [
  ["飞书", "sync/feishu.js"],
  ["微信公众号", "sync/wechat.js"],
  ["小红书", "sync/xiaohongshu.js"],
];

let failed = 0;
for (const [name, rel] of scripts) {
  console.log(`\n======== ${name} ========`);
  const r = spawnSync(process.execPath, [path.join(root, rel), slug], {
    encoding: "utf8",
    cwd: root,
    stdio: "inherit",
  });
  if (r.status !== 0) {
    console.error(`${name} 同步未完全成功 (exit ${r.status})`);
    failed += 1;
  }
}

console.log(`
======== 博客站点 ========
本地预览: npm run dev
构建检查: npm run build
部署上线: git add/commit/push → GitHub Actions 自动发布
站点地址: https://duniang818.github.io/
`);

process.exit(failed > 0 ? 1 : 0);
