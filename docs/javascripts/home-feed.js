(function () {
  var INITIAL_LIMIT = 3;
  var postsCache = [];

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

  function renderGrid(list) {
    var grid = document.getElementById("dn-post-grid");
    if (!grid) return;
    var visible = list.slice(0, INITIAL_LIMIT);
    grid.innerHTML = visible.length
      ? visible.map(cardHtml).join("")
      : '<p class="dn-empty">暂无文章</p>';
  }

  function isHome() {
    return !!document.getElementById("dn-post-grid");
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
        renderGrid(postsCache);
      })
      .catch(function () {
        return fetch(indexUrl("posts-index.json"))
          .then(function (r) {
            if (!r.ok) throw new Error("HTTP " + r.status);
            return r.json();
          })
          .then(function (data) {
            postsCache = data.posts || [];
            renderGrid(postsCache);
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
