# 飞博虾

<div class="dn-hero" markdown="0">
  <h1>飞博虾</h1>
  <p>飞书写作台 + GitHub 发布台。无需自有公网。</p>
  <div class="dn-hero-actions">
    <a class="dn-btn dn-btn-primary" href="workbench.html">打开工作台</a>
    <a class="dn-btn dn-btn-ghost" href="https://my.feishu.cn/base/ADtHbOF0raWJj0stRApcfjjInLg" target="_blank" rel="noreferrer">打开台账</a>
  </div>
</div>

## 怎么用

1. **写作台**：在飞书云文档写随笔（编辑即预览）
2. **稿件箱**：台账登记文档链接、导航栏目、状态
3. **发布台**：本机执行一键发布，或打包队列交给 GitHub Actions

```powershell
cd D:\my-blog
npm run feiboxia:ship
```

## 相关页面

- [完整指南](../tech/feiboxia.md) — 从零搭建到日常发布的完整实操
- [访问统计](analytics-setup.md) — 不蒜子 PV 与可选 GA4
- [云文档小组件开发记](../blog/posts/feishu-docs-addon-dev.md) — 飞博虾小组件踩坑实录
