# 博客访问统计说明

## 每篇博文自动统计（已启用）

仓库已接入 **不蒜子** 访问统计（国内可访问性更好）：

- 页脚显示「本站 PV」
- 文章正文底部显示「本文阅读」（本页 PV）
- 脚本加载失败时会显示「统计中」占位

脚本：`docs/javascripts/visitor-badge.js`  
样式：`docs/stylesheets/extra.css`

## （可选）Google Analytics 4

若还要在 Google 后台看路径报表：

1. 打开 [Google Analytics](https://analytics.google.com) 创建媒体资源，拿到 Measurement ID（`G-xxxxxxxx`）
2. 编辑 `mkdocs.yml`：

```yaml
extra:
  analytics:
    provider: google
    property: G-xxxxxxxx
```

3. 提交并等待 GitHub Pages 部署

当前仓库里若仍是 `G-XXXXXXXXXX` 占位，表示 GA4 未启用；**不影响**上面的每篇阅读量徽章。
