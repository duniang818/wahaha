import React, { useEffect, useMemo, useRef, useState } from "react";
import { BlockitClient } from "@lark-opdev/block-docs-addon-api";

type Action = "publish" | "republish" | "unpublish";
type PlatformId = "blog" | "wechat" | "xhs" | "csdn" | "zhihu";
type PublishStatus = "unknown" | "never" | "published" | "revoked";

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

/** 用 GitHub Contents + 博客 URL 探测，判定发布状态 */
async function detectPublishStatus(
  cfg: Cfg,
  nav: string,
  slug: string
): Promise<{ status: PublishStatus; detail: string }> {
  if (!cfg.githubPat?.trim() || !cfg.githubRepo?.trim() || !slug) {
    return { status: "unknown", detail: "未配置 PAT，无法自动检测" };
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
      return { status: "never", detail: "仓库中尚无对应博文文件" };
    }
    if (!res.ok) {
      return { status: "unknown", detail: `检测失败 ${res.status}` };
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
    const draft = /^\s*draft:\s*true\s*$/im.test(head);
    if (draft) {
      return { status: "revoked", detail: "博文存在但已标 draft（下架）" };
    }

    const url = blogPostUrl(cfg, nav, slug);
    try {
      const page = await fetch(url, { method: "GET", cache: "no-store" });
      if (page.ok) {
        return { status: "published", detail: "博文在线可访问" };
      }
      return {
        status: "published",
        detail: `仓库已有文件；页面 ${page.status}（Pages 可能还在部署）`,
      };
    } catch {
      return {
        status: "published",
        detail: "仓库已有文件；页面探测失败（可点链接确认）",
      };
    }
  } catch (e: any) {
    return { status: "unknown", detail: e?.message || "网络检测失败" };
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
  const [action, setAction] = useState<Action>("publish");
  const [selected, setSelected] = useState<PlatformId[]>(["blog"]);
  const [status, setStatus] = useState<PublishStatus>("unknown");
  const [statusDetail, setStatusDetail] = useState("");
  const [tagsText, setTagsText] = useState(() => tagsForNav("blog/posts").join(","));
  const [newNav, setNewNav] = useState("");
  const [editingNav, setEditingNav] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const busyRef = useRef(false);
  const collapsedRef = useRef(false);
  const pinOpen = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const suggestedAction = useMemo<Action>(() => {
    if (status === "published") return "republish";
    if (status === "revoked") return "republish";
    return "publish";
  }, [status]);

  // 切换栏目时同步默认标签（用户仍可改）
  useEffect(() => {
    setTagsText(tagsForNav(nav).join(","));
  }, [nav]);

  async function refreshStatus(c: Cfg, n: string, s: string) {
    setStatus("unknown");
    setStatusDetail("正在检测发布状态…");
    const r = await detectPublishStatus(c, n, s);
    setStatus(r.status);
    setStatusDetail(r.detail);
    if (r.status === "published") setAction("republish");
    else if (r.status === "revoked") setAction("republish");
    else if (r.status === "never") setAction("publish");
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
          setShowSetup(true);
          setMsg("首次使用：请先在「设置」填写 GitHub PAT");
        }

        const ctx = await readDocContext();
        setTitle(ctx.title);
        setDocUrl(ctx.url);
        setDocToken(ctx.token);
        const s =
          KNOWN_DOC_SLUGS[ctx.token] ||
          slugify(ctx.title, ctx.token ? `doc-${ctx.token.slice(0, 10)}` : "") ||
          `post-${Date.now().toString(36)}`;
        setSlug(s);

        const last = inter?.lastAction as any;
        const startNav =
          last?.nav && merged.navs?.includes(last.nav) ? last.nav : "blog/posts";
        setNav(startNav);
        setTagsText(tagsForNav(startNav).join(","));

        await refreshStatus(merged, startNav, s);
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
    setShowSetup(false);
    if (next.githubPat?.trim()) {
      await refreshStatus(next, nav, slug);
    }
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

  async function runAction() {
    if (!selected.length) {
      setMsg("请至少选择一个对接平台");
      return;
    }
    if (!docUrl) {
      setMsg("没有文档 URL");
      return;
    }
    if (!blogReady) {
      setShowSetup(true);
      setMsg("请先在「设置」填写 GitHub 仓库与 PAT");
      return;
    }
    if (action !== "unpublish") {
      for (const id of selected) {
        if (id === "blog") continue;
        if (!platformReady(cfg, id)) {
          setShowSetup(true);
          setMsg(`「${PLATFORMS.find(p => p.id === id)?.name}」未对接，请到设置填写`);
          return;
        }
      }
    }

    setBusy(true);
    const label =
      action === "publish" ? "发布" : action === "republish" ? "重新发布" : "撤销发布";
    setMsg(`正在${label}…`);
    try {
      const platforms = selected.join(",");
      const tags = tagsText
        .split(/[,，]/)
        .map(s => s.trim())
        .filter(Boolean)
        .join(",");
      const res = await fetch(
        `https://api.github.com/repos/${cfg.githubRepo}/dispatches`,
        {
          method: "POST",
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${cfg.githubPat}`,
            "X-GitHub-Api-Version": "2022-11-28",
          },
          body: JSON.stringify({
            event_type: "feiboxia-doc-publish",
            // GitHub client_payload 最多 10 个字段：用 tags 替换 mode
            client_payload: {
              action,
              title,
              doc_url: docUrl,
              doc_token: docToken,
              nav_dir: nav,
              slug:
                slug ||
                slugify(title, docToken ? `doc-${docToken.slice(0, 10)}` : ""),
              base_token: cfg.baseToken,
              table_id: cfg.tableId,
              platforms,
              tags: tags || tagsForNav(nav).join(","),
            },
          }),
        }
      );
      if (res.status !== 204) {
        const t = await res.text();
        throw new Error(`GitHub 触发失败 ${res.status}: ${t.slice(0, 240)}`);
      }

      if (action === "unpublish") {
        setStatus("revoked");
        setStatusDetail("已触发撤销，约 1~5 分钟后生效");
      } else {
        setStatus("published");
        setStatusDetail("已触发发布，约 1~5 分钟后可打开");
      }

      await persistInteraction({
        feiboxiaCfg: cfg,
        lastAction: {
          at: new Date().toISOString(),
          action,
          platforms,
          title,
          postUrl,
          nav,
          slug,
          status: action === "unpublish" ? "revoked" : "published",
        },
      });

      setMsg(
        action === "unpublish"
          ? "✓ 已触发撤销。博客约 1~5 分钟后下架；外站请按清单手动处理"
          : `✓ 已触发${label}。约 1~5 分钟后博客链接可打开`
      );
    } catch (e: any) {
      setMsg(`失败：${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  /** 作者管理：移动栏目 / 更新标签 / 删除博文（GitHub dispatch，仅 PAT 持有者可触发） */
  async function runManage(manageAction: "move" | "delete") {
    if (!docUrl) {
      setMsg("没有文档 URL");
      return;
    }
    if (!blogReady) {
      setShowSetup(true);
      setMsg("请先在「设置」填写 GitHub 仓库与 PAT");
      return;
    }
    if (
      manageAction === "delete" &&
      !window.confirm(
        "确定从博客删除这篇文章？\n\n飞书文档会保留，之后可重新发布。"
      )
    ) {
      return;
    }

    setBusy(true);
    const label = manageAction === "move" ? "移动/更新标签" : "删除博文";
    setMsg(`正在${label}…`);
    try {
      const tags = tagsText
        .split(/[,，]/)
        .map(s => s.trim())
        .filter(Boolean)
        .join(",");
      const res = await fetch(
        `https://api.github.com/repos/${cfg.githubRepo}/dispatches`,
        {
          method: "POST",
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${cfg.githubPat}`,
            "X-GitHub-Api-Version": "2022-11-28",
          },
          body: JSON.stringify({
            event_type: "feiboxia-doc-manage",
            client_payload: {
              action: manageAction,
              doc_url: docUrl,
              doc_token: docToken,
              slug:
                slug ||
                slugify(title, docToken ? `doc-${docToken.slice(0, 10)}` : ""),
              nav_dir: nav,
              tags: tags || tagsForNav(nav).join(","),
            },
          }),
        }
      );
      if (res.status !== 204) {
        const t = await res.text();
        throw new Error(`GitHub 触发失败 ${res.status}: ${t.slice(0, 240)}`);
      }
      if (manageAction === "delete") {
        setStatus("never");
        setStatusDetail("已触发删除，约 1~5 分钟后下线");
      } else {
        setStatusDetail("已触发移动/标签更新，约 1~5 分钟后生效");
      }
      setMsg(`✓ 已触发${label}，约 1~5 分钟后在博客生效`);
    } catch (e: any) {
      setMsg(`失败：${e?.message || e}`);
    } finally {
      setBusy(false);
    }
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

  const confirmLabel = busy
    ? "处理中…"
    : showSetup
      ? "保存设置"
      : action === "publish"
        ? "确认发布"
        : action === "republish"
          ? "确认重新发布"
          : "确认撤销";

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
          </div>
        </header>
        <p className="tiny muted status-line">{statusDetail}</p>

        <div className="top-acts">
          {(
            [
              ["publish", "发布"],
              ["republish", "重新发布"],
              ["unpublish", "撤销"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`act ${action === id && !showSetup ? "on" : ""} ${
                id === "unpublish" ? "danger" : ""
              } ${suggestedAction === id && !showSetup ? "suggest" : ""}`}
              disabled={
                (id === "publish" && status === "published") ||
                (id === "republish" && status === "never") ||
                (id === "unpublish" && status === "never")
              }
              onClick={() => {
                setShowSetup(false);
                setAction(id);
              }}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            className={`act ${showSetup ? "on" : ""}`}
            onClick={() => setShowSetup(v => !v)}
          >
            设置
          </button>
        </div>

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
          </section>
        ) : (
          <section className="panel">
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
                  setNav(e.target.value);
                  void refreshStatus(cfg, e.target.value, slug);
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
                onClick={() => void refreshStatus(cfg, nav, slug)}
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

            {status === "published" && (
              <div className="manage-box">
                <p className="tiny muted">作者管理（仅 PAT 持有者可操作）</p>
                <div className="manage-acts">
                  <button
                    type="button"
                    className="ghost sm"
                    disabled={busy}
                    onClick={() => void runManage("move")}
                  >
                    移动栏目/更新标签
                  </button>
                  <button
                    type="button"
                    className="ghost sm danger-text"
                    disabled={busy}
                    onClick={() => void runManage("delete")}
                  >
                    删除博文
                  </button>
                </div>
                <p className="tiny muted">
                  改正文请在飞书里编辑后点「重新发布」
                </p>
              </div>
            )}
          </section>
        )}

        <p className={`msg ${msg.startsWith("失败") ? "err" : ""}`}>{msg}</p>
      </div>

      <div className="panel-footer">
        <button
          type="button"
          className={`cta ${!showSetup && action === "unpublish" ? "cta-danger" : ""}`}
          disabled={busy}
          onClick={() => {
            if (showSetup) void saveCfg(cfg);
            else void runAction();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
