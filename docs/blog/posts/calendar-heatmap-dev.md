---
feishu_doc: HQdrdp7zKo9AiFxNgCFcsYnRnBg
feishu_url: "https://my.feishu.cn/docx/HQdrdp7zKo9AiFxNgCFcsYnRnBg"
title: 日历热力图组件开发全记录
author: 渡娘
date: 2026-07-31
nav: 博客
visibility: public
draft: false
tags:
  - 博客
  - 技术
  - MkDocs
  - 前端
description: "从需求到实现：在 MkDocs 博客首页做一块 GitHub 风格的日历热力图，记录写作节奏与任务完成度。"
---

# 日历热力图组件开发全记录

博客首页那块红绿相间的日历热力图，是这阵子折腾得最久的一个组件。从最早一个占满半屏的大卡片，到最终桌面端"全年一屏可见"的紧凑布局，中间推翻了好几版。这篇把整个开发过程记下来，既是复盘，也留给以后再做类似东西时的自己参考。

## 一、需求背景：为什么是日历热力图

博客用 MkDocs Material 主题搭的，文章慢慢多起来之后，首页一直缺一个"全局节奏感"的东西。

光看「最新文章」列表，只能知道最近写了什么；光看标签云，只能知道内容分布。但「我最近是不是在写」「哪天干活多」「哪段时间摸鱼了」这类问题，列表回答不了。

GitHub 的 contribution graph 是个很好的参照——一眼就能看出全年的活跃分布。但我不只想看"有没有提交"，还想看"任务量有多大""完成度怎么样"。所以需求就变成了：

- 在首页铺一张全年日历，按天显示任务量，颜色深浅代表强度；
- 每个方块底部带一条绿色进度条，表示完成度；
- 周、月、季、年四级都能做汇总，并且可点击下钻到详情页；
- 桌面端尽量一屏看完全年，不用滚动；
- 能按栏目（博客 / 技术 / 旅行 / 教育……）筛选。

最终首页 `docs/index.md` 里就是这样一个结构：

```markdown
## 日历热力图

<div class="dn-cal-hint" markdown="0">
  <p><b>日</b>小方块可点进当日文章 · <b>红</b>深浅=任务量 · <b>绿</b>底栏=完成度 · 周/月/季/年总结条均可下钻</p>
</div>

<div id="dn-calendar-root" class="dn-calendar-root" markdown="0">
  <p class="dn-empty">正在加载日历热力图…</p>
</div>
```

根容器 `#dn-calendar-root` 留给 JS 去填充，初始给一个加载占位。所有真正的渲染都在前端跑。

## 二、技术方案

整体是「构建期生成索引 + 运行时前端渲染」的两段式。数据由 Node 脚本预生成成 JSON，前端 fetch 下来拼 DOM，纯原生 JS，不引框架。

### 2.1 数据结构：calendar-index.json

数据源是 `scripts/build-posts-index.mjs`，它遍历 `docs/` 下所有 `.md`，解析 frontmatter，汇总出两个文件：`posts-index.json`（文章列表）和 `calendar-index.json`（日历聚合）。

构建日历的核心是 `buildCalendar(posts)`，它做三件事：按天聚合、算强度、建归档树。

```javascript
function buildCalendar(posts) {
  const days = {};
  for (const p of posts) {
    if (!p.date) continue;
    if (!days[p.date]) {
      days[p.date] = { date: p.date, count: 0, tasksTotal: 0, tasksDone: 0, posts: [] };
    }
    const day = days[p.date];
    day.count += 1;
    day.tasksTotal += p.tasksTotal || 0;
    day.tasksDone += p.tasksDone || 0;
    day.posts.push({ /* 标题、url、栏目、摘要、缩略图、完成度... */ });
  }

  for (const d of Object.values(days)) {
    d.completion = d.tasksTotal ? Math.round((d.tasksDone / d.tasksTotal) * 100) : 0;
    d.intensity = d.tasksTotal || d.count;   // 关键：强度优先用任务总数
  }
  // ... 再聚合 archives（年/季/月/周）
  return { generatedAt, rangeStart, rangeEnd, maxIntensity, days, archives };
}
```

这里有个关键设计：`intensity = d.tasksTotal || d.count`。强度不等于发文数，而是任务总数。如果一篇文章里挂了 8 个 checklist 子任务，那一天的强度就是 8，而不是 1。这样热力图反映的是"实际工作量"，更贴近"干活多不多"的直觉。

