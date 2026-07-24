/**
 * 飞书机器人发消息给作者（需 im:message 权限 + FEISHU_NOTIFY_OPEN_ID）
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./tenant.js";

const DEFAULT_SITE = "https://duniang818.github.io/wahaha/";

async function getTenantToken(appId, appSecret) {
  const res = await fetch(
    "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
    }
  );
  const j = await res.json();
  if (j.code !== 0) throw new Error(`tenant token 失败: ${JSON.stringify(j)}`);
  return j.tenant_access_token;
}

export async function sendFeishuText(text) {
  const appId = process.env.FEISHU_APP_ID || "";
  const appSecret = process.env.FEISHU_APP_SECRET || "";
  const receiveId = process.env.FEISHU_NOTIFY_OPEN_ID || "";
  if (!appId || !appSecret) {
    console.warn("未配置 FEISHU_APP_ID/SECRET，跳过飞书通知");
    return { sent: false, reason: "no_app_creds" };
  }
  if (!receiveId) {
    console.warn("未配置 FEISHU_NOTIFY_OPEN_ID，跳过飞书通知");
    return { sent: false, reason: "no_open_id" };
  }

  const token = await getTenantToken(appId, appSecret);
  const res = await fetch(
    "https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=open_id",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receive_id: receiveId,
        msg_type: "text",
        content: JSON.stringify({ text: String(text || "").slice(0, 4000) }),
      }),
    }
  );
  const j = await res.json();
  if (j.code !== 0) {
    throw new Error(`发飞书消息失败: ${JSON.stringify(j)}`);
  }
  return { sent: true, messageId: j.data?.message_id };
}

export function siteBase(url = process.env.SITE_URL || DEFAULT_SITE) {
  return String(url || DEFAULT_SITE).replace(/\/?$/, "/");
}

export function blogPostUrl(navDir, slug, siteUrl) {
  const base = siteBase(siteUrl);
  const rel = `${String(navDir || "blog/posts").replace(/^\/+|\/+$/g, "")}/${slug}/`;
  return new URL(rel, base).href;
}

/** 探测 Pages 是否已上线 */
export async function verifyBlogLive(navDir, slug, siteUrl) {
  const url = blogPostUrl(navDir, slug, siteUrl);
  try {
    const res = await fetch(url, { method: "GET", cache: "no-store", redirect: "follow" });
    return res.ok;
  } catch {
    return false;
  }
}

export function formatRetryNotify({ ok, title, slug, navDir, blogUrl, reason, attempt }) {
  const head = ok ? "【飞博虾】晚间重试 · 成功 ✅" : "【飞博虾】晚间重试 · 失败 ❌";
  const lines = [
    head,
    `《${title || slug || "未命名"}》`,
    blogUrl || blogPostUrl(navDir, slug),
  ];
  if (!ok && reason) lines.push(`原因：${reason}`);
  if (attempt) lines.push(`第 ${attempt} 次晚间重试`);
  if (!ok) lines.push("已安排下一晚 21:00 再次重试（直至成功）");
  return lines.join("\n");
}
