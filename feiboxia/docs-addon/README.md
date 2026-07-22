# 飞博虾 · 云文档小组件

让「飞博虾」可以插入任意飞书云文档（`+` / `/` 搜索），在文档内一键：

1. **写入博客文章台账**
2. **触发发布到 GitHub 博客**（经 GitHub Actions，无需自有公网）

## 你需要完成的一次性后台配置

### 1. 开放平台开启「云文档小组件」

1. 打开 [飞书开放平台](https://open.feishu.cn/app) → 应用 `cli_aaac9ff9eae4dbfc`（或你的飞博虾应用）
2. **添加应用能力** → 勾选 **云文档小组件**
3. 创建小组件后，复制 **BlockTypeID**（形如 `blk_xxxx`）
4. 把 `feiboxia/docs-addon/app.json` 里的：

```json
"blockTypeID": "REPLACE_WITH_BLOCK_TYPE_ID"
```

改成真实 ID。

5. **权限**：确保应用有多维表格读写、云文档读权限；把「渡娘博客台账」与常用文档 **分享给该应用**（或至少应用身份可写台账）。

6. **安全域名 / 上传**：按控制台「云文档小组件」指引配置；开发调试可用 `npm start`。

### 2. GitHub Secrets（写台账 + 可选拉正文）

仓库 Settings → Secrets：

| Secret | 说明 |
|--------|------|
| `FEISHU_APP_ID` | 开放平台 App ID |
| `FEISHU_APP_SECRET` | App Secret |

### 3. 构建并上传小组件

```powershell
cd D:\my-blog\feiboxia\docs-addon
npm i
# 确认 app.json 已填 blockTypeID
opdev login          # 若已登录会提示 Already login，属正常
npm run upload       # 内部：build 生成 project.config.json 后再 upload
```

上传成功后控制台会提示打开：

`https://open.feishu.cn/app/cli_aaac9ff9eae4dbfc/blocks/`

在后台为小组件填图标/名称「飞博虾」，再 **创建版本并发布**。

#### 常见报错

| 现象 | 原因 | 处理 |
|------|------|------|
| `Not allowed to upload` | 上传的是空 dist / 缺配置，被当成非法小程序包 | 用当前 `npm run upload`（会生成 `project.config.json`） |
| `project.config.json is not found` | 自定义 webpack 未接官方插件 | 已用 `docsAddonWebpackPlugin` 修复 |
| `opdev login` 卡住或报错 | 浏览器授权未完成 / 网络 | 再跑一次；成功时会显示 `Already login` |
| 个人版限制 | 极少数能力需企业租户 | 你当前账号已能上传成功则无妨 |

### 4. 在文档里添加

打开任意云文档 → 输入 `/` 或点 `+` → 搜索 **飞博虾** → 插入。

## 发布 / 重新发布 / 撤销

小组件「发布」页：

1. 选择动作：**发布** / **重新发布** / **撤销发布**
2. 勾选平台：GitHub 博客（自动）、微信 / 小红书 / CSDN / 知乎（备稿或撤销清单）
3. 若某外站尚未填写对接备忘，会提示并跳到「设置 → 对接平台」

撤销时：博客由 Actions 将博文标为 `draft: true`；外站生成可复制的撤销清单（需在各平台后台人工下架）。


## 数据流（无自有公网）

```text
飞书文档内「飞博虾」块
    → GitHub repository_dispatch
    → Actions「飞博虾·文档发布」
        → OpenAPI 写台账
        →（若应用能读文档）写入 docs/ 并 push
```

若 Actions 拉不到正文（文档未分享给应用），台账仍会写入「待发博客」，你本机再执行：

```powershell
npm run feiboxia:ship
```

## 目录

```text
feiboxia/docs-addon/     小组件前端工程
feiboxia/ci-doc-publish.mjs
.github/workflows/feiboxia-doc-publish.yml
```
