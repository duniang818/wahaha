/**
 * 当 MkDocs 静态 TOC 为空时（飞书导入多 h1），从正文标题生成右侧目录
 */
(function () {
  function slugFromHeading(el) {
    if (el.id) return el.id;
    var t = (el.textContent || "").trim().toLowerCase();
    t = t.replace(/[^\w\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "");
    if (t) {
      el.id = t;
      return t;
    }
    var id = "h-" + Math.random().toString(36).slice(2, 8);
    el.id = id;
    return id;
  }

  function buildTocNav() {
    var aside = document.querySelector('.md-sidebar--secondary .md-nav--secondary');
    if (!aside) return;
    if (aside.querySelector(".md-nav__list[data-md-component='toc'] li")) return;

    var headings = document.querySelectorAll(
      ".md-content__inner.md-typeset h1, .md-content__inner.md-typeset h2, .md-content__inner.md-typeset h3"
    );
    if (!headings.length) return;

    var title = aside.getAttribute("aria-label") || "目录";
    var ul = document.createElement("ul");
    ul.className = "md-nav__list";
    ul.setAttribute("data-md-component", "toc");
    ul.setAttribute("data-md-scrollfix", "");

    headings.forEach(function (h) {
      var level = Number(h.tagName.slice(1)) || 2;
      if (level > 3) return;
      var li = document.createElement("li");
      li.className = "md-nav__item";
      var a = document.createElement("a");
      a.className = "md-nav__link";
      a.href = "#" + slugFromHeading(h);
      var span = document.createElement("span");
      span.className = "md-ellipsis";
      span.textContent = (h.textContent || "").replace(/\u¶/g, "").trim();
      a.appendChild(span);
      li.appendChild(a);
      if (level === 3) li.style.paddingLeft = "0.75rem";
      if (level === 1) li.style.fontWeight = "600";
      ul.appendChild(li);
    });

    var label = aside.querySelector(".md-nav__title");
    if (!label) {
      label = document.createElement("label");
      label.className = "md-nav__title";
      label.setAttribute("for", "__toc");
      label.innerHTML = '<span class="md-nav__icon md-icon"></span>' + title;
      aside.insertBefore(label, aside.firstChild);
    }
    aside.appendChild(ul);
  }

  function boot() {
    buildTocNav();
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
