#!/usr/bin/env node
/**
 * 渡娘博客助手 — 终端交互菜单
 * 启动: npm run blog
 */
import readline from "node:readline";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DOCS = path.join(ROOT, "docs");
const MAP_FILE = path.join(ROOT, "sync/feishu-map.json");
const DEFAULTS_FILE = path.join(ROOT, "sync/assistant-defaults.json");

const DEFAULTS = loadDefaults();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(q) {
  return new Promise(resolve => rl.question(q, a => resolve(String(a ?? "").trim())));
}

async function askDefault(label, def) {
  const hint = def === undefined || def === "" ? "" : ` [${def}]`;
  const v = await ask(`${label}${hint}: `);
  return v === "" ? def ?? "" : v;
}

function loadDefaults() {
  const base = {
    dir: "blog/posts",
    platforms: "wechat,xhs,csdn,zhihu",
    tag: "旅行",
    site: "https://duniang818.github.io/wahaha/",
  };
  try {
    if (fs.existsSync(DEFAULTS_FILE)) {
      return { ...base, ...JSON.parse(fs.readFileSync(DEFAULTS_FILE, "utf8")) };
    }
  } catch {
    /* ignore */
  }
  return base;
}

function saveDefaults(partial) {
  const next = { ...DEFAULTS, ...partial };
  fs.mkdirSync(path.dirname(DEFAULTS_FILE), { recursive: true });
  fs.writeFileSync(DEFAULTS_FILE, JSON.stringify(next, null, 2), "utf8");
  Object.assign(DEFAULTS, next);
}

function pause() {
  return ask("\n按回车返回菜单…");
}