最终 `calendar-index.json` 的结构长这样（节选）：

```json
{
  "generatedAt": "2026-07-31T06:46:39.206Z",
  "rangeStart": "2026-01-01",
  "rangeEnd": "2026-12-31",
  "maxIntensity": 10,
  "days": {
    "2026-07-22": {
      "date": "2026-07-22",
      "count": 10,
      "tasksTotal": 10,
      "tasksDone": 10,
      "posts": [ /* ... */ ],
      "completion": 100,
      "intensity": 10
    }
  },
  "archives": {
    "2026": {
      "year": "2026",
      "months": { "2026-07": { "intensity": 27, "posts": 20 } },
      "quarters": { "2026-Q3": 27 },
      "weeks": { "2026-W31": 10, "2026-W30": 17 },
      "days": 6,
      "intensity": 27,
      "posts": 20
    }
  }
}
```

`maxIntensity` 是全年所有天的最大强度，前端用它做颜色归一化。`archives` 则是预聚合好的年/季/月/周统计，主要给左侧「日期归档」侧边栏用。

任务数怎么来？frontmatter 里有 `tasks_total` / `tasks_done` 就直接用；没有的话脚本会去正文的 tasklist 语法 `- [x]` / `- [ ]` 里数：

```javascript
function countTasks(meta, body) {
  const fmTotal = Number(meta.tasks_total || meta.tasksTotal || 0);
  if (fmTotal > 0) return { tasksTotal: fmTotal, tasksDone: Math.min(Math.max(0, fmDone), fmTotal) };
  let total = 0, done = 0;
  for (const line of String(body).split("\n")) {
    if (/^\s*[-*]\s+\[[xX]\]/.test(line)) { total += 1; done += 1; }
    else if (/^\s*[-*]\s+\[[\s]\]/.test(line)) { total += 1; }
  }
  if (total === 0) return { tasksTotal: 1, tasksDone: 1 };
  return { tasksTotal: total, tasksDone: done };
}
```

没有任务清单的文章默认算 1/1，这样不会因为"没标记完成"而把完成度拉成 0，避免误导。

### 2.2 渲染逻辑：calendar-heatmap.js

整个组件是一个 IIFE，靠一个 `state` 对象维护状态：

```javascript
var state = {
  posts: [],      // 全站文章
  cal: null,      // calendar-index.json 内容
  navTags: [],
  activeNav: "全部",
  focusYear: null,
};
```

渲染是层层嵌套的：`year → quarter → month → week → day`，每一层都有对应的 `xxxBlockHtml` 函数返回 HTML 字符串，最后一把塞进根容器。

最底层是日单元格 `dayCellHtml`，它决定颜色和完成度条：

```javascript
function dayCellHtml(dateStr, inMonth) {
  var d = dayData(dateStr);
  var intensity = d ? d.intensity : 0;
  var completion = d ? d.completion : 0;
  var max = (state.cal && state.cal.maxIntensity) || 1;
  var cls = "dn-day-cell " + heatClass(intensity, max) +
            (inMonth ? "" : " dn-day-out") + (d ? " dn-day-active" : "");
  return '<a class="' + cls + '" href="' + esc(detailUrl("day", dateStr)) + '" ...>' +
    '<span class="dn-day-num">' + dayNum + "</span>" +
    '<span class="dn-day-progress" style="--dn-done:' + completion + '%"></span>' +
    "</a>";
}
```

颜色深浅靠 `heatClass` 把强度归一化后映射到 6 档（0~5）：

```javascript
function heatClass(intensity, max) {
  if (!intensity) return "dn-heat-0";
  var r = intensity / Math.max(1, max);
  if (r <= 0.2) return "dn-heat-1";
  if (r <= 0.4) return "dn-heat-2";
  if (r <= 0.65) return "dn-heat-3";
  if (r <= 0.85) return "dn-heat-4";
  return "dn-heat-5";
}
```

档位阈值不是均匀的（0.2 / 0.4 / 0.65 / 0.85），低强度区间分得细一点，因为大多数日子的强度都偏低，这样能让"轻微活跃"和"完全没动"区分开。

每个单元格是个 `<a>`，`href` 指向详情页 `/calendar/?view=day&k=2026-07-22`。周/月/季/年的总结条也走同样的 `detailUrl`，只是 `view` 参数不同。这样点哪都能下钻，不用单独写路由。

