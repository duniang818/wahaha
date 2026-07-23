(function () {
  var BZ_SRC = "https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
  var bzLoaded = false;

  function loadBusuanzi() {
    if (bzLoaded || document.querySelector('script[data-dn-bz="1"]')) return;
    bzLoaded = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = BZ_SRC;
    s.setAttribute("data-dn-bz", "1");
    document.head.appendChild(s);
  }

  function counterHtml(label, id) {
    return (
      '<span class="dn-counter">' +
      '<span class="dn-counter-label">' +
      label +
      "</span> " +
      '<span class="dn-counter-val" id="' +
      id +
      '">—</span>' +
      "</span>"
    );
  }

  function addFooterBadge() {
    var copyright =
      document.querySelector(".md-copyright") || document.querySelector(".md-footer__inner");
    if (!copyright || copyright.querySelector(".dn-visitor-badge")) return;

    loadBusuanzi();
    var span = document.createElement("span");
    span.className = "dn-visitor-badge";
    span.innerHTML = counterHtml("本站 PV", "busuanzi_value_site_pv");
    copyright.appendChild(span);

    window.setTimeout(function () {
      ["busuanzi_value_site_pv", "busuanzi_value_page_pv"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el && (!el.textContent || el.textContent === "0")) {
          el.textContent = "统计中";
        }
      });
    }, 3500);
  }

  function addArticleViews() {
    var content =
      document.querySelector("article.md-content__inner") ||
      document.querySelector(".md-content__inner");
    if (!content || content.querySelector(".dn-page-views")) return;

    loadBusuanzi();
    var box = document.createElement("p");
    box.className = "dn-page-views";
    box.setAttribute("aria-label", "本文阅读量");
    box.innerHTML = counterHtml("本文阅读", "busuanzi_value_page_pv");
    content.appendChild(box);
  }

  function run() {
    addFooterBadge();
    addArticleViews();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }

  if (typeof document$ !== "undefined" && document$.subscribe) {
    document$.subscribe(run);
  } else {
    var last = location.href;
    setInterval(function () {
      if (location.href !== last) {
        last = location.href;
        run();
      }
    }, 800);
  }
})();