function runNode(scriptRel, args = [], { inherit = true } = {}) {
  const script = path.join(ROOT, scriptRel);
  console.log(`\n> node ${scriptRel} ${args.join(" ")}\n`);
  const r = spawnSync(process.execPath, [script, ...args], {
    cwd: ROOT,
    stdio: inherit ? "inherit" : "pipe",
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  return r.status ?? 1;
}

function runCmd(cmd, args = []) {
  console.log(`\n> ${cmd} ${args.join(" ")}\n`);
  const r = spawnSync(cmd, args, {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  return r.status ?? 1;
}

function listSlugs(limit = 30) {
  const acc = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      const st = fs.statSync(p);
      if (st.isDirectory()) {
        if (name === "private") continue;
        walk(p);
      } else if (/\.md$/i.test(name) && name.toLowerCase() !== "readme.md") {
        acc.push({
          slug: name.replace(/\.md$/i, ""),
          rel: path.relative(DOCS, p).replace(/\\/g, "/"),
        });
      }
    }
  }
  walk(DOCS);
  return acc.slice(0, limit);
}

function printBanner() {
  console.clear?.();
  console.log(`
╔══════════════════════════════════════════╗
║     渡娘博客助手  ·  终端一键工作台      ║
╠══════════════════════════════════════════╣
║  本地: D:\\my-blog                        ║
║  线上: ${DEFAULTS.site.padEnd(33)}║
╚══════════════════════════════════════════╝`);
}

async function menu() {
  while (true) {
    printBanner();
    console.log(`
  1) 本地预览博客 (mkdocs serve)
  2) 飞书文档 → 同步到博客（可推送上线）
  3) 本地文章 → 发布到外站（微信/小红书/CSDN/知乎）
  4) 批量发布（按标签）
  5) 构建静态站 (mkdocs build)
  6) Git 提交并推送上线
  7) 查看文章列表 / 飞书绑定
  8) 修改默认参数
  9) 打开发布台说明页
  0) 退出
`);
    const choice = await ask("请选择 [0-9]: ");
    try {
      switch (choice) {
        case "1":
          await doPreview();
          break;
        case "2":
          await doFromFeishu();
          break;
        case "3":
          await doPublishOne();
          break;
        case "4":
          await doPublishBatch();
          break;
        case "5":
          await doBuild();
          break;
        case "6":
          await doGitPush();
          break;
        case "7":
          await doList();
          break;
        case "8":
          await doEditDefaults();
          break;
        case "9":
          runNode("scripts/open-desk.js");
          await pause();
          break;
        case "0":
        case "q":
        case "Q":
          console.log("再见。");
          rl.close();
          return;
        default:
          console.log("无效选项。");
          await pause();
      }
    } catch (e) {
      console.error("\n出错:", e?.message || e);
      await pause();
    }
  }
}

async function doPreview() {
  console.log("启动本地预览 http://127.0.0.1:8000/ （Ctrl+C 结束服务后回车）");
  const mkdocs = path.join(ROOT, ".venv/Scripts/mkdocs.exe");
  const cmd = fs.existsSync(mkdocs) ? mkdocs : "mkdocs";
  const child = spawn(cmd, ["serve", "-a", "127.0.0.1:8000"], {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  await new Promise(resolve => child.on("exit", resolve));
  await pause();
}

async function doFromFeishu() {
  console.log("\n—— 飞书 → 博客 ——");
  console.log("在飞书写好后，粘贴文档链接即可。\n");

  const url = await askDefault("飞书文档 URL 或 token", DEFAULTS.lastFeishuUrl || "");
  if (!url) {
    console.log("未填写文档地址，已取消。");
    await pause();
    return;
  }

  const slug = await askDefault("文章文件名 slug（回车自动用标题）", "");
  const dir = await askDefault("写入目录（相对 docs/）", DEFAULTS.dir);
  const pushAns = await askDefault("推送到 GitHub 上线？(Y/n)", "Y");
  const alsoAns = await askDefault(
    `同时发外站？填写平台或留空跳过（默认可选 ${DEFAULTS.platforms}）`,
    ""
  );
  const privateAns = await askDefault("作为私密稿？(y/N)", "N");

  const args = [url];
  if (slug) args.push("--slug", slug);
  if (dir) args.push("--dir", dir);
  if (/^y/i.test(pushAns)) args.push("--push");
  if (alsoAns) args.push("--also", alsoAns);
  if (/^y/i.test(privateAns)) args.push("--private");

  saveDefaults({ lastFeishuUrl: url, dir });
  const code = runNode("sync/feishu-to-blog.js", args);
  console.log(code === 0 ? "\n✓ 完成" : `\n✗ 退出码 ${code}`);
  await pause();
}

async function doPublishOne() {
  console.log("\n—— 本地文章 → 外站 ——");
  const items = listSlugs(20);
  if (items.length) {
    console.log("最近可见文章：");
    items.slice(0, 12).forEach((it, i) => console.log(`  ${i + 1}. ${it.slug}  (${it.rel})`));
  }
  const slug = await askDefault("文章名 slug", items[0]?.slug || "welcome");
  if (!slug) {
    await pause();
    return;
  }
  const platforms = await askDefault("平台（逗号分隔）", DEFAULTS.platforms);
  const dry = await askDefault("仅演练 dry-run？(y/N)", "N");

  const args = [slug, "--to", platforms];
  if (/^y/i.test(dry)) args.push("--dry-run");

  saveDefaults({ platforms });
  const code = runNode("sync/publish-all.js", args);
  console.log(code === 0 ? "\n✓ 完成" : `\n✗ 退出码 ${code}`);
  await pause();
}

async function doPublishBatch() {
  console.log("\n—— 批量发布 ——");
  const tag = await askDefault("标签 tag", DEFAULTS.tag);
  const platforms = await askDefault("平台", DEFAULTS.platforms);
  const dry = await askDefault("仅演练 dry-run？(Y/n)", "Y");

  const args = ["--batch", "--tag", tag, "--to", platforms];
  if (!/^n/i.test(dry)) args.push("--dry-run");

  saveDefaults({ tag, platforms });
  const code = runNode("sync/publish-all.js", args);
  console.log(code === 0 ? "\n✓ 完成" : `\n✗ 退出码 ${code}`);
  await pause();
}

async function doBuild() {
  const mkdocs = path.join(ROOT, ".venv/Scripts/mkdocs.exe");
  const cmd = fs.existsSync(mkdocs) ? mkdocs : "mkdocs";
  const code = runCmd(cmd, ["build"]);
  console.log(code === 0 ? "\n✓ 构建完成 → site/" : `\n✗ 退出码 ${code}`);
  await pause();
}

async function doGitPush() {
  console.log("\n—— Git 提交并推送 ——");
  const msg = await askDefault("提交说明", "docs: update blog content");
  runCmd("git", ["status", "-sb"]);
  const ok = await askDefault("确认 add + commit + push？(Y/n)", "Y");
  if (/^n/i.test(ok)) {
    await pause();
    return;
  }
  runCmd("git", ["add", "docs", "sync", "overrides", "mkdocs.yml", "README.md"]);
  const c = spawnSync("git", ["commit", "-m", msg], {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (c.status !== 0) console.log("（可能没有变更需要提交）");
  const p = runCmd("git", ["push", "origin", "HEAD"]);
  console.log(p === 0 ? "\n✓ 已推送，等待 Actions 部署" : "\n✗ 推送失败（检查网络）");
  await pause();
}

async function doList() {
  console.log("\n—— 文章 ——");
  listSlugs(40).forEach(it => console.log(`  ${it.slug.padEnd(28)} ${it.rel}`));
  console.log("\n—— 飞书绑定 ——");
  if (fs.existsSync(MAP_FILE)) {
    console.log(fs.readFileSync(MAP_FILE, "utf8"));
  } else {
    console.log("（暂无）");
  }
  await pause();
}

async function doEditDefaults() {
  console.log("\n—— 默认参数 ——");
  const dir = await askDefault("默认写入目录", DEFAULTS.dir);
  const platforms = await askDefault("默认外站平台", DEFAULTS.platforms);
  const tag = await askDefault("默认批量标签", DEFAULTS.tag);
  const site = await askDefault("线上地址", DEFAULTS.site);
  saveDefaults({ dir, platforms, tag, site });
  console.log("\n已保存到 sync/assistant-defaults.json");
  await pause();
}

menu();
