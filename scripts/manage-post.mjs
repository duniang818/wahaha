#!/usr/bin/env node
/**
 * 作者本机：管理博文（移动栏目 / 改标签 / 删除 / 列表）
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deletePost, listPosts, movePost } from "../feiboxia/lib/post-manage.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

function flag(name) {
  const i = args.indexOf(name);
  if (i < 0) return "";
  return args[i + 1] || "";
}

function hasFlag(name) {
  return args.includes(name);
}

function maybePush(result, slug) {
  if (!hasFlag("--push")) return;
  spawnSync("node", ["scripts/build-posts-index.mjs"], { cwd: ROOT, stdio: "inherit" });
  spawnSync(
    "git",
    ["add", "docs", "sync/feishu-map.json", "docs/javascripts/posts-index.json", "docs/javascripts/posts-index-preview.json"],
    { cwd: ROOT, stdio: "inherit" }
  );
  let msg = `docs: 更新博文 ${slug}`;
  if (result?.to) msg = `docs: 移动博文 ${result.slug} → ${result.navDir}`;
  if (result?.deleted) msg = `docs: 删除博文 ${result.slug}`;
  const c = spawnSync("git", ["commit", "-m", msg], { cwd: ROOT, stdio: "inherit" });
  if (c.status === 0) spawnSync("git", ["push", "origin", "HEAD"], { cwd: ROOT, stdio: "inherit" });
}

if (!args.length || args[0] === "--help" || args[0] === "-h") {
  console.log(`
作者博文管理（仅本机 / 飞博虾 PAT 触发，访客无法在公开站操作）

  npm run post:list
  npm run post:move -- <slug> --nav travel [--tags 旅行,测试] [--push]
  npm run post:tags -- <slug> --tags 标签1,标签2 [--push]
  npm run post:delete -- <slug> [--push]

同步说明：
  · 改正文 → 飞书编辑 +「重新发布」
  · 移动/标签/删除 → 本命令或飞书飞博虾「管理」
  · --push → git commit + push，约 1~2 分钟上线
`);
  process.exit(0);
}

const sub = args[0];

try {
  if (sub === "list") {
    for (const p of listPosts()) {
      console.log(`- ${p.title}  [${p.nav}]  ${p.rel}`);
    }
    process.exit(0);
  }

  const slug = sub === "move" || sub === "tags" || sub === "delete" ? args[1] : sub;
  if (!slug) throw new Error("缺少 slug");

  let result;
  if (sub === "move" || hasFlag("--nav")) {
    const navDir = flag("--nav");
    if (!navDir && sub === "move") throw new Error("move 需要 --nav");
    result = movePost({
      slug,
      navDir: navDir || undefined,
      tags: flag("--tags") || undefined,
    });
    console.log("✓ 完成:", result.from, "→", result.to, "| 标签:", (result.tags || []).join(", "));
  } else if (sub === "tags" || hasFlag("--tags")) {
    result = movePost({ slug, tags: flag("--tags") });
    console.log("✓ 标签:", (result.tags || []).join(", "));
  } else if (sub === "delete") {
    result = deletePost({ slug });
    console.log("✓ 已删除:", result.deleted, "（飞书文档保留，可重新发布）");
  } else {
    throw new Error("未知命令，使用 --help");
  }

  maybePush(result, slug);
} catch (e) {
  console.error("失败:", e.message || e);
  process.exit(1);
}
