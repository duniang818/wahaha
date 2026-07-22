#!/usr/bin/env node
/**
 * 将本地 Markdown 同步为微信公众号「草稿箱」草稿。
 * 需要公众号 AppID / AppSecret（写在 .env）。
 *
 * 用法: node sync/wechat.js <slug>
 *
 * 说明：
 * - 使用 draft/add 接口，不会直接群发
 * - 若未配置 WECHAT_THUMB_MEDIA_ID，会写入占位提示并仍尝试提交纯文本 content
 */
import fs from "node:fs";
import path from "node:path";
import {
  ensureOutDir,
  loadEnv,
  readPost,
  getSiteUrl,
  markdownToPlain,
  OUT_DIR,
} from "./lib/posts.js";

loadEnv();

const slug = process.argv[2];
if (!slug) {
  console.error("用法: npm run sync:wechat -- <文章slug>");
  process.exit(1);
}

const appId = process.env.WECHAT_APP_ID;
const appSecret = process.env.WECHAT_APP_SECRET;

const post = readPost(slug);
const title = String(post.frontmatter.title || post.slug);
const digest = String(
  post.frontmatter.description || markdownToPlain(post.body).slice(0, 100)
);
const siteUrl = getSiteUrl();
const postUrl = `${siteUrl}/posts/${post.slug}/`;

const html = markdownToWechatHtml(post.body, postUrl);

ensureOutDir();
const previewPath = path.join(OUT_DIR, `${post.slug}.wechat.html`);
fs.writeFileSync(previewPath, html, "utf8");
console.log(`已导出微信 HTML 预览: ${previewPath}`);

if (!appId || !appSecret) {
  console.log(`
未配置 WECHAT_APP_ID / WECHAT_APP_SECRET。
请在 .env 中填写公众号开发者凭证后重试。
当前已生成可粘贴到公众号后台的 HTML：${previewPath}
`);
  process.exit(0);
}

const token = await getAccessToken(appId, appSecret);
const thumbMediaId = process.env.WECHAT_THUMB_MEDIA_ID || "";

const article = {
  title: title.slice(0, 64),
  author: String(post.frontmatter.author || "渡娘").slice(0, 16),
  digest: digest.slice(0, 120),
  content: html,
  content_source_url: postUrl,
  thumb_media_id: thumbMediaId || undefined,
  need_open_comment: 0,
  only_fans_can_comment: 0,
};

if (!thumbMediaId) {
  console.warn(
    "警告: 未设置 WECHAT_THUMB_MEDIA_ID。微信草稿通常需要封面图 media_id；若接口报错，请先在素材库上传封面并填入 media_id。"
  );
}

const res = await fetch(
  `https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${token}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ articles: [article] }),
  }
);
const data = await res.json();

if (data.errcode && data.errcode !== 0) {
  console.error("微信草稿创建失败:", data);
  process.exit(1);
}

console.log("微信公众号草稿已创建。media_id:", data.media_id);
fs.writeFileSync(
  path.join(OUT_DIR, `${post.slug}.wechat.json`),
  JSON.stringify({ ...data, title, postUrl }, null, 2),
  "utf8"
);

async function getAccessToken(id, secret) {
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${id}&secret=${secret}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.access_token) {
    throw new Error(`获取 access_token 失败: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

function markdownToWechatHtml(md, canonicalUrl) {
  // 轻量转换：覆盖标题、段落、列表、链接、代码；复杂 MDX 请在公众号后台再润色
  let html = md
    .replace(/^######\s+(.+)$/gm, "<h6>$1</h6>")
    .replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>")
    .replace(/^####\s+(.+)$/gm, "<h4>$1</h4>")
    .replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^##\s+(.+)$/gm, "<h2>$1</h2>")
    .replace(/^#\s+(.+)$/gm, "<h2>$1</h2>")
    .replace(/```[\s\S]*?```/g, block => {
      const code = block.replace(/^```\w*\n?/, "").replace(/```$/, "");
      return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
    })
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^(?!<h\d|<pre|<ul|<ol|<li|<p|<\/)(.+)$/gm, "<p>$1</p>");

  return `${html}<hr/><p>原文链接：<a href="${canonicalUrl}">${canonicalUrl}</a></p>`;
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
