---
feishu_doc: FPn3dyoQGoktXUx5xhDcZQqRnEh
feishu_url: "https://my.feishu.cn/docx/FPn3dyoQGoktXUx5xhDcZQqRnEh"
title: 旅行规划助手：从需求到实现
author: 渡娘
date: 2026-07-31
nav: 博客
visibility: public
draft: false
tags:
  - 博客
  - 技术
  - 旅行
  - 前端
description: "带孩子去山西旅游不知道怎么规划路线？用纯前端做一个智能旅行规划助手，含景点推荐、路线规划、行程生成。"
---

今年暑假计划带孩子去山西转一圈。做攻略的时候我遇到了一个经典的"选择困难症"：乔家大院和王家大院到底去哪个？两个都是晋商大院，网上的评价各有各的说法，光看评论根本决策不了。更要命的是路线——山西景点从北到南拉得很长，大同的云冈石窟、忻州的五台山、晋中的平遥古城、晋南的壶口瀑布，到底先去哪后去哪、每天安排几个景点、路上要花多少时间，全是一笔糊涂账。

与其在十几个攻略帖子里来回翻，不如自己写个工具：输入起点终点，自动推荐沿途景点、算出最短路线、生成每日行程。于是就有了这个「旅行规划助手」。这篇文章记录一下从需求到实现的完整过程，包括踩过的两个坑。

---

## 一、技术方案：为什么是纯前端

这个工具的需求其实很简单——本质就是一堆"如果起点是 A、终点是 B，推荐哪些景点、怎么走最顺"的查表逻辑。不需要用户登录，不需要保存数据到服务器，也不需要实时调用外部 API。所以技术选型很明确：

**纯前端实现，零后端依赖，所有数据写死在 JS 里。**

具体来说：

| 项目 | 选择 | 理由 |
|------|------|------|
| 运行环境 | 浏览器 | 用户打开网页即用，无需安装 |
| 数据存储 | JS 内嵌常量 | 景点数据量小（12 个景点），不值得上数据库 |
| 路线算法 | BFS 广度优先搜索 | 城市图规模小（12 城 14 条边），BFS 足够 |
| 页面框架 | MkDocs Material | 博客本身就用 MkDocs 搭的，直接挂一个 JS 文件 |
| 状态管理 | 闭包内的 `state` 对象 | 无需 Vue/React，原生 JS 够用 |

整个工具就是一个 IIFE（立即执行函数），挂在 `d:\my-blog\docs\javascripts\travel-planner.js` 里，通过 MkDocs 的 `extra_javascript` 全局加载：

```yaml
# mkdocs.yml
extra_javascript:
  - javascripts/travel-planner.js
```

页面入口 `docs/travel/planner.md` 只需要放一个空容器，JS 启动时往里填内容：

```html
<div id="tp-root" class="tp-root" markdown="0">
  <p class="dn-empty">正在加载旅行规划助手…</p>
</div>
```

---

## 二、数据结构设计

工具的核心是三份数据：城市、路线、景点。数据设计好了，后面的逻辑就是顺水推舟。

### 城市数据：带 SVG 坐标

每个城市除了名字和描述，还带了一组 `x, y` 坐标——这是用来在 SVG 地图上画点的相对坐标。加一个 `area` 字段标记区域（晋北、晋中、晋南），方便推荐"同区域"的景点。

```javascript
var CITIES = {
  "太原":   { x: 350, y: 280, area: "晋中", desc: "省会，交通枢纽" },
  "大同":   { x: 380, y: 60,  area: "晋北", desc: "北魏京城，云冈石窟" },
  "忻州":   { x: 350, y: 200, area: "晋北", desc: "五台山门户" },
  "代县":   { x: 400, y: 180, area: "晋北", desc: "雁门关所在地" },
  // ... 共 12 个城市
};
```

### 路线数据：城市间的边

路线就是图的边，记录两座城市之间的距离（km）、行车时间（h）和交通方式描述（t）。这个 `t` 字段后面会专门讲——它曾经引发过一个 bug。

