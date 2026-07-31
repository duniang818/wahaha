---
feishu_doc: PEKxdgu5AoKSYfxyzaRc32KCnoh
feishu_url: "https://my.feishu.cn/docx/PEKxdgu5AoKSYfxyzaRc32KCnoh"
title: 博客评论系统双模式设计
author: 渡娘
date: 2026-07-31
nav: 博客
visibility: public
draft: false
tags:
  - 博客
  - 技术
  - 建站
  - 评论
description: "静态博客评论难题的折中方案：游客免登录评论 + GitHub Giscus 双模式，兼顾低门槛互动与正式讨论。"
---

这篇记的是「博客评论区」从无到有、从「套个 Giscus 就完事」到「双模式」的折腾过程。不是产品发布稿，是开发笔记——中间纠结过什么、为什么这么取舍、踩了哪些坑，都按真实顺序写下来。

博客是 MkDocs Material + GitHub Pages 的纯静态站，正文能写，但评论这事天然尴尬：没有后端，访客想互动就得先登录第三方账号，门槛一拉高，基本就没人说话了。我希望既能让人随手留两句，又能在需要正经讨论时有个像样的入口。最后做出来的形态是：**一个评论区，两种身份，默认免登录。**

---

## 1. 需求背景：静态博客为什么难有评论

静态博客的好处是省心——push 一篇 Markdown，CI 一跑就上线，不用维护服务器。但评论这件事它天然搞不定，因为评论是「写」操作，需要 somewhere 帮你存下来。

常见的做法是把评论存到别处：要么挂个第三方评论服务（Disqus、Giscus、Cusdis），要么自己架个后端（Twikoo、Waline、Artalk）。问题来了：

- **门槛型方案**（Giscus / Disqus）：访客必须登录 GitHub / Google 才能发言。技术博客的读者多半有 GitHub，但这仍是一道墙——很多人只是路过想说一句「谢谢，有用」，看到要登录就关了。
- **自建型方案**（Twikoo / Waline）：免登录友好，但要部署后端、配数据库、管反垃圾，还得有个稳定域名。对一个只想写文章的人来说，运维成本陡增。

我想要的其实是两个场景都照顾到：

1. 日常路过、随手互动 → **不用登录，点开就能写**。
2. 想认真讨论、希望评论跟自己 GitHub 身份绑定 → **能切到 Giscus**，享受它成熟的登录、表情、邮件通知。

换句话说，**「低门槛互动」和「正式讨论」不应该互斥**，而当时市面上的方案基本是二选一。

---

## 2. 方案对比：四条路走下来选了哪条

动手前我把能想到的方案列了一遍，挨个权衡：

| 方案 | 后端依赖 | 免登录 | 维护成本 | 适合场景 |
|------|----------|--------|----------|----------|
| **Giscus** | GitHub Discussions | 否（需 GitHub 登录） | 极低，配 repo 即可 | 技术博客正式讨论 |
| **Twikoo** | 自建（Vercel/云函数 + 数据库） | 是 | 中，要部署+反垃圾 | 想要全网可见的免登录评论 |
| **Cusdis** | 官方托管或自建 | 是 | 低（托管）/ 中（自建） | 轻量、需人工审核 |
| **自研前端** | 无（localStorage） | 是 | 低，纯前端 | 本地预览、低门槛互动 |

逐条看：

- **Giscus** 体验最好、最省事，但「必须登录」是硬伤，挡掉了大部分随性互动。
- **Twikoo** 全能，可我不想为了评论专门维护一个云函数 + 数据库，而且还没想好要不要长期开公网服务。
- **Cusdis** 轻量，但免费托管有审核延迟，自建又要折腾，性价比不高。
- **自研前端 + localStorage** 零后端、零成本，缺点是评论只存在访客自己浏览器里——但这恰恰满足「本地预览 / 随手互动」。

