/**
 * lark-cli 状态检测与通用封装
 */
import { spawnSync } from "node:child_process";

export function runLark(args, opts = {}) {
  return spawnSync("lark-cli", args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    maxBuffer: 20 * 1024 * 1024,
    ...opts,
  });
}

export function larkInstalled() {
  const r = runLark(["--version"]);
  return !(r.error || r.status !== 0);
}

/**
 * @returns {{ ok: boolean, configured: boolean, user?: boolean, message?: string, raw?: any }}
 */
export function getLarkStatus() {
  if (!larkInstalled()) {
    return {
      ok: false,
      configured: false,
      message: "未安装 lark-cli。请执行: npm i -g @larksuite/cli",
    };
  }

  const status = runLark(["auth", "status", "--json"]);
  let raw;
  try {
    raw = JSON.parse(status.stdout || "{}");
  } catch {
    raw = { ok: false, parseError: true, stdout: status.stdout };
  }

  if (raw?.error?.subtype === "not_configured" || raw?.error?.message === "not configured") {
    return {
      ok: false,
      configured: false,
      message: "飞书应用未配置。请运行: lark-cli config init --new",
      raw,
    };
  }

  const identities = raw?.identities || raw?.data?.identities || {};
  const userStatus = identities?.user?.status || identities?.user;
  const userMissing =
    userStatus === "missing" ||
    identities?.user?.available === false ||
    raw?.note?.includes?.("User identity is missing");

  if (userMissing || (status.status !== 0 && raw?.ok === false)) {
    const hint =
      identities?.user?.hint ||
      raw?.error?.hint ||
      raw?.error?.message ||
      "需要用户登录";
    return {
      ok: false,
      configured: true,
      user: false,
      message: `飞书用户未登录：${hint}\n请运行: lark-cli auth login --domain docs`,
      raw,
    };
  }

  return {
    ok: true,
    configured: true,
    user: true,
    message: "飞书 CLI 可用（用户已登录）",
    raw,
  };
}

export function fetchDocMarkdown(docArg) {
  const fetch = runLark([
    "docs",
    "+fetch",
    "--api-version",
    "v2",
    "--as",
    "user",
    "--doc",
    docArg,
    "--doc-format",
    "markdown",
    "--json",
  ]);

  if (fetch.status !== 0) {
    return {
      ok: false,
      error: (fetch.stderr || fetch.stdout || "").trim() || `exit ${fetch.status}`,
      stdout: fetch.stdout,
      stderr: fetch.stderr,
    };
  }

  let payload;
  try {
    payload = JSON.parse(fetch.stdout || "{}");
  } catch {
    return { ok: false, error: "无法解析 lark-cli 输出", stdout: fetch.stdout };
  }

  if (payload.ok === false) {
    return { ok: false, error: JSON.stringify(payload, null, 2), payload };
  }

  const content =
    payload?.data?.document?.content ||
    payload?.data?.content ||
    payload?.content ||
    "";
  const docId =
    payload?.data?.document?.document_id ||
    payload?.data?.document?.token ||
    "";

  return { ok: true, content: String(content || ""), docId, payload };
}
