#!/usr/bin/env node
/**
 * GitHub Actions / 本机：处理「文档内飞博虾」发来的发布请求
 * - 按 doc_url / slug 更新台账（同一篇不重复建行）
 * - mode=full 时拉文档写入 docs/（优先 OpenAPI 应用身份，其次 lark-cli）
 *
 * 环境变量：
 *   FEISHU_APP_ID / FEISHU_APP_SECRET
 *   CLIENT_PAYLOAD  JSON（或 feiboxia/queue/doc-dispatch.json）
 */
import fs from "node:fs";
import path from "node:path";
import {
  fetchFeishuMarkdown,
  markdownFromFeishu,
  buildPostMarkdown,
  extractDocToken,
  mirrorImagesInMarkdown,
  excerptFromBody,
  fetchDocBlocksMarkdown,
} from "./lib/feishu-doc.js";
import { normalizeNavDir } from "./lib/publish.js";
import { ROOT } from "./lib/tenant.js";

/** 栏目 → 默认标签（与小组件 NAV_META 一致） */
const NAV_TAG_DEFAULT = {
  "blog/posts": "博客,飞博虾",
  education: "教育,飞博虾",
  travel: "旅行,飞博虾",
  tech: "技术,飞博虾",
  life: "生活,飞博虾",
};

function resolveTags(payload, navDir) {
  const raw = String(payload.tags || "").trim();
  if (raw) {
    return raw
      .split(/[,，]/)
      .map(s => s.trim())
      .filter(Boolean);
  }
  return String(NAV_TAG_DEFAULT[navDir] || "飞博虾")
    .split(/[,，]/)
    .map(s => s.trim())
    .filter(Boolean);
}

function loadPayload() {
  if (process.env.CLIENT_PAYLOAD) {
    return JSON.parse(process.env.CLIENT_PAYLOAD);
  }
  const f = path.join(ROOT, "feiboxia/queue/doc-dispatch.json");
  if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, "utf8"));
  throw new Error("缺少 CLIENT_PAYLOAD");
}

/** URL 安全 slug：去掉中文等非 ASCII，避免 Pages 404 */
export function safeSlug(title, fallback = "") {
  const ascii = String(title || "")
    .toLowerCase()
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  if (ascii.length >= 2) return ascii;
  const fb = String(fallback || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  if (fb.length >= 2) return fb;
  return `post-${Date.now().toString(36)}`;
}

function walkMarkdown(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walkMarkdown(p, out);
    else if (name.endsWith(".md")) out.push(p);
  }
  return out;
}

/** 已有博文：按 feishu_url / feishu_doc 找回 slug，保证再次发布覆盖同一文件 */
function findExistingPost(docUrl, docToken) {
  const docsRoot = path.join(ROOT, "docs");
  const files = walkMarkdown(docsRoot);
  for (const file of files) {
    const head = fs.readFileSync(file, "utf8").slice(0, 1200);
    if (!head.startsWith("---")) continue;
    const urlHit =
      docUrl &&
      (head.includes(`feishu_url: ${docUrl}`) ||
        head.includes(`feishu_url: "${docUrl}"`));
    const tokenHit =
      docToken &&
      (head.includes(`feishu_doc: ${docToken}`) ||
        head.includes(`feishu_doc: "${docToken}"`));
    if (!urlHit && !tokenHit) continue;
    const rel = path.relative(docsRoot, file).replace(/\\/g, "/");
    const slug = path.basename(rel, ".md");
    const navDir = path.dirname(rel).replace(/\\/g, "/");
    return { rel, slug, navDir, file };
  }
  return null;
}

function loadFeishuMap() {
  const f = path.join(ROOT, "sync/feishu-map.json");
  if (!fs.existsSync(f)) return {};
  try {
    return JSON.parse(fs.readFileSync(f, "utf8"));
  } catch {
    return {};
  }
}

