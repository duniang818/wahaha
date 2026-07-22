# 飞博虾

飞书写作台 + GitHub 发布台。**不依赖自有公网。**

## 文档内飞博虾（云文档小组件）

飞书文档 → `+` 或 `/` → 搜索「飞博虾」→ 插入块 → **发布到博客**（自动写台账）。

配置与上传：见 [docs-addon/README.md](./docs-addon/README.md)。

## 推荐路径

```powershell
# 1. 飞书写文档 + 台账标「待发博客」或「立即发布」
# 2. 本机一键发布
cd D:\my-blog
npm run feiboxia:ship
```

工作台（部署后）：https://duniang818.github.io/wahaha/feiboxia/workbench.html

## 架构（借用飞书 + GitHub）

```text
飞书 Docx（写/预览） + Base 台账（稿件箱）
        │
        ▼ 本机 feiboxia:ship
   pack → docs/ → git push → GitHub Pages
        │
        └─ 或 pack 后仅 push queue/ → Actions 应用
```

飞书云端自动化若指向 localhost 会失败；本方案用「本机发布台 / Actions 队列」代替公网 webhook。

## 命令

| 命令 | 作用 |
|------|------|
| `feiboxia:ship` | 打包+写入+推送（日常） |
| `feiboxia:pack` | 只打包队列 |
| `feiboxia:apply` | 只应用队列 |
| `blog` | 终端菜单 |

市场上架材料见 [MARKETPLACE.md](./MARKETPLACE.md)。
