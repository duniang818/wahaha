/**
 * 博客日历热力图：日 / 周 / 月 / 季 / 年
 * 红深浅 = 任务量；底栏绿条 = 完成度
 */
(function () {
  var WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];
  var MONTH_NAMES = [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ];

  var state = {
    posts: [],
    cal: null,
    navTags: [],
    activeNav: "全部",
    focusYear: null,
  };

  function siteBase() {
    if (location.pathname.indexOf("/wahaha/") === 0 || location.pathname === "/wahaha") {
      return "/wahaha";
    }
    var m = document.querySelector('meta[name="site-base"]');
    if (m && m.content) {
      try {
        var u = new URL(m.content, location.href);
        if (u.host === location.host) {
          return u.pathname.replace(/\/+$/, "") || "";
        }
      } catch {
        /* ignore */
      }
    }
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
    // 必须相对站点根，避免 /calendar/ 下拼成 /calendar/javascripts/
    var base = siteBase();
    return (base + "/javascripts/" + name).replace(/\/{2,}/g, "/");
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function parseYMD(s) {
    var p = String(s).split("-");
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]), 12);
  }

  function fmtYMD(d) {
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function mondayOf(d) {
    var x = new Date(d.getTime());
    var day = (x.getDay() + 6) % 7;
    x.setDate(x.getDate() - day);
    return x;
  }

  function addDays(d, n) {
    var x = new Date(d.getTime());
    x.setDate(x.getDate() + n);
    return x;
  }

  function isoWeekKey(dateStr) {
    var d = parseYMD(dateStr);
    var day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day + 3);
    var week1 = new Date(d.getFullYear(), 0, 4);
    var week =
      1 +
      Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    return d.getFullYear() + "-W" + pad2(week);
  }

  function detailUrl(view, key) {
    var base = resolveUrl("/calendar/");
    if (!/[?&]/.test(base) && !base.endsWith("/")) base += "/";
    return base + "?view=" + encodeURIComponent(view) + "&k=" + encodeURIComponent(key);
  }

  function heatClass(intensity, max) {
    if (!intensity) return "dn-heat-0";
    var r = intensity / Math.max(1, max);
    if (r <= 0.2) return "dn-heat-1";
    if (r <= 0.4) return "dn-heat-2";
    if (r <= 0.65) return "dn-heat-3";
    if (r <= 0.85) return "dn-heat-4";
    return "dn-heat-5";
  }

  function dayData(dateStr) {
    return (state.cal && state.cal.days && state.cal.days[dateStr]) || null;
  }

  function aggregateRange(startStr, endStr) {
    var cur = parseYMD(startStr);
    var end = parseYMD(endStr);
    var posts = [];
    var tasksTotal = 0;
    var tasksDone = 0;
    var intensity = 0;
    var activeDays = 0;
    while (cur <= end) {
      var key = fmtYMD(cur);
      var d = dayData(key);
      if (d) {
        activeDays += 1;
        intensity += d.intensity || 0;
        tasksTotal += d.tasksTotal || 0;
        tasksDone += d.tasksDone || 0;
        (d.posts || []).forEach(function (p) {
          posts.push(Object.assign({ date: key }, p));
        });
      }
      cur = addDays(cur, 1);
    }
    return {
      posts: posts,
      tasksTotal: tasksTotal,
      tasksDone: tasksDone,
      intensity: intensity,
      activeDays: activeDays,
      completion: tasksTotal ? Math.round((tasksDone / tasksTotal) * 100) : 0,
    };
  }

  function filterPostsByNav(list) {
    if (state.activeNav === "全部") return list;
    return list.filter(function (p) {
      return p.nav === state.activeNav;
    });
  }

  /* ---------- 左侧日期归档 ---------- */
  function injectArchiveNav() {
    var root = document.querySelector(".md-sidebar--primary .md-nav--primary > .md-nav__list");
    if (!root || !state.cal) return;

    var old = root.querySelector(".dn-cal-archive");
    if (old) old.remove();

    var years = Object.keys(state.cal.archives || {}).sort().reverse();
    if (!years.length) return;

    var li = document.createElement("li");
    li.className = "md-nav__item md-nav__item--nested dn-cal-archive";
    var html =
      '<input class="md-nav__toggle md-toggle" type="checkbox" id="__dn_cal_archive" checked>' +
      '<label class="md-nav__link" for="__dn_cal_archive" tabindex="0">' +
      '<span class="md-ellipsis">日期归档</span>' +
      '<span class="md-nav__icon md-icon"></span></label>' +
      '<nav class="md-nav" aria-label="日期归档"><ul class="md-nav__list">';

    years.forEach(function (y) {
      var arch = state.cal.archives[y];
      var months = Object.keys(arch.months || {}).sort().reverse();
      html +=
        '<li class="md-nav__item md-nav__item--nested">' +
        '<input class="md-nav__toggle md-toggle" type="checkbox" id="__dn_y_' +
        y +
        '" ' +
        (y === String(state.focusYear || years[0]) ? "checked" : "") +
        ">" +
        '<label class="md-nav__link" for="__dn_y_' +
        y +
        '"><span class="md-ellipsis">' +
        y +
        " 年</span><span class=\"md-nav__icon md-icon\"></span></label>" +
        '<nav class="md-nav"><ul class="md-nav__list">' +
        '<li class="md-nav__item"><a href="' +
        esc(detailUrl("year", y)) +
        '" class="md-nav__link"><span class="md-ellipsis">' +
        y +
        " · 全年</span></a></li>";

      months.forEach(function (ym) {
        var mi = arch.months[ym];
        var count = typeof mi === "object" ? mi.posts || mi.intensity || 0 : mi;
        html +=
          '<li class="md-nav__item"><a href="' +
          esc(detailUrl("month", ym)) +
          '" class="md-nav__link"><span class="md-ellipsis">' +
          Number(ym.slice(5)) +
          " 月 · " +
          count +
          " 篇</span></a></li>";
      });

      html += "</ul></nav></li>";
    });

    html += "</ul></nav>";
    li.innerHTML = html;
    root.appendChild(li);
  }

  /* ---------- 单元格 / 汇总条 ---------- */
  function dayCellHtml(dateStr, inMonth) {
    var d = dayData(dateStr);
    var intensity = d ? d.intensity : 0;
    var completion = d ? d.completion : 0;
    var dayNum = Number(dateStr.slice(8, 10));
    var max = (state.cal && state.cal.maxIntensity) || 1;
    var cls =
      "dn-day-cell " +
      heatClass(intensity, max) +
      (inMonth ? "" : " dn-day-out") +
      (d ? " dn-day-active" : "");
    var title = dateStr + (d ? " · 任务 " + intensity + " · 完成 " + completion + "%" : " · 无记录");
    return (
      '<a class="' +
      cls +
      '" href="' +
      esc(detailUrl("day", dateStr)) +
      '" title="' +
      esc(title) +
      '" data-date="' +
      esc(dateStr) +
      '">' +
      '<span class="dn-day-num">' +
      dayNum +
      "</span>" +
      '<span class="dn-day-progress" style="--dn-done:' +
      completion +
      '%" aria-hidden="true"></span>' +
      "</a>"
    );
  }

  function summaryBarHtml(view, key, label, agg, vertical) {
    var max = (state.cal && state.cal.maxIntensity) || 1;
    var heat = heatClass(agg.intensity, max);
    return (
      '<a class="dn-sum-bar ' +
      (vertical ? "dn-sum-bar--v" : "dn-sum-bar--h") +
      " " +
      heat +
      '" href="' +
      esc(detailUrl(view, key)) +
      '" title="' +
      esc(label + " · 任务 " + agg.intensity + " · 完成 " + agg.completion + "%") +
      '">' +
      '<span class="dn-sum-label">' +
      esc(label) +
      "</span>" +
      '<span class="dn-sum-meta">' +
      agg.intensity +
      " · " +
      agg.completion +
      "%</span>" +
      '<span class="dn-sum-progress" style="--dn-done:' +
      agg.completion +
      '%"></span>' +
      "</a>"
    );
  }

  function weekBlockHtml(weekStart, month) {
    var cells = [];
    var startStr = fmtYMD(weekStart);
    var endStr = fmtYMD(addDays(weekStart, 6));
    for (var i = 0; i < 7; i++) {
      var ds = fmtYMD(addDays(weekStart, i));
      var inMonth = Number(ds.slice(5, 7)) === month;
      cells.push(dayCellHtml(ds, inMonth));
    }
    var agg = aggregateRange(startStr, endStr);
    var wkey = isoWeekKey(startStr);
    return (
      '<div class="dn-week">' +
      '<div class="dn-week-days">' +
      cells.join("") +
      "</div>" +
      summaryBarHtml("week", wkey, "周总结", agg, false) +
      "</div>"
    );
  }

  function monthBlockHtml(year, month) {
    var first = new Date(year, month - 1, 1, 12);
    var last = new Date(year, month, 0, 12);
    var cursor = mondayOf(first);
    var weeks = [];
    while (cursor <= last || (cursor.getMonth() + 1 === month && cursor.getDate() === 1)) {
      weeks.push(weekBlockHtml(cursor, month));
      cursor = addDays(cursor, 7);
      if (cursor > last && cursor.getMonth() + 1 !== month) break;
      if (weeks.length > 6) break;
    }
    var startStr = fmtYMD(first);
    var endStr = fmtYMD(last);
    var agg = aggregateRange(startStr, endStr);
    var ym = year + "-" + pad2(month);
    return (
      '<div class="dn-month" id="dn-month-' +
      ym +
      '">' +
      '<div class="dn-month-main">' +
      '<div class="dn-month-head">' +
      '<h3 class="dn-month-title">' +
      year +
      " 年 " +
      MONTH_NAMES[month - 1] +
      "</h3>" +
      '<div class="dn-weekdays">' +
      WEEKDAYS.map(function (w) {
        return '<span>' + w + "</span>";
      }).join("") +
      "</div></div>" +
      '<div class="dn-month-weeks">' +
      weeks.join("") +
      "</div></div>" +
      summaryBarHtml("month", ym, "月总结", agg, true) +
      "</div>"
    );
  }

  function quarterBlockHtml(year, q) {
    var startM = (q - 1) * 3 + 1;
    var months = [];
    for (var m = startM; m < startM + 3; m++) {
      months.push(monthBlockHtml(year, m));
    }
    var startStr = year + "-" + pad2(startM) + "-01";
    var endMonth = startM + 2;
    var endDay = new Date(year, endMonth, 0).getDate();
    var endStr = year + "-" + pad2(endMonth) + "-" + pad2(endDay);
    var agg = aggregateRange(startStr, endStr);
    var qkey = year + "-Q" + q;
    return (
      '<section class="dn-quarter" id="dn-quarter-' +
      qkey +
      '">' +
      '<div class="dn-quarter-head">' +
      "<h2>" +
      year +
      " 年第 " +
      q +
      " 季度</h2>" +
      summaryBarHtml("quarter", qkey, "季总结", agg, false) +
      "</div>" +
      '<div class="dn-quarter-months">' +
      months.join("") +
      "</div></section>"
    );
  }

  function yearBlockHtml(year) {
    var quarters = [];
    for (var q = 1; q <= 4; q++) quarters.push(quarterBlockHtml(year, q));
    var agg = aggregateRange(year + "-01-01", year + "-12-31");
    return (
      '<section class="dn-year" id="dn-year-' +
      year +
      '">' +
      '<div class="dn-year-head">' +
      "<h2>" +
      year +
      " 年热力地图</h2>" +
      summaryBarHtml("year", String(year), "年总结", agg, false) +
      "</div>" +
      quarters.join("") +
      "</section>"
    );
  }

  function legendHtml() {
    return (
      '<div class="dn-heat-legend" aria-hidden="true">' +
      '<span class="dn-legend-label">任务少</span>' +
      '<span class="dn-day-cell dn-heat-0"></span>' +
      '<span class="dn-day-cell dn-heat-1"></span>' +
      '<span class="dn-day-cell dn-heat-2"></span>' +
      '<span class="dn-day-cell dn-heat-3"></span>' +
      '<span class="dn-day-cell dn-heat-4"></span>' +
      '<span class="dn-day-cell dn-heat-5"></span>' +
      '<span class="dn-legend-label">任务多</span>' +
      '<span class="dn-legend-sep">·</span>' +
      '<span class="dn-legend-green">底栏绿条 = 完成度</span>' +
      "</div>"
    );
  }

  /* ---------- 总览渲染 ---------- */
  function renderOverview() {
    var root = document.getElementById("dn-calendar-root");
    if (!root || !state.cal) return;

    var years = [];
    var y0 = Number(state.cal.rangeStart.slice(0, 4));
    var y1 = Number(state.cal.rangeEnd.slice(0, 4));
    for (var y = y1; y >= y0; y--) years.push(y);
    if (!years.length) years = [new Date().getFullYear()];
    state.focusYear = state.focusYear || years[0];

    var yearPosts = state.posts.filter(function (p) {
      return String(p.date || "").slice(0, 4) === String(state.focusYear);
    }).length;
    var yearDays = Object.keys(state.cal.days || {}).filter(function (d) {
      return d.slice(0, 4) === String(state.focusYear);
    }).length;

    root.innerHTML =
      '<div class="dn-cal-toolbar">' +
      '<div class="dn-cal-years">' +
      years
        .map(function (y) {
          return (
            '<button type="button" class="dn-cal-year-btn' +
            (y === state.focusYear ? " on" : "") +
            '" data-year="' +
            y +
            '">' +
            y +
            "</button>"
          );
        })
        .join("") +
      "</div>" +
      legendHtml() +
      "</div>" +
      '<div class="dn-cal-stats">' +
      "<span><b>" +
      yearPosts +
      "</b> 篇文章</span>" +
      "<span><b>" +
      yearDays +
      "</b> 个活跃日</span>" +
      "<span><b>" +
      (state.posts.length || 0) +
      "</b> 全站收录</span>" +
      "</div>" +
      '<div class="dn-cal-board">' +
      yearBlockHtml(state.focusYear) +
      "</div>";

    root.querySelectorAll(".dn-cal-year-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.focusYear = Number(btn.getAttribute("data-year"));
        renderOverview();
        injectArchiveNav();
        var board = root.querySelector(".dn-cal-board");
        if (board) board.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ---------- 中间分类标签 ---------- */
  function renderNavTags() {
    var el = document.getElementById("dn-nav-tags");
    if (!el) return;
    var tags = ["全部"].concat(state.navTags || []);
    el.innerHTML = tags
      .map(function (t) {
        return (
          '<button type="button" class="dn-nav-tag' +
          (t === state.activeNav ? " on" : "") +
          '" data-nav="' +
          esc(t) +
          '">' +
          esc(t) +
          "</button>"
        );
      })
      .join("");
    el.querySelectorAll(".dn-nav-tag").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.activeNav = btn.getAttribute("data-nav") || "全部";
        renderNavTags();
        if (document.getElementById("dn-calendar-detail")) renderDetail();
        else renderPostGrid();
      });
    });
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
      '<div class="dn-card-foot">' +
      (p.date ? '<time class="dn-post-date">' + esc(p.date) + "</time>" : "") +
      (typeof p.completion === "number"
        ? '<span class="dn-card-done">完成 ' + p.completion + "%</span>"
        : "") +
      "</div></div></a>"
    );
  }

  function renderPostGrid() {
    var grid = document.getElementById("dn-post-grid");
    if (!grid) return;
    var list = filterPostsByNav(state.posts);
    grid.innerHTML = list.length
      ? list.slice(0, 12).map(cardHtml).join("")
      : '<p class="dn-empty">该分类暂无文章</p>';
  }

  /* ---------- 详情页 ---------- */
  function parseDetailParams() {
    var q = new URLSearchParams(location.search);
    var view = q.get("view") || "";
    var key = q.get("k") || "";
    if (!view && location.hash) {
      var h = new URLSearchParams(location.hash.replace(/^#/, ""));
      view = h.get("view") || view;
      key = h.get("k") || key;
    }
    return { view: view, key: key };
  }

  function rangeForView(view, key) {
    if (view === "day") return { start: key, end: key, title: key + " · 日详情" };
    if (view === "week") {
      // key: YYYY-Www — find a Monday in that ISO week
      var ym = key.match(/^(\d{4})-W(\d{2})$/);
      if (!ym) return null;
      var year = Number(ym[1]);
      var week = Number(ym[2]);
      var simple = new Date(year, 0, 1 + (week - 1) * 7, 12);
      var mon = mondayOf(simple);
      // adjust to ISO week containing Jan 4
      var jan4 = new Date(year, 0, 4, 12);
      var week1mon = mondayOf(jan4);
      mon = addDays(week1mon, (week - 1) * 7);
      return {
        start: fmtYMD(mon),
        end: fmtYMD(addDays(mon, 6)),
        title: key + " · 周总结（" + fmtYMD(mon) + " ~ " + fmtYMD(addDays(mon, 6)) + "）",
      };
    }
    if (view === "month") {
      var p = key.split("-");
      var y = Number(p[0]);
      var m = Number(p[1]);
      var last = new Date(y, m, 0).getDate();
      return {
        start: key + "-01",
        end: key + "-" + pad2(last),
        title: key + " · 月总结",
      };
    }
    if (view === "quarter") {
      var qm = key.match(/^(\d{4})-Q([1-4])$/);
      if (!qm) return null;
      var qy = Number(qm[1]);
      var qn = Number(qm[2]);
      var sm = (qn - 1) * 3 + 1;
      var em = sm + 2;
      return {
        start: qy + "-" + pad2(sm) + "-01",
        end: qy + "-" + pad2(em) + "-" + pad2(new Date(qy, em, 0).getDate()),
        title: key + " · 季总结",
      };
    }
    if (view === "year") {
      return {
        start: key + "-01-01",
        end: key + "-12-31",
        title: key + " 年 · 年总结",
      };
    }
    return null;
  }

  function fillDetailToc(sections) {
    var toc = document.querySelector(".md-sidebar--secondary .md-nav__list");
    if (!toc) return;
    var box = document.getElementById("dn-detail-toc-inject");
    if (!box) {
      box = document.createElement("div");
      box.id = "dn-detail-toc-inject";
      toc.parentNode.insertBefore(box, toc);
    }
    box.innerHTML =
      '<ul class="md-nav__list dn-detail-toc">' +
      sections
        .map(function (s) {
          return (
            '<li class="md-nav__item"><a href="#' +
            esc(s.id) +
            '" class="md-nav__link"><span class="md-ellipsis">' +
            esc(s.label) +
            "</span></a></li>"
          );
        })
        .join("") +
      "</ul>";
  }

  function renderDetail() {
    var root = document.getElementById("dn-calendar-detail");
    if (!root || !state.cal) return;

    var params = parseDetailParams();
    if (!params.view || !params.key) {
      root.innerHTML =
        '<div class="dn-detail-empty">' +
        "<p>请从首页热力图点击「日 / 周 / 月 / 季 / 年」方块进入详情。</p>" +
        '<p><a class="dn-btn dn-btn-primary" href="' +
        esc(resolveUrl("/")) +
        '">返回首页热力图</a></p></div>';
      return;
    }

    var range = rangeForView(params.view, params.key);
    if (!range) {
      root.innerHTML = '<p class="dn-empty">无效的详情参数</p>';
      return;
    }

    var agg = aggregateRange(range.start, range.end);
    var postsAll = agg.posts || [];
    var posts = filterPostsByNav(postsAll);
    // 分类筛空时回退全部，避免「导航有、详情无」
    if (!posts.length && postsAll.length && state.activeNav !== "全部") {
      state.activeNav = "全部";
      renderNavTags();
      posts = postsAll;
    }
    var dayKeys = [];
    var cur = parseYMD(range.start);
    var end = parseYMD(range.end);
    while (cur <= end) {
      var ds = fmtYMD(cur);
      if (dayData(ds)) dayKeys.push(ds);
      cur = addDays(cur, 1);
    }

    var sections = [
      { id: "dn-sec-overview", label: "概览" },
      { id: "dn-sec-days", label: "有记录的日期" },
      { id: "dn-sec-posts", label: "文章列表" },
    ];

    var h1 = document.querySelector(".md-content h1");
    if (h1) h1.textContent = range.title;

    root.innerHTML =
      '<section id="dn-sec-overview" class="dn-detail-panel">' +
      '<div class="dn-detail-stats">' +
      '<div class="dn-stat"><b>' +
      agg.activeDays +
      "</b><span>活跃天</span></div>" +
      '<div class="dn-stat"><b>' +
      agg.intensity +
      "</b><span>任务量</span></div>" +
      '<div class="dn-stat"><b>' +
      agg.tasksDone +
      "/" +
      agg.tasksTotal +
      "</b><span>完成项</span></div>" +
      '<div class="dn-stat"><b>' +
      agg.completion +
      "%</b><span>完成度</span></div>" +
      '<div class="dn-stat"><b>' +
      posts.length +
      "</b><span>文章</span></div>" +
      "</div>" +
      '<div class="dn-detail-progress"><span style="width:' +
      agg.completion +
      '%"></span></div>' +
      '<p class="dn-detail-range">' +
      esc(range.start) +
      " ~ " +
      esc(range.end) +
      "</p></section>" +
      '<section id="dn-sec-days" class="dn-detail-panel">' +
      "<h2>有记录的日期</h2>" +
      '<div class="dn-detail-days">' +
      (dayKeys.length
        ? dayKeys
            .map(function (d) {
              var dd = dayData(d);
              return (
                '<a class="dn-day-chip ' +
                heatClass(dd.intensity, state.cal.maxIntensity) +
                '" href="' +
                esc(detailUrl("day", d)) +
                '">' +
                esc(d) +
                " · " +
                dd.intensity +
                "</a>"
              );
            })
            .join("")
        : '<p class="dn-empty">该时段暂无记录</p>') +
      "</div></section>" +
      '<section id="dn-sec-posts" class="dn-detail-panel">' +
      "<h2>文章列表</h2>" +
      '<div class="dn-post-grid">' +
      (posts.length ? posts.map(cardHtml).join("") : '<p class="dn-empty">暂无文章</p>') +
      "</div></section>";

    fillDetailToc(sections);
  }

  /* ---------- boot ---------- */
  function loadData() {
    return Promise.all([
      fetch(indexUrl("posts-index.json")).then(function (r) {
        if (!r.ok) throw new Error("posts");
        return r.json();
      }),
      fetch(indexUrl("calendar-index.json")).then(function (r) {
        if (!r.ok) throw new Error("cal");
        return r.json();
      }),
    ]).then(function (pair) {
      state.posts = pair[0].posts || [];
      state.navTags = pair[0].navTags || [];
      state.cal = pair[1];
    });
  }

  function boot() {
    var hasOverview = !!document.getElementById("dn-calendar-root");
    var hasDetail = !!document.getElementById("dn-calendar-detail");
    if (!hasOverview && !hasDetail) return;

    document.documentElement.classList.add("dn-cal-page");

    loadData()
      .then(function () {
        injectArchiveNav();
        if (hasOverview) {
          renderOverview();
          renderNavTags();
          renderPostGrid();
        }
        if (hasDetail) {
          renderNavTags();
          renderDetail();
        }
      })
      .catch(function () {
        var root = document.getElementById("dn-calendar-root") || document.getElementById("dn-calendar-detail");
        if (root) {
          root.innerHTML =
            '<p class="dn-empty">日历索引未生成。请运行：<code>node scripts/build-posts-index.mjs</code></p>';
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

  window.dnCalendarHeatmap = { boot: boot, detailUrl: detailUrl };
})();
