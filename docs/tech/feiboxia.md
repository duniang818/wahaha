# 飞博虾

飞书里写、GitHub 上发。**不需要自有公网。**

## 产品结构

| 台 | 在哪 | 干什么 |
|----|------|--------|
| 写作台 | 飞书云文档 | 编辑与预览 |
| 稿件箱 | 飞书多维表格台账 | 栏目、定时、状态 |
| 工作台壳 | [GitHub Pages 工作台](../feiboxia/workbench.html) | 一个入口串起写作/发布 |
| 发布台 | 本机 `feiboxia:ship` 或 GitHub Actions | 落到博客 `docs/` 导航目录 |

## 无公网发布链路

```text
飞书文档 + 台账（待发 / 立即发布）
        │
        ▼  本机（已登录飞书）
 npm run feiboxia:ship
   = pack（拉文档入 queue）
   + apply（写入 docs/）
   + git push
        │
        ▼
 GitHub Pages 自动部署博客
```

备用：只 `feiboxia:pack` 后 push 队列，由 Actions「飞博虾发布台」应用。

## 命令

| 命令 | 说明 |
|------|------|
| `npm run feiboxia:ship` | 本机一键发布（推荐） |
| `npm run feiboxia:pack` | 仅打包到 `feiboxia/queue/` |
| `npm run feiboxia:apply` | 仅把队列写入 `docs/` |
| `npm run feiboxia` | 本机绑定页服务（可选） |
| `npm run blog` | 终端菜单 |

## 飞书应用主页

开放平台「网页应用」主页可填：

`https://duniang818.github.io/wahaha/feiboxia/workbench.html`

安装后从工作台打开即进入飞博虾。

## 外站

GitHub 博客为全自动写入；微信/小红书等仍为备稿导出（见外站脚本），不阻塞主链路。