```javascript
var ROUTES = [
  { a: "太原", b: "忻州", km: 80,  h: 1.0, t: "高速1h" },
  { a: "太原", b: "平遥", km: 100, h: 1.5, t: "高铁0.5h/自驾1.5h" },
  { a: "平遥", b: "祁县", km: 25,  h: 0.5, t: "自驾0.5h" },
  // ... 共 14 条边
];
```

### 景点数据：12 个景点的完整档案

每个景点是一个信息密度很高的对象，包含了我做攻略时关心的所有维度：评分、门票、游玩时长、亲子指数、最佳季节、核心看点、实用贴士。

```javascript
var ATTRACTIONS = [
  {
    id: "qiao", name: "乔家大院", emoji: "🏚️", city: "祁县",
    types: ["文化", "历史"], level: "5A", heritage: false,
    rating: 4.3, duration: 2, ticket: 115, kidScore: 3,
    bestSeason: "全年", group: "mansion",
    desc: "晋商乔氏家族宅院，《大红灯笼高高挂》取景地……",
    highlights: ["三百余间房屋", "砖雕影壁「百寿图」", "晋商民俗博物馆", "影视取景地"],
    tips: "院落布局精巧，建议请讲解或租语音导览……"
  },
  {
    id: "wang", name: "王家大院", emoji: "🏯", city: "灵石",
    types: ["文化", "历史"], level: "4A", heritage: false,
    rating: 4.5, duration: 2.5, ticket: 66, kidScore: 3,
    bestSeason: "全年", group: "mansion",
    desc: "规模远超乔家大院的晋商宅院，依山而建，被誉为「民间故宫」……",
    highlights: ["依山而建的城堡式建筑", "面积是乔家大院的数十倍", "红门堡建筑群", "石雕砖雕木雕三绝"],
    tips: "规模宏大，建议预留2.5小时……与乔家大院二选一推荐王家。"
  },
  // ... 共 12 个景点
];
```

注意每个景点都有一个 `group` 字段（如 `mansion`、`must_see`、`architecture`），这是用来做对比表的——同组的景点会被自动拉出来横向 PK。乔家和王家都是 `mansion` 组，所以会自动出现在对比表里。

---

## 三、核心功能实现

### 1. SVG 地图与路线绘制

地图没用任何地图库，而是直接手写 SVG。每个城市是一个 `<circle>`，城市名是 `<text>`，路线是 `<line>`。起点终点高亮，不在路线上的城市点半透明显示。

```javascript
function renderRoute() {
  var path = findPath(state.origin, state.dest);
  // ...
  // 画路线连线
  for (var i = 0; i < path.length - 1; i++) {
    var c1 = CITIES[path[i]], c2 = CITIES[path[i + 1]];
    svgParts.push(
      '<line class="tp-route-line tp-active" x1="' + c1.x + '" y1="' + c1.y +
      '" x2="' + c2.x + '" y2="' + c2.y + '"/>'
    );
  }
  // 画所有城市点（路线上的高亮）
  Object.keys(CITIES).forEach(function (name) {
    var c = CITIES[name];
    var isRoute = routeCitySet[name];
    var cls = "tp-city-dot";
    if (name === state.origin) cls += " tp-origin";
    else if (name === state.dest) cls += " tp-dest";
    if (!isRoute) cls += '" style="opacity:0.25';
    svgParts.push('<circle class="' + cls + '" cx="' + c.x + '" cy="' + c.y + '" r="5"/>');
    // ...
  });
}
```

地图下方还会显示一排信息标签（chip）：总路程、行车时间、途经站数、沿途景点数，一眼就能看清这条线的大致开销。

### 2. BFS 路线规划算法

这是整个工具的算法核心。需求是：给定起点和终点，在城市路线图中找一条经过城市数最少的路径。

城市和路线构成了一个无向图（14 条边，12 个节点）。求"最少经过节点数"的路径，经典解法就是 **BFS（广度优先搜索）**——BFS 天然保证第一次到达终点时走过的边数最少。

