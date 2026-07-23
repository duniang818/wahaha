(function () {
  var PATH_TO_NAV = {
    "blog/posts": "博客",
    blog: "博客",
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
    if (!path || path === "index.html" || path === "index") return "";

    if (path.indexOf("blog/posts") === 0 || path.indexOf("blog/posts/") === 0) return "博客";
    if (path.split("/")[0] === "blog") return "博客";

    var top = path.split("/")[0];
    return PATH_TO_NAV[top] || PATH_TO_NAV[path.split("/").slice(0, 2).join("/")] || "";
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

  function findSectionItem(navLabel) {
    var root = findSidebarList();
    if (!root) return null;
    var items = root.children;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var labelEl = item.querySelector(
        ":scope > label.md-nav__link, :scope > a.md-nav__link, :scope > .md-nav__link.md-nav__container a.md-nav__link"
      );
      if (!labelEl) continue;
      if (labelEl.textContent.trim() === navLabel) return item;
    }
    return null;
  }

  function findSectionList(navLabel) {
    var item = findSectionItem(navLabel);
    if (!item) return null;
    var nested = item.querySelector(":scope > .md-nav > .md-nav__list");
    if (nested) return nested;
    nested = item.querySelector(":scope > .md-nav__link.md-nav__container + nav .md-nav__list");
    return nested || null;
  }

  function expandSection(navLabel) {
    var item = findSectionItem(navLabel);
    if (!item) return;
    var toggle = item.querySelector(":scope > input.md-nav__toggle");
    if (toggle) {
      toggle.checked = true;
      toggle.classList.remove("md-toggle--indeterminate");
    }
    var nav = item.querySelector(":scope > nav.md-nav");
    if (nav) nav.setAttribute("aria-expanded", "true");
  }

  function ensureBlogSection() {
    var existing = findSectionList("博客");
    if (existing) return existing;

    var root = findSidebarList();
    if (!root) return null;

    var li = document.createElement("li");
    li.className = "md-nav__item md-nav__item--nested md-nav__item--active dn-nav-blog-section";
    li.innerHTML =
      '<input class="md-nav__toggle md-toggle" type="checkbox" id="__dn_nav_blog" checked>' +
      '<label class="md-nav__link" for="__dn_nav_blog">博客</label>' +
      '<nav class="md-nav" aria-label="博客" data-md-level="1">' +
      '<ul class="md-nav__list" data-md-scrollfix></ul></nav>';

    var home = root.querySelector(":scope > .md-nav__item");
    if (home && home.nextSibling) root.insertBefore(li, home.nextSibling);
    else root.appendChild(li);

    return li.querySelector(".md-nav__list");
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

    var sectionList = navLabel === "博客" ? ensureBlogSection() : findSectionList(navLabel);
    if (!sectionList) return;

    expandSection(navLabel);

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
