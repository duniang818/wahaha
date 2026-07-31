---
title: 飞博虾：飞书写作 + GitHub 发布
author: 渡娘
date: 2026-07-24
nav: 技术
tags:
  - 技术
  - 飞书
  - 飞博虾
  - 建站
  - 部署
description: "飞书里写、GitHub 上发，不需要自有公网。从搭建博客仓库到一键发布的完整实操指南。"
---

飞书里写、GitHub 上发。**不需要自有公网。**

---

## 产品结构

| 台 | 在哪 | 干什么 |
|----|------|--------|
| 写作台 | 飞书云文档 | 编辑与预览 |
| 稿件箱 | 飞书多维表格台账 | 栏目、定时、状态 |
| 工作台壳 | [GitHub Pages 工作台](../feiboxia/workbench.html) | 一个入口串起写作/发布 |
| 发布台 | 本机 `feiboxia:ship` 或 GitHub Actions | 落到博客 `docs/` 导航目录 |

### 无公网发布链路

```text
飞书文档 + 台账（待发 / 立即发布）
        │
        ▼  本机（已登录飞书）
 npm run feiboxia:ship
   = pack（拉文档入 queue）
   + apply（写入 docs/）
   + git push
        │
        ▼
 GitHub Pages 自动部署博客
```

备用：只 `feiboxia:pack` 后 push 队列，由 Actions「飞博虾发布台」应用。

---

## 从零搭建（可复制实操）

如果你也想要「在飞书写随笔，点一下就出现在自己的博客站点」，又**不想自己架公网服务器**，照以下步骤做。

### 1. 准备账号

1. **GitHub**：能建仓库、开 GitHub Pages
2. **飞书**：能建云文档、多维表格（台账）