```javascript
function findPath(start, end) {
  if (start === end) return [start];
  var visited = {};
  visited[start] = true;
  var queue = [[start]];  // 队列里存的是完整路径
  while (queue.length) {
    var path = queue.shift();
    var cur = path[path.length - 1];  // 当前路径的末端城市
    for (var i = 0; i < ROUTES.length; i++) {
      var r = ROUTES[i];
      var next = null;
      if (r.a === cur && !visited[r.b]) next = r.b;
      else if (r.b === cur && !visited[r.a]) next = r.a;
      if (next) {
        var newPath = path.concat([next]);
        if (next === end) return newPath;  // 找到终点，立即返回
        visited[next] = true;
        queue.push(newPath);
      }
    }
  }
  return null;  // 不连通
}
```

这里有个细节值得注意：队列里存的不是单个城市，而是**完整路径数组**。这样找到终点时直接返回路径，不用再回溯父节点。对于 12 个节点的小图，这点内存开销完全可以接受，代码却清爽很多。

找到路径后，`pathDistance` 函数会沿着路径累加每段的公里数和小时数，并收集每段的交通方式描述：

```javascript
function pathDistance(path) {
  var total = 0, hours = 0, segments = [];
  for (var i = 0; i < path.length - 1; i++) {
    var r = routeBetween(path[i], path[i + 1]);
    if (r) {
      total += r.km;
      hours += r.h;
      segments.push({ from: path[i], to: path[i + 1], km: r.km, h: r.h, t: r.t });
    }
  }
  return { km: total, h: Math.round(hours * 10) / 10, segments: segments };
}
```

### 3. 12 个景点推荐与智能排序

景点推荐不是简单地把沿途景点全列出来，而是会根据用户的**兴趣偏好**和**出行人员**做打分排序。

`scoreAttraction` 函数给每个景点算一个匹配分：基础分是景点评分，兴趣匹配的每匹配一个类型加 0.5 分，亲子出行时高亲子指数（>=4）再加 1 分、低亲子指数（<=2）扣 0.5 分。

```javascript
function scoreAttraction(a) {
  var score = a.rating;
  // 兴趣匹配加分
  a.types.forEach(function (t) {
    if (state.interests.indexOf(t) >= 0) score += 0.5;
  });
  // 亲子出行时的亲子指数加权
  if (state.travelers === "family" && a.kidScore >= 4) score += 1;
  if (state.travelers === "family" && a.kidScore <= 2) score -= 0.5;
  return score;
}
```

这样，同样是选"文化+历史+亲子"的亲子游，壶口瀑布（kidScore: 5）会排到很前面，而华严寺（kidScore: 3）就靠后一些。对孩子来说，看黄河奔腾显然比看辽代佛殿有意思。

景点推荐的范围也有讲究：不仅推荐路线"途经"的城市景点，还会推荐起点和终点**同区域**的景点。比如从太原到大同，途经忻州、代县、应县、浑源，但五台山虽然不在路线上（在忻州的东边），属于"晋北"区域，也会被推荐出来。

```javascript
function getAttractionsForArea(origin, dest) {
  var path = findPath(origin, dest);
  if (!path) return ATTRACTIONS.slice();
  var routeCities = {};
  path.forEach(function (c) { routeCities[c] = true; });
  var originArea = CITIES[origin] ? CITIES[origin].area : "";
  var destArea = CITIES[dest] ? CITIES[dest].area : "";
  return ATTRACTIONS.filter(function (a) {
    if (routeCities[a.city]) return true;        // 路线途经城市
    var cityArea = CITIES[a.city] ? CITIES[a.city].area : "";
    return cityArea === originArea || cityArea === destArea;  // 同区域
  });
}
```

点击任意景点卡片会弹出详情弹窗，里面展示了完整的信息九宫格：评分、等级、门票、游览时长、亲子指数、最佳季节，外加核心看点列表和实用贴士。弹窗里有一个"加入行程"按钮，点了就把这个景点纳入后续的行程生成。

