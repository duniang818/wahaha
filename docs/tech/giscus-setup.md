# 评论配置

## 界面说明

文章底部评论区**默认展示**：

- **游客**（默认）：顶部表情墙 + Markdown 富文本编辑器 + 昵称 + 发布
- **GitHub 账号**：切换到 Giscus（含表情墙、输入/预览、GitHub 登录），与线上一致

无需先注册第三方服务即可在本地看到完整评论框。

---

## GitHub 登录评论（Giscus）

1. 仓库开启 **Discussions**
2. 打开 [giscus.app/zh-CN](https://giscus.app/zh-CN)，选择仓库 `duniang818/wahaha`，复制真实的 `category_id`
3. 填入 `mkdocs.yml`（当前为占位值，需替换为真实 ID 后 GitHub 评论才会同步）：

```yaml
extra:
  giscus:
    category: Announcements
    category_id: DIC_xxxxxx   # 替换占位值
```

未替换占位值时，Giscus 界面仍会显示，但评论可能无法写入 Discussions。

---

## 让游客评论全网可见（Twikoo，可选）

```yaml
extra:
  twikoo:
    env_id: 你的envId
```

配置见 [Twikoo 文档](https://twikoo.js.org)。未配置时游客评论仅保存在本浏览器。
