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