### 4. 景点对比表：乔家大院 vs 王家大院

这就是解决我最初那个"选择困难症"的功能。系统会自动找出同一 `group` 下有 2 个及以上景点的分组，生成横向对比表。

```javascript
function renderComparison() {
  // 按 group 分组
  var groups = {};
  list.forEach(function (a) {
    if (!groups[a.group]) groups[a.group] = [];
    groups[a.group].push(a);
  });
  // 只保留有 2 个及以上景点的分组
  var compareGroups = Object.keys(groups).filter(function (g) {
    return groups[g].length >= 2;
  });
  // ...
}
```

对比表不是干巴巴地罗列数据，而是会自动标记每一行的"最优值"——用 `bestRow` 函数，传入"越高越好"还是"越低越好"的标志，自动给最优单元格加高亮 class：

```javascript
function bestRow(label, fn, higherBetter) {
  var vals = items.map(fn);
  var best = higherBetter ? Math.max.apply(null, vals) : Math.min.apply(null, vals);
  var cells = items.map(function (a, i) {
    var v = fn(a);
    var isBest = vals[i] === best;
    return '<td class="' + (isBest ? "tp-best" : "") + '">' + v + "</td>";
  }).join("");
  return "<tr><td>" + esc(label) + "</td>" + cells + "</tr>";
}
```

乔家 vs 王家的对比结果一目了然：

| 对比项 | 乔家大院 | 王家大院 |
|--------|----------|----------|
| 等级 | 5A | 4A |
| 评分 | ★ 4.3 | ★ 4.5（更优） |
| 门票 | 115 元 | 66 元（更优） |
| 游览时长 | 2h | 2.5h |
| 亲子友好 | 👍👍👍 | 👍👍👍 |

王家大院评分更高、门票便宜将近一半、面积大得多，唯一"劣势"是等级是 4A 而非 5A。综合来看，二选一的话王家大院性价比明显更高。数据摆在那里，纠结症瞬间治好了。

### 5. 自动行程生成：按路线顺序分配每日景点

这是最复杂的部分。输入是用户选中的景点列表，输出是一个按天组织的行程，每天包含赶路、游览、午餐、入住等节点，每个节点都带时间。

算法分几步：

**第一步，按路线顺序排列景点。** 用 BFS 算出的路径给每个城市一个序号，景点按所在城市的序号排序，保证行程顺序和路线方向一致——不会出现"先去大同再回太原"的折返。

```javascript
var routeOrder = {};
path.forEach(function (c, i) { routeOrder[c] = i; });
selectedAtts.sort(function (a, b) {
  var ia = routeOrder[a.city] !== undefined ? routeOrder[a.city] : 999;
  var ib = routeOrder[b.city] !== undefined ? routeOrder[b.city] : 999;
  return ia - ib;
});
```

**第二步，逐个分配景点到每天。** 维护一个"当前时间"（从早上 8:00 开始，单位是分钟），每加入一个景点，先算从当前城市到景点城市的赶路时间，再加上游览时长。如果超过当天 18:00 的结束时间，就开新的一天。

```javascript
var currentTime = 8 * 60;  // 8:00
var dayEnd = 18 * 60;      // 18:00

for (var i = 0; i < selectedAtts.length; i++) {
  var att = selectedAtts[i];
  // 计算赶路时间
  if (currentCity !== att.city) {
    var travelRoute = pathDistance(findPath(currentCity, att.city));
    var travelMin = Math.round(travelRoute.h * 60);
    // 赶路+游览超过当天结束时间 → 开新的一天
    if (currentTime + travelMin + att.duration * 60 > dayEnd && currentDay.stops.length > 0) {
      // 先收尾当天：午餐 + 入住
      days.push(currentDay);
      currentDay = { num: days.length + 1, stops: [], city: currentCity };
      currentTime = 8 * 60;
    }
    // 添加赶路节点
    currentDay.stops.push({
      type: "travel", time: formatTime(currentTime),
      text: currentCity + " → " + att.city,
      sub: /* 路线段详情 */
    });
    currentTime += travelMin;
  }
  // 添加游览节点（中间可能插入午餐）
  // ...
}
```

