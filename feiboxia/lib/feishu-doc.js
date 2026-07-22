/**
 * 拉取飞书文档 Markdown（优先 lark-cli 用户身份）
 */
import { spawnSync } from "node:child_process";

export function fetchFeishuMarkdown(docUrlOrToken) {
  const r = spawnSync(
    "lark-cli",
    [
      "docs",
      "+fetch",
      "--api-version",
      "v2",
      "--as",
      "user",
      "--doc",
      docUrlOrToken,
      "--doc-format",
      "markdown",
      "--json",
    ],
    {
      encoding: "utf8",
      shell: process.platform === "win32",
      maxBuffer: 20 * 1024 * 1024,
    }
  );

  if (r.status !== 0) {
    throw new Error((r.stderr || r.stdout || `lark-cli exit ${r.status}`).slice(0, 800));
  }

  let payload;
  try {
    payload = JSON.parse(r.stdout || "{}");
  } catch {
    throw new Error("无法解析飞书文档返回");
  }
  if (payload.ok === false) {
    throw new Error(JSON.stringify(payload.error || payload));
  }

  const content =
    payload?.data?.document?.content ||
    payload?.data?.content ||
    payload?.content ||
    "";
  const docId =
    payload?.data?.document?.document_id ||
    extractDocToken(docUrlOrToken) ||
    "";

  if (!String(content).trim()) {
    throw new Error("飞书文档内容为空");
  }

  return { content: String(content), docId, payload };
}

export function extractDocToken(input) {
  const m = String(input).match(/\/(?:docx|doc|wiki)\/([A-Za-z0-9]+)/);
  if (m) return m[1];
  if (/^[A-Za-z0-9_-]+$/.test(String(input))) return String(input);
  return "";
}

export function markdownFromFeishu(md) {
  let text = String(md).trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```\w*\n?/, "").replace(/\n?```$/, "");
  }
  let title = "";
  const h1 = text.match(/^#\s+(.+)$/m);
  if (h1) title = h1[1].trim();
  return { title, body: text.replace(/^\s*#\s+.+\n+/, "").trim() };
}

export function slugify(title) {
  return String(title)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function yamlEscape(s) {
  if (/[:#{}[\],&*?|<>=!%@`]/.test(s) || /\s/.test(s)) {
    return `"${String(s).replace(/"/g, '\\"')}"`;
  }
  return s;
}

export function buildPostMarkdown({
  title,
  body,
  slug,
  tags = [],
  docId = "",
  docUrl = "",
  navDir = "blog/posts",
  platforms = ["blog", "wechat", "xhs", "csdn", "zhihu"],
  draft = false,
}) {
  const today = new Date().toISOString().slice(0, 10);
  const tagList = (Array.isArray(tags) ? tags : String(tags).split(/[,，]/))
    .map(s => String(s).trim())
    .filter(Boolean);
  if (!tagList.length) tagList.push("飞博虾");

  const plats = (Array.isArray(platforms) ? platforms : String(platforms).split(","))
    .map(s => String(s).trim())
    .filter(Boolean)
    .filter(p => p !== "blog"); // frontmatter 外站列表；blog 由文件存在表示

  const front = [
    "---",
    `title: ${yamlEscape(title)}`,
    "author: 渡娘",
    `date: ${today}`,
    `visibility: ${draft ? "private" : "public"}`,
    `draft: ${draft ? "true" : "false"}`,
    `feishu_doc: ${docId}`,
    `feishu_url: ${docUrl}`,
    "platforms:",
    ...(plats.length ? plats.map(t => `  - ${t}`) : ["  - none"]),
    "tags:",
    ...tagList.map(t => `  - ${t}`),
    "description: 由飞博虾一键发布",
    "---",
    "",
  ].join("\n");

  const rel = `${String(navDir || "blog/posts").replace(/^\/+|\/+$/g, "")}/${slug}.md`;
  return { rel, content: `${front}${body}\n`, title, slug };
}
