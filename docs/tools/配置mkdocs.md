---
title: 配置 MkDocs
date: 2026-07-21
nav: 技术
tags:
  - 技术
  - 建站
  - MkDocs
---

# 配置 MkDocs

MkDocs Material 主题的核心配置项与自定义技巧。

## 导航配置

### Navigation tabs

导航页签：把 section 节单独显示在一个页面，让左侧边栏更简洁。

```yaml
theme:
  features:
    - navigation.sections
```

### Navigation sections

导航节：顶层节会分组显示在左侧边栏。

```yaml
theme:
  features:
    - navigation.expand   # 默认展开
    - navigation.indexes   # section 下直接挂 index
```

### 自动导航

在 `mkdocs.yml` 中手写 `nav` 列表，或用 `not_in_nav` 排除不需要出现在导航中的页面：

```yaml
not_in_nav: |
  /private/**/*.md
  /drafts/**
```

## 页面间跳转

使用标准 Markdown 链接语法，方括号跟小括号：

```markdown
[显示名称](目标文章的相对路径.md)
```

例如从 `tools/配置mkdocs.md` 链接到同目录的 Obsidian 文章：

```markdown
[Obsidian 使用技巧](obsidian.md)
```

## 代码块复制按钮

Material 主题内置代码复制功能，在 `mkdocs.yml` 中启用：

```yaml
theme:
  features:
    - content.code.copy
    - content.code.annotate
```

## 目录（TOC）

右侧目录自动生成，基于 Markdown 标题层级。启用：

```yaml
theme:
  features:
    - toc.follow       # 滚动时高亮当前节
    - navigation.top   # 返回顶部按钮
```

## 搜索

```yaml
theme:
  features:
    - search.suggest     # 搜索建议
    - search.highlight   # 高亮搜索词

plugins:
  - search:
      lang:
        - zh
        - en
```

## 上一篇/下一篇

Material 主题自动在文章底部显示前后导航，由 `nav` 顺序决定。也可用 `navigation.footer` 控制：

```yaml
theme:
  features:
    - navigation.footer
```

## 附件管理

MkDocs 的图片等附件放在 `docs/` 下的任意目录。建议按栏目组织：

```text
docs/
  blog/posts/assets/<slug>/    # 博文配图
  tech/assets/<slug>/          # 技术文章配图
  travel/assets/               # 旅行相关图片
```

Markdown 中引用相对路径即可：

```markdown
![描述](assets/my-article/image.png)
```