本机需要：Node.js、Git、Python（MkDocs）、[lark-cli](https://github.com/larksuite/cli)

### 2. 建博客仓库

```powershell
mkdir my-blog
cd my-blog
git init
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install mkdocs-material
mkdocs new .
```

改 `mkdocs.yml` 至少这些：

```yaml
site_name: 你的站点名
site_url: https://你的用户名.github.io/仓库名/
repo_url: https://github.com/你的用户名/仓库名
theme:
  name: material
  language: zh
```

### 3. 打开 GitHub Pages

仓库 → **Settings → Pages**：Source 选 **GitHub Actions**。

```powershell
git remote add origin https://github.com/你的用户名/仓库名.git
git add .
git commit -m "chore: init mkdocs blog"
git push -u origin main
```

几分钟后打开 `https://你的用户名.github.io/仓库名/`

### 4. 接通飞书（写作台）

```powershell
npm i -g @larksuite/cli
lark-cli config init --new --lang zh
lark-cli auth login --domain docs
lark-cli auth login --domain base
```

建「稿件台账」（多维表格），建议字段：

| 字段 | 用途 |
|------|------|
| 标题 | 文章标题 |
| 飞书文档 | 文档链接 |
| slug | 文件名（可空，自动生成） |
| 导航栏目 | 如 `blog/posts` / `tech` |
| 状态 | 草稿 / 待发博客 / 已发博客 |
| 一键操作 | （无）/ 立即发布 |
| 定时发布时间 | 可选 |
| 发布结果 | 回写说明 |

### 5. 目录结构参考

```text
my-blog/
  docs/
    index.md
    blog/posts/          ← 随笔
    tech/                ← 技术
    feiboxia/            ← 工作台说明页（可选）
  feiboxia/              ← 发布脚本（可选）
  mkdocs.yml
  .github/workflows/deploy.yml
```

---

## 日常发布工作流

```text
飞书云文档写作
    ↓
（可选）飞书多维表格「渡娘博客台账」登记状态=待发博客
    ↓
本机 npm run blog → 一键写入 docs/ → git push → GitHub Pages
    ↓
（可选）导出小红书/CSDN/知乎文案；微信草稿需填公众号凭证
```

### 终端助手菜单（`npm run blog`）

| 键 | 功能 |
|----|------|
| S | 飞书首次配置 / 登录 |
| 1 | 飞书 URL → 博客（可 push） |
| 2 | 创建飞书博客台账 Base |
| 3 | 从台账「待发博客」一键发布 |
| 4 | 重新同步已绑定文档 |
| 5 | 本地预览 |
| 6 | 外站导出（需知限制） |
| 7 | 构建 / git 推送 |
| 8 | 列表 |
| 9 | 默认参数 |

### 日常：单篇一键

```powershell
cd D:\my-blog
npm run blog
# 选 1 → 粘贴飞书文档链接 → 回车用默认 → 确认 push
```

或命令行：

```powershell
npm run from-feishu -- "https://xxx.feishu.cn/docx/TOKEN" --push
```

### 日常：台账管理全部文章

```powershell
npm run blog   # 选 2 创建「渡娘博客台账」
# 在飞书台账新增行：飞书文档链接 + 状态=待发博客
npm run blog   # 选 3 从台账一键发布
```

### 第一次（只要做一次）

1. 打开配置页完成应用创建（浏览器扫码/授权）：

```text
https://open.feishu.cn/page/cli?user_code=9TMR-FREE&lpv=1.0.52&ocv=1.0.52&from=cli
```

或终端执行：`lark-cli config init --new --lang zh`

2. 用户登录文档与台账权限：

```powershell
lark-cli auth login --domain docs
lark-cli auth login --domain base
```

3. 检查：

```powershell
cd D:\my-blog
npm run feishu:check
```

### 一篇文章完整 Checklist

```text
□ 飞书新建云文档，写好标题与正文
□ 台账新增一行，粘贴文档 URL
□ 选择导航栏目（例如 blog/posts）
□ 状态 = 待发博客（或一键操作 = 立即发布）
□ 本机执行：npm run feiboxia:ship
□ 打开 GitHub Actions 看部署是否成功
□ 打开站点对应栏目确认上线
```

---

## 带图发布

飞书文档内图片会自动下载到 `docs/blog/posts/assets/<slug>/` 并转为 Markdown 语法。

### 前提

1. 飞书开放平台应用凭证（与 GitHub Actions 相同）：`FEISHU_APP_ID` / `FEISHU_APP_SECRET`
2. 测试文档已**分享给该应用**
3. 应用权限包含 **`docs:document.media:download`**

### 测试发布

```powershell
$env:FEISHU_APP_ID="你的AppID"
$env:FEISHU_APP_SECRET="你的AppSecret"
npm run feiboxia:test-publish -- https://my.feishu.cn/docx/你的文档token
```

### 常见问题

| 现象 | 原因 | 处理 |
|------|------|------|
| 正文无图片语法 | Blocks API 失败，走了纯文本兜底 | 检查应用权限、文档是否分享给应用 |
| 有语法但图片 404 | assets 目录未生成 | 看终端 `blocks:` / `图片镜像` 报错 |
| lark-cli 报错 | 本机未登录 lark-cli | 不影响，优先走 Blocks API |

---

## 命令速查

| 命令 | 说明 |
|------|------|
| `npm run feiboxia:ship` | 本机一键发布（推荐） |
| `npm run feiboxia:pack` | 仅打包到 `feiboxia/queue/` |
| `npm run feiboxia:apply` | 仅把队列写入 `docs/` |
| `npm run feiboxia` | 本机绑定页服务（可选） |
| `npm run blog` | 终端菜单 |

---

## 作者管理（仅作者可操作）

公开博客是静态站，**访客无法在网页上删改文章**。只有持有 GitHub PAT 的作者，才能管理博文。

| 操作 | 怎么做 | 飞书文档 | 本地仓库 | 线上博客 |
|------|--------|----------|----------|----------|
| **改正文** | 飞书编辑 → 飞博虾「重新发布」 | 源 | CI 写入 `docs/` | 自动部署 |
| **移动栏目** | 飞博虾选栏目 →「移动栏目/更新标签」 | 保留 | Actions commit | 约 1~5 分钟 |
| **改标签** | 同上（只改标签也可） | 保留 | 同上 | 同上 |
| **删除博文** | 飞博虾「删除博文」或本机 `post:delete` | **保留** | 删 md + 配图 | 下线 |

### 飞书飞博虾（推荐）

1. 在飞书文档侧边栏打开飞博虾，设置里填 GitHub 仓库与 PAT（需 `repo` + `workflow` 权限）。
2. 文章已发布后，展开「作者管理」：
   - **移动栏目/更新标签**：按当前选择的栏目与标签更新 frontmatter，并移动 `docs/` 下文件。
   - **删除博文**：从博客移除，飞书原文不动。
3. 触发 [飞博虾·博文管理](https://github.com/duniang818/wahaha/actions/workflows/feiboxia-doc-manage.yml) workflow，成功后自动 commit + push。

### 本机 CLI

```powershell
cd D:\my-blog
npm run post:list
npm run post:move -- feishu-oneclick-test --nav travel --tags 旅行,测试
npm run post:tags -- feishu-oneclick-test --tags 博客,飞书
npm run post:delete -- feishu-oneclick-test
# 加 --push 可本地 commit + push（不经过飞书）
```

### 三端同步

```text
                    ┌─────────────┐
                    │  飞书文档    │  ← 正文唯一编辑源
                    └──────┬──────┘
                           │ 发布 / 重新发布
                           ▼
┌──────────┐    pull     ┌─────────────┐    push    ┌──────────────┐
│ 本机仓库  │ ◄────────── │ GitHub 仓库  │ ─────────► │ GitHub Pages │
└──────────┘             └─────────────┘            └──────────────┘
      ▲                         ▲
      │  post:* --push          │ 飞博虾 dispatch / CI
      └─────────────────────────┘
```

- **本机 ↔ GitHub**：飞博虾或 CI 改完后，本机执行 `git pull`；本机 `--push` 后远程即最新。
- **飞书 ↔ 博客正文**：始终通过「发布 / 重新发布」同步；移动/删标签/删除不改正文。
- **删除后再发**：同一飞书文档可再次「发布」，按 `sync/feishu-map.json` 绑定同一 slug 或新建。

---

## 晚间自动重试 + 飞书通知

文档内飞博虾点击「发送 / 重新发送」后，若 CI 未能写入正文（网络、文档未分享给应用等），会自动加入 **晚间重试队列**，在北京时间 **21:00** 再执行一次。

- 重试 **成功或失败** 都会给作者发一条飞书私聊
- 若仍失败，会安排 **下一晚 21:00** 继续重试，直至成功
- 队列文件：`sync/publish-retry-queue.json`

### 配置（GitHub Secrets）

| Secret | 说明 |
|--------|------|
| `FEISHU_NOTIFY_OPEN_ID` | 接收通知的飞书用户 open_id |

获取 open_id：`lark-cli contact resolve --name "你的姓名"`

可选环境变量 `FEIBOXIA_RETRY_HOUR`（默认 `21`）可调整重试小时。

---

## 外站导出（诚实预期）

- **小红书 / CSDN / 知乎**：导出到 `sync/out/` 并打开编辑页，需手动粘贴发布
- **微信**：在 `.env` 填 `WECHAT_APP_ID` / `WECHAT_APP_SECRET` 后可写入公众号草稿箱

---

## Markdown → 飞书正文（可编辑）

在飞书文档侧边栏飞博虾展开 **「导入 Markdown → 飞书正文」**：

| 模式 | 说明 |
|------|------|
| 覆盖当前文档 | 用 .md 替换本篇正文，飞书里直接改 |
| 追加到文末 | 在现有内容后追加 |
| 新建飞书文档 | 在云空间新建 docx（非附件） |

需 GitHub PAT（`workflow` 权限）触发 Actions；应用需有文档 **编辑** 权限。

---

## 文档内嵌入（云文档小组件）

在飞书文档按 `+` / `/` 插入 **飞博虾**，可对**当前文档**一键写入台账并触发博客发布。

开发记录见博文：[从零开发飞书云文档小组件：飞博虾踩坑实录](../blog/posts/feishu-docs-addon-dev.md)

---

## 相关文件

| 文件 | 说明 |
|------|------|
| `sync/feishu-to-blog.js` | 拉文档写 Markdown |
| `sync/feishu-cms-init.js` / `feishu-cms-publish.js` | 台账管理 |
| `sync/feishu-map.json` | 文档 ↔ 本地文件绑定 |
| `sync/feishu-cms.json` | 台账 token（本机，不提交） |
| `feiboxia/lib/post-manage.js` | 作者移动/改标签/删除 |
| `scripts/manage-post.mjs` | 本机 CLI |
| `.github/workflows/feiboxia-doc-manage.yml` | 飞博虾触发 Actions |
| `sync/publish-retry-queue.json` | 发布失败晚间重试队列 |
| `.github/workflows/feiboxia-doc-retry.yml` | 每晚 21:00 自动重试 |

---

## 关于「国内加速」与 git push

博客站的国内加速（`fonts.loli.net`、`gcore.jsdelivr.net`）只加快 **访客打开 Pages 时** 加载字体/评论编辑器脚本，与 **git push 到 github.com** 无关。Push 走 Git 协议直连 GitHub，在国内仍可能超时，可尝试：VPN/代理、`git config http.proxy …`、或换网络时段重试。

---

## FAQ

**Q：能不能完全不碰电脑？**
A：写作可以只在飞书；发布至少要本机执行一次同步（或用 GitHub Actions + 预先打包的队列）。没有自有公网时，这是最稳的折中。

**Q：微信 / 小红书也能一键吗？**
A：GitHub 博客可以全自动写入。微信需公众号凭证进草稿箱；小红书等多为导出备稿。先把「飞书 → 博客」跑通，再加外站。

**Q：私密内容怎么办？**
A：不要推进公开仓库；或放在构建时排除的目录（例如 `docs/private/`）。

**Q：飞书应用主页填什么？**
A：`https://duniang818.github.io/wahaha/feiboxia/workbench.html`

---

**一句话总结**：飞书负责写得舒服，GitHub 负责站得住；本机只负责把两者接上。