最后我没在四选一里纠结，而是把 **自研前端（游客模式）** 和 **Giscus（GitHub 模式）** 拼到同一个评论区里，用 Tab 切换。默认走游客模式，零门槛；想正式讨论，点一下切到 Giscus。Twikoo 留作「让游客评论全网可见」的可选升级位，配置项先占着，哪天想开了填个 `env_id` 就能上。

---

## 3. 最终设计：双模式

整体形态：文章底部一个评论区，顶部两个 Tab——「游客」和「GitHub 账号」。

```text
┌─────────────────────────────────────────────┐
│  [ 游客 ]  [ GitHub 账号 ]                  │  ← Tab 切换
├─────────────────────────────────────────────┤
│  表情墙：👍 ❤️ 😄 🎉 …  (点击 +1)           │
│  ─────────────────────────────────────      │
│  ┌───────────────────────────────────────┐  │
│  │ EasyMDE 工具栏：B I H | 引用 列表 | …  │  │
│  │                                       │  │
│  │  Markdown 编辑区（支持预览/分屏）      │  │
│  └───────────────────────────────────────┘  │
│  [昵称输入框]              [发布评论]       │
│                                             │
│  评论列表（localStorage，最新在前）          │
└─────────────────────────────────────────────┘
        切到 GitHub Tab → 懒加载 Giscus iframe
```

### 游客模式（默认）

- **表情墙**：一排常用 emoji，点击 +1，再点 -1，数据存 localStorage。对齐 Giscus 的 reactions 视觉。
- **Markdown 富文本编辑器**：用 EasyMDE，工具栏带粗体、斜体、标题、引用、列表、链接、代码、表格、预览、分屏、全屏。
- **昵称**：一个输入框，默认「游客」，最长 32 字符。
- **发布**：内容 + 昵称 + 时间戳存进 localStorage，评论列表即时刷新。
- **草稿自动保存**：边写边存，刷新页面不丢。

全程不登录、不联网、不依赖任何第三方。代价是：评论只在这台浏览器可见（提示文案里说清楚了，配 Twikoo 后可全网可见）。

### GitHub 模式（切换）

- 切到这个 Tab 才**懒加载** Giscus 的 `client.js`，注入 iframe。
- 走 GitHub Discussions，自带登录、输入/预览、reactions、邮件通知。
- 用 `data-mapping="pathname"` 按路径映射讨论帖，每篇文章一个独立讨论。

两个模式共享同一个评论区容器，但数据完全隔离：游客评论在 localStorage，Giscus 评论在 GitHub。互不污染。

---

## 4. 技术实现

### 4.1 评论容器怎么挂上去

MkDocs Material 支持覆盖 `comments.html` partial。我在 `overrides/partials/comments.html` 里放了一个带 `data-*` 属性的空 div，把页面信息和全局配置都塞进去：

```html
{% if page and page.meta and page.meta.comments == false %}
{% else %}
  <h2 id="__comments">评论</h2>

  <div id="dn-comments" class="dn-comments-root"
    data-page-url="{{ page.url }}"
    data-page-title="{{ page.title }}"
    data-site-url="{{ config.site_url }}"
    data-twikoo-env="{{ config.extra.twikoo.env_id if config.extra.twikoo else '' }}"
    data-giscus-cat="{{ config.extra.giscus.category_id if config.extra.giscus else '' }}"
    data-giscus-category="{{ config.extra.giscus.category if config.extra.giscus else 'Announcements' }}"
  ></div>
{% endif %}
```

这样做的好处是：单篇文章在 frontmatter 写 `comments: false` 就能关掉评论；配置全部从 `mkdocs.yml` 的 `extra` 读，前端脚本只管读 `dataset`，不碰构建逻辑。

`mkdocs.yml` 里的配置长这样：

```yaml
extra:
  comments: true
  cusdis:
    host: https://cusdis.com
    app_id: ""
  twikoo:
    env_id: ""
  giscus:
    category: Announcements
    category_id: DIC_KWDORplaceholder
```

`cusdis` / `twikoo` / `giscus` 三个都留了位，当前只有 giscus 是激活态（占位 ID 还没换成真实的，但不影响界面渲染）。CDN 依赖在 `extra_javascript` 里引入：

