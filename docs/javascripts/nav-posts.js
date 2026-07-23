(function () {
  var PATH_TO_NAV = {
    "blog/posts": "博客",
    education: "教育",
    travel: "旅行",
    tech: "技术",
    life: "生活",
    feiboxia: "飞博虾",
  };

  var fullCache = null;
  var fullLoading = null;
  var sidebarNav = null;

  function siteBase() {
    var m = document.querySelector('meta[name="site-base"]');
    if (m && m.content) {
      try {
        return new URL(m.content, location.origin).pathname.replace(/\/+$/, "") || "";
      } catch {
        /* ignore */
      }
    }
    if (location.pathname.indexOf("/wahaha") === 0) return "/wahaha";
    return "";
  }

  function resolveUrl(u) {
    if (!u) return "";
    if (/^https?:\/\//i.test(u)) return u;
    var base = siteBase();
    if (u.startsWith("/")) return (base + u).replace(/\/{2,}/g, "/");
    return (base + "/" + u.replace(/^\.?\//, "")).replace(/\/{2,}/g, "/");
  }

  function indexUrl(name) {
    try {
      return new URL("javascripts/" + name, document.baseURI).href;
    } catch {
      return "javascripts/" + name;
    }
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function navFromPath() {
    var base = siteBase();
    var path = location.pathname;
    if (base && path.indexOf(base) === 0) path = path.slice(base.length);
    path = path.replace(/^\/+|\/+$/g, "");
    if (!path || path === "index.html") return "";
    var top = path.split("/")[0];
    return PATH_TO_NAV[top] || "";
  }

  function fetchFull() {
    if (fullCache) return Promise.resolve(fullCache);
    if (fullLoading) return fullLoading;
    fullLoading = fetch(indexUrl("posts-index.json"))
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        fullCache = data.posts || [];
        return fullCache;
      })
      .finally(function () {
        fullLoading = null;
      });
    return fullLoading;
  }

  function findSidebarList() {
    var root = document.querySelector(".md-sidebar--primary .md-nav--primary > .md-nav__list");
    return root || null;
  }

  function findSectionList(navLabel) {
    var root = findSidebarList();
    if (!root) return null;
    var items = root.children;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var labelEl = item.querySelector(":scope > label.md-nav__link, :scope > a.md-nav__link");
      if (!labelEl) continue;
      var text = labelEl.textContent.trim();
      if (text === navLabel) {
        var nested = item.querySelector(":scope > .md-nav > .md-nav__list");
        if (nested) return nested;
      }
    }
    return null;
  }

  function clearSidebar() {
    document.querySelectorAll(".dn-nav-post-item").forEach(function (el) {
      el.remove();
    });
    sidebarNav = null;
  }

  function renderSidebar(navLabel, posts) {
    clearSidebar();
    if (!navLabel || !posts.length) return;

    var sectionList = findSectionList(navLabel);
    if (!sectionList) return;

    posts.forEach(function (p) {
      var href = resolveUrl(p.url);
      var active = location.pathname.replace(/\/+$/, "") === href.replace(/\/+$/, "");
      var li = document.createElement("li");
      li.className = "md-nav__item dn-nav-post-item" + (active ? " md-nav__item--active" : "");
      li.innerHTML =
        '<a href="' +
        esc(href) +
        '" class="md-nav__link dn-nav-post-link">' +
        '<span class="dn-nav-post-title">' +
        esc(p.title) +
        "</span></a>";
      sectionList.appendChild(li);
    });

    sidebarNav = navLabel;
  }

  function loadAndRenderSidebar(navLabel) {
    if (!navLabel) {
      clearSidebar();
      return Promise.resolve([]);
    }
    return fetchFull()
      .then(function (posts) {
        var filtered = posts.filter(function (p) {
          return p.nav === navLabel;
        });
        renderSidebar(navLabel, filtered);
        return filtered;
      })
      .catch(function () {
        return [];
      });
  }

  window.dnNavPosts = {
    setCategory: loadAndRenderSidebar,
    fetchFull: fetchFull,
    navFromPath: navFromPath,
    clear: clearSidebar,
  };

  function bootSectionPage() {
    if (document.body.classList.contains("md-page-index")) return;
    var nav = navFromPath();
    if (nav) loadAndRenderSidebar(nav);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootSectionPage);
  } else {
    bootSectionPage();
  }

  if (typeof document$ !== "undefined" && document$.subscribe) {
    document$.subscribe(function () {
      bootSectionPage();
    });
  }
})();
