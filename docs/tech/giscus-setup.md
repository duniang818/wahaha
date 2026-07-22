# Giscus 评论配置

仓库：`duniang818/wahaha`（`data-repo-id` 已写入 `overrides/partials/comments.html`）

## 一次性设置

1. GitHub 仓库 → **Settings → General → Features** → 勾选 **Discussions**
2. 打开 https://giscus.app/zh-CN
3. 仓库填 `duniang818/wahaha`，页面 ↔️ Discussions 映射选 **pathname**
4. 复制生成的 `data-category` 与 `data-category-id`
5. 替换 `overrides/partials/comments.html` 中对应属性后推送

未完成第 1–5 步时，评论区可能空白，不影响正文浏览。
