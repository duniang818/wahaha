# 访问统计配置说明

本博客已集成 **Google Analytics 4（GA4）** 用于统计站点总访问量和每篇文章的访问量。

## 1. 获取 GA4 媒体资源 ID

1. 打开 [Google Analytics](https://analytics.google.com)，登录 Google 账号。
2. 进入「管理」→「创建」→「媒体资源」，选择 **GA4**。
3. 按提示填写网站名称、网址（如 `https://duniang818.github.io/wahaha/`）等信息。
4. 创建完成后，在媒体资源设置里找到 **Measurement ID**，格式为 `G-XXXXXXXXXX`。

## 2. 替换 mkdocs.yml 中的占位 ID

打开仓库根目录的 `mkdocs.yml`，找到如下配置：

```yaml
extra:
  analytics:
    provider: google
    property: G-XXXXXXXXXX
```

将 `G-XXXXXXXXXX` 替换为你在 GA4 后台复制的真实 Measurement ID，例如 `G-ABCDEF1234`。

## 3. 重新部署并查看数据

保存修改后，推送到 GitHub：

```bash
git add mkdocs.yml
git commit -m "chore: 更新 GA4 Measurement ID"
git push origin main
```

GitHub Actions 会自动构建并部署到 GitHub Pages。部署完成后，博客所有页面都会自动上报访问数据。

几分钟后即可在 GA4 后台查看：

- **总访问量**：查看「流量获取」或「实时」报告。
- **每篇文章访问量**：查看「页面和屏幕」报告，路径对应 `/blog/posts/...` 或对应文章标题。

## 4. 页面底部可见徽章（可选）

本仓库还附带了一个简单的页面底部访问计数徽章，脚本位于 `docs/javascripts/visitor-badge.js`。

它会在页脚显示一个累计访问次数的小徽章，使用的是第三方免费服务 [hits.seeyoufarm.com](https://hits.seeyoufarm.com)。如果你不需要该徽章，可以在 `mkdocs.yml` 中删除以下行：

```yaml
extra_javascript:
  - javascripts/visitor-badge.js
```

然后删除 `docs/javascripts/visitor-badge.js` 文件即可。
