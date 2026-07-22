import React, { useEffect, useMemo, useRef, useState } from "react";
import { BlockitClient } from "@lark-opdev/block-docs-addon-api";

type Tab = "publish" | "setup" | "share";
type Action = "publish" | "republish" | "unpublish";
type PlatformId = "blog" | "wechat" | "xhs" | "csdn" | "zhihu";

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
};

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
};

const NAVS = ["blog/posts", "education", "travel", "tech", "life"];
const LS_KEY = "feiboxia_addon_cfg_v1";
const KNOWN_DOC_SLUGS: Record<string, string> = {
  OGj3dcxuxowNetxgQudc771znhr: "feishu-oneclick-test",
  NvC5dYXOco8X28xnCbScFQXnnng: "feishu-github-blog-guide",
};
const PAT_HELP =
  "https://github.com/settings/tokens/new?scopes=repo,workflow&description=feiboxia-docs-addon";

const PLATFORMS: {
  id: PlatformId;
  name: string;
  auto: boolean;
  tip: string;
}[] = [
  { id: "blog", name: "GitHub 博客", auto: true, tip: "自动写入站点" },
  { id: "wechat", name: "微信公众号", auto: false, tip: "复制文案备稿" },
  { id: "xhs", name: "小红书", auto: false, tip: "复制文案备稿" },
  { id: "csdn", name: "CSDN", auto: false, tip: "复制文案备稿" },
  { id: "zhihu", name: "知乎", auto: false, tip: "复制文案备稿" },
];

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

