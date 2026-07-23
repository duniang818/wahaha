---
title: "用飞书写作 + GitHub Pages 建个人博客（可复制实操）"
author: 渡娘
date: 2026-07-22
visibility: public
draft: false
feishu_doc: NvC5dYXOco8X28xnCbScFQXnnng
feishu_url: "https://my.feishu.cn/docx/NvC5dYXOco8X28xnCbScFQXnnng"
tags:
  - 博客
  - 飞博虾
description: "不买服务器、不租公网：飞书里写文章，GitHub 托管博客。本文给出可直接照做的步骤与命令。"
nav: 博客
---

如果你也想要「在飞书写随笔，点一下就出现在自己的博客站点」，又**不想自己架公网服务器**，可以用这套组合：

- **飞书**：写作台（编辑 + 预览）+ 台账（稿件管理）
- **GitHub**：代码仓库 + Pages 托管 + Actions 自动部署
- **本机一小步**：把飞书稿同步进仓库（`feiboxia:ship`）

下面是一篇**可复制实操**说明。你照着做，就能搭出同款结构。

## 1. 目标长什么样

```text
飞书云文档（随便写）
    ↓ 台账登记「待发」
本机：npm run feiboxia:ship
    ↓
GitHub 仓库 docs/ 里的 Markdown
    ↓ Actions 构建
https://你的用户名.github.io/仓库名/
```

读者访问的是 GitHub Pages；你写作时几乎只待在飞书里。

## 2. 准备两个账号能力

1. **GitHub**：能建仓库、开 GitHub Pages  
2. **飞书**：能建云文档、多维表格（台账）

本机需要：

- Node.js（跑发布脚本）
- Git
- Python（若用 MkDocs；可用 venv）
- [lark-cli](https://github.com/larksuite/cli)（拉飞书文档）

## 3. 建博客仓库（GitHub）

### 3.1 创建仓库

例如仓库名：`wahaha`（或你的名字）。公开仓库即可。

### 3.2 用 MkDocs Material 初始化（推荐）

在本机：

```powershell
mkdir my-blog
cd my-blog
git init
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install mkdocs-material
mkdocs new .
```

改 `mkdocs.yml` 里至少这些：

```yaml
site_name: 你的站点名
site_url: https://你的用户名.github.io/仓库名/
repo_url: https://github.com/你的用户名/仓库名
theme:
  name: material
  language: zh
```

内容放在 `docs/`：导航栏目可以是 `blog/posts`、`tech`、`life` 等文件夹。

### 3.3 打开 GitHub Pages

仓库 → **Settings → Pages**：

- Source 选 **GitHub Actions**（推荐），或部署 `gh-pages` 分支  

本仓库使用 Actions：push 到 `main` 后自动 `mkdocs build` 并发布。

推送：

```powershell
git remote add origin https://github.com/你的用户名/仓库名.git
git add .
git commit -m "chore: init mkdocs blog"
git push -u origin main
```

几分钟后打开：

`https://你的用户名.github.io/仓库名/`

## 4. 接通飞书（写作台）

### 4.1 安装并登录 lark-cli

```powershell
npm i -g @larksuite/cli
lark-cli config init --new --lang zh
lark-cli auth login --domain docs
lark-cli auth login --domain base
```

按提示在浏览器完成应用配置与授权。

### 4.2 建「稿件台账」（多维表格）

建议字段：

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

在飞书写好一篇文档 → 台账新行粘贴链接 → 状态设为 **待发博客**。

## 5. 本机发布台（无公网关键一步）

飞书云端**访问不了**你家电脑，所以「真正写入 GitHub」放在本机完成：

```powershell
cd 你的博客目录
npm run feiboxia:ship
```

它会：

1. 读取台账里「待发 / 立即发布」的稿  
2. 拉取飞书文档 → 生成 Markdown  
3. 写入对应 `docs/导航栏目/`  
4. `git commit` + `git push`  
5. 触发 Pages 部署  

没有飞博虾脚本时，最小替代是：手动把飞书内容复制成 `docs/blog/posts/xxx.md`，再 `git push`——思路相同。

## 6. 一篇文章的完整Checklist（可复制）

```text
□ 飞书新建云文档，写好标题与正文
□ 台账新增一行，粘贴文档 URL
□ 选择导航栏目（例如 blog/posts）
□ 状态 = 待发博客（或一键操作 = 立即发布）
□ 本机执行：npm run feiboxia:ship
□ 打开 GitHub Actions 看部署是否成功
□ 打开站点对应栏目确认上线
```

## 7. 工作台入口（可选）

部署后可以做一页「工作台」汇总链接（写作说明、台账、发布命令），例如：

`https://你的用户名.github.io/仓库名/feiboxia/`

飞书开放平台若做网页应用，**主页就填这个地址**——打开飞书工作台就能进「写作台 / 发布台」说明页。

## 8. 常见问题

**Q：能不能完全不碰电脑？**  
A：写作可以只在飞书；发布至少要本机执行一次同步（或用 GitHub Actions + 预先打包的队列）。没有自有公网时，这是最稳的折中。

**Q：微信 / 小红书也能一键吗？**  
A：GitHub 博客可以全自动写入。微信需公众号凭证进草稿箱；小红书等多为导出备稿。先把「飞书 → 博客」跑通，再加外站。

**Q：私密内容怎么办？**  
A：不要推进公开仓库；或放在构建时排除的目录（例如 `docs/private/`）。

## 9. 你可以直接抄的目录结构

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

**一句话总结**：飞书负责写得舒服，GitHub 负责站得住；本机只负责把两者接上。  

这篇文章本身就是用该流程发布的示例——你可以改标题、换栏目，复用同一条命令再发下一篇。
