#!/usr/bin/env node
/**
 * CSDN：导出 Markdown，并尝试打开编辑器页面（需作者本机手动粘贴）。
 * 用法: node sync/csdn.js <slug>
 */
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import {
  assertCanPublish,
  ensureOutDir,
  getSiteUrl,
  loadEnv,
  readPost,
  OUT_DIR,
} from "./lib/posts.js";

loadEnv();
const slug = process.argv[2];
if (!slug) {
  console.error("用法: npm run sync:csdn -- <slug>");
  process.exit(1);
}

const post = readPost(slug);
assertCanPublish(post);
const title = post.frontmatter.title || post.slug;
const url = `${getSiteUrl()}/${post.rel.replace(/\.md$/, "/").replace(/index\/$/, "")}`;

const md = `---\ntitle: ${title}\n---\n\n${post.body}\n\n> 原文：${url}\n`;
ensureOutDir();
const out = path.join(OUT_DIR, `${post.slug}.csdn.md`);
fs.writeFileSync(out, md, "utf8");
console.log(`已导出 CSDN Markdown: ${out}`);

const home = process.env.CSDN_HOME || "https://editor.csdn.net/md/";
console.log(`请打开编辑器并粘贴: ${home}`);
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
