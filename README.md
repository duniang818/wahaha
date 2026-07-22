# 我的空间（旧博客）

线上地址：https://duniang818.github.io/superset-fork/  
仓库：https://github.com/duniang818/superset-fork（源码在 **private** 分支，站点在 **gh-pages**）

## 本地预览

```bash
cd D:\my-blog
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
mkdocs serve
```

浏览器打开：http://127.0.0.1:8000/ （路径与线上 `/superset-fork/` 内容一致）

## 写作与发布

1. 编辑 `docs/**/*.md`
2. `mkdocs serve` 本地确认
3. 提交并推送到 `private`（或你的写作分支）
4. 构建并发布到 `gh-pages`：

```bash
mkdocs build
# 将 site/ 内容部署到 gh-pages 分支根目录
```

或使用 GitHub Actions（见仓库内原有工作流）。
