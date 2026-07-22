/**
 * 飞博虾核心：飞书文档 → 博客文件
 */
import fs from "node:fs";
import path from "node:path";
import {
  fetchFeishuMarkdown,
  markdownFromFeishu,
  slugify,
  buildPostMarkdown,
  extractDocToken,
} from "./feishu-doc.js";
import { commitFileToGithub, writeLocalAndMaybePush } from "./github.js";
import { ROOT } from "./tenant.js";

const NAV_ALIASES = {
  博客: "blog/posts",
  文章: "blog/posts",
  教育: "education",
  旅行: "travel",
  技术: "tech",
  生活: "life",
  "blog/posts": "blog/posts",
  education: "education",
  travel: "travel",
  tech: "tech",
  life: "life",
};

export function normalizeNavDir(raw) {
  const s = String(raw || "blog/posts").trim();
  return NAV_ALIASES[s] || s.replace(/^\/+|\/+$/g, "") || "blog/posts";
}

export async function publishArticle(input, tenant) {
  const docUrl = String(input.doc_url || input.docUrl || "").trim();
  if (!docUrl) throw new Error("缺少飞书文档链接 doc_url");

  const fetched = fetchFeishuMarkdown(docUrl);
  const parsed = markdownFromFeishu(fetched.content);
  const title = String(input.title || parsed.title || "未命名文章").trim();
  const slug =
    String(input.slug || "").trim() ||
    slugify(title) ||
    `feiboxia-${(fetched.docId || extractDocToken(docUrl)).slice(0, 10)}`;
  const navDir = normalizeNavDir(input.nav_dir || input.dir || input["写入目录"]);
  const tags = input.tags || input["标签"] || "飞博虾";

  const built = buildPostMarkdown({
    title,
    body: parsed.body,
    slug,
    tags,
    docId: fetched.docId,
    docUrl,
    navDir,
  });

  // 更新本机绑定表
  try {
    const mapFile = path.join(ROOT, "sync/feishu-map.json");
    const map = fs.existsSync(mapFile)
      ? JSON.parse(fs.readFileSync(mapFile, "utf8"))
      : {};
    map[fetched.docId || slug] = {
      slug,
      path: built.rel,
      title,
      url: docUrl,
      updatedAt: new Date().toISOString(),
      via: "feiboxia",
    };
    fs.writeFileSync(mapFile, JSON.stringify(map, null, 2), "utf8");
  } catch {
    /* ignore */
  }

  const mode = tenant?.blog?.mode || "local";
  let deploy = null;

  if (mode === "github") {
    deploy = await commitFileToGithub({
      token: tenant.blog.token,
      repo: tenant.blog.repo,
      branch: tenant.blog.branch || "main",
      path: `${(tenant.blog.docsPath || "docs").replace(/\/$/, "")}/${built.rel}`,
      content: built.content,
      message: `docs: 飞博虾发布《${title}》`,
    });
  } else {
    const push = input.push !== false && input.push !== "false";
    deploy = writeLocalAndMaybePush({
      rel: built.rel,
      content: built.content,
      title,
      push,
    });
  }

  return {
    ok: true,
    message: "发布成功",
    title,
    slug,
    path: built.rel,
    mode,
    deploy,
    siteHint:
      tenant?.blog?.siteUrl ||
      process.env.SITE_URL ||
      "https://duniang818.github.io/wahaha/",
  };
}
