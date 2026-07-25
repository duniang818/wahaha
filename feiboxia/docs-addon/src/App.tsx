import React, { useEffect, useMemo, useRef, useState } from "react";
import { BlockitClient } from "@lark-opdev/block-docs-addon-api";

type Action = "publish" | "republish" | "unpublish";
type Cmd = "send" | "republish" | "pull" | "revoke";
type MdImportMode = "overwrite" | "append" | "new";
type PlatformId = "blog" | "wechat" | "xhs" | "csdn" | "zhihu";
type PublishStatus = "unknown" | "never" | "published" | "revoked";

type DocBinding = {
  navDir: string;
  slug: string;
  title?: string;
  tags: string[];
  fromMap: boolean;
};

type MdJobTrack = {
  jobId: string;
  progress: number;
  phase: string;
  status: "pending" | "running" | "success" | "failure";
  message: string;
  newDocUrl?: string;
};

type Cfg = {
  baseToken: string;
  tableId: string;
  githubRepo: string;
  githubPat: string;
  siteUrl: string;
  wechatNote: string;
  xhsNote: string;
  csdnNote: string;
  zhihuNote: string;
  shareLead: string;
  navs: string[];
};

const DEFAULT_NAVS = ["blog/posts", "education", "travel", "tech", "life"];

/** 导航栏目 → 中文标签（与 URL 路径一致） */
const NAV_META: Record<string, { label: string; tags: string[] }> = {
  "blog/posts": { label: "博客", tags: ["博客", "飞博虾"] },
  education: { label: "教育", tags: ["教育", "飞博虾"] },
  travel: { label: "旅行", tags: ["旅行", "飞博虾"] },
  tech: { label: "技术", tags: ["技术", "飞博虾"] },
  life: { label: "生活", tags: ["生活", "飞博虾"] },
};

/** frontmatter nav 中文标签 → 目录 */
const NAV_LABEL_TO_DIR: Record<string, string> = {
  博客: "blog/posts",
  教育: "education",
  旅行: "travel",
  技术: "tech",
  生活: "life",
  飞博虾: "feiboxia",
};

function tagsForNav(navDir: string): string[] {
  const meta = NAV_META[navDir];
  if (meta) return [...meta.tags];
  const leaf = navDir.split("/").filter(Boolean).pop() || "博客";
  return [leaf, "飞博虾"];
}

function pathOf(navDir: string, slugVal: string) {
  const n = String(navDir || "blog/posts").replace(/^\/+|\/+$/g, "");
  const s = String(slugVal || "post").replace(/^\/+|\/+$/g, "");
  return `/${n}/${s}/`;
}

const DEFAULT_CFG: Cfg = {
  baseToken: "ADtHbOF0raWJj0stRApcfjjInLg",
  tableId: "tblfvnQ3mm7DlX9X",
  githubRepo: "duniang818/wahaha",
  githubPat: "",
  siteUrl: "https://duniang818.github.io/wahaha/",
  wechatNote: "",
  xhsNote: "",
  csdnNote: "",
  zhihuNote: "",
  shareLead: "刚写了一篇，欢迎来看～",
  navs: DEFAULT_NAVS,
};

const LS_KEY = "feiboxia_addon_cfg_v1";
const KNOWN_DOC_SLUGS: Record<string, string> = {
  OGj3dcxuxowNetxgQudc771znhr: "feishu-oneclick-test",
  NvC5dYXOco8X28xnCbScFQXnnng: "feishu-github-blog-guide",
};
const PAT_HELP =
  "https://github.com/settings/tokens/new?scopes=repo,workflow&description=feiboxia-docs-addon";

/** 面板固定尺寸 */
const PANEL_SIZE = { w: 340, h: 520 };
/** 收起时融入宿主横条 */
const BAR_SIZE = { w: 340, h: 36 };

async function setHostSize(w: number, h: number) {
  const bridge = DocMiniApp.Bridge as any;
  try {
    await bridge?.updateResize?.({ width: w, height: h });
  } catch {
    /* ignore */
  }
  try {
    await bridge?.updateHeight?.(h);
  } catch {
    /* ignore */
  }
}

/** 宿主 resize 有时首帧不生效，短延迟重试 */
async function setHostSizeReliable(w: number, h: number) {
  await setHostSize(w, h);
  await new Promise(r => window.setTimeout(r, 80));
  await setHostSize(w, h);
  await new Promise(r => window.setTimeout(r, 200));
  await setHostSize(w, h);
}

const PLATFORMS: { id: PlatformId; name: string; auto: boolean }[] = [
  { id: "blog", name: "GitHub 博客", auto: true },
  { id: "wechat", name: "微信", auto: false },
  { id: "xhs", name: "小红书", auto: false },
  { id: "csdn", name: "CSDN", auto: false },
  { id: "zhihu", name: "知乎", auto: false },
];

const STATUS_LABEL: Record<PublishStatus, string> = {
  unknown: "检测中…",
  never: "未发布",
  published: "已发布",
  revoked: "已撤销",
};

const DocMiniApp = new BlockitClient().initAPI();

function slugify(title: string, fallback = "") {
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

function siteBase(url: string) {
  return (url || "").replace(/\/?$/, "/");
}

function blogPostUrl(cfg: Cfg, nav: string, slug: string) {
  return `${siteBase(cfg.siteUrl)}${`${nav}/${slug}/`.replace(/^\//, "")}`;
}

function loadLocalCfg(): Partial<Cfg> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<Cfg>;
  } catch {
    return {};
  }
}

function saveLocalCfg(cfg: Cfg) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(cfg));
  } catch {
    /* ignore */
  }
}

function platformReady(cfg: Cfg, id: PlatformId): boolean {
  if (id === "blog") return Boolean(cfg.githubPat?.trim() && cfg.githubRepo?.trim());
  if (id === "wechat") return Boolean(cfg.wechatNote?.trim());
  if (id === "xhs") return Boolean(cfg.xhsNote?.trim());
  if (id === "csdn") return Boolean(cfg.csdnNote?.trim());
  if (id === "zhihu") return Boolean(cfg.zhihuNote?.trim());
  return false;
}