周/月/季/年的总结条由 `summaryBarHtml` 统一生成，区分横向（`--h`）和纵向（`--v`）两种变体：

```javascript
function summaryBarHtml(view, key, label, agg, vertical) {
  var heat = heatClass(agg.intensity, max);
  return '<a class="dn-sum-bar ' + (vertical ? "dn-sum-bar--v" : "dn-sum-bar--h") + " " + heat + '" ...>' +
    '<span class="dn-sum-label">' + label + "</span>" +
    '<span class="dn-sum-meta">' + agg.intensity + " · " + agg.completion + "%</span>" +
    '<span class="dn-sum-progress" style="--dn-done:' + agg.completion + '%"></span>' +
    "</a>";
}
```

聚合统计交给 `aggregateRange(startStr, endStr)`，它遍历区间内的每一天累加 `intensity` / `tasksTotal` / `tasksDone`，算出 `completion`。周、月、季、年都复用这一个函数，只是起止日期不同。

启动流程 `boot()` 比较标准：fetch 两个 JSON → 注入左侧归档 → 渲染总览/详情。还订阅了 Material 的 `document$`，配合主题的 instant navigation：

```javascript
function boot() {
  var hasOverview = !!document.getElementById("dn-calendar-root");
  var hasDetail = !!document.getElementById("dn-calendar-detail");
  if (!hasOverview && !hasDetail) return;
  document.documentElement.classList.add("dn-cal-page");
  loadData().then(function () {
    injectArchiveNav();
    if (hasOverview) { renderOverview(); renderNavTags(); renderPostGrid(); }
    if (hasDetail) { renderNavTags(); renderDetail(); }
  });
}
if (typeof document$ !== "undefined" && document$.subscribe) document$.subscribe(boot);
```

### 2.3 CSS 样式：extra.css

样式都在 `docs/stylesheets/extra.css` 里，用 `dn-` 前缀隔离命名空间，避免和 Material 自带类撞车。

热力色板定义成 CSS 变量，亮色和暗色（slate）各一套：

```css
:root {
  --dn-heat-0: rgba(148, 163, 184, 0.18);
  --dn-heat-1: #fecaca;
  --dn-heat-2: #fca5a5;
  --dn-heat-3: #f87171;
  --dn-heat-4: #ef4444;
  --dn-heat-5: #b91c1c;
  --dn-done: #22c55e;
}
[data-md-color-scheme="slate"] {
  --dn-heat-0: rgba(71, 85, 105, 0.45);
  --dn-heat-1: #7f1d1d;
  /* ... 暗色下从深到浅反向 */
  --dn-heat-5: #f87171;
}
```

亮色用粉色系（`#fecaca` → `#b91c1c`），暗色用深红系，两套都保证在各自背景下有足够对比度。完成度绿条统一用 `--dn-done: #22c55e`。

日单元格的关键样式：

```css
.dn-day-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1.1rem;
  border-radius: 0.22rem;
  font-size: 0.56rem;
  font-weight: 700;
  overflow: hidden;
  transition: transform 0.14s ease, box-shadow 0.14s ease, filter 0.14s ease;
}
.dn-day-cell:hover {
  transform: translateY(-1px) scale(1.08);
  box-shadow: 0 6px 12px rgba(185, 28, 28, 0.22);
  z-index: 1;
}
```

完成度条用绝对定位贴在格子底部，高度占 16%，宽度由 `--dn-done` 变量驱动：

```css
.dn-day-progress {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 16%;
  background: rgba(15, 23, 42, 0.1);
}
.dn-day-progress::after {
  content: "";
  display: block;
  height: 100%;
  width: var(--dn-done, 0%);
  background: var(--dn-done);
}
```

用 CSS 变量传值（`style="--dn-done:80%"`）而不是直接写 width，好处是周/月/季/年的总结条可以复用同一套伪元素逻辑，只改方向即可。

## 三、核心功能

### 按日显示任务量 + 颜色深浅映射

每天一个方块，颜色深浅 = 当天 `intensity / maxIntensity` 的归一化比值，分 6 档。没有记录的日子是 `dn-heat-0`（近乎透明的灰），属于本月但跨周补位的日期加 `dn-day-out`（opacity 0.22）压暗，避免视觉抢戏。

### 底栏绿条 = 完成度

每个方块底部一条绿条，宽度 = `completion%`。完成度 100% 的格子底下铺满一条绿，没完成的只铺一小段。这样"红深浅看强度、绿长短看完成度"两个维度互不干扰。

