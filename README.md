# 渡娘的空间

本地：`D:\my-blog`  
线上：https://duniang818.github.io/wahaha/

## 飞博虾（推荐）

飞书写文章 → 台账登记 → 本机一键发到 GitHub 博客（**无需自有公网**）。

```powershell
cd D:\my-blog
npm run feiboxia:ship         # 发布台：拉飞书待发稿 → docs → push
npm run blog                  # 终端菜单
```

工作台：https://duniang818.github.io/wahaha/feiboxia/workbench.html  
台账：https://my.feishu.cn/base/ADtHbOF0raWJj0stRApcfjjInLg  

说明：[飞博虾](docs/tech/feiboxia.md)

## 本地预览

```powershell
cd D:\my-blog
.\.venv\Scripts\Activate.ps1
npm run dev
# http://127.0.0.1:8000/
```

## 飞书写作 → 一键上博客（命令行）

首次（只需一次）：

```powershell
lark-cli config init --new --lang zh
lark-cli auth login --domain docs
lark-cli auth login --domain base
npm run feishu:check
```

日常：

```powershell
npm run from-feishu -- "https://xxx.feishu.cn/docx/TOKEN" --push
```

## 外站导出（仅本机）

```powershell
copy .env.example .env   # 微信需填 AppID/Secret；其它平台多为导出
npm run publish:one -- welcome --to xhs,csdn,zhihu
```

小红书/CSDN/知乎：官方无完整发文 API，脚本导出到 `sync/out/` 并打开编辑页。  
权限：`docs/private/` 与 `visibility: private` 禁止外发。

## 推送上线

```powershell
git add .
git commit -m "docs: update"
git push origin main
```

## Giscus

见 [评论配置](docs/tech/giscus-setup.md)：需先在仓库启用 Discussions。