**第三步，处理午餐。** 如果游览时间跨越了 12:00，自动在游览后插入一个午餐节点（1 小时）。如果某天景点太多超过天数上限，会把最后两天合并。

最终生成的行程用时间轴（timeline）展示，每个节点有不同颜色的圆点和图标：

```javascript
var dotClass = { travel: "tp-travel", visit: "tp-visit", meal: "tp-meal", hotel: "tp-hotel" };
var dotIcon = { travel: "🚗", visit: "🏛", meal: "🍽", hotel: "🏨" };
```

### 6. 四个预设场景

为了让用户不用每次都手动配置，我做了四个预设场景，一键填充所有参数并自动生成行程：

```javascript
var SCENARIOS = [
  { id: "shanxi3",  name: "山西3日亲子游（北线）",
    origin: "太原", dest: "大同", days: 3, travelers: "family",
    interests: ["文化", "历史", "亲子"],
    selected: ["yanmen", "muta", "xuankong", "yungang"] },
  { id: "shanxi3s", name: "山西3日文化游（南线）",
    origin: "太原", dest: "灵石", days: 3, travelers: "adult",
    interests: ["文化", "历史", "美食"],
    selected: ["jinci", "qiao", "pingyao", "wang"] },
  { id: "shanxi5",  name: "山西5日深度游（全线）",
    origin: "太原", dest: "大同", days: 5, travelers: "family",
    interests: ["文化", "历史", "自然", "亲子"],
    selected: ["jinci", "qiao", "pingyao", "wang", "yanmen", "muta", "xuankong", "yungang"] },
  { id: "shanxi_compare", name: "大院对比：乔家 vs 王家",
    origin: "太原", dest: "灵石", days: 2, travelers: "adult",
    interests: ["文化", "历史"],
    selected: ["qiao", "wang"] }
];
```

点击场景按钮的逻辑很简单：把场景的参数灌进 `state`，重新渲染设置面板，然后直接调用 `doPlan()` 生成行程：

```javascript
el.querySelectorAll(".tp-scenario-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var sc = SCENARIOS.filter(function (s) { return s.id === sid; })[0];
    if (!sc) return;
    state.origin = sc.origin;
    state.dest = sc.dest;
    state.days = sc.days;
    state.interests = sc.interests.slice();
    state.selected = {};
    sc.selected.forEach(function (id) { state.selected[id] = true; });
    renderSetup();  // 刷新下拉框和标签状态
    doPlan();       // 直接出结果
  });
});
```

---

## 四、踩过的坑

开发过程不算一帆风顺，有两个 bug 印象深刻。

### 坑一：路线描述显示 undefined

行程生成后，赶路节点的副标题里出现了 `undefined`。比如"太原 → 忻州"下面应该显示交通方式，结果变成了 `太原→忻州 · 80km · undefined`。

定位到 `generateItinerary` 里构造赶路节点 `sub` 字段的那行：

```javascript
sub: travelRoute.segments.map(function (s) { return s.from + "→" + s.to; }).join(" ") +
     " · " + travelRoute.km + "km · " +
     travelRoute.segments.map(function (s) { return s.t; }).join(" / ")
```

最后一段 `s.t` 就是元凶。`s.t` 来自 `pathDistance` 里组装的 `segments`：

```javascript
segments.push({ from: path[i], to: path[i + 1], km: r.km, h: r.h, t: r.t });
```

而 `r.t` 来自 ROUTES 数据。问题出在：最初我建路线数据时，有几条边只写了 `a`、`b`、`km`、`h` 四个字段，漏了交通方式描述 `t`。`r.t` 取不到值就是 `undefined`，`.join(" / ")` 之后字符串里就出现了字面量 `undefined`。

**修复方法**：给所有 14 条路线补上 `t` 字段，标注实际交通方式。

