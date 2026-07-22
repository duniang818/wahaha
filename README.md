# 渡娘的空间

本地：`D:\my-blog`  
线上：https://duniang818.github.io/wahaha/

## 本地预览

```powershell
cd D:\my-blog
.\.venv\Scripts\Activate.ps1
npm run dev
# http://127.0.0.1:8000/
```

## 博客助手（推荐）

一条命令打开菜单，按提示选择即可：

```powershell
cd D:\my-blog
npm run blog
```

可做：本地预览、飞书→博客、发外站、批量发布、构建、git 推送、改默认参数。

## 飞书写作 → 一键上博客

```powershell
lark-cli auth login
npm run from-feishu -- "https://xxx.feishu.cn/docx/TOKEN" --push
# 同时发微信/小红书等：
npm run from-feishu -- "URL" --push --also wechat,xhs,csdn,zhihu
```

详见 [飞书一键发布](docs/tech/feishu-publish.md)。

## 作者一键发布（仅本机 L1）

```powershell
copy .env.example .env   # 填微信等凭证
npm run desk             # 打开发布台说明页
npm run publish:one -- welcome --to wechat,xhs,csdn,zhihu --dry-run
npm run publish:batch -- --tag 旅行 --to xhs --dry-run
```

权限：`docs/private/` 与 `visibility: private` 禁止外发；访客只能浏览公开站并评论。

## 推送上线

```powershell
git add .
git commit -m "docs: update"
git push origin main
```

## Giscus

见 [评论配置](docs/tech/giscus-setup.md)：需先在仓库启用 Discussions。