function qrImg(data: string, size = 148) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(
    data
  )}`;
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

function setupHintFor(id: PlatformId): string {
  const map: Record<PlatformId, string> = {
    blog: "请到「设置」填写 GitHub 仓库与 PAT（勾选 repo + workflow）。",
    wechat: "请到「设置 → 对接平台」填写微信公众号备忘（账号名/后台入口即可）。",
    xhs: "请到「设置 → 对接平台」填写小红书账号备注。",
    csdn: "请到「设置 → 对接平台」填写 CSDN 账号备注。",
    zhihu: "请到「设置 → 对接平台」填写知乎账号备注。",
  };
  return map[id];
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
  return { docRef, title: String(title), token: String(token), url };
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

async function updateHostHeight() {
  try {
    await (DocMiniApp.Bridge as any)?.updateHeight?.();
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

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

function PlatformPicker({
  selected,
  onToggle,
  mode,
}: {
  selected: PlatformId[];
  onToggle: (id: PlatformId) => void;
  mode: Action;
}) {
  return (
    <div className="plats">
      {PLATFORMS.map(p => {
        const on = selected.includes(p.id);
        return (
          <button
            key={p.id}
            type="button"
            className={`plat ${on ? "on" : ""}`}
            onClick={() => onToggle(p.id)}
            title={p.tip}
          >
            <span className="plat-check">{on ? "✓" : ""}</span>
            <span className="plat-name">{p.name}</span>
            <span className="plat-tag">{p.auto ? "自动" : mode === "unpublish" ? "指引" : "备稿"}</span>
          </button>
        );
      })}
    </div>
  );
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
  const [tab, setTab] = useState<Tab>("publish");
  const [cfg, setCfg] = useState<Cfg>(DEFAULT_CFG);
  const [showPat, setShowPat] = useState(false);
  const [persistHint, setPersistHint] = useState("");
  const [action, setAction] = useState<Action>("publish");
  const [selected, setSelected] = useState<PlatformId[]>(["blog"]);
  const [guide, setGuide] = useState("");

  const blogReady = platformReady(cfg, "blog");
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
  const workbenchUrl = useMemo(
    () => `${siteBase(cfg.siteUrl)}feiboxia/workbench.html`,
    [cfg.siteUrl]
  );
  const actionsUrl = useMemo(
    () => `https://github.com/${cfg.githubRepo || "duniang818/wahaha"}/actions`,
    [cfg.githubRepo]
  );
  const ledgerUrl = useMemo(
    () => `https://my.feishu.cn/base/${cfg.baseToken}`,
    [cfg.baseToken]
  );

  const unpublishChecklist = useMemo(() => {
    const lines = [`【飞博虾 · 撤销清单】${title}`, ""];
    if (selected.includes("blog")) {
      lines.push(`□ GitHub 博客：将自动下架（draft）→ ${postUrl}`);
    }
    if (selected.includes("wechat")) {
      lines.push(
        `□ 微信公众号：到后台删除/下架该篇${cfg.wechatNote ? `（${cfg.wechatNote}）` : ""}`
      );
    }
    if (selected.includes("xhs")) {
      lines.push(
        `□ 小红书：App 内删除笔记${cfg.xhsNote ? `（${cfg.xhsNote}）` : ""}`
      );
    }
    if (selected.includes("csdn")) {
      lines.push(
        `□ CSDN：文章管理中下架/删除${cfg.csdnNote ? `（${cfg.csdnNote}）` : ""}`
      );
    }
    if (selected.includes("zhihu")) {
      lines.push(
        `□ 知乎：创作中心删除文章${cfg.zhihuNote ? `（${cfg.zhihuNote}）` : ""}`
      );
    }
    lines.push("", `飞书原稿：${docUrl || "-"}`);
    return lines.join("\n");
  }, [selected, title, postUrl, cfg, docUrl]);

  const shareText = useMemo(() => {
    const lead = (cfg.shareLead || "").trim();
    return [
      lead || title,
      "",
      title,
      postUrl,
      "",
      docUrl ? `飞书原稿：${docUrl}` : "",
      selected.includes("wechat") && cfg.wechatNote ? `微信：${cfg.wechatNote}` : "",
      selected.includes("xhs") && cfg.xhsNote ? `小红书：${cfg.xhsNote}` : "",
      selected.includes("csdn") && cfg.csdnNote ? `CSDN：${cfg.csdnNote}` : "",
      selected.includes("zhihu") && cfg.zhihuNote ? `知乎：${cfg.zhihuNote}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [cfg, title, postUrl, docUrl, selected]);

  useEffect(() => {
    (async () => {
      try {
        const local = loadLocalCfg();
        const inter = await readInteraction();
        const fromInter = (inter?.feiboxiaCfg || {}) as Partial<Cfg>;
        const merged: Cfg = {
          ...DEFAULT_CFG,
          ...fromInter,
          ...local,
          githubPat: local.githubPat || fromInter.githubPat || "",
        };
        setCfg(merged);
        if (!merged.githubPat?.trim()) {
          setTab("setup");
          setMsg("第一次用：先到「设置」填 GitHub PAT，博客才能自动发布");
        }

        const ctx = await readDocContext();
        setTitle(ctx.title);
        setDocUrl(ctx.url);
        setDocToken(ctx.token);
        setSlug(
          KNOWN_DOC_SLUGS[ctx.token] ||
            slugify(ctx.title, ctx.token ? `doc-${ctx.token.slice(0, 10)}` : "") ||
            `post-${Date.now().toString(36)}`
        );
        setReady(true);
        await notifyReady();
        await updateHostHeight();
      } catch (e: any) {
        setMsg(`初始化失败：${e?.message || e}`);
        setReady(true);
        await notifyReady();
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => void updateHostHeight(), 80);
    return () => window.clearTimeout(t);
  }, [ready, tab, msg, action, selected, guide, showPat]);

  function togglePlat(id: PlatformId) {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      return [...prev, id];
    });
    setGuide("");
  }

  async function saveCfg(next: Cfg) {
    setCfg(next);
    saveLocalCfg(next);
    const ok = await persistInteraction({
      feiboxiaCfg: next,
      savedAt: new Date().toISOString(),
    });
    setPersistHint(
      ok ? "已保存到本文档块 + 本机浏览器" : "已保存到本机浏览器（文档块存储未开启时仍可用）"
    );
    setMsg("✓ 设置已保存");
    if (next.githubPat?.trim()) setTab("publish");
  }

  function validateSelection(): string | null {
    if (!selected.length) return "请至少选择一个平台";
    if (!docUrl) return "没有文档 URL，请确认在云文档中插入本块";

    // 触发流水线始终需要 GitHub PAT
    if (!blogReady) {
      setGuide(setupHintFor("blog"));
      setTab("setup");
      return "请先在「设置」填写 GitHub 仓库与 PAT（用于触发发布/撤销流水线）";
    }

    // 发布/重发时：外站若未填对接备忘，引导去设置
    if (action !== "unpublish") {
      for (const id of selected) {
        if (id === "blog") continue;
        if (!platformReady(cfg, id)) {
          setGuide(setupHintFor(id));
          setTab("setup");
          return `「${PLATFORMS.find(p => p.id === id)?.name}」还没对接好：${setupHintFor(id)}`;
        }
      }
    }
    return null;
  }

  async function runAction() {
    const err = validateSelection();
    if (err) {
      setMsg(err);
      return;
    }
    setBusy(true);
    const label =
      action === "publish"
        ? "发布"
        : action === "republish"
          ? "重新发布"
          : "撤销发布";
    setMsg(`正在${label}…`);
    try {
      const platforms = selected.join(",");
      // client_payload 顶层 ≤ 10
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
            client_payload: {
              action,
              mode: action === "unpublish" ? "unpublish" : "full",
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
            },
          }),
        }
      );

      if (res.status !== 204) {
        const t = await res.text();
        throw new Error(`GitHub 触发失败 ${res.status}: ${t.slice(0, 240)}`);
      }

      await persistInteraction({
        feiboxiaCfg: cfg,
        lastAction: {
          at: new Date().toISOString(),
          action,
          platforms,
          title,
          postUrl,
        },
      });

      if (action === "unpublish") {
        const ok = await copyText(unpublishChecklist);
        setMsg(
          ok
            ? "✓ 已触发博客下架；外站撤销清单已复制，请按清单到各平台操作"
            : "✓ 已触发博客下架；请到「外站」查看撤销清单"
        );
        setTab("share");
      } else {
        setMsg(
          `✓ 已触发${label}（${selected.map(id => PLATFORMS.find(p => p.id === id)?.name).join("、")}）。可到 Actions 看进度`
        );
        if (selected.some(id => id !== "blog")) setTab("share");
      }
    } catch (e: any) {
      setMsg(`失败：${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <div className="wrap" ref={rootRef}>
        <div className="loading">
          <span className="shrimp bounce">🦐</span> 飞博虾准备中…
        </div>
      </div>
    );
  }

  return (
    <div className="wrap" ref={rootRef}>
      <div className="glow" aria-hidden />
      <header className="hd">
        <div className="brand">
          <span className="shrimp" aria-hidden>
            🦐
          </span>
          <div>
            <div className="brand-name">
              飞博<span>虾</span>
            </div>
            <div className="brand-sub">飞书 → 博客 / 外站</div>
          </div>
        </div>
        <div className={`badge ${blogReady ? "ok" : "warn"}`}>
          {blogReady ? "已就绪" : "待设置"}
        </div>
      </header>

      <nav className="tabs" aria-label="飞博虾功能">
        {(
          [
            ["publish", "发布"],
            ["setup", "设置"],
            ["share", "外站"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
          >
            {label}
            {id === "setup" && !blogReady ? <i className="dot" /> : null}
          </button>
        ))}
      </nav>

      {!blogReady && tab !== "setup" ? (
        <button type="button" className="banner" onClick={() => setTab("setup")}>
          第一次？先去「设置」填 GitHub PAT，才能发布到博客 →
        </button>
      ) : null}

      {guide ? (
        <div className="guide">
          <strong>怎么对接</strong>
          <p>{guide}</p>
          <button type="button" className="linkish" onClick={() => setTab("setup")}>
            打开设置填写
          </button>
        </div>
      ) : null}

      {tab === "setup" ? (
        <section className="panel">
          <p className="hint">
            参数保存在<strong>本机</strong>与本文档块。博客发布必须填 PAT；外站填备忘即可（用于文案与撤销清单）。
          </p>

          <div className="card soft">
            <div className="card-title">① GitHub 博客（自动）</div>
            <div className="qr-row compact">
              <div className="qr-card">
                <img src={qrImg(PAT_HELP, 110)} alt="PAT" width={100} height={100} />
                <button type="button" className="linkish" onClick={() => openExternal(PAT_HELP)}>
                  扫码创建 PAT
                </button>
              </div>
              <div className="fields grow">
                <label>GitHub PAT（repo + workflow）</label>
                <div className="pat-row">
                  <input
                    type={showPat ? "text" : "password"}
                    value={cfg.githubPat}
                    onChange={e => setCfg({ ...cfg, githubPat: e.target.value })}
                    placeholder="ghp_... / github_pat_..."
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="ghost sm"
                    onClick={() => setShowPat(v => !v)}
                  >
                    {showPat ? "隐" : "显"}
                  </button>
                </div>
                <label>仓库 owner/repo</label>
                <input
                  value={cfg.githubRepo}
                  onChange={e => setCfg({ ...cfg, githubRepo: e.target.value })}
                />
                <label>博客站点 URL</label>
                <input
                  value={cfg.siteUrl}
                  onChange={e => setCfg({ ...cfg, siteUrl: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="card soft">
            <div className="card-title">② 对接平台（外站备忘）</div>
            <p className="tiny muted">
              第一次选中某外站时若未填，会跳到这里提示。填账号备注即可，无需服务器。
            </p>
            <label>微信公众号</label>
            <input
              value={cfg.wechatNote}
              onChange={e => setCfg({ ...cfg, wechatNote: e.target.value })}
              placeholder="如：渡娘公众号 / 后台草稿箱"
            />
            <label>小红书</label>
            <input
              value={cfg.xhsNote}
              onChange={e => setCfg({ ...cfg, xhsNote: e.target.value })}
              placeholder="如：@渡娘"
            />
            <label>CSDN</label>
            <input
              value={cfg.csdnNote}
              onChange={e => setCfg({ ...cfg, csdnNote: e.target.value })}
              placeholder="如：CSDN 博客 ID"
            />
            <label>知乎</label>
            <input
              value={cfg.zhihuNote}
              onChange={e => setCfg({ ...cfg, zhihuNote: e.target.value })}
              placeholder="如：知乎昵称"
            />
            <label>分享导语</label>
            <input
              value={cfg.shareLead}
              onChange={e => setCfg({ ...cfg, shareLead: e.target.value })}
            />
          </div>

          <details className="more">
            <summary>台账高级参数</summary>
            <label>base_token</label>
            <input
              value={cfg.baseToken}
              onChange={e => setCfg({ ...cfg, baseToken: e.target.value })}
            />
            <label>table_id</label>
            <input
              value={cfg.tableId}
              onChange={e => setCfg({ ...cfg, tableId: e.target.value })}
            />
          </details>

          <div className="btns">
            <button type="button" className="cta" onClick={() => saveCfg(cfg)}>
              保存设置
            </button>
            <button type="button" className="ghost" onClick={() => openExternal(ledgerUrl)}>
              打开台账
            </button>
          </div>
          {persistHint ? <p className="tiny muted">{persistHint}</p> : null}
        </section>
      ) : null}

      {tab === "publish" ? (
        <section className="panel">
          <div className="actions">
            {(
              [
                ["publish", "发布"],
                ["republish", "重新发布"],
                ["unpublish", "撤销发布"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`act ${action === id ? "on" : ""} ${id === "unpublish" ? "danger" : ""}`}
                onClick={() => {
                  setAction(id);
                  if (id === "unpublish" && selected.length === 0) {
                    setSelected(["blog"]);
                  }
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <p className="hint">
            {action === "unpublish"
              ? "勾选要从哪些平台撤销。博客可自动下架；微信/小红书等会生成撤销清单供你操作。"
              : action === "republish"
                ? "覆盖更新已发布内容。勾选要对接到的平台。"
                : "首次发布：勾选要对接到的平台。未设置的平台会提示去「设置」填写。"}
          </p>

          <label>
            {action === "unpublish" ? "撤销平台" : "对接平台"}
          </label>
          <PlatformPicker
            selected={selected}
            onToggle={togglePlat}
            mode={action}
          />

          <label>标题</label>
          <input value={title} onChange={e => setTitle(e.target.value)} />

          <div className="two">
            <div>
              <label>导航栏目</label>
              <select value={nav} onChange={e => setNav(e.target.value)}>
                {NAVS.map(n => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>slug</label>
              <input value={slug} onChange={e => setSlug(e.target.value)} />
            </div>
          </div>
          <p className="tiny muted preview-url">{postUrl}</p>

          <div className="btns">
            <button
              type="button"
              className={`cta ${action === "unpublish" ? "cta-danger" : ""}`}
              disabled={busy}
              onClick={() => runAction()}
            >
              {busy
                ? "处理中…"
                : action === "publish"
                  ? "确认发布"
                  : action === "republish"
                    ? "确认重新发布"
                    : "确认撤销"}
            </button>
          </div>

          <div className="quick">
            <button type="button" className="chip" onClick={() => openExternal(actionsUrl)}>
              Actions
            </button>
            <button type="button" className="chip" onClick={() => openExternal(workbenchUrl)}>
              工作台
            </button>
            <button type="button" className="chip" onClick={() => openExternal(ledgerUrl)}>
              台账
            </button>
            <button type="button" className="chip" onClick={() => setTab("share")}>
              文案 / 清单
            </button>
          </div>
        </section>
      ) : null}

      {tab === "share" ? (
        <section className="panel">
          <p className="hint">
            博客可自动；外站用「复制文案」备稿。撤销时用下面清单到各平台手动下架。
          </p>

          <div className="qr-row">
            <div className="qr-card wide">
              <img src={qrImg(postUrl, 150)} alt="博客" width={130} height={130} />
              <strong>博客页</strong>
              <span className="tiny break">{postUrl}</span>
              <div className="btns tight">
                <button
                  type="button"
                  className="ghost sm"
                  onClick={async () => {
                    setMsg((await copyText(postUrl)) ? "✓ 已复制链接" : "复制失败");
                  }}
                >
                  复制链接
                </button>
                <button type="button" className="ghost sm" onClick={() => openExternal(postUrl)}>
                  打开
                </button>
              </div>
            </div>
          </div>

          <label>外站发布文案</label>
          <textarea className="share-box" readOnly rows={4} value={shareText} />
          <div className="btns tight">
            <button
              type="button"
              className="cta"
              onClick={async () => {
                setMsg((await copyText(shareText)) ? "✓ 文案已复制" : "复制失败");
              }}
            >
              复制发布文案
            </button>
          </div>

          <label>撤销清单（外站需人工）</label>
          <textarea className="share-box" readOnly rows={5} value={unpublishChecklist} />
          <div className="btns tight">
            <button
              type="button"
              className="ghost"
              onClick={async () => {
                setMsg((await copyText(unpublishChecklist)) ? "✓ 清单已复制" : "复制失败");
              }}
            >
              复制撤销清单
            </button>
            <button type="button" className="ghost" onClick={() => setTab("setup")}>
              改平台备忘
            </button>
          </div>
        </section>
      ) : null}

      <p className={`msg ${msg.startsWith("失败") ? "err" : ""}`}>{msg}</p>
    </div>
  );
}
