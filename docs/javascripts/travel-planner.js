/**
 * 智能旅行规划助手
 * 输入起点终点 → 推荐景点 → 路线规划 → 日程安排
 */
(function () {
  "use strict";

  /* ========== 城市数据（SVG相对坐标） ========== */
  var CITIES = {
    "太原":   { x: 350, y: 280, area: "晋中", desc: "省会，交通枢纽" },
    "大同":   { x: 380, y: 60,  area: "晋北", desc: "北魏京城，云冈石窟" },
    "忻州":   { x: 350, y: 200, area: "晋北", desc: "五台山门户" },
    "代县":   { x: 400, y: 180, area: "晋北", desc: "雁门关所在地" },
    "应县":   { x: 370, y: 140, area: "晋北", desc: "千年木塔" },
    "浑源":   { x: 420, y: 110, area: "晋北", desc: "悬空寺，恒山" },
    "平遥":   { x: 300, y: 300, area: "晋中", desc: "世界遗产古城" },
    "祁县":   { x: 310, y: 290, area: "晋中", desc: "乔家大院" },
    "灵石":   { x: 270, y: 320, area: "晋中", desc: "王家大院" },
    "五台山": { x: 460, y: 170, area: "晋东北", desc: "佛教四大名山之首" },
    "临汾":   { x: 180, y: 340, area: "晋南", desc: "尧都" },
    "吉县":   { x: 120, y: 380, area: "晋南", desc: "壶口瀑布" }
  };

  /* ========== 路线数据（km, 小时） ========== */
  var ROUTES = [
    { a: "太原",   b: "忻州",   km: 80,  h: 1.0, t: "高速1h" },
    { a: "忻州",   b: "代县",   km: 60,  h: 1.0, t: "高速1h" },
    { a: "代县",   b: "应县",   km: 80,  h: 1.2, t: "高速1.2h" },
    { a: "应县",   b: "浑源",   km: 50,  h: 0.8, t: "国道0.8h" },
    { a: "浑源",   b: "大同",   km: 70,  h: 1.2, t: "高速1.2h" },
    { a: "太原",   b: "平遥",   km: 100, h: 1.5, t: "高铁0.5h/自驾1.5h" },
    { a: "平遥",   b: "祁县",   km: 25,  h: 0.5, t: "自驾0.5h" },
    { a: "祁县",   b: "灵石",   km: 100, h: 1.5, t: "高速1.5h" },
    { a: "平遥",   b: "灵石",   km: 120, h: 2.0, t: "高速2h" },
    { a: "太原",   b: "临汾",   km: 270, h: 3.5, t: "高铁1.5h/自驾3.5h" },
    { a: "临汾",   b: "吉县",   km: 100, h: 2.0, t: "国道2h" },
    { a: "忻州",   b: "五台山", km: 150, h: 2.0, t: "高速2h" },
    { a: "太原",   b: "五台山", km: 200, h: 3.0, t: "高速3h" },
    { a: "代县",   b: "五台山", km: 130, h: 1.8, t: "高速1.8h" }
  ];

  /* ========== 景点数据 ========== */
  var ATTRACTIONS = [
    {
      id: "yungang", name: "云冈石窟", emoji: "🗿", city: "大同",
      types: ["文化", "历史", "艺术"], level: "5A", heritage: true,
      rating: 5.0, duration: 3, ticket: 120, kidScore: 4,
      bestSeason: "4-10月", group: "must_see",
      desc: "北魏皇家石窟，45个主要洞窟，51000余尊造像，中国佛教艺术巅峰之作。",
      highlights: ["第20窟大佛（云冈代表作）", "第5/6窟精美壁画", "昙曜五窟", "音乐舞蹈石雕"],
      tips: "建议上午前往光线最佳，预留3小时。带孩子的家庭可重点看第20窟和第5窟，给孩子讲北魏故事。景区有电瓶车。"
    },
    {
      id: "qiao", name: "乔家大院", emoji: "🏚️", city: "祁县",
      types: ["文化", "历史"], level: "5A", heritage: false,
      rating: 4.3, duration: 2, ticket: 115, kidScore: 3,
      bestSeason: "全年", group: "mansion",
      desc: "晋商乔氏家族宅院，《大红灯笼高高挂》取景地，以精美砖雕、木雕、石雕闻名。",
      highlights: ["三百余间房屋", "砖雕影壁「百寿图」", "晋商民俗博物馆", "影视取景地"],
      tips: "院落布局精巧，建议请讲解或租语音导览。孩子可能对建筑兴趣不大，可重点讲「大红灯笼」的故事增加趣味。"
    },
    {
      id: "wang", name: "王家大院", emoji: "🏯", city: "灵石",
      types: ["文化", "历史"], level: "4A", heritage: false,
      rating: 4.5, duration: 2.5, ticket: 66, kidScore: 3,
      bestSeason: "全年", group: "mansion",
      desc: "规模远超乔家大院的晋商宅院，依山而建，被誉为「民间故宫」，面积达25万平方米。",
      highlights: ["依山而建的城堡式建筑", "面积是乔家大院的数十倍", "红门堡建筑群", "石雕砖雕木雕三绝"],
      tips: "规模宏大，建议预留2.5小时。地势较高需爬台阶，带老人小孩注意。性价比高于乔家大院。与乔家大院二选一推荐王家。"
    },
    {
      id: "pingyao", name: "平遥古城", emoji: "🏘️", city: "平遥",
      types: ["文化", "历史", "美食"], level: "5A", heritage: true,
      rating: 4.6, duration: 6, ticket: 125, kidScore: 4,
      bestSeason: "4-10月", group: "must_see",
      desc: "保存最完整的明清古城，世界文化遗产。城墙、票号、县衙俱全，夜晚灯会格外迷人。",
      highlights: ["明清古城墙（6.4公里）", "日升昌票号（中国银行业鼻祖）", "平遥县衙", "又见平遥演出"],
      tips: "通票含22个景点，建议至少一天。晚上逛古城看夜景，吃平遥牛肉。推荐住古城内客栈体验明清风貌。可看《又见平遥》演出。"
    },
    {
      id: "xuankong", name: "悬空寺", emoji: "⛩️", city: "浑源",
      types: ["文化", "建筑", "探险"], level: "4A", heritage: false,
      rating: 4.4, duration: 1.5, ticket: 125, kidScore: 3,
      bestSeason: "4-10月", group: "must_see",
      desc: "建于北魏的悬崖古寺，三教合一（佛道儒），悬挂于翠屏峰半壁，李白曾题「壮观」二字。",
      highlights: ["悬崖木构建筑（千年不倒）", "三教合一殿", "李白题字「壮观」", "恒山脚下"],
      tips: "登临需排队，节假日人多。恐高者可远观不登。登临票另购。带孩子注意安全，台阶陡峭。"
    },
    {
      id: "muta", name: "应县木塔", emoji: "🗼", city: "应县",
      types: ["文化", "建筑", "历史"], level: "4A", heritage: false,
      rating: 4.3, duration: 1.5, ticket: 50, kidScore: 4,
      bestSeason: "全年", group: "architecture",
      desc: "世界现存最古老最高大的纯木结构塔，辽代建筑（1056年），高67.31米，无一钉一铆。",
      highlights: ["全木结构无一根铁钉", "高67.31米（约20层楼高）", "辽代彩塑壁画", "建筑力学奇迹"],
      tips: "目前仅可登一层。带孩子来可以讲建筑力学的神奇，是最好的实物科普教材。参观1-1.5小时即可。"
    },
    {
      id: "yanmen", name: "雁门关", emoji: "⛰️", city: "代县",
      types: ["历史", "自然"], level: "5A", heritage: false,
      rating: 4.2, duration: 2.5, ticket: 90, kidScore: 3,
      bestSeason: "4-10月", group: "history",
      desc: "「中华第一关」，长城重要关隘，历代兵家必争之地。杨家将故事的发生地。",
      highlights: ["长城关隘遗址", "杨家将故事发源地", "雁门关古道", "长城博物馆"],
      tips: "需爬山，建议穿运动鞋。给孩子讲杨家将守关的故事会很感兴趣。春秋风景最佳。"
    },
    {
      id: "wutai", name: "五台山", emoji: "🛕", city: "五台山",
      types: ["文化", "自然", "宗教"], level: "5A", heritage: true,
      rating: 4.5, duration: 8, ticket: 135, kidScore: 3,
      bestSeason: "5-9月", group: "mountain",
      desc: "佛教四大名山之首，世界文化景观遗产。五座台顶环抱，寺院林立，夏日避暑胜地。",
      highlights: ["显通寺（五大禅处之首）", "塔院寺大白塔", "菩萨顶", "五座台顶朝台"],
      tips: "夏季最佳，山上温差大需带外套。朝台需一天且体力要求高，带孩子建议只逛台怀镇寺庙群。"
    },
    {
      id: "jinci", name: "晋祠", emoji: "🏛️", city: "太原",
      types: ["文化", "园林", "历史"], level: "4A", heritage: false,
      rating: 4.3, duration: 2.5, ticket: 80, kidScore: 4,
      bestSeason: "全年", group: "taiyuan",
      desc: "中国现存最早的皇家园林，始建年代不详。有「晋祠三绝」：难老泉、宋代彩塑、周柏。",
      highlights: ["圣母殿宋代彩塑", "鱼沼飞梁（十字桥孤例）", "难老泉", "周柏唐槐"],
      tips: "太原市内，交通方便。园林优美适合全家游览，建议上午去。有讲解服务。"
    },
    {
      id: "shanxi_museum", name: "山西博物院", emoji: "🏛️", city: "太原",
      types: ["文化", "历史"], level: "国家一级", heritage: false,
      rating: 4.5, duration: 2.5, ticket: 0, kidScore: 4,
      bestSeason: "全年", group: "taiyuan",
      desc: "山西省最大文物收藏展示机构，馆藏40余万件。以晋国青铜器、北朝文物闻名。",
      highlights: ["晋侯鸟尊（镇馆之宝）", "侯马盟书", "北齐壁画", "佛风遗韵展厅"],
      tips: "免费但需提前预约。建议作为山西之旅第一站，先了解历史背景再游各地。有儿童互动区。"
    },
    {
      id: "huayan", name: "华严寺", emoji: "🛕", city: "大同",
      types: ["文化", "建筑", "历史"], level: "4A", heritage: false,
      rating: 4.3, duration: 1.5, ticket: 65, kidScore: 3,
      bestSeason: "全年", group: "datong",
      desc: "辽金皇家寺院，大同市内最重要的古建筑之一。大雄宝殿为中国现存最大的辽金佛殿。",
      highlights: ["大雄宝殿（辽代巨构）", "合掌露齿菩萨（东方维纳斯）", "薄伽教藏殿", "辽代壁画"],
      tips: "与云冈石窟搭配游览，上午石窟下午华严寺。合掌露齿菩萨是必看精品。"
    },
    {
      id: "hukou", name: "壶口瀑布", emoji: "💦", city: "吉县",
      types: ["自然", "摄影"], level: "5A", heritage: false,
      rating: 4.4, duration: 2, ticket: 90, kidScore: 5,
      bestSeason: "春秋两季", group: "nature",
      desc: "黄河上最大的瀑布，世界唯一的金黄色瀑布。气势磅礴，十里龙漕蔚为壮观。",
      highlights: ["黄河奔腾而下", "十里龙漕", "彩虹奇观", "陕晋两省观景"],
      tips: "春秋两季水量最大最壮观。山西侧观景更佳。带孩子来震撼感十足，注意安全不要靠近护栏。"
    }
  ];

  /* ========== 快速场景 ========== */
  var SCENARIOS = [
    {
      id: "shanxi3", name: "山西3日亲子游（北线）",
      origin: "太原", dest: "大同", days: 3, travelers: "family",
      interests: ["文化", "历史", "亲子"], selected: ["yanmen", "muta", "xuankong", "yungang"]
    },
    {
      id: "shanxi3s", name: "山西3日文化游（南线）",
      origin: "太原", dest: "灵石", days: 3, travelers: "adult",
      interests: ["文化", "历史", "美食"], selected: ["jinci", "qiao", "pingyao", "wang"]
    },
    {
      id: "shanxi5", name: "山西5日深度游（全线）",
      origin: "太原", dest: "大同", days: 5, travelers: "family",
      interests: ["文化", "历史", "自然", "亲子"], selected: ["jinci", "qiao", "pingyao", "wang", "yanmen", "muta", "xuankong", "yungang"]
    },
    {
      id: "shanxi_compare", name: "大院对比：乔家 vs 王家",
      origin: "太原", dest: "灵石", days: 2, travelers: "adult",
      interests: ["文化", "历史"], selected: ["qiao", "wang"]
    }
  ];

  /* ========== 状态 ========== */
  var state = {
    origin: "太原",
    dest: "大同",
    days: 3,
    travelers: "family",
    interests: ["文化", "历史", "亲子"],
    selected: {},
    planned: false
  };

  /* ========== 工具函数 ========== */
  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

  function routeBetween(a, b) {
    for (var i = 0; i < ROUTES.length; i++) {
      var r = ROUTES[i];
      if ((r.a === a && r.b === b) || (r.a === b && r.b === a)) return r;
    }
    return null;
  }

  function findPath(start, end) {
    if (start === end) return [start];
    var visited = {};
    visited[start] = true;
    var queue = [[start]];
    while (queue.length) {
      var path = queue.shift();
      var cur = path[path.length - 1];
      for (var i = 0; i < ROUTES.length; i++) {
        var r = ROUTES[i];
        var next = null;
        if (r.a === cur && !visited[r.b]) next = r.b;
        else if (r.b === cur && !visited[r.a]) next = r.a;
        if (next) {
          var newPath = path.concat([next]);
          if (next === end) return newPath;
          visited[next] = true;
          queue.push(newPath);
        }
      }
    }
    return null;
  }

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

  function formatTime(min) {
    var h = Math.floor(min / 60);
    var m = min % 60;
    return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
  }

  function getAttractionsForRoute(origin, dest) {
    var path = findPath(origin, dest);
    if (!path) return [];
    var routeCities = {};
    path.forEach(function (c) { routeCities[c] = true; });
    return ATTRACTIONS.filter(function (a) { return routeCities[a.city]; });
  }

  function getAttractionsForArea(origin, dest) {
    var path = findPath(origin, dest);
    if (!path) return ATTRACTIONS.slice();
    var routeCities = {};
    path.forEach(function (c) { routeCities[c] = true; });
    // 也推荐起点和终点附近的景点
    var originArea = CITIES[origin] ? CITIES[origin].area : "";
    var destArea = CITIES[dest] ? CITIES[dest].area : "";
    return ATTRACTIONS.filter(function (a) {
      if (routeCities[a.city]) return true;
      var cityArea = CITIES[a.city] ? CITIES[a.city].area : "";
      return cityArea === originArea || cityArea === destArea;
    });
  }

  /* ========== 渲染：设置面板 ========== */
  function renderSetup() {
    var el = document.getElementById("tp-setup");
    if (!el) return;

    var cityOpts = Object.keys(CITIES).map(function (c) {
      return '<option value="' + esc(c) + '"' + (c === state.origin ? " selected" : "") + ">" + esc(c) + "</option>";
    }).join("");
    var destOpts = Object.keys(CITIES).map(function (c) {
      return '<option value="' + esc(c) + '"' + (c === state.dest ? " selected" : "") + ">" + esc(c) + "</option>";
    }).join("");

    var allTypes = ["文化", "历史", "自然", "建筑", "艺术", "美食", "亲子", "摄影", "探险", "宗教"];
    var tagHtml = allTypes.map(function (t) {
      var on = state.interests.indexOf(t) >= 0 ? " on" : "";
      return '<button type="button" class="tp-tag' + on + '" data-interest="' + esc(t) + '">' + esc(t) + "</button>";
    }).join("");

    var scenarioHtml = SCENARIOS.map(function (s) {
      return '<button type="button" class="tp-tag tp-scenario-btn" data-scenario="' + esc(s.id) + '">' + esc(s.name) + "</button>";
    }).join("");

    el.innerHTML =
      '<div class="tp-field"><label>出发地</label><select id="tp-origin">' + cityOpts + "</select></div>" +
      '<div class="tp-field"><label>目的地</label><select id="tp-dest">' + destOpts + "</select></div>" +
      '<div class="tp-field"><label>旅行天数</label><select id="tp-days">' +
      [2, 3, 4, 5, 6, 7].map(function (d) {
        return '<option value="' + d + '"' + (d === state.days ? " selected" : "") + ">" + d + " 天</option>";
      }).join("") +
      "</select></div>" +
      '<div class="tp-field"><label>出行人员</label><select id="tp-travelers">' +
      '<option value="family"' + (state.travelers === "family" ? " selected" : "") + ">亲子游</option>" +
      '<option value="couple"' + (state.travelers === "couple" ? " selected" : "") + ">情侣游</option>" +
      '<option value="adult"' + (state.travelers === "adult" ? " selected" : "") + ">成人结伴</option>" +
      '<option value="solo"' + (state.travelers === "solo" ? " selected" : "") + ">独自旅行</option>" +
      "</select></div>" +
      '<div class="tp-field" style="grid-column:1/-1"><label>兴趣偏好</label><div class="tp-tags" id="tp-interests">' + tagHtml + "</div></div>" +
      '<div class="tp-field" style="grid-column:1/-1"><label>快速场景</label><div class="tp-tags" id="tp-scenarios">' + scenarioHtml + "</div></div>" +
      '<button type="button" class="tp-plan-btn" id="tp-plan">开始智能规划</button>';

    document.getElementById("tp-origin").addEventListener("change", function () { state.origin = this.value; });
    document.getElementById("tp-dest").addEventListener("change", function () { state.dest = this.value; });
    document.getElementById("tp-days").addEventListener("change", function () { state.days = Number(this.value); });
    document.getElementById("tp-travelers").addEventListener("change", function () { state.travelers = this.value; });

    el.querySelectorAll(".tp-tag[data-interest]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var v = btn.getAttribute("data-interest");
        var idx = state.interests.indexOf(v);
        if (idx >= 0) state.interests.splice(idx, 1);
        else state.interests.push(v);
        btn.classList.toggle("on");
      });
    });

    el.querySelectorAll(".tp-scenario-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var sid = btn.getAttribute("data-scenario");
        var sc = SCENARIOS.filter(function (s) { return s.id === sid; })[0];
        if (!sc) return;
        state.origin = sc.origin;
        state.dest = sc.dest;
        state.days = sc.days;
        state.travelers = sc.travelers;
        state.interests = sc.interests.slice();
        state.selected = {};
        sc.selected.forEach(function (id) { state.selected[id] = true; });
        renderSetup();
        doPlan();
      });
    });

    document.getElementById("tp-plan").addEventListener("click", doPlan);
  }

  /* ========== 渲染：路线地图 ========== */
  function renderRoute() {
    var el = document.getElementById("tp-route");
    if (!el) return;

    var path = findPath(state.origin, state.dest);
    if (!path) {
      el.innerHTML = '<div class="tp-empty-state"><div class="tp-big-icon">🗺️</div><p>暂无路线数据</p></div>';
      return;
    }
    var dist = pathDistance(path);
    var routeCitySet = {};
    path.forEach(function (c) { routeCitySet[c] = true; });

    // 收集沿途景点
    var routeAttractions = ATTRACTIONS.filter(function (a) { return routeCitySet[a.city]; });

    // SVG
    var svgW = 560, svgH = 440;
    var svgParts = [];

    // 路线连线
    for (var i = 0; i < path.length - 1; i++) {
      var c1 = CITIES[path[i]], c2 = CITIES[path[i + 1]];
      var isActive = true;
      svgParts.push(
        '<line class="tp-route-line' + (isActive ? " tp-active" : "") +
        '" x1="' + c1.x + '" y1="' + c1.y + '" x2="' + c2.x + '" y2="' + c2.y + '"/>'
      );
    }

    // 所有城市点（路线上的高亮）
    Object.keys(CITIES).forEach(function (name) {
      var c = CITIES[name];
      var isRoute = routeCitySet[name];
      var cls = "tp-city-dot";
      if (name === state.origin) cls += " tp-origin";
      else if (name === state.dest) cls += " tp-dest";
      if (!isRoute) cls += '" style="opacity:0.25';
      svgParts.push(
        '<circle class="' + cls + '" cx="' + c.x + '" cy="' + c.y + '" r="5"/>'
      );
      svgParts.push(
        '<text class="tp-city-label" x="' + c.x + '" y="' + (c.y - 10) + '"' +
        (isRoute ? "" : ' style="opacity:0.3"') + ">" + esc(name) + "</text>"
      );
    });

    // 景点标记
    routeAttractions.forEach(function (a) {
      var c = CITIES[a.city];
      var isSel = state.selected[a.id];
      svgParts.push(
        '<circle class="tp-attraction-pin' + (isSel ? " tp-selected" : "") +
        '" cx="' + c.x + '" cy="' + (c.y + 14) + '" r="3.5" data-att="' + a.id + '"/>'
      );
    });

    var infoChips =
      '<span class="tp-chip">🚗 总路程 <b>' + dist.km + 'km</b></span>' +
      '<span class="tp-chip">⏱ 行车约 <b>' + dist.h + 'h</b></span>' +
      '<span class="tp-chip">📍 途经 <b>' + path.length + '</b> 站</span>' +
      '<span class="tp-chip">🏛 沿途 <b>' + routeAttractions.length + '</b> 景点</span>';

    el.innerHTML =
      '<div class="tp-route-map">' +
      '<svg class="tp-route-svg" viewBox="0 0 ' + svgW + ' ' + svgH + '" xmlns="http://www.w3.org/2000/svg">' +
      svgParts.join("") +
      "</svg>" +
      '<div class="tp-route-info">' + infoChips + "</div>" +
      "</div>";

    // 景点标记点击
    el.querySelectorAll(".tp-attraction-pin").forEach(function (pin) {
      pin.addEventListener("click", function () {
        var aid = pin.getAttribute("data-att");
        showDetail(aid);
      });
    });
  }

  /* ========== 渲染：景点卡片 ========== */
  function renderAttractions() {
    var el = document.getElementById("tp-attractions");
    if (!el) return;

    var list = getAttractionsForArea(state.origin, state.dest);
    if (!list.length) {
      el.innerHTML = '<div class="tp-empty-state"><div class="tp-big-icon">🏛️</div><p>该路线暂无景点数据</p></div>';
      return;
    }

    // 按兴趣和亲子评分排序
    list.sort(function (a, b) {
      var sa = scoreAttraction(a);
      var sb = scoreAttraction(b);
      return sb - sa;
    });

    el.innerHTML = list.map(function (a) {
      var isSel = state.selected[a.id];
      var badges = "";
      if (a.heritage) badges += '<span class="tp-att-badge tp-badge-heritage">世界遗产</span>';
      badges += '<span class="tp-att-badge tp-badge-5a">' + esc(a.level) + "</span>";
      var matchBadge = scoreAttraction(a) >= 3 ? '<span class="tp-att-badge">推荐</span>' : "";
      var stars = "★".repeat(Math.round(a.rating)) + "☆".repeat(5 - Math.round(a.rating));

      return (
        '<div class="tp-att-card' + (isSel ? " tp-selected" : "") + '" data-att="' + a.id + '">' +
        '<div class="tp-att-img">' + a.emoji + "</div>" +
        '<div class="tp-att-body">' +
        '<h4 class="tp-att-name">' + esc(a.name) + "</h4>" +
        '<div class="tp-att-meta">' + badges + matchBadge + "</div>" +
        '<p class="tp-att-desc">' + esc(a.desc) + "</p>" +
        '<div class="tp-att-foot">' +
        '<span class="tp-att-rating">' + stars + " " + a.rating + "</span>" +
        '<span class="tp-att-ticket">💰 ' + (a.ticket > 0 ? a.ticket + "元" : "免费") +
        " · ⏱ " + a.duration + "h</span>" +
        "</div></div></div>"
      );
    }).join("");

    el.querySelectorAll(".tp-att-card").forEach(function (card) {
      card.addEventListener("click", function () {
        var aid = card.getAttribute("data-att");
        // 点击卡片主体显示详情
        showDetail(aid);
      });
    });
  }

  function scoreAttraction(a) {
    var score = a.rating;
    // 兴趣匹配
    a.types.forEach(function (t) {
      if (state.interests.indexOf(t) >= 0) score += 0.5;
    });
    // 亲子加分
    if (state.travelers === "family" && a.kidScore >= 4) score += 1;
    if (state.travelers === "family" && a.kidScore <= 2) score -= 0.5;
    return score;
  }

  /* ========== 渲染：对比表 ========== */
  function renderComparison() {
    var el = document.getElementById("tp-compare");
    if (!el) return;

    // 找同组景点
    var groups = {};
    var list = getAttractionsForArea(state.origin, state.dest);
    list.forEach(function (a) {
      if (!groups[a.group]) groups[a.group] = [];
      groups[a.group].push(a);
    });

    var compareGroups = Object.keys(groups).filter(function (g) {
      return groups[g].length >= 2;
    });

    if (!compareGroups.length) {
      el.innerHTML = "";
      return;
    }

    var html = "";
    compareGroups.forEach(function (g) {
      var items = groups[g];
      var groupLabel = {
        "mansion": "晋商大院对比",
        "must_see": "必看景点对比",
        "architecture": "古建筑对比",
        "datong": "大同景点对比",
        "taiyuan": "太原景点对比"
      }[g] || "景点对比";

      var headers = items.map(function (a) {
        return "<th>" + esc(a.name) + "</th>";
      }).join("");

      function row(label, fn) {
        var cells = items.map(function (a) {
          var v = fn(a);
          return '<td>' + v + "</td>";
        }).join("");
        return "<tr><td>" + esc(label) + "</td>" + cells + "</tr>";
      }

      // 找最优值
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

      html +=
        '<h3 class="tp-section-title" style="margin-top:1rem"><span class="tp-icon">⚖️</span>' + esc(groupLabel) + "</h3>" +
        '<div class="tp-compare"><table>' +
        "<thead><tr><th>对比项</th>" + headers + "</tr></thead><tbody>" +
        row("等级", function (a) { return a.level + (a.heritage ? " · 世遗" : ""); }) +
        row("类型", function (a) { return a.types.join("、"); }) +
        bestRow("评分", function (a) { return "★ " + a.rating; }, true) +
        bestRow("门票", function (a) { return a.ticket > 0 ? a.ticket + "元" : "免费"; }, false) +
        bestRow("游览时长", function (a) { return a.duration + "h"; }, false) +
        bestRow("亲子友好", function (a) { return "👍".repeat(a.kidScore); }, true) +
        row("最佳季节", function (a) { return a.bestSeason; }) +
        row("亮点", function (a) { return a.highlights.slice(0, 2).join("；"); }) +
        "</tbody></table></div>";
    });

    el.innerHTML = html;
  }

  /* ========== 行程生成算法 ========== */
  function generateItinerary() {
    var selectedIds = Object.keys(state.selected);
    if (!selectedIds.length) return null;

    var path = findPath(state.origin, state.dest);
    if (!path) path = [state.origin];

    // 收集选中景点
    var selectedAtts = selectedIds.map(function (id) {
      return ATTRACTIONS.filter(function (a) { return a.id === id; })[0];
    }).filter(Boolean);

    // 按路线顺序排列景点
    var routeOrder = {};
    path.forEach(function (c, i) { routeOrder[c] = i; });
    selectedAtts.sort(function (a, b) {
      var ia = routeOrder[a.city] !== undefined ? routeOrder[a.city] : 999;
      var ib = routeOrder[b.city] !== undefined ? routeOrder[b.city] : 999;
      return ia - ib;
    });

    // 生成每日行程
    var days = [];
    var currentDay = { num: 1, stops: [], city: state.origin };
    var currentTime = 8 * 60; // 8:00 in minutes
    var currentCity = state.origin;
    var dayEnd = 18 * 60; // 18:00

    for (var i = 0; i < selectedAtts.length; i++) {
      var att = selectedAtts[i];

      // 计算从当前城市到景点城市的行程
      var travelRoute = null;
      if (currentCity !== att.city) {
        var p = findPath(currentCity, att.city);
        if (p) {
          travelRoute = pathDistance(p);
        }
      }

      // 如果需要赶路
      if (travelRoute && travelRoute.h > 0) {
        var travelMin = Math.round(travelRoute.h * 60);
        // 如果赶路后+游览超过当天结束时间，开新的一天
        if (currentTime + travelMin + att.duration * 60 > dayEnd && currentDay.stops.length > 0) {
          // 加午餐（如果还没有）
          if (currentTime < 12 * 60 && currentDay.stops.length > 0) {
            currentDay.stops.push({
              type: "meal", time: formatTime(12 * 60), text: "午餐",
              sub: "品尝当地特色美食"
            });
          }
          // 入住
          currentDay.stops.push({
            type: "hotel", time: formatTime(currentTime), text: "入住 " + currentCity,
            sub: "休息整顿"
          });
          days.push(currentDay);
          currentDay = { num: days.length + 1, stops: [], city: currentCity };
          currentTime = 8 * 60;
        }

        // 添加赶路
        currentDay.stops.push({
          type: "travel", time: formatTime(currentTime),
          text: currentCity + " → " + att.city,
          sub: travelRoute.segments.map(function (s) { return s.from + "→" + s.to; }).join(" ") + " · " + travelRoute.km + "km · " + travelRoute.segments.map(function (s) { return s.t; }).join(" / ")
        });
        currentTime += travelMin;
        currentCity = att.city;
        currentDay.city = currentCity;
      }

      // 午餐
      if (currentTime < 12 * 60 && currentTime + att.duration * 60 > 12 * 60) {
        currentDay.stops.push({
          type: "visit", time: formatTime(currentTime),
          text: "游览 " + att.name,
          sub: att.duration + "小时 · " + att.highlights[0]
        });
        currentTime += att.duration * 60;
        currentDay.stops.push({
          type: "meal", time: formatTime(currentTime), text: "午餐",
          sub: "当地特色美食"
        });
        currentTime += 60; // 午餐1小时
      } else {
        currentDay.stops.push({
          type: "visit", time: formatTime(currentTime),
          text: "游览 " + att.name,
          sub: att.duration + "小时 · " + att.highlights[0]
        });
        currentTime += att.duration * 60;
      }

      // 如果超过当天结束时间，开新的一天
      if (currentTime >= dayEnd && i < selectedAtts.length - 1) {
        currentDay.stops.push({
          type: "hotel", time: formatTime(currentTime),
          text: "入住 " + currentCity,
          sub: "休息整顿"
        });
        days.push(currentDay);
        currentDay = { num: days.length + 1, stops: [], city: currentCity };
        currentTime = 8 * 60;
      }
    }

    // 最后一天入住终点
    if (currentDay.stops.length > 0) {
      currentDay.stops.push({
        type: "hotel", time: formatTime(currentTime),
        text: "入住 " + currentCity,
        sub: "行程结束"
      });
      days.push(currentDay);
    }

    // 限制天数
    while (days.length > state.days) {
      // 合并最后两天
      var last = days.pop();
      if (days.length > 0) {
        days[days.length - 1].stops = days[days.length - 1].stops.concat(last.stops);
      }
    }

    // 计算总费用
    var totalTicket = selectedAtts.reduce(function (s, a) { return s + a.ticket; }, 0);
    var totalDist = pathDistance(path);

    return {
      days: days,
      totalTicket: totalTicket,
      totalDistance: totalDist.km,
      totalAttractions: selectedAtts.length
    };
  }

  /* ========== 渲染：行程安排 ========== */
  function renderItinerary() {
    var el = document.getElementById("tp-itinerary");
    if (!el) return;

    var selectedCount = Object.keys(state.selected).length;
    if (!selectedCount) {
      el.innerHTML = '<div class="tp-empty-state"><div class="tp-big-icon">📋</div><p>请在上方选择想去的景点，系统将自动生成最优行程</p></div>';
      return;
    }

    var plan = generateItinerary();
    if (!plan || !plan.days.length) {
      el.innerHTML = '<div class="tp-empty-state"><div class="tp-big-icon">📋</div><p>无法生成行程，请检查路线</p></div>';
      return;
    }

    var dotClass = { travel: "tp-travel", visit: "tp-visit", meal: "tp-meal", hotel: "tp-hotel" };
    var dotIcon = { travel: "🚗", visit: "🏛", meal: "🍽", hotel: "🏨" };

    var daysHtml = plan.days.map(function (day) {
      var firstCity = day.stops.length ? day.stops[0].text.split("→")[0].trim() : "";
      var lastCity = day.stops.length ? day.stops[day.stops.length - 1].text.replace(/.*→\s*/, "").replace(/^(游览|入住)\s*/, "").trim() : "";
      var routeLabel = firstCity && lastCity ? firstCity + " → " + lastCity : day.city;

      var stopsHtml = day.stops.map(function (s) {
        return (
          '<div class="tp-stop">' +
          '<div class="tp-stop-dot ' + (dotClass[s.type] || "") + '"></div>' +
          '<div class="tp-stop-body">' +
          '<div class="tp-stop-time">' + esc(s.time) + " " + (dotIcon[s.type] || "") + "</div>" +
          '<div class="tp-stop-text">' + esc(s.text) + "</div>" +
          (s.sub ? '<div class="tp-stop-sub">' + esc(s.sub) + "</div>" : "") +
          "</div></div>"
        );
      }).join("");

      return (
        '<div class="tp-day">' +
        '<div class="tp-day-head">' +
        '<span class="tp-day-num">' + day.num + "</span>" +
        '<span class="tp-day-title">第 ' + day.num + " 天</span>" +
        '<span class="tp-day-route">' + esc(routeLabel) + "</span>" +
        "</div>" +
        '<div class="tp-timeline">' + stopsHtml + "</div>" +
        "</div>"
      );
    }).join("");

    el.innerHTML =
      '<div class="tp-route-info" style="margin-bottom:1rem">' +
      '<span class="tp-chip">🏛 <b>' + plan.totalAttractions + "</b> 景点</span>" +
      '<span class="tp-chip">💰 门票约 <b>' + plan.totalTicket + "</b> 元</span>" +
      '<span class="tp-chip">🚗 总路程 <b>' + plan.totalDistance + "</b> km</span>" +
      '<span class="tp-chip">📅 <b>' + plan.days.length + "</b> 天行程</span>" +
      "</div>" +
      daysHtml;
  }

  /* ========== 详情弹窗 ========== */
  function showDetail(id) {
    var a = ATTRACTIONS.filter(function (x) { return x.id === id; })[0];
    if (!a) return;
    var modal = document.getElementById("tp-modal");
    if (!modal) return;

    var stars = "★".repeat(Math.round(a.rating)) + "☆".repeat(5 - Math.round(a.rating));
    var isSel = state.selected[id];
    var btnLabel = isSel ? "从行程中移除" : "加入行程";
    var btnClass = isSel ? " tp-btn-remove" : "";

    var highlightsHtml = a.highlights.map(function (h) {
      return "<li>" + esc(h) + "</li>";
    }).join("");

    modal.innerHTML =
      '<div class="tp-modal-box">' +
      '<div class="tp-modal-head">' +
      "<h3>" + a.emoji + " " + esc(a.name) + "</h3>" +
      '<button type="button" class="tp-modal-close" id="tp-modal-close">✕</button>' +
      "</div>" +
      '<div class="tp-modal-body">' +
      '<p style="font-size:0.82rem;color:var(--tp-muted);margin-bottom:0.5rem">📍 ' + esc(a.city) + " · " + a.types.join("、") + "</p>" +
      "<p>" + esc(a.desc) + "</p>" +
      '<div class="tp-info-grid">' +
      '<div class="tp-info-item"><b style="color:var(--tp-accent)">' + stars + "</b><span>" + a.rating + " 分</span></div>" +
      '<div class="tp-info-item"><b>' + a.level + (a.heritage ? " · 世遗" : "") + "</b><span>景区等级</span></div>" +
      '<div class="tp-info-item"><b>' + (a.ticket > 0 ? a.ticket + "元" : "免费") + "</b><span>门票</span></div>" +
      '<div class="tp-info-item"><b>' + a.duration + "h</b><span>建议游览</span></div>" +
      '<div class="tp-info-item"><b>' + "👍".repeat(a.kidScore) + "</b><span>亲子指数</span></div>" +
      '<div class="tp-info-item"><b>' + esc(a.bestSeason) + "</b><span>最佳季节</span></div>" +
      "</div>" +
      '<h4 style="margin:0.5rem 0 0.3rem;font-size:0.88rem">✨ 核心看点</h4>' +
      '<ul class="tp-highlights">' + highlightsHtml + "</ul>" +
      '<div class="tp-tips-box">💡 <b>实用贴士：</b>' + esc(a.tips) + "</div>" +
      '<button type="button" class="tp-plan-btn' + btnClass + '" id="tp-toggle-att" data-att="' + a.id + '" style="margin-top:0.8rem;width:100%">' + btnLabel + "</button>" +
      "</div></div>";

    modal.classList.add("on");

    document.getElementById("tp-modal-close").addEventListener("click", function () {
      modal.classList.remove("on");
    });
    modal.addEventListener("click", function (e) {
      if (e.target === modal) modal.classList.remove("on");
    });

    document.getElementById("tp-toggle-att").addEventListener("click", function () {
      var aid = this.getAttribute("data-att");
      if (state.selected[aid]) delete state.selected[aid];
      else state.selected[aid] = true;
      renderAttractions();
      renderRoute();
      renderItinerary();
      modal.classList.remove("on");
    });
  }

  /* ========== 主规划流程 ========== */
  function doPlan() {
    state.planned = true;
    // 如果起点和终点相同，尝试推荐周边
    if (state.origin === state.dest) {
      // 保持原样，推荐周边景点
    }
    renderRoute();
    renderAttractions();
    renderComparison();
    renderItinerary();
    // 滚动到路线
    var route = document.getElementById("tp-route");
    if (route) route.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ========== 启动 ========== */
  function boot() {
    var root = document.getElementById("tp-root");
    if (!root) return;

    root.innerHTML =
      '<div class="tp-hero"><h1>🗺️ 旅行规划助手</h1><p>输入起点和目的地，智能推荐沿途景点、规划最优路线、生成每日行程 — 让旅行规划不再耗时</p></div>' +
      '<div class="tp-setup" id="tp-setup"></div>' +
      '<div class="tp-route-section" id="tp-route-section">' +
      '<h2 class="tp-section-title"><span class="tp-icon">🛣️</span>推荐路线</h2>' +
      '<div id="tp-route"></div>' +
      "</div>" +
      '<div class="tp-route-section">' +
      '<h2 class="tp-section-title"><span class="tp-icon">🏛</span>景点推荐 · 点击查看详情并加入行程</h2>' +
      '<div class="tp-attractions" id="tp-attractions"></div>' +
      "</div>" +
      '<div id="tp-compare"></div>' +
      '<div class="tp-route-section">' +
      '<h2 class="tp-section-title"><span class="tp-icon">📋</span>行程安排</h2>' +
      '<div class="tp-itinerary" id="tp-itinerary">' +
      '<div class="tp-empty-state"><div class="tp-big-icon">👆</div><p>选择上方的出发地和目的地，点击「开始智能规划」</p></div>' +
      "</div></div>" +
      '<div class="tp-modal" id="tp-modal"></div>';

    renderSetup();
    // 默认显示一个初始路线
    renderRoute();
    renderAttractions();
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
