# 本机测试：飞书带图重新发布

## 前提

1. 飞书开放平台应用凭证（与 GitHub Actions 相同）：
   - `FEISHU_APP_ID`
   - `FEISHU_APP_SECRET`
2. 测试文档已**分享给该应用**（或应用有文档读取权限）
3. 应用权限包含 **`docs:document.media:download`**（下载文档内图片）

## 一键测试发布

PowerShell：

```powershell
$env:FEISHU_APP_ID="你的AppID"
$env:FEISHU_APP_SECRET="你的AppSecret"
npm run feiboxia:test-publish -- https://my.feishu.cn/docx/你的文档token
```

也可指定 slug：

```powershell
npm run feiboxia:test-publish -- https://my.feishu.cn/docx/OGj3dcxuxowNetxgQudc771znhr feishu-img-test
```

## 检查是否成功

1. 查看 `docs/blog/posts/<slug>.md` 正文是否有：
   ```markdown
   ![image](assets/<slug>/img-01.png)
   ```
2. 查看 `docs/blog/posts/assets/<slug>/` 目录是否有图片文件
3. 本地预览：
   ```bash
   npm run dev
   ```
4. 浏览器打开：`http://127.0.0.1:8000/wahaha/blog/posts/<slug>/`

## 常见问题

| 现象 | 原因 | 处理 |
|------|------|------|
| 正文无图片语法 | Blocks API 失败，走了纯文本兜底 | 检查应用权限、文档是否分享给应用 |
| 有语法但图片 404 | assets 目录未生成 | 看终端 `blocks:` / `图片镜像` 报错 |
| lark-cli 报错 | 本机未登录 lark-cli | 不影响，优先走 Blocks API |

## 与线上一致

测试满意后：

```bash
git add docs feiboxia/queue sync
git commit -m "docs: 测试发布带图文档"
git push
```

或在飞书文档内用飞博虾小组件触发发布（GitHub Actions 会跑同一套 `ci-doc-publish.mjs`）。
