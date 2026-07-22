# 渡娘的空间

本地唯一工程目录：`D:\my-blog`  
线上唯一入口：https://duniang818.github.io/

## 本地预览

```powershell
cd D:\my-blog
.\.venv\Scripts\Activate.ps1
mkdocs serve
# http://127.0.0.1:8000/
```

## 写文章 / 改资料

| 分区 | 路径 |
|------|------|
| 教育 | `docs/education/` |
| 旅行 | `docs/travel/` |
| 技术 | `docs/tech/`、`docs/tools/`、`docs/analysis/` |
| 生活随笔 | `docs/life/`、`docs/blog/posts/` |

从旧 React 资料站重新导入数据：

```powershell
node scripts/migrate-from-githubio.mjs
```

## 发布

```powershell
git add .
git commit -m "docs: update"
git push origin main
```

GitHub Actions 自动构建并发布到用户站根域名。  
仓库 Settings → Pages → Source 选 **GitHub Actions**。

## 与旧目录关系

- `D:\githubio\legacy`：原始 React 数据源（可归档，不必再部署）
- `D:\githubio\portal`：曾作临时入口；现由本站首页取代
