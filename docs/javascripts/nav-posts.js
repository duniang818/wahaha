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

  function renderSidebar(navLabel, posts) {
    var listRoot = findSidebarList();
    if (!listRoot || !navLabel) return;

    var old = document.getElementById("dn-nav-posts-block");
    if (old) old.remove();

    if (!posts.length) return;

    var wrap = document.createElement("li");
    wrap.id = "dn-nav-posts-block";
    wrap.className = "md-nav__item md-nav__item--nested md-nav__item--active dn-nav-posts-block";

    var toggleId = "__nav_dn_posts";
    var items = posts
      .map(function (p) {
        var href = resolveUrl(p.url);
        var active = location.pathname.replace(/\/+$/, "") === href.replace(/\/+$/, "");
        return (
          '<li class="md-nav__item' +
          (active ? " md-nav__item--active" : "") +
          '">' +
          '<a href="' +
          esc(href) +
          '" class="md-nav__link">' +
          '<span class="md-ellipsis">' +
          esc(p.title) +
          "</span></a></li>"
        );
      })
      .join("");

    wrap.innerHTML =
      '<input class="md-nav__toggle" type="checkbox" id="' +
      toggleId +
      '" checked>' +
      '<label class="md-nav__link" for="' +
      toggleId +
      '">' +
      esc(navLabel) +
      " 文章 (" +
      posts.length +
      ")</label>" +
      '<nav class="md-nav" data-md-component="collapsible">' +
      '<ul class="md-nav__list">' +
      items +
      "</ul></nav>";

    listRoot.insertBefore(wrap, listRoot.firstChild);
    sidebarNav = navLabel;
  }

  function clearSidebar() {
    var old = document.getElementById("dn-nav-posts-block");
    if (old) old.remove();
    sidebarNav = null;
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
