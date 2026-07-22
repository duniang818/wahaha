# 终端博客助手

```powershell
cd D:\my-blog
npm run blog
```

## 菜单能力

| 选项 | 功能 |
|------|------|
| 1 | 本地预览 `mkdocs serve` |
| 2 | 飞书文档 → 写入博客（可 `--push` 上线） |
| 3 | 本地文章 → 微信/小红书/CSDN/知乎 |
| 4 | 按标签批量发布（默认先 dry-run） |
| 5 | `mkdocs build` |
| 6 | git 提交并推送 |
| 7 | 列出文章 / 飞书绑定 |
| 8 | 修改默认路径、平台、标签 |
| 9 | 打开发布台 HTML 说明 |

直接回车即使用方括号里的**默认值**。默认项保存在本机 `sync/assistant-defaults.json`（不提交仓库）。
