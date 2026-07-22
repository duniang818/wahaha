#!/usr/bin/env node
/**
 * 知乎：导出纯文本/Markdown，并打开专栏写作页。
 * 用法: node sync/zhihu.js <slug>
 */
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import {
  assertCanPublish,
  ensureOutDir,
  getSiteUrl,
  loadEnv,
  markdownToPlain,
  readPost,
  OUT_DIR,
} from "./lib/posts.js";

loadEnv();
const slug = process.argv[2];
if (!slug) {
  console.error("用法: npm run sync:zhihu -- <slug>");
  process.exit(1);
}

const post = readPost(slug);
assertCanPublish(post);
const title = post.frontmatter.title || post.slug;
const url = `${getSiteUrl()}/`;
const body = `${title}\n\n${post.body}\n\n原文：${url}\n`;

ensureOutDir();
const outMd = path.join(OUT_DIR, `${post.slug}.zhihu.md`);
const outTxt = path.join(OUT_DIR, `${post.slug}.zhihu.txt`);
fs.writeFileSync(outMd, body, "utf8");
fs.writeFileSync(outTxt, `${title}\n\n${markdownToPlain(post.body)}\n\n原文：${url}\n`, "utf8");
console.log(`已导出知乎文案:\n- ${outMd}\n- ${outTxt}`);

const home = process.env.ZHIHU_HOME || "https://zhuanlan.zhihu.com/write";
console.log(`请打开并粘贴: ${home}`);
openUrl(home);

function openUrl(u) {
  const cmd =
    process.platform === "win32"
      ? ["cmd", ["/c", "start", "", u]]
      : process.platform === "darwin"
        ? ["open", [u]]
        : ["xdg-open", [u]];
  try {
    spawn(cmd[0], cmd[1], { detached: true, stdio: "ignore" }).unref();
  } catch {
    /* ignore */
  }
}