async function readDocContext() {
  const docRef = await DocMiniApp.getActiveDocumentRef();
  const title = (await DocMiniApp.Document.getTitle(docRef)) || "未命名文章";
  const anyRef = docRef as any;
  const token =
    anyRef?.docToken ||
    anyRef?.token ||
    anyRef?.documentId ||
    anyRef?.docId ||
    "";
  const url = token ? `https://my.feishu.cn/docx/${token}` : "";
  return { title: String(title), token: String(token), url };
}

async function notifyReady() {
  try {
    await (DocMiniApp as any).LifeCycle?.notifyAppReady?.();
  } catch {
    /* ignore */
  }
  try {
    await (DocMiniApp.Bridge as any)?.notifyAppReady?.();
  } catch {
    /* ignore */
  }
}

async function ensureHostVisible() {
  try {
    await (DocMiniApp.Bridge as any)?.updateVisiable?.(true);
  } catch {
    /* ignore */
  }
}

async function persistInteraction(value: Record<string, unknown>) {
  const api = (DocMiniApp as any).Interaction;
  if (!api?.setData) return false;
  try {
    await api.setData({ type: "replace", data: { path: [], value } });
    return true;
  } catch {
    try {
      await api.setData([{ type: "replace", data: { path: [], value } }]);
      return true;
    } catch {
      return false;
    }
  }
}

