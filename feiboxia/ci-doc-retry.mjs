#!/usr/bin/env node
/**
 * 晚间 21:00 重试失败的发布，并飞书通知作者
 */
import fs from "node:fs";
import path from "node:path";
import { writeLocalMarkdown, upsertLedger } from "./ci-doc-publish.mjs";
import {
  listDueRetries,
  markRetryAttempt,
  markRetryDone,
  rescheduleRetry,
} from "./lib/retry-queue.js";
import {
  sendFeishuText,
  formatRetryNotify,
  verifyBlogLive,
  blogPostUrl,
} from "./lib/feishu-notify.js";
import { ROOT } from "./lib/tenant.js";

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

const appId = process.env.FEISHU_APP_ID || "";
const appSecret = process.env.FEISHU_APP_SECRET || "";
let token = "";
if (appId && appSecret) {
  token = await getTenantToken(appId, appSecret);
}

const due = listDueRetries();
console.log(`晚间重试：${due.length} 项待处理`);

if (!due.length) {
  console.log("无到期重试任务");
  process.exit(0);
}

let anyWrote = false;

for (const item of due) {
  const payload = { ...item.payload, action: item.payload.action || "republish" };
  const title = payload.title || item.title || item.slug;
  const navDir = payload.nav_dir || item.navDir || "blog/posts";
  const slug = payload.slug || item.slug;
  const url = item.blogUrl || blogPostUrl(navDir, slug);

  markRetryAttempt(item.id, { state: "retrying" });
  console.log("\n重试:", title, slug);

  let ok = false;
  let reason = "";

  try {
    const result = await writeLocalMarkdown(payload, token);
    const live =
      result.wrote && (await verifyBlogLive(result.navDir || navDir, result.slug || slug));
    ok = Boolean(result.wrote && live);
    if (!result.wrote) reason = "正文仍未写入（请确认文档已分享给飞博虾应用）";
    else if (!live) reason = "正文已写入但 Pages 页面仍未上线";
    if (ok) {
      markRetryDone(item.id);
      anyWrote = true;
      if (token) {
        await upsertLedger(token, payload, {
          slug: result.slug || slug,
          navDir: result.navDir || navDir,
          wroteMarkdown: true,
          platforms: payload.platforms,
        });
      }
    } else {
      rescheduleRetry(item.id, reason);
    }
  } catch (e) {
    reason = e.message || String(e);
    rescheduleRetry(item.id, reason);
  }

  const attempt = (item.attempts || 0) + 1;
  const text = formatRetryNotify({
    ok,
    title,
    slug,
    navDir,
    blogUrl: url,
    reason,
    attempt,
  });

  try {
    await sendFeishuText(text);
    console.log(ok ? "✓ 已通知：重试成功" : "✓ 已通知：重试失败");
  } catch (e) {
    console.warn("飞书通知失败:", e.message || e);
  }
}

fs.mkdirSync(path.join(ROOT, "feiboxia/queue"), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, "feiboxia/queue/doc-retry.last.json"),
  JSON.stringify(
    { handledAt: new Date().toISOString(), count: due.length, anyWrote },
    null,
    2
  ),
  "utf8"
);

console.log("\n晚间重试完成", anyWrote ? "（有正文写入，待 commit）" : "");
process.exit(0);