### 周/月/季/年总结条

这是这个组件最花心思的地方。四个粒度的总结条形态各不相同：

- **周总结**：横向极简条，只有 3px 高，hover 时涨到 5px，纯靠颜色和宽度表达。放在每周 7 个格子下面。
- **月总结**：纵向竖条，用 `writing-mode: vertical-rl` 把文字竖排，贴在月份主体右侧，占 1.3rem 宽。
- **季总结**：横向带文字的条，显示"季总结 · 27 · 100%"。
- **年总结**：和季总结同款横向条，放在年度标题旁。

所有总结条都是 `<a>`，点击跳详情页，`title` 里带 tooltip 提示「任务量 · 完成度」。

### 可点击跳转 + 五级下钻

从首页点任意方块 → 进 `/calendar/?view=day&k=2026-07-22` 这种详情页。详情页 `renderDetail()` 根据 `view` 参数算出对应时间区间，复用 `aggregateRange` 聚合，展示统计卡片、有记录的日期 chips、文章列表三段：

```javascript
function renderDetail() {
  var params = parseDetailParams();
  var range = rangeForView(params.view, params.key);
  var agg = aggregateRange(range.start, range.end);
  // 概览统计 / 有记录的日期 / 文章列表
}
```

`rangeForView` 负责把 `2026-W31`、`2026-Q3`、`2026-07` 这类 key 翻译成起止日期。周视图还要算 ISO 周的周一，这部分用了标准算法，绕开了 JS 原生 `getWeek` 不靠谱的问题。

### 年份切换 + 栏目筛选

顶部一排年份按钮，点切换 `focusYear` 后整块重渲染；分类标签 `#dn-nav-tags` 切换 `activeNav`，文章列表和详情页文章列表都会跟着筛。

## 四、布局优化历程：从大卡片到一屏全年

这块是返工最多的。

### 第一版：大月历卡片

最早一个月做成一张大卡片，12 张卡片竖着排，一年要滚好几屏。看着信息量足，但"全年节奏"这个核心诉求完全没满足——一眼看不到头尾，颜色对比也摊薄了。

### 第二版：季度横向排列

把一年拆成 4 个季度块，桌面端横向排开。但单列季度时每个月还是偏大，4 个季度并排后总宽度又顶不住内容区，要么挤要么溢出。

### 最终版：4 列季度 + 紧凑单元格

定下来桌面端 4 列季度并排，关键在于把单元格和字号压到极致小：

```css
.dn-day-cell { height: 1.1rem; font-size: 0.56rem; }
.dn-month-title { font-size: 0.72rem; }
.dn-weekdays span { font-size: 0.52rem; }
```

4 列用 `inline-block + width: calc(25% - 0.45rem)` 实现，没有上 grid 是因为季度块高度不一致，inline-block 的 baseline 对齐在这种"顶端对齐、各自独立"的场景反而更稳：

```css
@media (min-width: 1000px) {
  .dn-year > .dn-quarter {
    display: inline-block;
    vertical-align: top;
    width: calc(25% - 0.45rem);
  }
  .dn-year > .dn-quarter:not(:last-child) { margin-right: 0.6rem; }
}
```

月份本身用 grid 分成「日历主体 + 右侧竖向月总结条」两列，竖条固定 1.3rem：

```css
.dn-month {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 1.3rem;
  gap: 0.2rem;
  align-items: stretch;
}
```

最终在 1000px 以上的屏幕，一屏就能看完整年 12 个月，红绿分布尽收眼底，年度节奏一目了然。这就是折腾这么多版的意义。

## 五、踩过的坑

### 坑一：aspect-ratio 让格子变形

一开始想让方块保持正方形比例，用了 `aspect-ratio: 1`。结果在 inline-block + flex 的混合布局里，`aspect-ratio` 和显式 `height`、`width` 互相打架：有的浏览器算出来是 0 高度（因为 width 没定，aspect-ratio 反推不出），有的格子比例漂移。加上格子里还要塞日期数字和进度条，正方形其实并不好放数字。

最后放弃 aspect-ratio，改用固定 `height: 1.1rem` + grid `minmax(0, 1fr)` 让宽度自适应填充，反而稳定。格子是扁长方形，但视觉上更像 GitHub 那种紧凑格子，数字也更好读。

### 坑二：响应式断点要分三档

