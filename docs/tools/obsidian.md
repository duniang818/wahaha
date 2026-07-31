---
title: Obsidian 使用技巧
date: 2026-07-22
nav: 技术
tags:
  - 技术
  - 工具
  - Obsidian
---

# Obsidian 使用技巧

Obsidian 是基于本地 Markdown 文件的个人知识管理工具，核心优势在于双向链接和图谱视图。

## 基础设置

### 附件目录

在当前库设置中指定附件目录，避免图片散落：

```
设置 → 文件与链接 → 附件默认存放路径 → "在当前文件夹下指定的子文件夹"
子文件夹名称：assets/images
```

### 强制换行

普通句子中强制换行：输入两个空格，然后按 `Enter`。

## 核心功能

### 双向链接

用 `[[页面名]]` 创建双向链接，Obsidian 自动维护引用关系。在图谱视图中可以直观看到笔记之间的关联。

### 标签体系

| 层级 | 写法 | 用途 |
|------|------|------|
| 一级 | `#技术` | 大类 |
| 二级 | `#技术/工具` | 子类 |
| 三级 | `#技术/工具/obsidian` | 细分 |

### 模板（Templater）

创建新笔记时自动填充日期、标题等：

1. 安装 Templater 插件
2. 设置模板目录
3. 新建模板文件，使用变量：

```markdown
<% tp.file.creation_date() %>
<% tp.file.title %>
<% tp.date.now("YYYY-MM-DD", -1) %>
```

## 与 MkDocs 博客联动

Obsidian 笔记可以直接迁移到 MkDocs 博客：

1. **frontmatter 兼容**：两者都支持 YAML 头部
2. **链接转换**：`[[页面]]` 需改为标准 Markdown 链接
3. **图片路径**：Obsidian 的 `![[image.png]]` 改为 `![](path/to/image.png)`
4. **草稿标记**：`draft: true` 在 MkDocs 中可配合 `exclude_docs` 跳过构建

## 常用插件推荐

| 插件 | 功能 |
|------|------|
| Templater | 模板变量与自动填充 |
| Dataview | 笔记数据查询（类 SQL） |
| Calendar | 侧边栏日历导航 |
| Admonition | 提示框样式 |
| Excalidraw | 手绘嵌入笔记 |

## 快捷键

| 操作 | 快捷键 |
|------|--------|
| 新建笔记 | `Ctrl+N` |
| 跟随链接 | `Ctrl+Click` |
| 命令面板 | `Ctrl+P` |
| 快速切换 | `Ctrl+O` |
| 搜索 | `Ctrl+Shift+F` |
| 图谱视图 | `Ctrl+G` |
