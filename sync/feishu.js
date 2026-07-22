#!/usr/bin/env node
/**
 * 将本地 Markdown 文章同步为飞书云文档。
 * 优先调用本机 lark-cli（用户身份）；未安装时提示手动步骤。
 *
 * 用法: node sync/feishu.js <slug>
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  ensureOutDir,
  loadEnv,
  readPost,
  getSiteUrl,
  OUT_DIR,
} from "./lib/posts.js";

loadEnv();

const slug = process.argv[2];
if (!slug) {
  console.error("用法: npm run sync:feishu -- <文章slug>");
  process.exit(1);
}

const post = readPost(slug);
const title = post.frontmatter.title || post.slug;
const siteUrl = getSiteUrl();
const postUrl = `${siteUrl}/posts/${post.slug}/`;

const mdContent = [
  `# ${title}`,
  "",
  `> 原文：${postUrl}`,
  "",
  post.body,
  "",
].join("\n");

ensureOutDir();
const mdFile = path.join(OUT_DIR, `${post.slug}.feishu.md`);
fs.writeFileSync(mdFile, mdContent, "utf8");
console.log(`已导出飞书 Markdown: ${mdFile}`);

const which = spawnSync("lark-cli", ["--version"], { encoding: "utf8" });
if (which.error || which.status !== 0) {
  console.log(`
未检测到 lark-cli。请先安装并登录：
  npm i -g @larksuite/cli   # 或以官方方式安装
  lark-cli auth login

然后手动创建文档：
  lark-cli docs +create --api-version v2 --markdown @${mdFile}

或安装 CLI 后重新运行本命令。
`);
  process.exit(0);
}

const args = [
  "docs",
  "+create",
  "--api-version",
  "v2",
  "--as",
  "user",
  "--doc-format",
  "markdown",
  "--content",
  `@${mdFile}`,
];

if (process.env.FEISHU_FOLDER_TOKEN) {
  args.push("--folder-token", process.env.FEISHU_FOLDER_TOKEN);
}

console.log("正在创建飞书文档…");
const result = spawnSync("lark-cli", args, {
  encoding: "utf8",
  shell: process.platform === "win32",
});

if (result.stdout) console.log(result.stdout);
if (result.stderr) console.error(result.stderr);

if (result.status !== 0) {
  console.error("飞书同步失败。请确认已执行 lark-cli auth login，并检查权限。");
  process.exit(result.status || 1);
}

console.log("飞书文档创建成功。");