最早的断点只有"窄屏单列 / 宽屏多列"两档，结果中等屏幕（平板、笔记本缩窗）最难看：4 列挤不下、单列又太空。后来加了中间档：

```css
/* 中等屏幕：两列季度 */
@media (min-width: 800px) and (max-width: 999px) {
  .dn-year > .dn-quarter { width: calc(50% - 0.35rem); }
}
/* 宽屏：四列 */
@media (min-width: 1000px) {
  .dn-year > .dn-quarter { width: calc(25% - 0.45rem); }
}
/* 移动端：纵向月总结条改横向 */
@media (max-width: 760px) {
  .dn-month { grid-template-columns: 1fr; }
  .dn-sum-bar--v { writing-mode: horizontal-tb; }
}
```

移动端还顺手把竖排的月总结条 `writing-mode` 改回横向，不然窄屏竖条挤成一列没法看。

### 坑三：Material 主题样式冲突

Material 给 `<a>` 和标题都套了很重的默认样式，热力图方块是 `<a>`，会被染成主题链接蓝、带下划线。只能上 `!important` 强压：

```css
.dn-day-cell {
  text-decoration: none !important;
  color: #0f172a !important;
}
.dn-month-title, .dn-quarter-head h2 {
  margin: 0 !important;
  border: 0 !important;
}
```

热力色档位里 `dn-heat-3` 以上背景已经够深，还得把数字颜色改成白色，不然红底红字看不见：

```css
.dn-heat-3 { background: var(--dn-heat-3); color: #fff !important; }
.dn-heat-2 { background: var(--dn-heat-2); color: #450a0a !important; }
```

### 坑四：instant navigation 下脚本不重新执行

Material 开了 instant navigation 后是 SPA 式跳转，页面切换不会重新加载 JS，`DOMContentLoaded` 只在第一次触发。从首页点进详情页，组件不渲染。解决办法是订阅 Material 的 `document$`：

```javascript
if (typeof document$ !== "undefined" && document$.subscribe) {
  document$.subscribe(boot);
}
```

`boot()` 里先判断当前页面有没有对应根容器，没有就直接 return，避免无谓渲染。

### 坑五：部署在子路径 /calendar/ 下的 URL 拼接

详情页本身在 `/calendar/` 路径下，如果用相对路径拼 JS 资源地址，会拼成 `/calendar/javascripts/...` 导致 404。所以专门写了 `siteBase()` 和 `indexUrl()`，强制从站点根算起：

```javascript
function indexUrl(name) {
  // 必须相对站点根，避免 /calendar/ 下拼成 /calendar/javascripts/
  var base = siteBase();
  return (base + "/javascripts/" + name).replace(/\/{2,}/g, "/");
}
```

`siteBase()` 还兼容了部署在 `/wahaha/` 子路径的情况，从 `<meta name="site-base">` 读取，保证换个部署位置也不用改代码。

### 坑六：分类筛选筛空了详情页

详情页文章列表按栏目筛，如果某栏目在该时段没文章，列表会变空，用户以为"没数据"。加了个回退：筛空且原数据非空时，自动退回"全部"并重渲染标签：

```javascript
if (!posts.length && postsAll.length && state.activeNav !== "全部") {
  state.activeNav = "全部";
  renderNavTags();
  posts = postsAll;
}
```

## 六、最终效果

现在首页打开，桌面端一屏就能看到全年 12 个月的热力分布：

- 红色深浅一眼看出哪段时间高产（比如 7 月 22 日那天任务量拉满，颜色最深）；
- 绿条长短看出完成度，没干完的日子红格底下绿条只有一小截；
- 周/月/季/年四级总结条都能点进去看明细；
- 左侧侧边栏自动注入「日期归档」，按年/月树形展开，直接跳月度详情；
- 顶部年份按钮切换年份，栏目标签筛选文章。

从数据生成（Node 脚本扫 markdown → 聚合成 JSON）到前端渲染（原生 JS 拼 DOM + CSS 变量驱动配色），整套链路没有框架、没有构建步骤（除了一个 `node scripts/build-posts-index.mjs`），改起来直接刷新就能看效果。折腾归折腾，最终这块热力图确实成了首页最有"信息密度"的一块——它让"我这一年都在干嘛"这件事变得可视化、可下钻，而不只是一串文章标题。

下一步想做的：给总结条加上 hover 时的迷你预览浮层（不用跳页就能看到该周/月写了啥），以及把热力色板做成可配置项，让"红"也能换成别的主题色。不过那是后话了。
