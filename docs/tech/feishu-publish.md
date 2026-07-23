# 飞书写作 → 一键发布博客

## 为什么以前 2/3/4 不通？

| 功能 | 失败原因 |
|------|----------|
| 飞书 → 博客 | 本机 `lark-cli` **未配置应用**（`not_configured`），无法读文档 |
| 外站发布 | 微信缺 `.env` 凭证；小红书/CSDN/知乎官方无完整发文 API，只能导出 |

## 推荐工作流（飞书优先）

```text
飞书云文档写作
    ↓
（可选）飞书多维表格「渡娘博客台账」登记状态=待发博客
    ↓
本机 npm run blog → 一键写入 docs/ → git push → GitHub Pages
    ↓
（可选）导出小红书/CSDN/知乎文案；微信草稿需填公众号凭证
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

### 日常：单篇一键

在飞书写好文章后：

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

## 助手菜单（`npm run blog`）

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

## 外站说明（诚实预期）

- **小红书 / CSDN / 知乎**：导出到 `sync/out/` 并打开编辑页，需手动粘贴发布
- **微信**：在 `.env` 填 `WECHAT_APP_ID` / `WECHAT_APP_SECRET` 后可写入公众号草稿箱

## 相关文件

- `sync/feishu-to-blog.js` — 拉文档写 Markdown
- `sync/feishu-cms-init.js` / `feishu-cms-publish.js` — 台账
- `sync/feishu-map.json` — 文档 ↔ 本地文件绑定
- `sync/feishu-cms.json` — 台账 token（本机，不提交）
- `feiboxia/lib/post-manage.js` — 作者移动/改标签/删除
- `scripts/manage-post.mjs` — 本机 CLI
- `.github/workflows/feiboxia-doc-manage.yml` — 飞博虾触发 Actions

## 作者管理（仅作者可操作）

公开博客是静态站，**访客无法在网页上删改文章**。只有持有 GitHub PAT 的作者，才能通过 **飞书飞博虾小组件** 或 **本机命令** 管理博文。

| 操作 | 怎么做 | 飞书文档 | 本地仓库 | 线上博客 |
|------|--------|----------|----------|----------|
| **改正文** | 飞书编辑 → 飞博虾「重新发布」 | 源 | CI 写入 `docs/` | 自动部署 |
| **移动栏目** | 飞博虾选栏目 →「移动栏目/更新标签」 | 保留 | Actions commit | 约 1~5 分钟 |
| **改标签** | 同上（只改标签也可） | 保留 | 同上 | 同上 |
| **删除博文** | 飞博虾「删除博文」或本机 `post:delete` | **保留**（可再发布） | 删 md + 配图 | 下线 |

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

### 三端如何保持同步

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