function resolveSlug(payload) {
  const docToken =
    payload.doc_token || extractDocToken(payload.doc_url || "") || "";
  const existing = findExistingPost(payload.doc_url, docToken);
  if (existing) return { slug: existing.slug, navDir: existing.navDir, existing };

  const map = loadFeishuMap();
  if (docToken && map[docToken]?.slug) {
    const m = map[docToken];
    const navDir =
      (m.path && path.dirname(m.path).replace(/\\/g, "/")) ||
      normalizeNavDir(payload.nav_dir);
    return { slug: m.slug, navDir, existing: null };
  }

  const raw = String(payload.slug || "").trim();
  const hasNonAscii = /[^\x00-\x7F]/.test(raw);
  const slug = hasNonAscii || !raw
    ? safeSlug(payload.title, docToken ? `doc-${docToken.slice(0, 10)}` : "")
    : safeSlug(raw, docToken ? `doc-${docToken.slice(0, 10)}` : "");
  return {
    slug,
    navDir: normalizeNavDir(payload.nav_dir),
    existing: null,
  };
}

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
  if (j.code !== 0) throw new Error(`获取 tenant token 失败: ${JSON.stringify(j)}`);
  return j.tenant_access_token;
}

async function fetchDocViaOpenApi(token, docUrlOrToken) {
  const docId = extractDocToken(docUrlOrToken);
  if (!docId) throw new Error("无法解析 document_id");
  const res = await fetch(
    `https://open.feishu.cn/open-apis/docx/v1/documents/${docId}/raw_content`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const j = await res.json();
  if (j.code !== 0) {
    throw new Error(`OpenAPI 拉正文失败: ${JSON.stringify(j)}`);
  }
  const content = String(j.data?.content || "").trim();
  if (!content) throw new Error("OpenAPI 返回正文为空");
  // raw_content 多为纯文本，补成 markdown
  const md = content.startsWith("#") ? content : `# 未命名\n\n${content}`;
  return { content: md, docId };
}

function cellText(v) {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (Array.isArray(v)) return v.map(cellText).filter(Boolean).join(" ");
  if (typeof v === "object") {
    if (v.link) return String(v.link);
    if (v.text) return String(v.text);
    if (v.name) return String(v.name);
  }
  return String(v);
}

async function searchLedgerRecord(token, appToken, tableId, { slug, docUrl }) {
  const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/search`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // 1) 按 slug 精确匹配
  if (slug) {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        page_size: 20,
        filter: {
          conjunction: "and",
          conditions: [
            { field_name: "slug", operator: "is", value: [slug] },
          ],
        },
      }),
    });
    const j = await res.json();
    if (j.code === 0 && j.data?.items?.length) {
      return j.data.items[0];
    }
  }

  // 2) 无过滤翻页，用文档链接兜底匹配（兼容旧数据）
  if (docUrl) {
    let pageToken = "";
    for (let i = 0; i < 5; i++) {
      const q = new URL(
        `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`
      );
      q.searchParams.set("page_size", "100");
      if (pageToken) q.searchParams.set("page_token", pageToken);
      const res = await fetch(q, { headers: { Authorization: `Bearer ${token}` } });
      const j = await res.json();
      if (j.code !== 0) break;
      const hit = (j.data?.items || []).find(it => {
        const link = cellText(it.fields?.["飞书文档"]);
        return link && (link === docUrl || link.includes(extractDocToken(docUrl)));
      });
      if (hit) return hit;
      if (!j.data?.has_more) break;
      pageToken = j.data.page_token || "";
    }
  }
  return null;
}

async function upsertLedger(token, payload, extra = {}) {
  const appToken = payload.base_token;
  const tableId = payload.table_id;
  if (!appToken || !tableId) {
    console.warn("未配置 base_token/table_id，跳过台账");
    return null;
  }

  const slug = extra.slug || payload.slug || "";
  const navDir = extra.navDir || payload.nav_dir || "blog/posts";
  const site = String(payload.site_url || "https://duniang818.github.io/wahaha/").replace(
    /\/?$/,
    "/"
  );
  const blogUrl = `${site}${navDir}/${slug}/`;
  const action = String(payload.action || payload.mode || "publish");
  const wrote = Boolean(extra.wroteMarkdown);
  const unpublished = Boolean(extra.unpublished);
  const platforms = String(payload.platforms || extra.platforms || "blog")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  let status = "待发博客";
  if (unpublished || action === "unpublish") status = "已撤销";
  else if (wrote || action === "republish" || action === "publish" || action === "full") {
    status = platforms.includes("blog") && wrote ? "已发博客" : "待发博客";
  }

  const fields = {
    标题: payload.title || "未命名",
    飞书文档: { link: payload.doc_url, text: payload.doc_url },
    slug,
    写入目录: navDir,
    状态: status,
    标签:
      String(payload.tags || "")
        .split(/[,，]/)
        .map(s => s.trim())
        .filter(Boolean)
        .join(",") ||
      (NAV_TAG_DEFAULT[navDir] || "飞博虾"),
    备注: `来自文档内飞博虾 · ${action} · ${platforms.join("+")} · ${new Date().toISOString()}${
      payload.notes ? ` · ${payload.notes}` : ""
    }${wrote || unpublished ? "" : " · 正文未写入（请分享文档给应用或本机 ship）"}`,
    博客路径: `${navDir}/${slug}.md`,
    导航栏目: navDir,
  };

  // 可选字段：有则写，无则忽略（不同台账版本字段不一）
  const optional = {
    发布结果: unpublished
      ? `已撤销：${platforms.join(", ")}`
      : wrote
        ? `已发布 ${blogUrl} · ${platforms.join(",")}`
        : "已登记，待正文入库",
    博客链接: { link: blogUrl, text: blogUrl },
  };

  const existing = await searchLedgerRecord(token, appToken, tableId, {
    slug,
    docUrl: payload.doc_url,
  });

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  async function tryWrite(bodyFields, method, targetUrl) {
    const res = await fetch(targetUrl, {
      method,
      headers,
      body: JSON.stringify({ fields: bodyFields }),
    });
    return res.json();
  }

  const baseUrl = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`;

  if (existing?.record_id) {
    let j = await tryWrite(fields, "PUT", `${baseUrl}/${existing.record_id}`);
    if (j.code !== 0) {
      j = await tryWrite(
        { ...fields, 飞书文档: payload.doc_url },
        "PUT",
        `${baseUrl}/${existing.record_id}`
      );
    }
    // 可选字段失败不阻断
    if (j.code === 0) {
      await tryWrite(
        { ...fields, ...optional, 飞书文档: fields["飞书文档"] },
        "PUT",
        `${baseUrl}/${existing.record_id}`
      ).catch(() => null);
      console.log("✓ 台账已更新", existing.record_id, status, blogUrl);
      return j;
    }
    console.warn("更新台账失败，尝试新建:", JSON.stringify(j));
  }

  let j = await tryWrite(fields, "POST", baseUrl);
  if (j.code !== 0) {
    j = await tryWrite({ ...fields, 飞书文档: payload.doc_url }, "POST", baseUrl);
  }
  if (j.code !== 0) {
    throw new Error(`写台账失败: ${JSON.stringify(j)}`);
  }
  console.log("✓ 台账已新建", j.data?.record?.record_id, status, blogUrl);
  return j;
}

async function writeLocalMarkdown(payload, token) {
  const resolved = resolveSlug(payload);
  const { slug, navDir } = resolved;
  let content = "";
  let docId = payload.doc_token || extractDocToken(payload.doc_url || "") || "";

  const errors = [];
  const docsRoot = path.join(ROOT, "docs");

  // 1) OpenAPI Blocks（含图片下载，CI 可用）
  if (token) {
    try {
      const fetched = await fetchDocBlocksMarkdown(token, payload.doc_url, {
        slug,
        navDir,
        docsRoot,
      });
      content = fetched.content;
      docId = fetched.docId || docId;
    } catch (e) {
      errors.push(`blocks: ${e.message || e}`);
    }
  }

  // 2) lark-cli markdown（CI 优先 bot 身份，本机可 user）
  if (!content) {
    const identities = token ? ["bot", "user"] : ["user", "bot"];
    for (const who of identities) {
      try {
        const fetched = fetchFeishuMarkdown(payload.doc_url, { as: who });
        content = fetched.content;
        docId = fetched.docId || docId;
        console.log(`✓ lark-cli markdown (${who})`);
        break;
      } catch (e) {
        errors.push(`lark-cli/${who}: ${e.message || e}`);
      }
    }
  }

  // 3) OpenAPI raw_content 纯文本兜底
  if (!content && token) {
    try {
      const fetched = await fetchDocViaOpenApi(token, payload.doc_url);
      content = fetched.content;
      docId = fetched.docId || docId;
    } catch (e) {
      errors.push(`raw: ${e.message || e}`);
    }
  }
  if (!content) {
    console.warn(
      "拉取正文失败（请将文档分享给应用，或本机 npm run feiboxia:ship）：",
      errors.join(" | ")
    );
    return { wrote: false, slug, navDir, blogRel: null };
  }

  const parsed = markdownFromFeishu(content);
  const title = payload.title || parsed.title || "未命名";
  const tagList = resolveTags(payload, navDir);
  let body = parsed.body;
  try {
    body = await mirrorImagesInMarkdown(body, {
      slug,
      navDir,
      token,
      docsRoot,
    });
  } catch (e) {
    console.warn("图片镜像部分失败:", e.message || e);
  }
  const built = buildPostMarkdown({
    title,
    body,
    slug,
    tags: tagList,
    docId,
    docUrl: payload.doc_url,
    navDir,
    platforms: String(payload.platforms || "blog,wechat,xhs,csdn,zhihu").split(","),
    draft: false,
    description: excerptFromBody(body),
  });
  const out = path.join(ROOT, "docs", built.rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, built.content, "utf8");
  console.log("✓ 已写入", built.rel);

  // 更新本地绑定表
  try {
    const mapPath = path.join(ROOT, "sync/feishu-map.json");
    const map = loadFeishuMap();
    if (docId) {
      map[docId] = {
        ...(map[docId] || {}),
        slug,
        path: built.rel,
        title,
        url: payload.doc_url,
        updatedAt: new Date().toISOString(),
        via: "feiboxia-doc-publish",
      };
      fs.mkdirSync(path.dirname(mapPath), { recursive: true });
      fs.writeFileSync(mapPath, JSON.stringify(map, null, 2), "utf8");
    }
  } catch {
    /* ignore */
  }

  return { wrote: true, slug, navDir, blogRel: built.rel, title };
}

/** 撤销：博客下架（draft）+ 从 frontmatter platforms 去掉外站标记 */
function unpublishLocal(payload) {
  const resolved = resolveSlug(payload);
  const { slug, navDir, existing } = resolved;
  const targets = String(payload.platforms || "blog")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  const rel = existing?.rel || `${navDir}/${slug}.md`;
  const file = existing?.file || path.join(ROOT, "docs", rel);
  if (!fs.existsSync(file)) {
    console.warn("未找到博文文件，仅更新台账:", rel);
    return { unpublished: true, slug, navDir, blogRel: rel, missing: true };
  }

  let text = fs.readFileSync(file, "utf8");
  if (!text.startsWith("---")) {
    console.warn("无 frontmatter，删除文件以实现下架:", rel);
    if (targets.includes("blog")) fs.unlinkSync(file);
    return { unpublished: true, slug, navDir, blogRel: rel, deleted: true };
  }

  const end = text.indexOf("\n---", 3);
  if (end < 0) {
    if (targets.includes("blog")) fs.unlinkSync(file);
    return { unpublished: true, slug, navDir, blogRel: rel, deleted: true };
  }

  let fm = text.slice(0, end + 4);
  const body = text.slice(end + 4);

  if (targets.includes("blog")) {
    fm = fm
      .replace(/\ndraft:\s*\w+/i, "\ndraft: true")
      .replace(/\nvisibility:\s*\w+/i, "\nvisibility: private");
    if (!/\ndraft:/i.test(fm)) {
      fm = fm.replace(/\n---\s*$/, "\ndraft: true\nvisibility: private\n---");
    }
  }

  const removePlats = targets.filter(t => t !== "blog");
  if (removePlats.length && /\nplatforms:/i.test(fm)) {
    // 简单处理：重写 platforms 列表为剩余项
    const keep = ["wechat", "xhs", "csdn", "zhihu"].filter(p => !removePlats.includes(p));
    const platBlock =
      "platforms:\n" + (keep.length ? keep.map(p => `  - ${p}`).join("\n") : "  - none");
    fm = fm.replace(/\nplatforms:[\s\S]*?(?=\n[a-z_]+:|\n---)/i, `\n${platBlock}\n`);
  }

  fs.writeFileSync(file, fm + body, "utf8");
  console.log("✓ 已撤销标记", rel, targets.join(","));
  return { unpublished: true, slug, navDir, blogRel: rel };
}

const payload = loadPayload();
const action = String(payload.action || payload.mode || "publish");
// 兼容旧 mode=full / ledger
const normalizedAction =
  action === "full"
    ? "publish"
    : action === "ledger"
      ? "ledger"
      : action;
payload.action = normalizedAction;
console.log("收到请求:", normalizedAction, payload.title, payload.doc_url, payload.platforms);

const appId = process.env.FEISHU_APP_ID || "";
const appSecret = process.env.FEISHU_APP_SECRET || "";
let token = "";
if (appId && appSecret) {
  token = await getTenantToken(appId, appSecret);
} else {
  console.warn("未设置 FEISHU_APP_ID/SECRET，台账与 OpenAPI 拉正文将受限");
}

let writeResult = {
  wrote: false,
  unpublished: false,
  slug: "",
  navDir: payload.nav_dir || "blog/posts",
  blogRel: null,
};

if (normalizedAction === "unpublish") {
  writeResult = { ...unpublishLocal(payload), wrote: false };
} else if (normalizedAction === "publish" || normalizedAction === "republish") {
  const plats = String(payload.platforms || "blog")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  if (plats.includes("blog") || plats.length === 0) {
    writeResult = await writeLocalMarkdown(payload, token);
  } else {
    // 仅外站：不写博客文件，只登记台账
    const r = resolveSlug(payload);
    writeResult = { wrote: false, slug: r.slug, navDir: r.navDir, blogRel: null };
  }
} else {
  // ledger only
  const r = resolveSlug(payload);
  writeResult = { wrote: false, slug: r.slug, navDir: r.navDir, blogRel: null };
}

// 纠正 payload.slug 供台账使用
payload.slug = writeResult.slug || safeSlug(payload.title, payload.doc_token);
payload.nav_dir = writeResult.navDir || payload.nav_dir;

if (token) {
  await upsertLedger(token, payload, {
    slug: payload.slug,
    navDir: payload.nav_dir,
    wroteMarkdown: writeResult.wrote,
    unpublished: writeResult.unpublished,
    platforms: payload.platforms,
  });
} else {
  console.warn("跳过 OpenAPI 写台账");
}

fs.mkdirSync(path.join(ROOT, "feiboxia/queue"), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, "feiboxia/queue/doc-dispatch.last.json"),
  JSON.stringify(
    {
      ...payload,
      resolvedSlug: payload.slug,
      wroteMarkdown: writeResult.wrote,
      unpublished: writeResult.unpublished || false,
      blogRel: writeResult.blogRel || null,
      handledAt: new Date().toISOString(),
    },
    null,
    2
  )
);

console.log(
  "完成",
  `action=${normalizedAction}`,
  `slug=${payload.slug}`,
  writeResult.unpublished
    ? "已撤销"
    : writeResult.wrote
      ? "正文已写入"
      : "正文未写入"
);