```yaml
extra_css:
  - stylesheets/extra.css
  - https://gcore.jsdelivr.net/npm/easymde@2.18.0/dist/easymde.min.css

extra_javascript:
  - https://gcore.jsdelivr.net/npm/marked@12.0.2/marked.min.js
  - https://gcore.jsdelivr.net/npm/easymde@2.18.0/dist/easymde.min.js
  - javascripts/comments-widget.js
```

### 4.2 localStorage 当游客模式的「后端」

静态站没有后端，但游客评论总得有个地方落地。我的做法是**把 localStorage 当成一个 per-page 的迷你数据库**。每篇文章用 `pageUrl` 做命名空间，互不干扰：

```javascript
var localKey = "dn-cmt-md:" + pageUrl;
var draftKey = "dn-cmt-draft:" + pageUrl;

function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem(localKey) || "[]");
  } catch {
    return [];
  }
}
```

发布时把新评论插到数组最前（最新在前），并截断到 100 条，避免 localStorage 无限膨胀：

```javascript
function fallbackSave(entry) {
  var list = loadLocal();
  list.unshift(entry);
  localStorage.setItem(localKey, JSON.stringify(list.slice(0, 100)));
  renderList();
}
```

发布动作本身很轻：

```javascript
document.getElementById("dn-cmt-submit").addEventListener("click", function () {
  if (!mde) return;
  var content = (mde.value() || "").trim();
  var nick = (nickEl.value || "").trim() || "游客";
  if (!content) {
    showMsg("请输入评论内容。", true);
    return;
  }

  var entry = {
    nick: nick,
    content: content,
    time: new Date().toLocaleString("zh-CN"),
    role: "guest",
  };

  fallbackSave(entry);
  mde.value("");
  try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
  showMsg(/* …提示文案… */);
});
```

草稿自动保存挂在 CodeMirror 的 `change` 事件上，边写边存，昵称也一起存进去，下次回来能恢复：

```javascript
mde.codemirror.on("change", function () {
  try {
    localStorage.setItem(
      draftKey,
      JSON.stringify({ text: mde.value(), nick: nickEl.value })
    );
  } catch { /* ignore */ }
});
```

### 4.3 EasyMDE 编辑器集成

EasyMDE 是基于 CodeMirror 的 Markdown 编辑器，自带工具栏和预览。集成代码很直接，但工具栏的选项是反复调过的——既要有足够的格式按钮，又不能堆得太满挤到换行：

```javascript
mde = new EasyMDE({
  element: editorEl,
  autofocus: false,
  spellChecker: false,
  status: ["lines", "words", "cursor"],
  placeholder: "支持 Markdown：**粗体**、*斜体*、链接、列表、代码块…",
  initialValue: draft.text || "",
  minHeight: "140px",
  toolbar: [
    "bold", "italic", "heading", "|",
    "quote", "unordered-list", "ordered-list", "|",
    "link", "code", "table", "|",
    "preview", "side-by-side", "fullscreen", "|",
    "guide",
  ],
});
```

初始化做了点容错：EasyMDE 是通过 CDN 异步加载的，挂载时可能还没就绪，所以先试一次，没就绪就 `setTimeout` 重试：

```javascript
if (typeof EasyMDE !== "undefined") {
  initEditor();
} else {
  window.setTimeout(initEditor, 500);
}
```

### 4.4 Giscus iframe 嵌入与懒加载

Giscus 的接入方式是往容器里塞一个带一堆 `data-*` 属性的 `<script>`，它自己会创建 iframe。关键设计是**懒加载**——只有用户切到 GitHub Tab 才加载，避免每篇文章都白白请求 giscus.app：

