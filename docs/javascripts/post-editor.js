/**
 * 作者在线编辑博文（GitHub Contents API + EasyMDE）
 * PAT 仅存本机 localStorage，不经过第三方服务器
 */
(function () {
  var LS_CFG = "feiboxia_addon_cfg_v1";
  var LS_PAT = "dn_author_github_pat";
  var DEFAULT_REPO = "duniang818/wahaha";

  function siteBase() {
    if (location.pathname.indexOf("/wahaha/") === 0 || location.pathname === "/wahaha") {
      return "/wahaha";
    }
    return "";
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function loadCfg() {
    try {
      var a = JSON.parse(localStorage.getItem(LS_CFG) || "{}");
      var pat = localStorage.getItem(LS_PAT) || a.githubPat || "";
      return {
        githubRepo: a.githubRepo || DEFAULT_REPO,
        githubPat: pat,
      };
    } catch {
      return { githubRepo: DEFAULT_REPO, githubPat: "" };
    }
  }

  function savePat(pat) {
    try {
      localStorage.setItem(LS_PAT, pat);
      var a = {};
      try {
        a = JSON.parse(localStorage.getItem(LS_CFG) || "{}");
      } catch {
        a = {};
      }
      a.githubPat = pat;
      localStorage.setItem(LS_CFG, JSON.stringify(a));
    } catch {
      /* ignore */
    }
  }

  function pageToDocsPath() {
    var base = siteBase();
    var path = location.pathname;
    if (base && path.indexOf(base) === 0) path = path.slice(base.length);
    path = path.replace(/^\/+|\/+$/g, "").replace(/\/index\.html$/i, "");
    if (!path || path === "index.html" || path === "calendar" || path.indexOf("calendar/") === 0) {
      return "";
    }
    if (path.endsWith(".html")) path = path.replace(/\.html$/i, "");
    return "docs/" + path + ".md";
  }

  function isArticlePage() {
    if (document.getElementById("dn-calendar-root")) return false;
    if (document.getElementById("dn-calendar-detail")) return false;
    var p = pageToDocsPath();
    if (!p || p === "docs/index.md" || p === "docs/about.md") return false;
    if (/-index\.md$/i.test(p)) return false;
    return !!document.querySelector(".md-content .md-typeset");
  }

  function utf8ToB64(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function b64ToUtf8(b64) {
    var bin = atob(String(b64).replace(/\n/g, ""));
    var bytes = Uint8Array.from(bin, function (c) {
      return c.charCodeAt(0);
    });
    try {
      return new TextDecoder("utf-8").decode(bytes);
    } catch {
      return bin;
    }
  }

  function ghHeaders(pat) {
    return {
      Accept: "application/vnd.github+json",
      Authorization: "Bearer " + pat,
      "X-GitHub-Api-Version": "2022-11-28",
    };
  }

  function ensureUi() {
    if (document.getElementById("dn-edit-fab")) return;
    var fab = document.createElement("button");
    fab.id = "dn-edit-fab";
    fab.type = "button";
    fab.className = "dn-edit-fab";
    fab.title = "编辑本文（作者）";
    fab.textContent = "编辑";
    fab.addEventListener("click", openEditor);
    document.body.appendChild(fab);

    var modal = document.createElement("div");
    modal.id = "dn-edit-modal";
    modal.className = "dn-edit-modal";
    modal.hidden = true;
    modal.innerHTML =
      '<div class="dn-edit-dialog" role="dialog" aria-modal="true" aria-label="编辑博文">' +
      '<header class="dn-edit-hd">' +
      "<div><strong>在线编辑</strong><span class=\"dn-edit-path\"></span></div>" +
      '<button type="button" class="dn-edit-close" aria-label="关闭">×</button>' +
      "</header>" +
      '<div class="dn-edit-auth">' +
      '<label>GitHub PAT <input type="password" class="dn-edit-pat" placeholder="ghp_…（repo 权限，仅存本机）" autocomplete="off"></label>' +
      '<label>仓库 <input type="text" class="dn-edit-repo" placeholder="owner/repo"></label>' +
      "</div>" +
      '<textarea class="dn-edit-ta" id="dn-edit-ta"></textarea>' +
      '<footer class="dn-edit-ft">' +
      '<p class="dn-edit-msg"></p>' +
      '<div class="dn-edit-acts">' +
      '<button type="button" class="dn-edit-cancel">取消</button>' +
      '<button type="button" class="dn-edit-save">保存并提交</button>' +
      "</div></footer></div>";
    document.body.appendChild(modal);

    modal.querySelector(".dn-edit-close").addEventListener("click", closeEditor);
    modal.querySelector(".dn-edit-cancel").addEventListener("click", closeEditor);
    modal.querySelector(".dn-edit-save").addEventListener("click", saveEditor);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeEditor();
    });
  }

  var mde = null;
  var fileSha = "";
  var filePath = "";

  function setMsg(text, isErr) {
    var el = document.querySelector("#dn-edit-modal .dn-edit-msg");
    if (!el) return;
    el.textContent = text || "";
    el.classList.toggle("err", !!isErr);
  }

  function closeEditor() {
    var modal = document.getElementById("dn-edit-modal");
    if (modal) modal.hidden = true;
    if (mde) {
      try {
        mde.toTextArea();
      } catch {
        /* ignore */
      }
      mde = null;
    }
  }

  async function openEditor() {
    ensureUi();
    var cfg = loadCfg();
    filePath = pageToDocsPath();
    if (!filePath) {
      alert("当前页不是可编辑的博文");
      return;
    }

    var modal = document.getElementById("dn-edit-modal");
    modal.hidden = false;
    modal.querySelector(".dn-edit-path").textContent = filePath;
    modal.querySelector(".dn-edit-pat").value = cfg.githubPat || "";
    modal.querySelector(".dn-edit-repo").value = cfg.githubRepo || DEFAULT_REPO;
    setMsg("正在从 GitHub 拉取原文…");

    var ta = document.getElementById("dn-edit-ta");
    if (mde) {
      try {
        mde.toTextArea();
      } catch {
        /* ignore */
      }
      mde = null;
    }
    ta.value = "";

    var pat = cfg.githubPat;
    if (!pat) {
      setMsg("请先填写 GitHub PAT（需要 repo 权限）", true);
      return;
    }

    try {
      var repo = modal.querySelector(".dn-edit-repo").value.trim() || DEFAULT_REPO;
      var res = await fetch(
        "https://api.github.com/repos/" + repo + "/contents/" + encodeURI(filePath),
        { headers: ghHeaders(pat) }
      );
      if (!res.ok) throw new Error("读取失败 " + res.status + "（检查 PAT 与路径）");
      var j = await res.json();
      fileSha = j.sha || "";
      var text = j.content && j.encoding === "base64" ? b64ToUtf8(j.content) : "";
      ta.value = text;
      if (typeof EasyMDE !== "undefined") {
        mde = new EasyMDE({
          element: ta,
          spellChecker: false,
          status: ["lines", "words", "cursor"],
          minHeight: "320px",
          autofocus: true,
        });
      }
      setMsg("已加载，修改后点「保存并提交」。Pages 约 1~3 分钟更新。");
    } catch (e) {
      setMsg(e.message || String(e), true);
    }
  }

  async function saveEditor() {
    var modal = document.getElementById("dn-edit-modal");
    var pat = modal.querySelector(".dn-edit-pat").value.trim();
    var repo = modal.querySelector(".dn-edit-repo").value.trim() || DEFAULT_REPO;
    if (!pat) {
      setMsg("请填写 PAT", true);
      return;
    }
    savePat(pat);

    var content = mde ? mde.value() : document.getElementById("dn-edit-ta").value;
    if (!content.trim()) {
      setMsg("内容不能为空", true);
      return;
    }

    setMsg("正在提交到 GitHub…");
    try {
      var res = await fetch(
        "https://api.github.com/repos/" + repo + "/contents/" + encodeURI(filePath),
        {
          method: "PUT",
          headers: Object.assign({ "Content-Type": "application/json" }, ghHeaders(pat)),
          body: JSON.stringify({
            message: "docs: 在线编辑 " + filePath.replace(/^docs\//, ""),
            content: utf8ToB64(content),
            sha: fileSha,
          }),
        }
      );
      if (!res.ok) {
        var t = await res.text();
        throw new Error("保存失败 " + res.status + ": " + t.slice(0, 180));
      }
      var j = await res.json();
      fileSha = (j.content && j.content.sha) || fileSha;
      setMsg("✓ 已提交。等待 GitHub Pages 部署后刷新页面即可看到更新。");
    } catch (e) {
      setMsg(e.message || String(e), true);
    }
  }

  function boot() {
    if (!isArticlePage()) {
      var fab = document.getElementById("dn-edit-fab");
      if (fab) fab.remove();
      return;
    }
    ensureUi();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  if (typeof document$ !== "undefined" && document$.subscribe) {
    document$.subscribe(boot);
  }
})();
