#!/usr/bin/env node
/**
 * 飞博虾服务端
 * - 台账「一键操作=立即发布」→ POST /api/v1/publish
 * - 定时扫描「待发博客 + 到点」→ 内置 scheduler
 * - 傻瓜式绑定页 → GET /
 *
 * 启动: npm run feiboxia
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  defaultTenantId,
  getTenant,
  upsertTenant,
  loadLocalCms,
  publicBaseUrl,
  ensureDataDir,
} from "./lib/tenant.js";
import { publishArticle } from "./lib/publish.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.FEIBOXIA_PORT || 8787);

ensureDataDir();

// 确保有默认租户（本机作者）
const cms = loadLocalCms();
upsertTenant(defaultTenantId(), {
  name: "渡娘本机",
  blog: {
    mode: process.env.FEIBOXIA_BLOG_MODE || "local",
    repo: process.env.GITHUB_REPO || "duniang818/wahaha",
    branch: process.env.GITHUB_BRANCH || "main",
    token: process.env.GITHUB_TOKEN || "",
    docsPath: process.env.GITHUB_DOCS_PATH || "docs",
    siteUrl: process.env.SITE_URL || "https://duniang818.github.io/wahaha/",
  },
  baseToken: cms?.baseToken || "",
  tableId: cms?.tableId || "",
});

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", c => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("请求体不是合法 JSON"));
      }
    });
    req.on("error", reject);
  });
}

function send(res, code, obj) {
  const body = JSON.stringify(obj, null, 2);
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(body);
}

function authTenant(req, body) {
  const tenantId = body.tenant_id || body.tenantId || defaultTenantId();
  const tenant = getTenant(tenantId);
  if (!tenant) return { error: "未知租户，请先打开首页完成绑定", status: 404 };

  const header = req.headers.authorization || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const secret = body.webhook_secret || body.secret || bearer;
  if (secret && secret !== tenant.webhookSecret) {
    return { error: "密钥错误", status: 401 };
  }
  // 本地开发允许无密钥；公网部署务必校验
  if (process.env.FEIBOXIA_REQUIRE_SECRET === "1" && secret !== tenant.webhookSecret) {
    return { error: "缺少或错误的 webhook 密钥", status: 401 };
  }
  return { tenant, tenantId };
}

async function handlePublish(req, res) {
  let body;
  try {
    body = await readBody(req);
  } catch (e) {
    return send(res, 400, { ok: false, message: e.message });
  }
  const auth = authTenant(req, body);
  if (auth.error) return send(res, auth.status, { ok: false, message: auth.error });

  try {
    const result = await publishArticle(body, auth.tenant);
    console.log(`[publish] ok ${result.path}`);
    return send(res, 200, {
      ok: true,
      success: true,
      message: result.message,
      path: result.path,
      title: result.title,
      slug: result.slug,
      site: result.siteHint,
    });
  } catch (e) {
    console.error("[publish] fail", e);
    return send(res, 500, {
      ok: false,
      success: false,
      message: String(e.message || e),
    });
  }
}

async function handleSetup(req, res) {
  let body;
  try {
    body = await readBody(req);
  } catch (e) {
    return send(res, 400, { ok: false, message: e.message });
  }
  const tenantId = body.tenant_id || defaultTenantId();
  const tenant = upsertTenant(tenantId, {
    name: body.name || "飞博虾用户",
    blog: {
      mode: body.mode || "github",
      repo: body.repo || "",
      branch: body.branch || "main",
      token: body.token || "",
      docsPath: body.docsPath || "docs",
      siteUrl: body.siteUrl || "",
    },
    baseToken: body.baseToken || "",
    tableId: body.tableId || "",
  });
  return send(res, 200, {
    ok: true,
    message: "绑定成功",
    tenantId,
    webhookSecret: tenant.webhookSecret,
    publishUrl: `${publicBaseUrl()}/api/v1/publish`,
    hint: "把 publishUrl 与 webhookSecret 填入飞书台账自动化「HTTP 请求」节点",
  });
}

function serveSetupPage(res) {
  const htmlPath = path.join(__dirname, "public/setup.html");
  const html = fs.readFileSync(htmlPath, "utf8");
  const tenant = getTenant(defaultTenantId());
  const injected = html
    .replaceAll("{{PUBLIC_URL}}", publicBaseUrl())
    .replaceAll("{{TENANT_ID}}", defaultTenantId())
    .replaceAll("{{WEBHOOK_SECRET}}", tenant?.webhookSecret || "")
    .replaceAll("{{BASE_URL}}", cms?.url || "");
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(injected);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
    });
    return res.end();
  }

  try {
    if (req.method === "GET" && url.pathname === "/") {
      return serveSetupPage(res);
    }
    if (req.method === "GET" && url.pathname === "/health") {
      return send(res, 200, { ok: true, app: "飞博虾", url: publicBaseUrl() });
    }
    if (req.method === "GET" && url.pathname === "/api/v1/tenant") {
      const t = getTenant(defaultTenantId());
      return send(res, 200, {
        ok: true,
        tenantId: defaultTenantId(),
        webhookSecret: t?.webhookSecret,
        publishUrl: `${publicBaseUrl()}/api/v1/publish`,
        blog: t?.blog ? { ...t.blog, token: t.blog.token ? "***" : "" } : null,
        base: cms,
      });
    }
    if (req.method === "POST" && url.pathname === "/api/v1/publish") {
      return handlePublish(req, res);
    }
    if (req.method === "POST" && url.pathname === "/api/v1/setup") {
      return handleSetup(req, res);
    }
    if (req.method === "POST" && url.pathname === "/api/v1/cron/tick") {
      // 预留：外部定时器可打此接口；本机也有内置扫描说明
      return send(res, 200, {
        ok: true,
        message: "请用飞书台账「定时工作流」或本机 npm run feiboxia:scan",
      });
    }
    send(res, 404, { ok: false, message: "not found" });
  } catch (e) {
    send(res, 500, { ok: false, message: String(e.message || e) });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  const t = getTenant(defaultTenantId());
  console.log(`
╔══════════════════════════════════════════╗
║           飞博虾 服务已启动              ║
╠══════════════════════════════════════════╣
║  绑定页: ${(`http://127.0.0.1:${PORT}/`).padEnd(33)}║
║  发布接口: /api/v1/publish               ║
║  租户: ${defaultTenantId().padEnd(35)}║
║  密钥: ${(t?.webhookSecret || "").slice(0, 12).padEnd(12)}…             ║
╚══════════════════════════════════════════╝
公网访问需设置 FEIBOXIA_PUBLIC_URL（如 ngrok 地址）后再配置飞书自动化。
`);
});