```javascript
function loadGiscus(container, categoryId, category) {
  if (!container || container.dataset.loaded === "1") return;
  container.dataset.loaded = "1";
  container.classList.add("giscus");
  var s = document.createElement("script");
  s.src = "https://giscus.app/client.js";
  s.setAttribute("data-repo", "duniang818/wahaha");
  s.setAttribute("data-repo-id", "R_kgDORLy0LA");
  s.setAttribute("data-category", category || GISCUS_DEFAULTS.category);
  s.setAttribute("data-category-id", categoryId || GISCUS_DEFAULTS.categoryId);
  s.setAttribute("data-mapping", "pathname");
  s.setAttribute("data-strict", "0");
  s.setAttribute("data-reactions-enabled", "1");
  s.setAttribute("data-input-position", "top");
  s.setAttribute("data-theme", "preferred_color_scheme");
  s.setAttribute("data-lang", "zh-CN");
  s.crossOrigin = "anonymous";
  s.async = true;
  container.appendChild(s);
}
```

用 `dataset.loaded` 做幂等标记，切来切去也不会重复注入。Tab 切换逻辑里，切到 github 才触发加载：

```javascript
root.querySelectorAll(".dn-cmt-idtab").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var id = btn.getAttribute("data-id");
    root.querySelectorAll(".dn-cmt-idtab").forEach(function (b) {
      b.classList.toggle("on", b === btn);
    });
    guestPanel.classList.toggle("on", id === "guest");
    guestPanel.hidden = id !== "guest";
    githubPanel.classList.toggle("on", id === "github");
    githubPanel.hidden = id !== "github";
    if (id === "github") {
      activateGithubTab();   // 这里才懒加载 Giscus
    }
    if (id === "guest" && mde) {
      setTimeout(function () { mde.codemirror.refresh(); }, 80);
    }
  });
});
```

最后那个 `mde.codemirror.refresh()` 是踩坑后才加的，后面讲。

### 4.5 表情墙的交互设计

表情墙想做成 Giscus reactions 那种感觉：一排 emoji chip，每个带计数，点一下 +1，再点 -1，归零就消失。顶部一个笑脸按钮弹出 picker 选表情。

数据结构很简单，一个 `{ emoji: count }` 的对象，按 pageUrl 存：

```javascript
var REACTION_EMOJIS = ["👍", "❤️", "😄", "🎉", "😕", "🚀", "👀"];

function reactionKey(pageUrl) { return "dn-cmt-react:" + pageUrl; }

function loadReactions(pageUrl) {
  try { return JSON.parse(localStorage.getItem(reactionKey(pageUrl)) || "{}"); }
  catch { return {}; }
}
```

picker 的开合用了最朴素的 `hidden` 属性 + 一个 `pickerOpen` 状态变量。点笑脸切换，点 picker 里的 emoji 计数 +1 并关闭，点外部任意位置（document click）也关闭：

```javascript
if (addBtn && picker) {
  addBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    pickerOpen = !pickerOpen;
    picker.hidden = !pickerOpen;
  });
}

document.addEventListener("click", function () {
  if (pickerOpen) {
    pickerOpen = false;
    var picker = wrap.querySelector(".dn-cmt-react-picker");
    if (picker) picker.hidden = true;
  }
});

wrap.addEventListener("click", function (e) { e.stopPropagation(); });
```

chip 点击是「取消」语义——计数 -1，归零则从数据里删掉这条，让 UI 自动回收：

```javascript
wrap.querySelectorAll(".dn-cmt-react-chip").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var emoji = btn.getAttribute("data-emoji");
    var next = loadReactions(pageUrl);
    next[emoji] = Math.max(0, (Number(next[emoji]) || 0) - 1);
    if (!next[emoji]) delete next[emoji];
    saveReactions(pageUrl, next);
    render();
  });
});
```

`render()` 每次重画整个表情墙——数据量小，这种「全量重渲染」比 diff 简单可靠，不会出现状态对不上的鬼畜。

### 4.6 Markdown 渲染：marked.js + 兜底

评论正文要渲染成 HTML，选了 `marked.js`。但 CDN 可能加载失败，所以包了一层 try/catch + 降级：marked 不可用就退化为「转义 + 换行转 `<br>`」，保证至少能安全显示纯文本：

