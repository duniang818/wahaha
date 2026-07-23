/**
 * 拉取飞书文档 Markdown（优先 lark-cli 用户身份）
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

export function fetchFeishuMarkdown(docUrlOrToken, { as = "user" } = {}) {
  const r = spawnSync(
    "lark-cli",
    [
      "docs",
      "+fetch",
      "--api-version",
      "v2",
      "--as",
      as === "bot" ? "bot" : "user",
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

async function feishuGet(token, url) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const j = await res.json();
  if (j.code !== 0) throw new Error(JSON.stringify(j));
  return j.data;
}

async function downloadFeishuMedia(token, fileToken, docId) {
  const extra = encodeURIComponent(
    JSON.stringify({ obj_type: "docx_image", obj_id: docId, file_token: fileToken })
  );
  const url = `https://open.feishu.cn/open-apis/drive/v1/medias/${fileToken}/download?extra=${extra}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    redirect: "follow",
  });
  if (!res.ok) {
    const url2 = `https://open.feishu.cn/open-apis/drive/v1/medias/${fileToken}/download`;
    const res2 = await fetch(url2, {
      headers: { Authorization: `Bearer ${token}` },
      redirect: "follow",
    });
    if (!res2.ok) throw new Error(`download ${fileToken} ${res2.status}`);
    return {
      buf: Buffer.from(await res2.arrayBuffer()),
      type: res2.headers.get("content-type") || "",
    };
  }
  return {
    buf: Buffer.from(await res.arrayBuffer()),
    type: res.headers.get("content-type") || "",
  };
}

function textRuns(block) {
  const els = block?.text?.elements || block?.heading1?.elements || block?.heading2?.elements ||
    block?.heading3?.elements || block?.heading4?.elements || block?.heading5?.elements ||
    block?.heading6?.elements || block?.heading7?.elements || block?.heading8?.elements ||
    block?.heading9?.elements || block?.bullet?.elements || block?.ordered?.elements ||
    block?.quote?.elements || block?.todo?.elements || [];
  return els.map(el => el?.text_run?.content || "").join("");
}

/** 通过 OpenAPI Blocks 拉正文（含图片下载到本地） */
export async function fetchDocBlocksMarkdown(token, docUrlOrToken, { slug, navDir, docsRoot }) {
  const docId = extractDocToken(docUrlOrToken);
  if (!docId || !token) throw new Error("blocks 拉取需要 docId 与 tenant token");

  const assetDir = path.join(
    docsRoot,
    String(navDir || "blog/posts").replace(/^\/+|\/+$/g, ""),
    "assets",
    slug
  );
  fs.mkdirSync(assetDir, { recursive: true });

  const blockMap = new Map();
  let pageToken = "";
  for (let page = 0; page < 20; page++) {
    const q = new URL(`https://open.feishu.cn/open-apis/docx/v1/documents/${docId}/blocks`);
    q.searchParams.set("page_size", "500");
    q.searchParams.set("document_revision_id", "-1");
    if (pageToken) q.searchParams.set("page_token", pageToken);
    const data = await feishuGet(token, q.toString());
    for (const item of data.items || []) blockMap.set(item.block_id, item);
    if (!data.has_more) break;
    pageToken = data.page_token || "";
    if (!pageToken) break;
  }

  const root = [...blockMap.values()].find(b => b.block_type === 1);
  if (!root) throw new Error("未找到文档 Page Block");

  let imgIdx = 0;
  const lines = [];

  async function walk(blockId, depth = 0) {
    const block = blockMap.get(blockId);
    if (!block) return;
    const type = block.block_type;
    const t = textRuns(block);

    if (type >= 3 && type <= 11) {
      const level = Math.min(type - 2, 6);
      lines.push(`${"#".repeat(level)} ${t}`.trim());
    } else if (type === 12) {
      lines.push(t ? `- ${t}` : "-");
    } else if (type === 13) {
      lines.push(t ? `1. ${t}` : "1.");
    } else if (type === 14) {
      lines.push("```", t, "```");
    } else if (type === 15) {
      lines.push(`> ${t}`);
    } else if (type === 17) {
      lines.push(`- [ ] ${t}`);
    } else if (type === 22) {
      lines.push("---");
    } else if (type === 27 && block.image?.token) {
      try {
        const { buf, type: ct } = await downloadFeishuMedia(token, block.image.token, docId);
        if (buf.length > 32) {
          imgIdx += 1;
          const ext = extFromUrl("", ct);
          const fname = `img-${String(imgIdx).padStart(2, "0")}.${ext}`;
          fs.writeFileSync(path.join(assetDir, fname), buf);
          lines.push(`![image](assets/${slug}/${fname})`);
        }
      } catch {
        lines.push("<!-- 图片下载失败 -->");
      }
    } else if (type === 2 && t.trim()) {
      lines.push(t);
    }

    for (const cid of block.children || []) {
      await walk(cid, depth + 1);
    }
  }

  for (const cid of root.children || []) {
    await walk(cid);
  }

  const md = lines.filter(Boolean).join("\n\n").trim();
  if (!md) throw new Error("Blocks 转换正文为空");
  return { content: md, docId };
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
  return { title, body: sanitizeFeishuMarkdown(text.replace(/^\s*#\s+.+\n+/, "")) };
}

/** 去掉飞书 markdown 里的 grid/column 容器，保留图片 */
export function sanitizeFeishuMarkdown(body) {
  return String(body || "")
    .replace(/<\/?grid[^>]*>/gi, "\n")
    .replace(/<\/?column[^>]*>/gi, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const FEISHU_IMG_HOST =
  /(?:feishu|larksuite|doubao|bytedance|feishucdn|larkoffice)\./i;

function extFromUrl(url, contentType = "") {
  const m = String(url).match(/\.(png|jpe?g|gif|webp|svg)(?:\?|$)/i);
  if (m) return m[1].toLowerCase().replace("jpeg", "jpg");
  if (/png/i.test(contentType)) return "png";
  if (/jpe?g/i.test(contentType)) return "jpg";
  if (/gif/i.test(contentType)) return "gif";
  if (/webp/i.test(contentType)) return "webp";
  return "png";
}

/** 将正文中的飞书图片 URL 下载到本地 assets 并改写为相对路径 */
export async function mirrorImagesInMarkdown(body, { slug, navDir, token, docsRoot }) {
  let text = String(body || "");
  const re = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const matches = [...text.matchAll(re)];
  if (!matches.length) return text;

  const assetDir = path.join(
    docsRoot,
    String(navDir || "blog/posts").replace(/^\/+|\/+$/g, ""),
    "assets",
    slug
  );
  fs.mkdirSync(assetDir, { recursive: true });

  let i = 0;
  for (const m of matches) {
    const alt = m[1];
    const rawUrl = m[2].trim().replace(/^["']|["']$/g, "");
    if (!/^https?:\/\//i.test(rawUrl)) continue;
    if (rawUrl.startsWith("/") || rawUrl.startsWith("assets/")) continue;

    try {
      const isFeishuCdn = FEISHU_IMG_HOST.test(rawUrl);
      const headers = token && !isFeishuCdn ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(rawUrl, { headers, redirect: "follow" });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 32) continue;
      const ext = extFromUrl(rawUrl, res.headers.get("content-type") || "");
      const fname = `img-${String(i + 1).padStart(2, "0")}.${ext}`;
      fs.writeFileSync(path.join(assetDir, fname), buf);
      const rel = `assets/${slug}/${fname}`;
      text = text.replace(m[0], `![${alt}](${rel})`);
      i += 1;
    } catch {
      /* 单张失败不阻断 */
    }
  }
  return text;
}

export function excerptFromBody(body, max = 120) {
  const plain = String(body || "")
    .replace(/^---[\s\S]*?---\n/, "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[#>*`_~-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > max ? `${plain.slice(0, max)}…` : plain;
}

export function firstImageInMarkdown(body) {
  const m = String(body || "").match(/!\[[^\]]*]\(([^)]+)\)/);
  return m ? m[1].trim() : "";
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

const NAV_LABEL_FROM_DIR = dir => {
  const d = String(dir || "blog/posts").replace(/^\/+|\/+$/g, "");
  const map = {
    "blog/posts": "博客",
    education: "教育",
    travel: "旅行",
    tech: "技术",
    life: "生活",
    feiboxia: "飞博虾",
  };
  return map[d] || map[d.split("/")[0]] || "其他";
};

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
  description = "",
}) {
  const today = new Date().toISOString().slice(0, 10);
  const navLabel = NAV_LABEL_FROM_DIR(navDir);
  const tagList = (Array.isArray(tags) ? tags : String(tags).split(/[,，]/))
    .map(s => String(s).trim())
    .filter(Boolean)
    .filter(t => t !== navLabel);
  const allTags = [navLabel, ...(tagList.length ? tagList : ["飞博虾"])];

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
    `nav: ${yamlEscape(navLabel)}`,
    "platforms:",
    ...(plats.length ? plats.map(t => `  - ${t}`) : ["  - none"]),
    "tags:",
    ...allTags.map(t => `  - ${t}`),
    `description: ${yamlEscape(description || excerptFromBody(body) || "由飞博虾一键发布")}`,
    "---",
    "",
  ].join("\n");

  const rel = `${String(navDir || "blog/posts").replace(/^\/+|\/+$/g, "")}/${slug}.md`;
  return { rel, content: `${front}${body}\n`, title, slug };
}