async function readInteraction(): Promise<Record<string, unknown> | null> {
  try {
    const data = await (DocMiniApp as any).Interaction?.getData?.();
    if (!data) return null;
    if (typeof data === "object" && data !== null && "feiboxiaCfg" in data) {
      return data as Record<string, unknown>;
    }
    if (data?.data && typeof data.data === "object") {
      return data.data as Record<string, unknown>;
    }
    return typeof data === "object" ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

async function openExternal(url: string) {
  try {
    const svc = (DocMiniApp as any).Service;
    if (svc?.App?.openUrl) {
      await svc.App.openUrl({ url });
      return;
    }
    if (svc?.openUrl) {
      await svc.openUrl({ url });
      return;
    }
  } catch {
    /* fall through */
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

function b64ToUtf8(b64: string) {
  const bin = atob(b64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  try {
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return bin;
  }
}

function utf8ToB64(str: string) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function parseOnlinePostUrl(postUrl: string, siteUrl: string) {
  try {
    const u = new URL(postUrl.trim());
    let p = u.pathname;
    const base = new URL(siteUrl || "https://example.com/").pathname.replace(/\/+$/, "");
    if (base && base !== "/" && p.startsWith(base)) p = p.slice(base.length);
    p = p.replace(/^\/+|\/+$/g, "");
    if (!p) return null;
    const parts = p.split("/").filter(Boolean);
    if (!parts.length) return null;
    const slug = parts[parts.length - 1];
    const navDir = parts.slice(0, -1).join("/") || "blog/posts";
    return { slug, navDir };
  } catch {
    return null;
  }
}

function githubHeaders(pat: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${pat}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function fetchGithubFileContent(cfg: Cfg, repoPath: string): Promise<string | null> {
  if (!cfg.githubPat?.trim() || !cfg.githubRepo?.trim()) return null;
  const res = await fetch(
    `https://api.github.com/repos/${cfg.githubRepo}/contents/${encodeURI(repoPath)}`,
    { headers: githubHeaders(cfg.githubPat) }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  const j = (await res.json()) as { content?: string; encoding?: string };
  if (j.content && j.encoding === "base64") {
    try {
      return b64ToUtf8(j.content);
    } catch {
      return null;
    }
  }
  return null;
}

async function fetchFeishuMap(cfg: Cfg): Promise<Record<string, Record<string, string>>> {
  try {
    const text = await fetchGithubFileContent(cfg, "sync/feishu-map.json");
    if (!text) return {};
    return JSON.parse(text) as Record<string, Record<string, string>>;
  } catch {
    return {};
  }
}

function parseFrontmatterMeta(md: string): { nav?: string; tags: string[]; title?: string } {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return { tags: [] };
  const fm = m[1];
  const tags: string[] = [];
  let nav: string | undefined;
  let title: string | undefined;

  const navM = fm.match(/^nav:\s*(.+)$/m);
  if (navM) nav = navM[1].trim().replace(/^["']|["']$/g, "");

  const titleM = fm.match(/^title:\s*(.+)$/m);
  if (titleM) title = titleM[1].trim().replace(/^["']|["']$/g, "");

  const listTags = fm.match(/^tags:\s*\n((?:[ \t]*-\s*.+\n?)+)/m);
  if (listTags) {
    for (const line of listTags[1].split("\n")) {
      const t = line.match(/^\s*-\s*(.+)/);
      if (t) tags.push(t[1].trim().replace(/^["']|["']$/g, ""));
    }
  } else {
    const inline = fm.match(/^tags:\s*\[(.+)\]/m);
    if (inline) {
      inline[1].split(",").forEach(s => {
        const t = s.trim().replace(/^["']|["']$/g, "");
        if (t) tags.push(t);
      });
    }
  }
  return { nav, tags, title };
}

function pathFromMapEntry(entry: Record<string, string>) {
  let navDir = entry.navDir || "blog/posts";
  let slug = entry.slug || "";
  if (entry.path) {
    const p = String(entry.path).replace(/^docs\//, "").replace(/\.md$/i, "");
    const parts = p.split("/").filter(Boolean);
    if (parts.length >= 2) {
      navDir = parts.slice(0, -1).join("/");
      slug = slug || parts[parts.length - 1];
    } else if (parts.length === 1) {
      slug = slug || parts[0];
    }
  }
  return { navDir, slug };
}

/** 从 feishu-map + 博文 frontmatter 解析栏目、slug、标签 */
async function resolveDocBinding(cfg: Cfg, docToken: string): Promise<DocBinding | null> {
  if (!docToken || !cfg.githubPat?.trim()) return null;

  const map = await fetchFeishuMap(cfg);
  const entry = map[docToken];
  let fromMap = false;
  let navDir = "blog/posts";
  let slug = KNOWN_DOC_SLUGS[docToken] || "";
  let title = entry?.title;

  if (entry) {
    fromMap = true;
    const parsed = pathFromMapEntry(entry);
    navDir = parsed.navDir;
    slug = parsed.slug || slug;
  }

  if (!slug) return null;

  const md = await fetchGithubFileContent(cfg, `docs/${navDir}/${slug}.md`);
  let tags = tagsForNav(navDir);

  if (md) {
    const meta = parseFrontmatterMeta(md);
    if (meta.nav) {
      navDir = NAV_LABEL_TO_DIR[meta.nav] || meta.nav;
    }
    if (meta.tags.length) tags = meta.tags;
    if (meta.title) title = meta.title;
  }

  return { navDir, slug, title, tags, fromMap };
}

async function fetchJobStatus(cfg: Cfg, jobId: string): Promise<MdJobTrack | null> {
  try {
    const text = await fetchGithubFileContent(cfg, `feiboxia/queue/jobs/${jobId}.json`);
    if (!text) return null;
    const j = JSON.parse(text) as Record<string, unknown>;
    const st = String(j.status || "running");
    return {
      jobId,
      progress: Number(j.progress) || 0,
      phase: String(j.phase || ""),
      status:
        st === "success" || st === "failure" || st === "pending" || st === "running"
          ? st
          : "running",
      message: String(j.message || ""),
      newDocUrl: j.newDocUrl ? String(j.newDocUrl) : undefined,
    };
  } catch {
    return null;
  }
}

async function fetchRecentMdImportRun(cfg: Cfg, sinceIso: string) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${cfg.githubRepo}/actions/workflows/feiboxia-md-import.yml/runs?event=repository_dispatch&per_page=8`,
      { headers: githubHeaders(cfg.githubPat) }
    );
    if (!res.ok) return null;
    const j = (await res.json()) as { workflow_runs?: Array<Record<string, string>> };
    const since = new Date(sinceIso).getTime();
    return (
      (j.workflow_runs || []).find(r => new Date(String(r.created_at)).getTime() >= since - 5000) ||
      null
    );
  } catch {
    return null;
  }
}

async function pollMdImportJob(
  cfg: Cfg,
  jobId: string,
  dispatchAt: string,
  onUpdate: (j: MdJobTrack) => void
): Promise<MdJobTrack> {
  const deadline = Date.now() + 8 * 60 * 1000;
  let last: MdJobTrack = {
    jobId,
    progress: 5,
    phase: "已触发",
    status: "pending",
    message: "等待 GitHub Actions 启动…",
  };
  onUpdate(last);

  while (Date.now() < deadline) {
    await new Promise(r => window.setTimeout(r, 3000));

    const job = await fetchJobStatus(cfg, jobId);
    if (job) {
      last = job;
      onUpdate(job);
      if (job.status === "success" || job.status === "failure") return job;
    }

    const run = await fetchRecentMdImportRun(cfg, dispatchAt);
    if (run) {
      if (run.status === "queued") {
        last = {
          ...last,
          progress: Math.max(last.progress, 12),
          phase: "排队中",
          status: "running",
          message: "Actions 排队中…",
        };
      } else if (run.status === "in_progress") {
        const elapsed = Date.now() - new Date(dispatchAt).getTime();
        const est = Math.min(88, 22 + Math.floor(elapsed / 2500));
        last = {
          ...last,
          progress: Math.max(last.progress, est),
          phase: "导入中",
          status: "running",
          message: "正在转换 Markdown 并写入飞书…",
        };
      } else if (run.status === "completed") {
        if (run.conclusion === "failure") {
          const final = await fetchJobStatus(cfg, jobId);
          if (final) return final;
          return {
            jobId,
            progress: 100,
            phase: "失败",
            status: "failure",
            message: "Actions 执行失败，请查看日志",
          };
        }
        const final = await fetchJobStatus(cfg, jobId);
        if (final) return final;
        last = {
          ...last,
          progress: 95,
          phase: "收尾",
          status: "running",
          message: "正在同步任务结果…",
        };
      }
      onUpdate(last);
    }
  }

  return {
    ...last,
    status: "failure",
    progress: 100,
    phase: "超时",
    message: "等待超时，请到 Actions 查看",
  };
}

/** 用 GitHub Contents + 博客 URL 探测，判定发布状态 */
async function detectPublishStatus(
  cfg: Cfg,
  nav: string,
  slug: string,
  docToken = ""
): Promise<{ status: PublishStatus; detail: string; linkedToDoc: boolean }> {
  if (!cfg.githubPat?.trim() || !cfg.githubRepo?.trim() || !slug) {
    return { status: "unknown", detail: "未配置 PAT，无法自动检测", linkedToDoc: false };
  }
  const path = `docs/${String(nav).replace(/^\/+|\/+$/g, "")}/${slug}.md`;
  try {
    const res = await fetch(
      `https://api.github.com/repos/${cfg.githubRepo}/contents/${encodeURI(path)}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${cfg.githubPat}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    if (res.status === 404) {
      return { status: "never", detail: "仓库中尚无对应博文文件", linkedToDoc: false };
    }
    if (!res.ok) {
      return { status: "unknown", detail: `检测失败 ${res.status}`, linkedToDoc: false };
    }
    const j = (await res.json()) as { content?: string; encoding?: string };
    let text = "";
    if (j.content && j.encoding === "base64") {
      try {
        text = b64ToUtf8(j.content);
      } catch {
        text = "";
      }
    }
    const head = text.slice(0, 1200);
    const linkedToDoc = Boolean(
      docToken &&
        (head.includes(`feishu_doc: ${docToken}`) ||
          head.includes(`feishu_doc: "${docToken}"`))
    );
    const draft = /^\s*draft:\s*true\s*$/im.test(head);
    if (draft) {
      return {
        status: "revoked",
        detail: linkedToDoc ? "博文已绑定本飞书文档，但已下架" : "博文存在但未绑定本飞书文档",
        linkedToDoc,
      };
    }

    const url = blogPostUrl(cfg, nav, slug);
    try {
      const page = await fetch(url, { method: "GET", cache: "no-store" });
      if (page.ok) {
        return {
          status: "published",
          detail: linkedToDoc ? "已绑定本飞书文档，在线可访问" : "线上存在但未绑定本飞书文档",
          linkedToDoc,
        };
      }
      return {
        status: "published",
        detail: linkedToDoc
          ? `已绑定；页面 ${page.status}（Pages 可能还在部署）`
          : `线上存在未绑定；页面 ${page.status}`,
        linkedToDoc,
      };
    } catch {
      return {
        status: "published",
        detail: linkedToDoc ? "已绑定本飞书文档" : "线上存在但未绑定本飞书文档",
        linkedToDoc,
      };
    }
  } catch (e: any) {
    return { status: "unknown", detail: e?.message || "网络检测失败", linkedToDoc: false };
  }
}

async function detectOnlineByUrl(cfg: Cfg, postUrl: string, docToken: string) {
  const parsed = parseOnlinePostUrl(postUrl, cfg.siteUrl);
  if (!parsed || !cfg.githubPat?.trim() || !cfg.githubRepo?.trim()) {
    return { exists: false, linkedToCurrent: false, parsed: null as ReturnType<typeof parseOnlinePostUrl> };
  }
  const path = `docs/${parsed.navDir}/${parsed.slug}.md`;
  try {
    const res = await fetch(
      `https://api.github.com/repos/${cfg.githubRepo}/contents/${encodeURI(path)}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${cfg.githubPat}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    if (res.status === 404) {
      return { exists: false, linkedToCurrent: false, parsed };
    }
    if (!res.ok) return { exists: false, linkedToCurrent: false, parsed };
    const j = (await res.json()) as { content?: string; encoding?: string };
    let text = "";
    if (j.content && j.encoding === "base64") {
      try {
        text = b64ToUtf8(j.content);
      } catch {
        text = "";
      }
    }
    const linkedToCurrent = Boolean(
      docToken &&
        (text.includes(`feishu_doc: ${docToken}`) ||
          text.includes(`feishu_doc: "${docToken}"`))
    );
    return { exists: true, linkedToCurrent, parsed };
  } catch {
    return { exists: false, linkedToCurrent: false, parsed };
  }
}

export function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [docToken, setDocToken] = useState("");
  const [nav, setNav] = useState("blog/posts");
  const [slug, setSlug] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [cfg, setCfg] = useState<Cfg>(DEFAULT_CFG);
  const [showPat, setShowPat] = useState(false);
  const [selected, setSelected] = useState<PlatformId[]>(["blog"]);
  const [status, setStatus] = useState<PublishStatus>("unknown");
  const [statusDetail, setStatusDetail] = useState("");
  const [linkedToDoc, setLinkedToDoc] = useState(false);
  const [onlinePostUrl, setOnlinePostUrl] = useState("");
  const [orphanOnline, setOrphanOnline] = useState({
    exists: false,
    linkedToCurrent: false,
  });
  const [tagsText, setTagsText] = useState(() => tagsForNav("blog/posts").join(","));
  const [newNav, setNewNav] = useState("");
  const [editingNav, setEditingNav] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mdImportMode, setMdImportMode] = useState<MdImportMode>("overwrite");
  const [docBinding, setDocBinding] = useState<DocBinding | null>(null);
  const [mdJob, setMdJob] = useState<MdJobTrack | null>(null);
  const mdFileRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  const collapsedRef = useRef(false);
  const pinOpen = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cfgSnapshot = useRef<Cfg | null>(null);

  const blogReady = platformReady(cfg, "blog");
  const navs = cfg.navs?.length ? cfg.navs : DEFAULT_NAVS;

  const postUrl = useMemo(
    () =>
      blogPostUrl(
        cfg,
        nav,
        slug ||
          slugify(title, docToken ? `doc-${docToken.slice(0, 10)}` : "") ||
          "post"
      ),
    [cfg, nav, slug, title, docToken]
  );

  const urlPath = useMemo(
    () =>
      pathOf(
        nav,
        slug ||
          slugify(title, docToken ? `doc-${docToken.slice(0, 10)}` : "") ||
          "post"
      ),
    [nav, slug, title, docToken]
  );

  const cmdFlags = useMemo(() => {
    const hasOnline = status === "published" || status === "revoked";
    const urlMode = Boolean(onlinePostUrl.trim());
    const orphan =
      urlMode && orphanOnline.exists && !orphanOnline.linkedToCurrent;
    const bound = linkedToDoc || Boolean(docBinding?.fromMap);

    return {
      send: Boolean(docToken) && status === "never" && !urlMode,
      republish: Boolean(docToken) && hasOnline && bound && !orphan,
      pull: orphan,
      revoke: urlMode && orphanOnline.exists,
    };
  }, [status, docToken, linkedToDoc, docBinding, onlinePostUrl, orphanOnline]);

  async function applyDocBinding(c: Cfg, token: string) {
    const binding = await resolveDocBinding(c, token);
    if (binding) {
      setDocBinding(binding);
      setNav(binding.navDir);
      setSlug(binding.slug);
      setTagsText(binding.tags.join(","));
      if (binding.title) setTitle(prev => prev || binding.title!);
      return binding;
    }
    setDocBinding(null);
    return null;
  }

  async function refreshStatus(c: Cfg, n: string, s: string, token = docToken) {
    setStatus("unknown");
    setStatusDetail("正在检测发布状态…");
    const r = await detectPublishStatus(c, n, s, token);
    setStatus(r.status);
    setStatusDetail(r.detail);
    setLinkedToDoc(r.linkedToDoc);
    if ((r.status === "published" || r.status === "revoked") && !r.linkedToDoc) {
      const u = blogPostUrl(c, n, s);
      setOnlinePostUrl(prev => prev.trim() || u);
      void refreshOrphanUrl(u, c, token);
    }
  }

  async function refreshOrphanUrl(url: string, c = cfg, token = docToken) {
    const u = url.trim();
    if (!u) {
      setOrphanOnline({ exists: false, linkedToCurrent: false });
      return;
    }
    const r = await detectOnlineByUrl(c, u, token);
    setOrphanOnline({ exists: r.exists, linkedToCurrent: r.linkedToCurrent });
    if (r.exists && r.parsed && !r.linkedToCurrent) {
      setNav(r.parsed.navDir);
      setSlug(r.parsed.slug);
    }
  }

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  useEffect(() => {
    collapsedRef.current = collapsed;
  }, [collapsed]);

  async function expandPanel() {
    if (!collapsedRef.current) return;
    await setHostSizeReliable(PANEL_SIZE.w, PANEL_SIZE.h);
    collapsedRef.current = false;
    setCollapsed(false);
    document.documentElement.dataset.feiboxia = "expanded";
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }

  async function collapsePanel() {
    if (collapsedRef.current) return;
    collapsedRef.current = true;
    setCollapsed(true);
    document.documentElement.dataset.feiboxia = "collapsed";
    await setHostSizeReliable(BAR_SIZE.w, BAR_SIZE.h);
  }

  function onFocusField() {
    pinOpen.current = true;
  }

  function onBlurField() {
    pinOpen.current = false;
  }

  function onScrollPanel() {
    /* 面板内滚动，避免外层抢滚动 */
  }

  useEffect(() => {
    (async () => {
      document.documentElement.dataset.feiboxia = "expanded";
      await notifyReady();
      await ensureHostVisible();
      await setHostSizeReliable(PANEL_SIZE.w, PANEL_SIZE.h);
      setReady(true);

      try {
        const local = loadLocalCfg();
        const inter = await readInteraction();
        const fromInter = (inter?.feiboxiaCfg || {}) as Partial<Cfg>;
        const merged: Cfg = {
          ...DEFAULT_CFG,
          ...fromInter,
          ...local,
          githubPat: local.githubPat || fromInter.githubPat || "",
          navs: local.navs || fromInter.navs || DEFAULT_NAVS,
        };
        setCfg(merged);
        if (!merged.githubPat?.trim()) {
          openSetup();
          setMsg("首次使用：请先在「设置」填写 GitHub PAT");
        }

        const ctx = await readDocContext();
        setTitle(ctx.title);
        setDocUrl(ctx.url);
        setDocToken(ctx.token);
        const fallbackSlug =
          slugify(ctx.title, ctx.token ? `doc-${ctx.token.slice(0, 10)}` : "") ||
          `post-${Date.now().toString(36)}`;

        const binding = await applyDocBinding(merged, ctx.token);
        const last = inter?.lastAction as { nav?: string } | undefined;
        const startNav =
          binding?.navDir ||
          (last?.nav && merged.navs?.includes(last.nav) ? last.nav : "blog/posts");
        const startSlug = binding?.slug || KNOWN_DOC_SLUGS[ctx.token] || fallbackSlug;

        if (!binding) {
          setNav(startNav);
          setSlug(startSlug);
          setTagsText(tagsForNav(startNav).join(","));
        }

        await refreshStatus(merged, startNav, startSlug, ctx.token);
        await setHostSizeReliable(PANEL_SIZE.w, PANEL_SIZE.h);
      } catch (e: any) {
        setMsg(`初始化失败：${e?.message || e}`);
        await notifyReady();
        await setHostSizeReliable(PANEL_SIZE.w, PANEL_SIZE.h);
      }
    })();
  }, []);

  // 阻止滚轮冒泡到飞书外层
  useEffect(() => {
    if (!ready) return;
    const blockOuterScroll = (e: WheelEvent) => {
      const el = scrollRef.current;
      if (!el) return;
      if (el.contains(e.target as Node)) {
        e.stopPropagation();
        return;
      }
      e.preventDefault();
      e.stopPropagation();
    };
    document.addEventListener("wheel", blockOuterScroll, { passive: false, capture: true });
    return () => document.removeEventListener("wheel", blockOuterScroll, { capture: true });
  }, [ready]);

  function onWheelPanel(e: React.WheelEvent) {
    e.stopPropagation();
  }

  async function saveCfg(next: Cfg) {
    setCfg(next);
    saveLocalCfg(next);
    await persistInteraction({
      feiboxiaCfg: next,
      savedAt: new Date().toISOString(),
    });
    setMsg("✓ 设置已保存");
    closeSetup(true);
    if (next.githubPat?.trim()) {
      await refreshStatus(next, nav, slug);
    }
  }

  function openSetup() {
    cfgSnapshot.current = { ...cfg };
    setShowSetup(true);
    setMsg("");
  }

  function closeSetup(saved: boolean) {
    if (!saved && cfgSnapshot.current) {
      setCfg(cfgSnapshot.current);
    }
    cfgSnapshot.current = null;
    setShowSetup(false);
    if (!saved) setMsg("");
  }

  function togglePlat(id: PlatformId) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  function addNav() {
    const v = newNav.trim().replace(/^\/+|\/+$/g, "");
    if (!v) return;
    if (navs.includes(v)) {
      setMsg("栏目已存在");
      return;
    }
    const next = { ...cfg, navs: [...navs, v] };
    setCfg(next);
    saveLocalCfg(next);
    setNav(v);
    setNewNav("");
    setMsg(`✓ 已添加栏目 ${v}`);
  }

  function removeNav(name: string) {
    if (navs.length <= 1) {
      setMsg("至少保留一个栏目");
      return;
    }
    const nextNavs = navs.filter(n => n !== name);
    const next = { ...cfg, navs: nextNavs };
    setCfg(next);
    saveLocalCfg(next);
    if (nav === name) setNav(nextNavs[0]);
    setMsg(`✓ 已删除栏目 ${name}`);
  }

  function renameNav(oldName: string, newName: string) {
    const v = newName.trim().replace(/^\/+|\/+$/g, "");
    if (!v || v === oldName) return;
    if (navs.includes(v)) {
      setMsg("栏目名已存在");
      return;
    }
    const nextNavs = navs.map(n => (n === oldName ? v : n));
    const next = { ...cfg, navs: nextNavs };
    setCfg(next);
    saveLocalCfg(next);
    if (nav === oldName) setNav(v);
    setMsg(`✓ 栏目已改为 ${v}`);
  }

  async function dispatchGithub(eventType: string, clientPayload: Record<string, unknown>) {
    const keys = Object.keys(clientPayload);
    if (keys.length > 10) {
      throw new Error(`dispatch 字段超限（${keys.length}/10）: ${keys.join(", ")}`);
    }
    const res = await fetch(
      `https://api.github.com/repos/${cfg.githubRepo}/dispatches`,
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${cfg.githubPat}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({ event_type: eventType, client_payload: clientPayload }),
      }
    );
    if (res.status !== 204) {
      const t = await res.text();
      throw new Error(`GitHub 触发失败 ${res.status}: ${t.slice(0, 240)}`);
    }
  }

  function tagsPayload() {
    return tagsText
      .split(/[,，]/)
      .map(s => s.trim())
      .filter(Boolean)
      .join(",");
  }

  async function runCmd(cmd: Cmd) {
    if (!blogReady) {
      openSetup();
      setMsg("请先在「设置」填写 GitHub 仓库与 PAT");
      return;
    }

    if (cmd === "revoke") {
      if (
        !window.confirm(
          "确定撤销（删除）该线上博文？\n\n飞书文档不受影响；若需保留请改用「拉取」绑定。"
        )
      ) {
        return;
      }
    }

    if ((cmd === "send" || cmd === "republish") && !docUrl) {
      setMsg("没有飞书文档 URL");
      return;
    }

    if ((cmd === "pull" || cmd === "revoke") && !onlinePostUrl.trim()) {
      setMsg("请填写线上博文 URL");
      return;
    }

    if (cmd === "send" || cmd === "republish") {
      if (!selected.length) {
        setMsg("请至少选择一个对接平台");
        return;
      }
      for (const id of selected) {
        if (id === "blog") continue;
        if (!platformReady(cfg, id)) {
          openSetup();
          setMsg(`「${PLATFORMS.find(p => p.id === id)?.name}」未对接，请到设置填写`);
          return;
        }
      }
    }

    const labels: Record<Cmd, string> = {
      send: "发送",
      republish: "重新发送",
      pull: "拉取",
      revoke: "撤销",
    };

    setBusy(true);
    setMsg(`正在${labels[cmd]}…`);
    try {
      if (cmd === "pull" || cmd === "revoke") {
        await dispatchGithub("feiboxia-doc-manage", {
          action: cmd === "pull" ? "pull" : "revoke",
          post_url: onlinePostUrl.trim(),
          site_url: cfg.siteUrl,
          doc_url: docUrl,
          doc_token: docToken,
        });
        if (cmd === "pull") {
          setLinkedToDoc(true);
          setStatus("published");
          setStatusDetail("已绑定本飞书文档，正文保留线上版本");
          setMsg("✓ 已拉取绑定，约 1~5 分钟后生效");
        } else {
          setStatus("never");
          setStatusDetail("已触发撤销删除");
          setMsg("✓ 已触发撤销，约 1~5 分钟后下线");
        }
        return;
      }

      const action: Action = cmd === "send" ? "publish" : "republish";
      await dispatchGithub("feiboxia-doc-publish", {
        action,
        title,
        doc_url: docUrl,
        doc_token: docToken,
        nav_dir: nav,
        slug:
          slug || slugify(title, docToken ? `doc-${docToken.slice(0, 10)}` : ""),
        base_token: cfg.baseToken,
        table_id: cfg.tableId,
        platforms: selected.join(","),
        tags: tagsPayload() || tagsForNav(nav).join(","),
      });

      setStatus("published");
      setLinkedToDoc(true);
      setStatusDetail("已触发 Actions，等待写入正文并部署");
      setMsg(`✓ 已触发${labels[cmd]}，约 1~5 分钟生效；若失败将于今晚 21:00 自动重试并飞书通知`);

      await persistInteraction({
        feiboxiaCfg: cfg,
        lastAction: {
          at: new Date().toISOString(),
          action,
          platforms: selected.join(","),
          title,
          postUrl,
          nav,
          slug,
          status: "published",
        },
      });
    } catch (e: any) {
      setMsg(`失败：${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  async function runMdImport(file: File) {
    if (!cfg.githubPat?.trim() || !cfg.githubRepo?.trim()) {
      openSetup();
      setMsg("请先在「设置」填写 GitHub PAT");
      return;
    }
    if (mdImportMode !== "new" && !docToken) {
      setMsg("请在飞书文档内打开飞博虾后再导入");
      return;
    }
    setBusy(true);
    setMdJob(null);
    setMsg("正在读取 Markdown…");
    const jobId = `md-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const dispatchAt = new Date().toISOString();
    try {
      const text = await file.text();
      if (!text.trim()) throw new Error("文件内容为空");
      if (text.length > 900_000) {
        throw new Error("文件过大（>900KB 文本），请拆分后重试");
      }
      setMdJob({
        jobId,
        progress: 8,
        phase: "上传",
        status: "pending",
        message: "正在提交到 GitHub Actions…",
      });
      setMsg("正在上传并转换为飞书正文…");
      await dispatchGithub("feiboxia-md-import", {
        mode: mdImportMode,
        doc_token: docToken,
        doc_url: docUrl,
        title: title || file.name.replace(/\.(md|markdown|txt)$/i, ""),
        markdown_b64: utf8ToB64(text),
        job_id: jobId,
      });
      const result = await pollMdImportJob(cfg, jobId, dispatchAt, setMdJob);
      if (result.status === "success") {
        setMsg(`✓ ${result.message || "导入完成"}`);
        if (mdImportMode !== "new") {
          setMsg(prev => `${prev}；请刷新当前文档查看`);
        }
      } else {
        setMsg(`失败：${result.message || "导入失败"}`);
      }
      if (mdFileRef.current) mdFileRef.current.value = "";
    } catch (e: any) {
      setMdJob(prev =>
        prev
          ? { ...prev, status: "failure", progress: 100, phase: "失败", message: e?.message || String(e) }
          : null
      );
      setMsg(`失败：${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  function renderCmdBar(extraClass = "") {
    return (
      <div className={`cmd-bar ${extraClass}`.trim()}>
        <button
          type="button"
          className="cmd-btn primary"
          disabled={busy || !cmdFlags.send}
          title="飞书有 · 线上无"
          onClick={() => void runCmd("send")}
        >
          发送
        </button>
        <button
          type="button"
          className="cmd-btn primary"
          disabled={busy || !cmdFlags.republish}
          title="飞书有 · 线上有 · 有改动"
          onClick={() => void runCmd("republish")}
        >
          重新发送
        </button>
        <button
          type="button"
          className="cmd-btn"
          disabled={busy || !cmdFlags.pull}
          title="飞书无绑定 · 线上有 · 保留并绑定"
          onClick={() => void runCmd("pull")}
        >
          拉取
        </button>
        <button
          type="button"
          className="cmd-btn danger"
          disabled={busy || !cmdFlags.revoke}
          title="飞书无绑定 · 线上有 · 删除线上"
          onClick={() => void runCmd("revoke")}
        >
          撤销
        </button>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="shell collapsed bar-mode" ref={rootRef}>
        <div className="host-strip" aria-label="飞博虾加载中">
          <span className="host-strip-icon shrimp bounce">🦐</span>
          <span className="host-strip-name">飞博虾</span>
        </div>
      </div>
    );
  }

  if (collapsed) {
    return (
      <div
        className="shell collapsed bar-mode"
        ref={rootRef}
        onClick={() => void expandPanel()}
        onMouseEnter={() => void expandPanel()}
        onPointerEnter={() => void expandPanel()}
        role="button"
        tabIndex={0}
        aria-label="展开飞博虾"
        title="飞博虾 · 移入或点击展开"
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            void expandPanel();
          }
        }}
      >
        <div className="host-strip">
          <span className="host-strip-icon" aria-hidden>
            🦐
          </span>
          <span className="host-strip-name">
            飞博<span>虾</span>
          </span>
          <span className={`host-strip-st ${status}`}>{STATUS_LABEL[status]}</span>
        </div>
      </div>
    );
  }

  const confirmLabel = busy ? "处理中…" : "保存设置";

  return (
    <div className="shell expanded" ref={rootRef}>
      <button
        type="button"
        className="panel-min"
        title="收起为小图标"
        aria-label="收起为小图标"
        onClick={e => {
          e.stopPropagation();
          collapsePanel();
        }}
      >
        −
      </button>
      <div
        className="panel-body"
        ref={scrollRef}
        onScroll={onScrollPanel}
        onWheel={onWheelPanel}
      >
        <header className="hd">
          <div className="brand">
            <span className="brand-icon" aria-hidden>
              🦐
            </span>
            <div className="brand-name">
              飞博<span>虾</span>
            </div>
          </div>
          <div className="hd-right">
            <span className={`st ${status}`}>{STATUS_LABEL[status]}</span>
            <button
              type="button"
              className={`act setup ${showSetup ? "on" : ""}`}
              onClick={() => (showSetup ? closeSetup(false) : openSetup())}
            >
              {showSetup ? "返回" : "设置"}
            </button>
          </div>
        </header>
        <p className="tiny muted status-line">
          {statusDetail}
          {docBinding?.fromMap ? (
            <span className="binding-hint">
              {" "}
              · 已识别 {docBinding.navDir}/{docBinding.slug}
            </span>
          ) : null}
        </p>

        {!showSetup && renderCmdBar("cmd-bar-top")}

        {showSetup ? (
          <section className="panel">
            <p className="hint">PAT 必填（repo + workflow）。外站填备忘即可。</p>
            <label>GitHub PAT</label>
            <div className="pat-row">
              <input
                type={showPat ? "text" : "password"}
                value={cfg.githubPat}
                onChange={e => setCfg({ ...cfg, githubPat: e.target.value })}
                onFocus={onFocusField}
                onBlur={onBlurField}
                placeholder="ghp_... / github_pat_..."
              />
              <button
                type="button"
                className="ghost sm"
                onClick={() => setShowPat(v => !v)}
              >
                {showPat ? "隐" : "显"}
              </button>
            </div>
            <button
              type="button"
              className="linkish"
              onClick={() => openExternal(PAT_HELP)}
            >
              打开创建 PAT 页
            </button>
            <label>仓库 owner/repo</label>
            <input
              value={cfg.githubRepo}
              onChange={e => setCfg({ ...cfg, githubRepo: e.target.value })}
              onFocus={onFocusField}
              onBlur={onBlurField}
            />
            <label>博客站点 URL</label>
            <input
              value={cfg.siteUrl}
              onChange={e => setCfg({ ...cfg, siteUrl: e.target.value })}
              onFocus={onFocusField}
              onBlur={onBlurField}
            />
            <label>微信 / 小红书 / CSDN / 知乎备忘</label>
            <input
              value={cfg.wechatNote}
              onChange={e => setCfg({ ...cfg, wechatNote: e.target.value })}
              onFocus={onFocusField}
              onBlur={onBlurField}
              placeholder="微信公众号备注"
            />
            <input
              value={cfg.xhsNote}
              onChange={e => setCfg({ ...cfg, xhsNote: e.target.value })}
              onFocus={onFocusField}
              onBlur={onBlurField}
              placeholder="小红书备注"
            />
            <input
              value={cfg.csdnNote}
              onChange={e => setCfg({ ...cfg, csdnNote: e.target.value })}
              onFocus={onFocusField}
              onBlur={onBlurField}
              placeholder="CSDN 备注"
            />
            <input
              value={cfg.zhihuNote}
              onChange={e => setCfg({ ...cfg, zhihuNote: e.target.value })}
              onFocus={onFocusField}
              onBlur={onBlurField}
              placeholder="知乎备注"
            />
            <div className="setup-acts">
              <button
                type="button"
                className="ghost"
                disabled={busy}
                onClick={() => closeSetup(false)}
              >
                返回
              </button>
              <button
                type="button"
                className="cta"
                disabled={busy}
                onClick={() => void saveCfg(cfg)}
              >
                {confirmLabel}
              </button>
            </div>
          </section>
        ) : (
          <section className="panel">
            <p className="hint tiny muted">
              发送/重新发送：当前飞书文档 → 博客；拉取/撤销：填下方线上 URL
            </p>

            <label>线上博文 URL（无绑定时填，用于拉取/撤销）</label>
            <input
              value={onlinePostUrl}
              onChange={e => setOnlinePostUrl(e.target.value)}
              onFocus={onFocusField}
              onBlur={() => {
                onBlurField();
                void refreshOrphanUrl(onlinePostUrl);
              }}
              placeholder="https://…/blog/posts/xxx/"
            />

            <label>对接平台</label>
            <div className="plats">
              {PLATFORMS.map(p => {
                const on = selected.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`plat ${on ? "on" : ""}`}
                    onClick={() => togglePlat(p.id)}
                  >
                    <span className="plat-check">{on ? "✓" : ""}</span>
                    <span className="plat-name">{p.name}</span>
                  </button>
                );
              })}
            </div>

            <label>标题</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              onFocus={onFocusField}
              onBlur={onBlurField}
            />

            <div className="nav-head">
              <label>导航栏目</label>
              <button
                type="button"
                className="linkish"
                onClick={() => setEditingNav(v => !v)}
              >
                {editingNav ? "完成" : "管理栏目"}
              </button>
            </div>

            {editingNav ? (
              <div className="nav-edit">
                {navs.map(n => (
                  <div key={n} className="nav-row">
                    <input
                      defaultValue={n}
                      onFocus={onFocusField}
                      onBlur={e => {
                        onBlurField();
                        if (e.target.value.trim() !== n) {
                          renameNav(n, e.target.value);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="ghost sm"
                      onClick={() => removeNav(n)}
                    >
                      删
                    </button>
                  </div>
                ))}
                <div className="nav-row">
                  <input
                    value={newNav}
                    onChange={e => setNewNav(e.target.value)}
                    onFocus={onFocusField}
                    onBlur={onBlurField}
                    placeholder="新栏目，如 essays"
                  />
                  <button type="button" className="ghost sm" onClick={addNav}>
                    加
                  </button>
                </div>
              </div>
            ) : (
              <select
                value={nav}
                onChange={e => {
                  const v = e.target.value;
                  setNav(v);
                  setTagsText(tagsForNav(v).join(","));
                  void refreshStatus(cfg, v, slug);
                }}
                onFocus={onFocusField}
                onBlur={onBlurField}
              >
                {navs.map(n => (
                  <option key={n} value={n}>
                    {NAV_META[n]?.label ? `${NAV_META[n].label}（${n}）` : n}
                  </option>
                ))}
              </select>
            )}

            <label>文档标签（与栏目一致，可改）</label>
            <input
              value={tagsText}
              onChange={e => setTagsText(e.target.value)}
              onFocus={onFocusField}
              onBlur={onBlurField}
              placeholder="教育,飞博虾"
            />

            <label>slug</label>
            <input
              value={slug}
              onChange={e => setSlug(e.target.value)}
              onFocus={onFocusField}
              onBlur={() => {
                onBlurField();
                void refreshStatus(cfg, nav, slug);
              }}
            />

            <div className="path-box" title="博客 URL 路径">
              <span className="k">URL 路径（栏目 + slug）</span>
              {urlPath}
            </div>

            <label>博客链接（可点击）</label>
            <a
              className="blog-link"
              href={postUrl}
              onClick={e => {
                e.preventDefault();
                void openExternal(postUrl);
              }}
            >
              {postUrl}
            </a>
            <div className="quick">
              <button
                type="button"
                className="chip"
                onClick={() => {
                  void applyDocBinding(cfg, docToken).then(b => {
                    void refreshStatus(cfg, b?.navDir || nav, b?.slug || slug);
                  });
                  void refreshOrphanUrl(onlinePostUrl);
                }}
              >
                刷新状态
              </button>
              <button
                type="button"
                className="chip"
                onClick={() =>
                  openExternal(`https://github.com/${cfg.githubRepo}/actions`)
                }
              >
                Actions
              </button>
            </div>

            <details className="md-import-box">
              <summary>导入 Markdown → 飞书正文（可编辑）</summary>
              <p className="hint tiny muted">
                上传 .md 文件，转为飞书 docx 正文（非附件）。需文档已分享给飞博虾应用。
              </p>
              <label>导入方式</label>
              <select
                value={mdImportMode}
                onChange={e => setMdImportMode(e.target.value as MdImportMode)}
                onFocus={onFocusField}
                onBlur={onBlurField}
              >
                <option value="overwrite">覆盖当前文档正文</option>
                <option value="append">追加到当前文档末尾</option>
                <option value="new">新建飞书文档</option>
              </select>
              <label>选择 Markdown 文件</label>
              <input
                ref={mdFileRef}
                type="file"
                accept=".md,.markdown,.txt,text/markdown,text/plain"
                disabled={busy}
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) void runMdImport(f);
                }}
              />
              {mdJob ? (
                <div
                  className={`md-job ${mdJob.status}`}
                  aria-live="polite"
                >
                  <div className="md-job-head">
                    <span className="md-job-phase">{mdJob.phase || "处理中"}</span>
                    <span className="md-job-pct">{mdJob.progress}%</span>
                  </div>
                  <div className="md-job-bar" role="progressbar" aria-valuenow={mdJob.progress} aria-valuemin={0} aria-valuemax={100}>
                    <div
                      className="md-job-fill"
                      style={{ width: `${Math.min(100, mdJob.progress)}%` }}
                    />
                  </div>
                  <p className="md-job-msg">{mdJob.message}</p>
                  {mdJob.status === "success" && mdJob.newDocUrl ? (
                    <button
                      type="button"
                      className="linkish md-job-link"
                      onClick={() => openExternal(mdJob.newDocUrl!)}
                    >
                      打开新飞书文档
                    </button>
                  ) : null}
                </div>
              ) : null}
            </details>
          </section>
        )}

        <p className={`msg ${msg.startsWith("失败") ? "err" : ""}`}>{msg}</p>
      </div>
    </div>
  );
}
