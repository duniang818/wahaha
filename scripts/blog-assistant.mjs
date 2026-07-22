#!/usr/bin/env node
/**
 * 渡娘博客助手 — 飞书优先一键工作台
 * 启动: npm run blog
 */
import readline from "node:readline";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getLarkStatus } from "../sync/lib/lark.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DOCS = path.join(ROOT, "docs");
const MAP_FILE = path.join(ROOT, "sync/feishu-map.json");
const CMS_FILE = path.join(ROOT, "sync/feishu-cms.json");
const DEFAULTS_FILE = path.join(ROOT, "sync/assistant-defaults.json");
const ENV_FILE = path.join(ROOT, ".env");
const ENV_EXAMPLE = path.join(ROOT, ".env.example");

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
    platforms: "xhs,csdn,zhihu",
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

function runNode(scriptRel, args = []) {
  const script = path.join(ROOT, scriptRel);
  console.log(`\n> node ${scriptRel} ${args.join(" ")}\n`);
  const r = spawnSync(process.execPath, [script, ...args], {
    cwd: ROOT,
    stdio: "inherit",
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

function feishuReadyLine() {
  const st = getLarkStatus();
  if (!st.configured) return "飞书: ✗ 未配置应用（选 S 一键初始化）";
  if (!st.ok) return `飞书: ✗ ${st.message?.split("\n")[0] || "需登录"}`;
  return "飞书: ✓ 已就绪";
}

function printBanner() {
  console.clear?.();
  console.log(`
╔══════════════════════════════════════════════╗
║          飞博虾  ·  飞书一键发博客           ║
╠══════════════════════════════════════════════╣
║  ${feishuReadyLine().padEnd(42).slice(0, 42)}║
║  线上: ${String(DEFAULTS.site).padEnd(37).slice(0, 37)}║
╚══════════════════════════════════════════════╝`);
}

async function menu() {
  while (true) {
    printBanner();
    console.log(`
【推荐 · 飞博虾】
  S) 飞书首次配置 / 登录
  W) 打开工作台说明（浏览器）
  P) 发布台一键：feiboxia:ship（飞书→博客→push）
  F) 启动本机绑定页服务
  U) 升级台账字段
  1) 飞书文档 URL → 写入博客
  2) 创建飞书「博客台账」
  3) 从台账「待发博客」发布
  4) 重新同步已绑定文档
  T) 扫描定时稿

【本机 / 外站】
  5) 本地预览 (mkdocs serve)
  6) 本地文章 → 外站导出
  7) 构建 / Git 推送
  8) 查看文章列表 / 飞书绑定
  9) 修改默认参数
  0) 退出
`);
    const choice = (await ask("请选择: ")).toUpperCase();
    try {
      switch (choice) {
        case "S":
          await doFeishuSetup();
          break;
        case "W": {
          const url = path.join(ROOT, "docs/feiboxia/workbench.html");
          const site = "https://duniang818.github.io/wahaha/feiboxia/workbench.html";
          console.log(`\n线上工作台: ${site}`);
          console.log(`本地文件: ${url}`);
          if (process.platform === "win32") {
            spawn("cmd", ["/c", "start", "", site], { detached: true, stdio: "ignore" }).unref();
          }
          await pause();
          break;
        }
        case "P":
          runNode("feiboxia/ship.mjs");
          await pause();
          break;
        case "F":
          console.log("\n启动飞博虾服务（Ctrl+C 结束后回车）…");
          {
            const child = spawn(process.execPath, [path.join(ROOT, "feiboxia/server.mjs")], {
              cwd: ROOT,
              stdio: "inherit",
              shell: process.platform === "win32",
              env: process.env,
            });
            await new Promise(resolve => child.on("exit", resolve));
          }
          await pause();
          break;
        case "U":
          runNode("feiboxia/upgrade-base.mjs");
          await pause();
          break;
        case "T":
          runNode("feiboxia/scan.mjs");
          await pause();
          break;
        case "1":
          await doFromFeishu();
          break;
        case "2":
          await doCmsInit();
          break;
        case "3":
          await doCmsPublish();
          break;
        case "4":
          await doResyncBound();
          break;
        case "5":
          await doPreview();
          break;
        case "6":
          await doPublishOne();
          break;
        case "7":
          await doBuildOrPush();
          break;
        case "8":
          await doList();
          break;
        case "9":
          await doEditDefaults();
          break;
        case "0":
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

async function doFeishuSetup() {
  console.log("\n—— 飞书配置向导 ——\n");
  const st = getLarkStatus();
  console.log(st.message || JSON.stringify(st, null, 2));

  if (!fs.existsSync(ENV_FILE) && fs.existsSync(ENV_EXAMPLE)) {
    fs.copyFileSync(ENV_EXAMPLE, ENV_FILE);
    console.log("\n已创建 .env（可稍后填微信 AppID 等）");
  }

  if (!st.configured) {
    console.log(`
请在本机另开一个终端执行（会弹出浏览器/二维码）：

  lark-cli config init --new --lang zh

完成后回来本菜单再选 S，继续登录。
`);
    await pause();
    return;
  }

  if (!st.ok) {
    console.log(`
需要用户授权读文档。请在本机终端执行：

  lark-cli auth login --domain docs
  lark-cli auth login --domain base

（台账功能需要 base 权限）
`);
    const tryNow = await askDefault("现在由助手发起 docs 授权？(Y/n)", "Y");
    if (/^y/i.test(tryNow)) {
      console.log("\n正在发起授权（请在浏览器完成）…\n");
      runCmd("lark-cli", ["auth", "login", "--domain", "docs"]);
      runCmd("lark-cli", ["auth", "login", "--domain", "base"]);
    }
    console.log("\n复查状态:");
    console.log(JSON.stringify(getLarkStatus(), null, 2));
    await pause();
    return;
  }

  console.log("\n✓ 飞书已就绪。可以选 1 发布单篇，或 2 创建台账。");
  await pause();
}

async function doFromFeishu() {
  const st = getLarkStatus();
  if (!st.ok) {
    console.log("\n飞书未就绪。请先选 S 完成配置/登录。");
    console.log(st.message || "");
    await pause();
    return;
  }

  console.log("\n—— 飞书文档 → 博客 ——");
  console.log("在飞书写好后，粘贴文档链接即可。\n");

  const url = await askDefault("飞书文档 URL 或 token", DEFAULTS.lastFeishuUrl || "");
  if (!url) {
    console.log("未填写文档地址，已取消。");
    await pause();
    return;
  }

  const slug = await askDefault("文章文件名 slug（回车自动用标题）", "");
  const dir = await askDefault("写入目录（相对 docs/）", DEFAULTS.dir);
  const tags = await askDefault("标签（逗号分隔）", "飞书同步");
  const pushAns = await askDefault("推送到 GitHub 上线？(Y/n)", "Y");
  const alsoAns = await askDefault(
    "同时导出外站？填写平台或留空跳过（如 xhs,csdn）",
    ""
  );
  const privateAns = await askDefault("作为私密稿？(y/N)", "N");

  const args = [url];
  if (slug) args.push("--slug", slug);
  if (dir) args.push("--dir", dir);
  if (tags) args.push("--tags", tags);
  if (/^y/i.test(pushAns)) args.push("--push");
  if (alsoAns) args.push("--also", alsoAns);
  if (/^y/i.test(privateAns)) args.push("--private");

  saveDefaults({ lastFeishuUrl: url, dir });
  const code = runNode("sync/feishu-to-blog.js", args);
  console.log(code === 0 ? "\n✓ 完成" : `\n✗ 退出码 ${code}`);
  await pause();
}

async function doCmsInit() {
  const st = getLarkStatus();
  if (!st.ok) {
    console.log("\n飞书未就绪。请先选 S。");
    await pause();
    return;
  }
  const code = runNode("sync/feishu-cms-init.js");
  console.log(code === 0 ? "\n✓ 完成" : `\n✗ 退出码 ${code}`);
  if (fs.existsSync(CMS_FILE)) {
    console.log(fs.readFileSync(CMS_FILE, "utf8"));
  }
  await pause();
}

async function doCmsPublish() {
  const st = getLarkStatus();
  if (!st.ok) {
    console.log("\n飞书未就绪。请先选 S。");
    await pause();
    return;
  }
  if (!fs.existsSync(CMS_FILE)) {
    console.log("尚未创建台账，请先选 2。");
    await pause();
    return;
  }
  const pushAns = await askDefault("发布后 git push 上线？(Y/n)", "Y");
  const allAns = await askDefault("发布全部「待发博客」？(y/N)", "N");
  const args = [];
  if (/^y/i.test(pushAns)) args.push("--push");
  if (/^y/i.test(allAns)) args.push("--all-pending");
  const code = runNode("sync/feishu-cms-publish.js", args);
  console.log(code === 0 ? "\n✓ 完成" : `\n✗ 退出码 ${code}`);
  await pause();
}

async function doResyncBound() {
  const st = getLarkStatus();
  if (!st.ok) {
    console.log("\n飞书未就绪。请先选 S。");
    await pause();
    return;
  }
  if (!fs.existsSync(MAP_FILE)) {
    console.log("还没有绑定记录。请先用选项 1 同步过至少一篇。");
    await pause();
    return;
  }
  const map = JSON.parse(fs.readFileSync(MAP_FILE, "utf8"));
  const entries = Object.entries(map);
  if (!entries.length) {
    console.log("绑定表为空。");
    await pause();
    return;
  }
  console.log("\n已绑定：");
  entries.forEach(([id, m], i) => {
    console.log(`  ${i + 1}. ${m.title || m.slug}  ${m.url || id}`);
  });
  const pick = await askDefault("选择序号（或粘贴 URL）", "1");
  let url = pick;
  const n = Number(pick);
  if (Number.isFinite(n) && n >= 1 && n <= entries.length) {
    url = entries[n - 1][1].url || entries[n - 1][0];
  }
  const pushAns = await askDefault("推送上线？(Y/n)", "Y");
  const args = [url];
  const hit = entries.find(([, m]) => m.url === url)?.[1] || entries[n - 1]?.[1];
  if (hit?.slug) args.push("--slug", hit.slug);
  if (hit?.path) {
    const dir = path.posix.dirname(hit.path.replace(/\\/g, "/"));
    if (dir && dir !== ".") args.push("--dir", dir);
  }
  if (/^y/i.test(pushAns)) args.push("--push");
  const code = runNode("sync/feishu-to-blog.js", args);
  console.log(code === 0 ? "\n✓ 完成" : `\n✗ 退出码 ${code}`);
  await pause();
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

async function doPublishOne() {
  console.log("\n—— 本地 → 外站 ——");
  console.log(`说明：
  · 小红书 / CSDN / 知乎：导出文案并打开编辑页（官方无完整发文 API）
  · 微信公众号：需在 .env 填写 WECHAT_APP_ID / WECHAT_APP_SECRET
`);
  const items = listSlugs(20);
  if (items.length) {
    items.slice(0, 12).forEach((it, i) => console.log(`  ${i + 1}. ${it.slug}`));
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
  console.log(code === 0 ? "\n✓ 完成（导出类平台成功即算完成）" : `\n✗ 退出码 ${code}`);
  await pause();
}

async function doBuildOrPush() {
  const sub = await askDefault("1=构建  2=git推送", "1");
  if (sub === "2") {
    await doGitPush();
    return;
  }
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

async function doList() {
  console.log("\n—— 文章 ——");
  listSlugs(40).forEach(it => console.log(`  ${it.slug.padEnd(28)} ${it.rel}`));
  console.log("\n—— 飞书绑定 ——");
  if (fs.existsSync(MAP_FILE)) {
    console.log(fs.readFileSync(MAP_FILE, "utf8"));
  } else {
    console.log("（暂无）");
  }
  console.log("\n—— 台账 ——");
  if (fs.existsSync(CMS_FILE)) {
    console.log(fs.readFileSync(CMS_FILE, "utf8"));
  } else {
    console.log("（未创建，选 2）");
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