```javascript
// 修复前（缺 t 字段）
{ a: "太原", b: "忻州", km: 80, h: 1.0 }

// 修复后
{ a: "太原", b: "忻州", km: 80, h: 1.0, t: "高速1h" }
```

教训：数据结构的每个字段，在使用方都要兜底。更稳妥的做法是在 `pathDistance` 里给 `t` 加默认值 `r.t || ""`，这样即使数据漏了也不会显示 `undefined`。

### 坑二：button 未找到的 DOM 初始化问题

第二个坑更隐蔽。在本地开发时一切正常，但部署到 MkDocs Material 站点后，从其他页面点导航栏跳到「旅行规划助手」页面，工具不加载——设置面板空白，点"开始智能规划"按钮没反应。

原因在于 MkDocs Material 的 `navigation.instant` 特性。开启后，页面切换是通过 JS 拦截链接、异步拉取新页面内容再替换 DOM，**不会触发完整的页面刷新**。而我的脚本是通过 `extra_javascript` 全局加载的，只在首次访问站点时执行一次。之后用 instant 导航跳到 planner 页面时，脚本不会重新执行，`boot()` 不运行，按钮自然就"找不到"了。

最初的处理是这样的：

```javascript
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
```

这段代码只考虑了"首次加载时 DOM 是否就绪"的情况，没考虑"instant 导航后需要重新初始化"。

**修复方法**：监听 MkDocs Material 提供的 `document$` 事件流。`document$` 是 Material 主题暴露的一个 RxJS Subject，每次页面内容切换后都会触发。订阅它，就能在每次导航后重新执行 `boot()`：

```javascript
if (typeof document$ !== "undefined" && document$.subscribe) {
  document$.subscribe(boot);
}
```

同时，所有渲染函数都加了空值保护，避免在非 planner 页面执行时报错：

```javascript
function renderSetup() {
  var el = document.getElementById("tp-setup");
  if (!el) return;  // 当前页面没有这个元素，直接返回
  // ...
}
```

`boot()` 开头也判断了根容器是否存在：

```javascript
function boot() {
  var root = document.getElementById("tp-root");
  if (!root) return;  // 非 planner 页面，跳过
  // ...
}
```

这样，无论用户是从 planner 页面直接打开，还是从其他页面 instant 导航过来，工具都能正确初始化。在非 planner 页面则安静地什么都不做。

---

## 五、最终效果

最终实现的旅行规划助手具备完整的闭环能力：

1. **设置面板**：选择出发地、目的地、天数、出行人员、兴趣偏好，或一键使用预设场景
2. **SVG 路线地图**：直观展示 BFS 算出的最短路径，标注途经城市和沿途景点
3. **景点推荐**：12 个山西景点，按兴趣和亲子指数智能排序，点击查看详情
4. **对比表**：同组景点自动横向 PK，最优值高亮（乔家 vs 王家一目了然）
5. **自动行程**：按路线顺序分配每日景点，自动插入赶路、午餐、入住节点，带时间轴展示

回到最初的问题：乔家大院还是王家大院？数据说话——王家大院评分更高、门票便宜一半、面积大得多，二选一选王家。行程上，3 天亲子北线（太原→大同）走雁门关、应县木塔、悬空寺、云冈石窟，刚好一天一个主要景点，带孩子不紧不慢。

整个工具 870 行 JS，没有一行后端代码，没有引入任何框架，数据全写死在文件里。对于这种"数据量小、逻辑明确、不需要持久化"的工具来说，纯前端方案的开发效率和部署便利性是无可比拟的。后续如果景点多了，可以把数据抽成 JSON 文件按需加载，但核心的 BFS 路线规划和行程生成逻辑不需要动。

相关文件位置：

- 核心逻辑：`docs/javascripts/travel-planner.js`
- 页面入口：`docs/travel/planner.md`
- 旅行首页入口卡片：`docs/travel/index.md`
- JS 加载配置：`mkdocs.yml` 的 `extra_javascript`
