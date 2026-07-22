#!/usr/bin/env node
/**
 * 一键发布到多平台（作者本机）。
 * 用法:
 *   node sync/publish-all.js <slug> [--to wechat,xhs,csdn,zhihu,feishu] [--dry-run]
 *   node sync/publish-all.js --batch --tag 旅行 --to xhs,wechat
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadEnv,
  readPost,
  listPosts,
  assertCanPublish,
  allowedPlatforms,
  appendLog,
} from "./lib/posts.js";

loadEnv();

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const batch = args.includes("--batch");

function getFlag(name) {
  const i = args.indexOf(name);
  if (i < 0) return null;
  return args[i + 1] || null;
}

const toRaw = getFlag("--to");
const tagFilter = getFlag("--tag");

const PLATFORM_SCRIPTS = {
  feishu: "sync/feishu.js",
  wechat: "sync/wechat.js",
  xhs: "sync/xiaohongshu.js",
  csdn: "sync/csdn.js",
  zhihu: "sync/zhihu.js",
};

function pickPlatforms(post) {
  const allowed = allowedPlatforms(post);
  const requested = toRaw
    ? toRaw.split(/[,，\s]+/).map(s => s.trim()).filter(Boolean)
    : allowed;
  return requested.filter(p => {
    if (!PLATFORM_SCRIPTS[p]) {
      console.warn(`未知平台: ${p}`);
      return false;
    }
    if (!allowed.includes(p) && allowed.length) {
      console.warn(`文章未授权平台 ${p}（frontmatter.platforms）`);
      return false;
    }
    return true;
  });
}

function publishOne(slug) {
  const post = readPost(slug);
  console.log(`\n######## ${post.frontmatter.title || post.slug} ########`);
  console.log(`文件: ${post.rel}`);

  try {
    assertCanPublish(post);
  } catch (e) {
    console.error(String(e.message || e));
    appendLog(`DENY ${post.rel}: ${e.message}`);
    return 1;
  }

  const platforms = pickPlatforms(post);
  if (!platforms.length) {
    console.error("没有可发布的平台");
    return 1;
  }

  if (dryRun) {
    console.log(`[dry-run] 将发布到: ${platforms.join(", ")}`);
    appendLog(`DRY-RUN ${post.rel} -> ${platforms.join(",")}`);
    return 0;
  }

  let failed = 0;
  for (const p of platforms) {
    const name = p;
    const rel = PLATFORM_SCRIPTS[p];
    console.log(`\n======== ${name} ========`);
    const r = spawnSync(process.execPath, [path.join(root, rel), post.slug], {
      encoding: "utf8",
      cwd: root,
      stdio: "inherit",
    });
    if (r.status !== 0) {
      failed += 1;
      appendLog(`FAIL ${post.rel} ${name} exit=${r.status}`);
    } else {
      appendLog(`OK ${post.rel} ${name}`);
    }
  }
  return failed > 0 ? 1 : 0;
}

if (batch) {
  let posts = listPosts().filter(p => !p.isPrivatePath);
  if (tagFilter) {
    posts = posts.filter(p => {
      const tags = p.frontmatter.tags || [];
      return Array.isArray(tags) && tags.map(String).includes(tagFilter);
    });
  }
  // Prefer posts with publishable frontmatter title
  posts = posts.filter(p => p.frontmatter.title || p.rel.includes("blog/posts/"));
  console.log(`批量候选 ${posts.length} 篇${tagFilter ? `（tag=${tagFilter}）` : ""}`);
  let code = 0;
  for (const p of posts) {
    code |= publishOne(p.filePath);
  }
  process.exit(code);
}

const slug = args.find(a => !a.startsWith("--") && a !== toRaw && a !== tagFilter);
if (!slug) {
  console.error(`用法:
  node sync/publish-all.js <slug> [--to wechat,xhs,csdn,zhihu] [--dry-run]
  node sync/publish-all.js --batch [--tag 旅行] [--to xhs,wechat] [--dry-run]`);
  process.exit(1);
}

process.exit(publishOne(slug));