```javascript
function mdRender(src) {
  try {
    if (typeof marked !== "undefined") {
      return marked.parse(String(src || ""), { breaks: true, gfm: true });
    }
  } catch { /* ignore */ }
  return esc(src).replace(/\n/g, "<br>");
}
```

这里有个**安全细节必须强调**：marked 默认不转义 HTML，直接喂用户输入会有 XSS 风险。因为这是纯前端 localStorage 方案、数据都是自己浏览器里写的，风险可控；但一旦接 Twikoo 让评论全网可见，就必须在入库或渲染前做净化（DOMPurify 之类），否则别人写个 `<img onerror=...>` 就能打全场。这块我留了 TODO，接 Twikoo 前补。

---

## 5. 踩过的坑

### 坑 1：Markdown 解析器选哪个

最初想自己写个正则替换，写到一半发现要处理的东西太多：代码块里的 `*` 不能当粗体、列表嵌套、链接嵌套……很快就成了半残品。试了 `markdown-it` 和 `marked`，最后选 `marked`：

- 体积小，CDN 一个文件搞定。
- API 简单，`marked.parse(src, { breaks: true, gfm: true })` 一行出结果。
- `breaks: true` 让单换行也成 `<br>`，符合评论场景的书写习惯（回车就是换行，不是新段落）。

但 marked v12 是异步友好的（v5+ 的 parse 默认同步返回 string，没问题），早期版本有 callback 形式，文档翻了好几遍才确认当前用法。**坑点：一定看版本号对应的 API**，别照着旧博客抄。

### 坑 2：编辑器样式跟 Material 主题打架

EasyMDE 自带一套 CSS，跟 Material 的卡片/圆角/配色风格完全不对付：方角边框、默认白底、暗色模式下编辑区是亮白色，刺眼得要命。

得用 CSS 覆盖，而且要分别处理亮色和暗色（Material 用 `data-md-color-scheme="slate"` 标识暗色）：

```css
/* EasyMDE 适配 Material 主题 */
.dn-comments-root .EasyMDEContainer .CodeMirror {
  border-radius: 0.6rem;
  border-color: rgba(148, 163, 184, 0.35);
  background: transparent;
  color: var(--dn-ink);
  min-height: 140px;
}
.dn-comments-root .editor-toolbar {
  border-radius: 0.6rem 0.6rem 0 0;
  border-color: rgba(148, 163, 184, 0.35);
  background: var(--dn-card);
}
.dn-comments-root .editor-preview,
.dn-comments-root .editor-preview-side {
  background: var(--dn-card);
  color: var(--dn-ink);
}
[data-md-color-scheme="slate"] .dn-comments-root .EasyMDEContainer .CodeMirror {
  background: rgba(15, 23, 42, 0.35);
}
```

关键技巧：**用 `transparent` 让编辑器继承页面背景**，再用主题变量 `--dn-ink` / `--dn-card` 控制前景和卡片底色，这样一套规则自动跟着主题走。暗色模式单独给个半透明深色底，保证 CodeMirror 的光标和选区可见。

### 坑 3：iframe 高度自适应

Giscus 的 iframe 高度是它自己通过 `postMessage` 通知父页面调整的，理论上不用管。但实际有两个小坑：

1. **容器初始没高度**：iframe 加载前容器是空的，会给个 `min-height: 120px` 兜底，否则布局会塌一下，评论区猛地往上跳，体验很差。

```css
.dn-giscus-host {
  min-height: 120px;
}
.dn-giscus-host .giscus,
.dn-giscus-host .giscus-frame {
  width: 100%;
}
```

2. **iframe 跨域**：父页面拿不到 iframe 内部尺寸，只能信 Giscus 自己发的 message。所以别想着手动量高度，交给它就行。但要保证 `data-theme="preferred_color_scheme"` 跟站点主题一致，否则 iframe 里是亮色、外面是暗色，割裂感极强。

### 坑 4：Material instant 导航不重挂脚本

