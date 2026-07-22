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
