#!/usr/bin/env node
/**
 * 小红书官方不提供发文 OpenAPI。
 * 本脚本把博客文章导出为「标题 + 正文 + 话题」可复制文案，便于粘贴发布。
 *
 * 用法: node sync/xiaohongshu.js <slug>
 */
import fs from "node:fs";
import path from "node:path";
import {
  ensureOutDir,
  loadEnv,
  readPost,
  getSiteUrl,
  markdownToPlain,
  assertCanPublish,
  OUT_DIR,
} from "./lib/posts.js";

loadEnv();

const slug = process.argv[2];
if (!slug) {
  console.error("用法: npm run sync:xhs -- <文章slug>");
  process.exit(1);
}

const post = readPost(slug);
assertCanPublish(post);
const title = String(post.frontmatter.title || post.slug);
const tags = Array.isArray(post.frontmatter.tags) ? post.frontmatter.tags : [];
const defaultTopics = (process.env.XHS_DEFAULT_TOPICS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const topics = [...new Set([...tags, ...defaultTopics])]
  .slice(0, 10)
  .map(t => `#${String(t).replace(/^#/, "")}`)
  .join(" ");

const siteUrl = getSiteUrl();
const postUrl = `${siteUrl}/posts/${post.slug}/`;
const plain = markdownToPlain(post.body);

// 小红书标题建议 ≤ 20 字；正文分段便于阅读
const xhsTitle = title.length > 20 ? `${title.slice(0, 18)}…` : title;
const bodyLines = plain
  .split(/\n+/)
  .map(l => l.trim())
  .filter(Boolean)
  .slice(0, 40);

const copy = [
  xhsTitle,
  "",
  ...bodyLines,
  "",
  `完整版：${postUrl}`,
  "",
  topics,
  "",
].join("\n");

ensureOutDir();
const outFile = path.join(OUT_DIR, `${post.slug}.xiaohongshu.txt`);
fs.writeFileSync(outFile, copy, "utf8");

const checklist = path.join(OUT_DIR, `${post.slug}.xiaohongshu.md`);
fs.writeFileSync(
  checklist,
  `# 小红书发布检查清单 — ${title}

## 文案文件
\`${outFile}\`

## 建议步骤
1. 打开小红书 App / 创作者中心，新建图文笔记
2. 准备 1–9 张配图（封面优先竖图）
3. 粘贴 \`${path.basename(outFile)}\` 中的标题与正文
4. 核对话题标签，补充地点/商品等（如有）
5. 预览后发布

## 限制说明
小红书未提供官方开放发文 API，本通路采用「博客 Markdown → 规范化文案导出」方式，保证内容同源、避免非官方自动化违规风险。
`,
  "utf8"
);

console.log(`小红书文案已导出: ${outFile}`);
console.log(`发布清单: ${checklist}`);
console.log("\n—— 预览 ——\n");
console.log(copy);
