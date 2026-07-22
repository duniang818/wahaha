#!/usr/bin/env node
/**
 * 本机一键：打包台账待发 → 应用到 docs → git commit → push
 * 无公网也能完成「飞书 → GitHub 博客」。
 *
 *   npm run feiboxia:ship
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT } from "./lib/tenant.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function run(cmd, args, opts = {}) {
  console.log(`\n> ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
    ...opts,
  });
  return r.status ?? 1;
}

let code = run(process.execPath, [path.join(__dirname, "queue-pack.mjs")]);
if (code !== 0) process.exit(code);

code = run(process.execPath, [path.join(__dirname, "queue-apply.mjs")]);
if (code !== 0) process.exit(code);

run("git", ["add", "docs", "feiboxia/queue", "sync/feishu-map.json"]);
const c = spawnSync(
  "git",
  ["commit", "-m", "docs: 飞博虾发布台同步稿件"],
  { cwd: ROOT, stdio: "inherit", shell: process.platform === "win32" }
);
if (c.status !== 0) {
  console.log("（可能没有新变更需要提交）");
}

code = run("git", ["push", "origin", "HEAD"]);
console.log(
  code === 0
    ? "\n✓ 已推送。GitHub Pages 部署完成后即可在线阅读。"
    : "\n✗ 推送失败，请检查网络后重试 git push。"
);
process.exit(code);
