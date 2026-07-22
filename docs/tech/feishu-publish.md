# 飞书写作 → 一键发布博客

## 工作流

1. 在飞书云文档里写好文章  
2. 本机执行：

```powershell
# 首次
lark-cli auth login

# 拉到博客并推送到 GitHub Pages
npm run from-feishu -- "https://你的域名.feishu.cn/docx/文档TOKEN" --push
```

3. 打开 https://duniang818.github.io/wahaha/ 查看（Actions 完成后）

## 常用参数

| 参数 | 说明 |
|------|------|
| `--push` | git 提交并推送，触发线上更新 |
| `--slug 文件名` | 指定 `docs` 下文件名 |
| `--dir blog/posts` | 写入目录（相对 `docs/`） |
| `--also wechat,xhs` | 同步后再发外站 |
| `--private` | 写入私密内容（不建议 `--push` 公开） |
| `--tags 旅行,随笔` | 自定义标签 |
| `--list` | 查看已绑定的飞书文档 |

## 说明

- 文档与本地文件映射保存在 `sync/feishu-map.json`
- 再次对同一飞书文档执行命令会**覆盖**对应本地 Markdown（适合改完再发）
- 博客公开站仍只读；发布能力仅作者本机
