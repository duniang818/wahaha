(function () {
  var INITIAL_LIMIT = 3;
  var activeNav = "";
  var postsCache = [];
  var navTagsCache = [];
  var totalCount = 0;
  var fullLoaded = false;
  var fullLoading = null;

  function indexUrl(name) {
    try {
      return new URL("javascripts/" + name, document.baseURI).href;
    } catch {
      return "javascripts/" + name;
    }
  }

  function siteBase() {
    var m = document.querySelector('meta[name="site-base"]');
    if (m && m.content) {
      try {
        return new URL(m.content, location.origin).pathname.replace(/\/+$/, "") || "";
      } catch {
        /* ignore */
      }
    }
    var p = location.pathname;
    if (p.indexOf("/wahaha") === 0) return "/wahaha";
    return "";
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function resolveUrl(u) {
    if (!u) return "";
    if (/^https?:\/\//i.test(u)) return u;
    var base = siteBase();
    if (u.startsWith("/")) return (base + u).replace(/\/{2,}/g, "/");
    return (base + "/" + u.replace(/^\.?\//, "")).replace(/\/{2,}/g, "/");
  }

  function cardHtml(p) {
    var thumb = p.thumb
      ? '<img class="dn-post-card-thumb" src="' + esc(resolveUrl(p.thumb)) + '" alt="" loading="lazy">'
      : '<div class="dn-post-card-thumb dn-post-card-placeholder" aria-hidden="true">📝</div>';
    var subTags = (p.tags || [])
      .filter(function (t) {
        return t !== p.nav;
      })
      .slice(0, 3)
      .map(function (t) {
        return '<span class="dn-card-tag">' + esc(t) + "</span>";
      })
      .join("");
    return (
      '<a class="dn-post-card" href="' +
      esc(resolveUrl(p.url)) +
      '">' +
      thumb +
      '<div class="dn-post-card-body">' +
      '<span class="dn-kicker">' +
      esc(p.nav) +
      "</span>" +
      "<h3>" +
      esc(p.title) +
      "</h3>" +
      "<p>" +
      esc(p.excerpt) +
      "</p>" +
      (subTags ? '<div class="dn-card-tags">' + subTags + "</div>" : "") +
      (p.date ? '<time class="dn-post-date">' + esc(p.date) + "</time>" : "") +
      "</div></a>"
    );
  }

  function filterPosts(posts) {
    if (!activeNav) return posts;
    return posts.filter(function (p) {
      return p.nav === activeNav;
    });
  }

  function renderHint() {
    var hint = document.getElementById("dn-load-hint");
    if (!hint) return;
    if (activeNav) {
      var n = filterPosts(postsCache).length;
      hint.textContent = "已加载「" + activeNav + "」全部 " + n + " 篇，左栏可快速跳转。";
      hint.hidden = false;
      return;
    }
    if (fullLoaded || totalCount <= INITIAL_LIMIT) {
      hint.hidden = true;
      return;
    }
    hint.innerHTML =
      "首页仅展示最新 <strong>" +
      INITIAL_LIMIT +
      "</strong> 篇（共 " +
      totalCount +
      " 篇）。点击上方分类标签加载该分类全部文章，并写入左侧导航。";
    hint.hidden = false;
  }

  function renderFilters(navTags) {
    var el = document.getElementById("dn-tag-filters");
    if (!el) return;
    var html =
      '<button type="button" class="dn-tag-chip' +
      (activeNav ? "" : " on") +
      '" data-nav="">全部</button>';
    html += navTags
      .map(function (t) {
        return (
          '<button type="button" class="dn-tag-chip' +
          (activeNav === t ? " on" : "") +
          '" data-nav="' +
          esc(t) +
          '">' +
          esc(t) +
          "</button>"
        );
      })
      .join("");
    el.innerHTML = html;
    el.querySelectorAll(".dn-tag-chip").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var nav = btn.getAttribute("data-nav") || "";
        if (nav === activeNav) return;
        activeNav = nav;
        renderFilters(navTagsCache);
        if (nav) {
          ensureFullLoaded().then(function () {
            renderAll();
            if (window.dnNavPosts) window.dnNavPosts.setCategory(nav);
          });
        } else {
          if (window.dnNavPosts) window.dnNavPosts.clear();
          renderAll();
        }
      });
    });
  }

  function renderCarousels(list) {
    var host = document.getElementById("dn-carousels");
    if (!host) return;
    if (!fullLoaded || activeNav) {
      host.innerHTML = "";
      return;
    }
    var byNav = {};
    list.forEach(function (p) {
      byNav[p.nav] = byNav[p.nav] || [];
      byNav[p.nav].push(p);
    });
    var html = "";
    Object.keys(byNav).forEach(function (nav) {
      var items = byNav[nav].slice(0, 3);
      if (items.length < 2) return;
      html +=
        '<section class="dn-carousel-block"><div class="dn-carousel-head"><h2>' +
        esc(nav) +
        '</h2><span class="dn-carousel-hint">最新 ' +
        items.length +
        " 篇</span></div>" +
        '<div class="dn-carousel">' +
        items.map(cardHtml).join("") +
        "</div></section>";
    });
    host.innerHTML = html;
  }

  function renderGrid(list) {
    var grid = document.getElementById("dn-post-grid");
    if (!grid) return;
    var visible = list;
    if (!activeNav && !fullLoaded) {
      visible = list.slice(0, INITIAL_LIMIT);
    }
    grid.innerHTML = visible.length
      ? visible.map(cardHtml).join("")
      : '<p class="dn-empty">暂无匹配文章</p>';
    renderHint();
  }

  function renderAll() {
    var list = filterPosts(postsCache);
    renderCarousels(postsCache);
    renderGrid(list);
  }

  function ensureFullLoaded() {
    if (fullLoaded) return Promise.resolve(postsCache);
    if (fullLoading) return fullLoading;
    if (window.dnNavPosts && window.dnNavPosts.fetchFull) {
      fullLoading = window.dnNavPosts.fetchFull().then(function (posts) {
        postsCache = posts;
        fullLoaded = true;
        totalCount = posts.length;
        return posts;
      });
      return fullLoading;
    }
    fullLoading = fetch(indexUrl("posts-index.json"))
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        postsCache = data.posts || [];
        fullLoaded = true;
        totalCount = postsCache.length;
        return postsCache;
      })
      .finally(function () {
        fullLoading = null;
      });
    return fullLoading;
  }

  function isHome() {
    return (
      document.body.classList.contains("md-page-index") ||
      document.querySelector('[data-md-component="content"] h1')?.textContent === "渡娘的空间"
    );
  }

  function boot() {
    if (!isHome()) return;
    fetch(indexUrl("posts-index-preview.json"))
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        postsCache = data.posts || [];
        navTagsCache = data.navTags || [];
        totalCount = data.total || postsCache.length;
        fullLoaded = false;
        renderFilters(navTagsCache);
        renderAll();
      })
      .catch(function () {
        return fetch(indexUrl("posts-index.json"))
          .then(function (r) {
            if (!r.ok) throw new Error("HTTP " + r.status);
            return r.json();
          })
          .then(function (data) {
            postsCache = data.posts || [];
            navTagsCache = data.navTags || [];
            totalCount = postsCache.length;
            fullLoaded = true;
            renderFilters(navTagsCache);
            renderAll();
          });
      })
      .catch(function () {
        var grid = document.getElementById("dn-post-grid");
        if (grid) {
          grid.innerHTML =
            '<p class="dn-empty">文章索引未生成。请先运行：<code>node scripts/build-posts-index.mjs</code></p>';
        }
      });
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
