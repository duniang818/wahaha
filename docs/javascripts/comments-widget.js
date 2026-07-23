(function () {
  var GISCUS_DEFAULTS = {
    categoryId: "DIC_KWDORplaceholder",
    category: "Announcements",
  };

  var REACTION_EMOJIS = ["👍", "❤️", "😄", "🎉", "😕", "🚀", "👀"];

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s || "");
    return d.innerHTML;
  }

  function mdRender(src) {
    try {
      if (typeof marked !== "undefined") {
        return marked.parse(String(src || ""), { breaks: true, gfm: true });
      }
    } catch {
      /* ignore */
    }
    return esc(src).replace(/\n/g, "<br>");
  }

  function loadGiscus(container, categoryId, category) {
    if (!container || container.dataset.loaded === "1") return;
    container.dataset.loaded = "1";
    container.classList.add("giscus");
    var s = document.createElement("script");
    s.src = "https://giscus.app/client.js";
    s.setAttribute("data-repo", "duniang818/wahaha");
    s.setAttribute("data-repo-id", "R_kgDORLy0LA");
    s.setAttribute("data-category", category || GISCUS_DEFAULTS.category);
    s.setAttribute("data-category-id", categoryId || GISCUS_DEFAULTS.categoryId);
    s.setAttribute("data-mapping", "pathname");
    s.setAttribute("data-strict", "0");
    s.setAttribute("data-reactions-enabled", "1");
    s.setAttribute("data-emit-metadata", "0");
    s.setAttribute("data-input-position", "top");
    s.setAttribute("data-theme", "preferred_color_scheme");
    s.setAttribute("data-lang", "zh-CN");
    s.crossOrigin = "anonymous";
    s.async = true;
    container.appendChild(s);
  }

  function reactionKey(pageUrl) {
    return "dn-cmt-react:" + pageUrl;
  }

  function loadReactions(pageUrl) {
    try {
      return JSON.parse(localStorage.getItem(reactionKey(pageUrl)) || "{}");
    } catch {
      return {};
    }
  }

  function saveReactions(pageUrl, data) {
    try {
      localStorage.setItem(reactionKey(pageUrl), JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }

  function totalReactions(data) {
    return Object.keys(data).reduce(function (sum, key) {
      return sum + (Number(data[key]) || 0);
    }, 0);
  }

  function mountReactionWall(wrap, pageUrl) {
    var pickerOpen = false;

    function render() {
      var data = loadReactions(pageUrl);
      var total = totalReactions(data);
      var chips = Object.keys(data)
        .filter(function (emoji) {
          return Number(data[emoji]) > 0;
        })
        .map(function (emoji) {
          return (
            '<button type="button" class="dn-cmt-react-chip" data-emoji="' +
            esc(emoji) +
            '" title="点击取消">' +
            esc(emoji) +
            ' <span class="dn-cmt-react-count">' +
            esc(data[emoji]) +
            "</span></button>"
          );
        })
        .join("");

      wrap.innerHTML =
        '<div class="dn-cmt-reactions-head">' +
        '<span class="dn-cmt-reactions-label">' +
        total +
        " 个表情</span>" +
        '<button type="button" class="dn-cmt-react-add" aria-label="添加表情" title="添加表情">🙂</button></div>' +
        '<div class="dn-cmt-reactions-row">' +
        (chips || '<span class="dn-cmt-reactions-empty">点击笑脸添加第一个表情</span>') +
        "</div>" +
        '<div class="dn-cmt-react-picker" hidden>' +
        REACTION_EMOJIS.map(function (emoji) {
          return (
            '<button type="button" class="dn-cmt-react-pick" data-emoji="' +
            esc(emoji) +
            '">' +
            esc(emoji) +
            "</button>"
          );
        }).join("") +
        "</div>";

      var addBtn = wrap.querySelector(".dn-cmt-react-add");
      var picker = wrap.querySelector(".dn-cmt-react-picker");

      function closePicker() {
        pickerOpen = false;
        if (picker) picker.hidden = true;
      }

      if (addBtn && picker) {
        addBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          pickerOpen = !pickerOpen;
          picker.hidden = !pickerOpen;
        });
      }

      wrap.querySelectorAll(".dn-cmt-react-pick").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var emoji = btn.getAttribute("data-emoji");
          var next = loadReactions(pageUrl);
          next[emoji] = (Number(next[emoji]) || 0) + 1;
          saveReactions(pageUrl, next);
          closePicker();
          render();
        });
      });

      wrap.querySelectorAll(".dn-cmt-react-chip").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var emoji = btn.getAttribute("data-emoji");
          var next = loadReactions(pageUrl);
          next[emoji] = Math.max(0, (Number(next[emoji]) || 0) - 1);
          if (!next[emoji]) delete next[emoji];
          saveReactions(pageUrl, next);
          render();
        });
      });
    }

    document.addEventListener("click", function () {
      if (pickerOpen) {
        pickerOpen = false;
        var picker = wrap.querySelector(".dn-cmt-react-picker");
        if (picker) picker.hidden = true;
      }
    });

    wrap.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    render();
  }

  function mount() {
    var root = document.getElementById("dn-comments");
    if (!root || root.dataset.mounted === "1") return;
    root.dataset.mounted = "1";

    var pageUrl = root.dataset.pageUrl || location.pathname;
    var twikooEnv = (root.dataset.twikooEnv || "").trim();
    var giscusCat =
      (root.dataset.giscusCat || "").trim() || GISCUS_DEFAULTS.categoryId;
    var giscusCategory =
      root.dataset.giscusCategory || GISCUS_DEFAULTS.category;
    var localKey = "dn-cmt-md:" + pageUrl;
    var draftKey = "dn-cmt-draft:" + pageUrl;

    root.innerHTML =
      '<div class="dn-cmt-idtabs" role="tablist">' +
      '<button type="button" class="dn-cmt-idtab on" data-id="guest" role="tab">游客</button>' +
      '<button type="button" class="dn-cmt-idtab" data-id="github" role="tab">GitHub 账号</button>' +
      "</div>" +
      '<div id="dn-cmt-guest" class="dn-cmt-panel on" role="tabpanel">' +
      '<div id="dn-cmt-guest-reactions" class="dn-cmt-reactions"></div>' +
      '<textarea id="dn-cmt-editor"></textarea>' +
      '<div class="dn-cmt-bar">' +
      '<input id="dn-cmt-nick" class="dn-cmt-input" type="text" placeholder="昵称（默认：游客）" maxlength="32" />' +
      '<button type="button" id="dn-cmt-submit" class="dn-cmt-submit">发布评论</button>' +
      "</div>" +
      '<p id="dn-cmt-msg" class="dn-cmt-msg" hidden></p>' +
      "</div>" +
      '<div id="dn-cmt-github" class="dn-cmt-panel" role="tabpanel" hidden>' +
      '<div id="dn-giscus" class="dn-giscus-host"></div>' +
      "</div>" +
      '<div id="dn-cmt-list" class="dn-cmt-list"></div>';

    var guestPanel = document.getElementById("dn-cmt-guest");
    var githubPanel = document.getElementById("dn-cmt-github");
    var guestReactions = document.getElementById("dn-cmt-guest-reactions");
    var giscusHost = document.getElementById("dn-giscus");
    var listEl = document.getElementById("dn-cmt-list");
    var msgEl = document.getElementById("dn-cmt-msg");
    var nickEl = document.getElementById("dn-cmt-nick");
    var editorEl = document.getElementById("dn-cmt-editor");
    var mde = null;

    mountReactionWall(guestReactions, pageUrl);

    function showMsg(text, isErr) {
      msgEl.hidden = !text;
      msgEl.textContent = text || "";
      msgEl.className = "dn-cmt-msg" + (isErr ? " err" : " ok");
    }

    function loadLocal() {
      try {
        return JSON.parse(localStorage.getItem(localKey) || "[]");
      } catch {
        return [];
      }
    }

    function renderList() {
      var items = loadLocal();
      if (!items.length) {
        listEl.innerHTML = '<p class="dn-cmt-empty">暂无评论，来抢沙发吧～</p>';
        return;
      }
      listEl.innerHTML =
        '<h3 class="dn-cmt-list-title">评论 (' +
        items.length +
        ")</h3>" +
        items
          .map(function (c) {
            return (
              '<article class="dn-cmt-item">' +
              '<header><strong>' +
              esc(c.nick || "游客") +
              "</strong>" +
              '<span class="dn-cmt-badge">游客</span>' +
              (c.time ? "<time>" + esc(c.time) + "</time>" : "") +
              "</header>" +
              '<div class="dn-cmt-body md-typeset">' +
              mdRender(c.content) +
              "</div></article>"
            );
          })
          .join("");
    }

    function initEditor() {
      if (mde || typeof EasyMDE === "undefined") return;
      var draft = {};
      try {
        draft = JSON.parse(localStorage.getItem(draftKey) || "{}");
      } catch {
        draft = {};
      }
      if (draft.nick) nickEl.value = draft.nick;

      mde = new EasyMDE({
        element: editorEl,
        autofocus: false,
        spellChecker: false,
        status: ["lines", "words", "cursor"],
        placeholder: "支持 Markdown：**粗体**、*斜体*、链接、列表、代码块…",
        initialValue: draft.text || "",
        minHeight: "140px",
        toolbar: [
          "bold",
          "italic",
          "heading",
          "|",
          "quote",
          "unordered-list",
          "ordered-list",
          "|",
          "link",
          "code",
          "table",
          "|",
          "preview",
          "side-by-side",
          "fullscreen",
          "|",
          "guide",
        ],
      });

      mde.codemirror.on("change", function () {
        try {
          localStorage.setItem(
            draftKey,
            JSON.stringify({ text: mde.value(), nick: nickEl.value })
          );
        } catch {
          /* ignore */
        }
      });
    }

    function activateGithubTab() {
      loadGiscus(giscusHost, giscusCat, giscusCategory);
    }

    root.querySelectorAll(".dn-cmt-idtab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        root.querySelectorAll(".dn-cmt-idtab").forEach(function (b) {
          b.classList.toggle("on", b === btn);
        });
        guestPanel.classList.toggle("on", id === "guest");
        guestPanel.hidden = id !== "guest";
        githubPanel.classList.toggle("on", id === "github");
        githubPanel.hidden = id !== "github";
        if (id === "github") {
          activateGithubTab();
        }
        if (id === "guest" && mde) {
          setTimeout(function () {
            mde.codemirror.refresh();
          }, 80);
        }
      });
    });

    document.getElementById("dn-cmt-submit").addEventListener("click", function () {
      if (!mde) return;
      var content = (mde.value() || "").trim();
      var nick = (nickEl.value || "").trim() || "游客";
      if (!content) {
        showMsg("请输入评论内容。", true);
        return;
      }

      var entry = {
        nick: nick,
        content: content,
        time: new Date().toLocaleString("zh-CN"),
        role: "guest",
      };

      fallbackSave(entry);
      mde.value("");
      try {
        localStorage.removeItem(draftKey);
      } catch {
        /* ignore */
      }
      showMsg(
        twikooEnv
          ? "评论已保存（Twikoo 同步需配置 envId 后刷新）。"
          : "评论已发布（预览模式：仅本浏览器可见。配置 Twikoo 后全网可见）。",
        false
      );
    });

    function fallbackSave(entry) {
      var list = loadLocal();
      list.unshift(entry);
      localStorage.setItem(localKey, JSON.stringify(list.slice(0, 100)));
      renderList();
    }

    renderList();

    if (typeof EasyMDE !== "undefined") {
      initEditor();
    } else {
      window.setTimeout(initEditor, 500);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }

  if (typeof document$ !== "undefined" && document$.subscribe) {
    document$.subscribe(mount);
  }
})();