Material 有个 `navigation.instant` 特性，页面切换是 SPA 式的，**不会重新执行 `<script>`**。这意味着 `comments-widget.js` 在首屏挂一次后，跳到下一篇文章，评论区还是上一篇的——评论容器没人重新填充。

解法是订阅 MkDocs Material 的 `document$` 事件流，每次页面切换都重新 `mount`：

```javascript
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}

if (typeof document$ !== "undefined" && document$.subscribe) {
  document$.subscribe(mount);
}
```

同时 `mount()` 里用 `dataset.mounted` 做幂等，防止同一容器被重复挂载：

```javascript
function mount() {
  var root = document.getElementById("dn-comments");
  if (!root || root.dataset.mounted === "1") return;
  root.dataset.mounted = "1";
  // ...
}
```

这个坑藏得深，本地刷新调试完全复现不了，上线切文章才发现评论框是「死的」。**教训：涉及 SPA 导航的插件，一定订阅 `document$`，别只靠 `DOMContentLoaded`。**

### 坑 5：CodeMirror 在隐藏 Tab 里失真

这是坑 4 的姊妹坑。游客 Tab 切到 GitHub Tab 再切回来，编辑器里的文字会出现「不换行 / 光标位置错乱 / 高度塌陷」。原因是 CodeMirror 在 `display:none` 的容器里无法正确测量行高，切回来时它还以为自己那么宽。

得手动调 `refresh()`，而且要 **setTimeout 延迟一下**，等容器真正 display 出来再刷新：

```javascript
if (id === "guest" && mde) {
  setTimeout(function () { mde.codemirror.refresh(); }, 80);
}
```

80ms 是试出来的——太短（比如 0ms）容器还没完成布局，refresh 没用；太长用户能感觉到延迟。80ms 在我机器上刚好。

---

## 6. 最终效果

跑起来之后，文章底部是这样的：

- 默认停在**游客 Tab**：顶部一排表情 chip（没数据时显示「点击笑脸添加第一个表情」），下面是 EasyMDE 编辑器，工具栏齐全，再下面是昵称 + 发布按钮，最底下是评论列表。写完点发布，列表顶部立刻多一条，带「游客」徽章和时间。
- 点**GitHub 账号 Tab**：Giscus iframe 懒加载进来，自带登录框、输入/预览切换、reactions。切回游客 Tab，编辑器内容还在（草稿自动保存），光标位置正常。
- **暗色模式**下，编辑器、工具栏、预览区都跟着变暗，没有亮瞎眼的白底。
- 刷新页面，草稿和已发评论都还在（localStorage 持久化）。

整件事的妙处在于：**没花一分钱服务器、没部署任何后端，评论区就「看起来像那么回事」了。** 路过的访客零门槛互动，想正经讨论的切到 Giscus，两条路都通。

---

## 7. 小结与后续

这套双模式本质是个「折中」：用 localStorage 假装有个后端，换来零门槛；用 Giscus 兜住正式讨论。它不完美——游客评论不能跨设备、跨浏览器可见，这是 localStorage 的天然限制。但作为一个个人静态博客的评论方案，它在「互动门槛」和「维护成本」之间找到了我满意的平衡点。

后续要做的几件事：

1. **接 Twikoo 让游客评论全网可见**：`mkdocs.yml` 里 `twikoo.env_id` 填上就行，但接之前必须先上 DOMPurify 做 XSS 净化。
2. **替换 Giscus 占位 category_id**：当前是 `DIC_KWDORplaceholder`，换成真实的 Discussions category ID 后 GitHub 评论才会真正写入。
3. **评论导出/迁移**：localStorage 的数据考虑做个一键导出 JSON，方便以后迁到真后端。
4. **反垃圾**：游客模式目前完全没限制，接 Twikoo 后要加频率限制和敏感词过滤。

如果你也在折腾静态博客评论、又不想为评论专门养个后端，这个「双模式 + localStorage」的思路可以直接抄。完整代码在 `docs/javascripts/comments-widget.js`，样式在 `docs/stylesheets/extra.css`，配置说明在 `docs/tech/giscus-setup.md`。
