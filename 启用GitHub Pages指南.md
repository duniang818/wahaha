# 启用 GitHub Pages 详细指南

## 前提条件

✅ 代码已上传到GitHub仓库：`duniang818/duniang818.github.io`
✅ 仓库中已包含 `.github/workflows/deploy.yml` 文件

## 详细步骤

### 步骤1：进入仓库设置页面

1. 访问你的仓库：https://github.com/duniang818/duniang818.github.io
2. 点击仓库顶部的 **"Settings"** 标签（在 "Code"、"Issues"、"Pull requests" 等标签的右侧）

### 步骤2：找到 Pages 设置

1. 在左侧菜单栏中，向下滚动找到 **"Pages"** 选项
2. 点击 **"Pages"**

### 步骤3：配置 Source

在 "Source" 部分，你会看到几个选项：

**重要：选择 GitHub Actions**

1. 在 "Source" 下拉菜单中，选择：
   ```
   GitHub Actions
   ```
   
   ⚠️ **不要选择**：
   - ❌ Deploy from a branch
   - ❌ None

2. 如果看到 "Your site is ready to be published" 的提示，说明配置正确

3. 点击 **"Save"** 按钮（如果显示的话）

### 步骤4：验证配置

配置完成后，页面会显示：

```
✅ Your site is live at https://duniang818.github.io
```

或者

```
✅ Your site is ready to be published at https://duniang818.github.io
```

## 如果看不到 GitHub Actions 选项？

### 情况1：还没有推送代码

如果仓库是空的或还没有 `.github/workflows/deploy.yml` 文件：
1. 先上传代码（包括 `.github` 文件夹）
2. 然后回到 Settings > Pages

### 情况2：GitHub Actions 被禁用

1. 检查仓库设置中的 Actions 权限：
   - Settings > Actions > General
   - 确保 "Allow all actions and reusable workflows" 已启用
   - 点击 Save

### 情况3：使用旧版界面

如果看到的是旧版界面（有 "Source" 下拉菜单显示 "None"、"main"、"gh-pages" 等）：
1. 确保代码已上传
2. 等待几分钟让GitHub识别工作流文件
3. 刷新页面
4. 应该会看到 "GitHub Actions" 选项

## 部署流程说明

### 自动部署流程

启用 GitHub Actions 后，部署流程如下：

1. **触发部署**
   - 当你推送代码到 main/master 分支时
   - 或者手动触发（Actions > Deploy to GitHub Pages > Run workflow）

2. **构建阶段**
   - GitHub Actions 会自动运行 `.github/workflows/deploy.yml`
   - 安装依赖：`npm ci`
   - 构建项目：`npm run build`
   - 上传构建产物

3. **部署阶段**
   - 自动部署到 GitHub Pages
   - 通常需要 5-10 分钟

4. **完成**
   - 网站上线：https://duniang818.github.io

## 查看部署状态

### 方法1：Actions 页面

1. 点击仓库顶部的 **"Actions"** 标签
2. 查看 "Deploy to GitHub Pages" 工作流
3. 点击最新的运行记录查看详情
4. 绿色 ✓ 表示成功，红色 ✗ 表示失败

### 方法2：Pages 设置页面

1. Settings > Pages
2. 查看 "Build and deployment" 部分
3. 会显示最近的部署状态

## 常见问题

### Q1: 保存后没有反应？

**A**: 
- 检查是否真的点击了 Save
- 刷新页面查看
- 检查 Actions 标签页是否有工作流运行

### Q2: 显示 "No deployments yet"？

**A**: 
- 确保代码已推送
- 检查 `.github/workflows/deploy.yml` 文件是否存在
- 手动触发：Actions > Deploy to GitHub Pages > Run workflow

### Q3: 工作流运行失败？

**A**: 
- 点击失败的运行记录查看错误日志
- 常见问题：
  - 缺少文件（确保所有文件都上传了）
  - 构建错误（检查 package.json）
  - 权限问题（检查仓库设置）

### Q4: 网站显示 404？

**A**: 
- 等待 5-10 分钟让部署完成
- 检查仓库名是否正确：`duniang818.github.io`
- 检查仓库是否为 Public
- 清除浏览器缓存后重试

### Q5: 如何手动触发部署？

**A**: 
1. 点击 "Actions" 标签
2. 选择 "Deploy to GitHub Pages" 工作流
3. 点击 "Run workflow" 按钮
4. 选择分支（main）
5. 点击 "Run workflow"

## 验证网站是否上线

### 方法1：直接访问

访问：https://duniang818.github.io

如果看到网站首页，说明部署成功！

### 方法2：检查部署状态

1. Settings > Pages
2. 查看页面顶部是否显示：
   ```
   ✅ Your site is live at https://duniang818.github.io
   ```

### 方法3：查看 Actions

1. Actions > Deploy to GitHub Pages
2. 最新的运行应该显示绿色 ✓
3. 点击查看详情，应该看到 "Deploy to GitHub Pages" 步骤成功

## 预期结果

配置成功后，你应该看到：

1. **Settings > Pages**：
   - Source: GitHub Actions
   - 显示网站地址：https://duniang818.github.io

2. **Actions 页面**：
   - "Deploy to GitHub Pages" 工作流正在运行或已完成
   - 状态为绿色 ✓

3. **网站访问**：
   - https://duniang818.github.io 可以正常访问
   - 显示网站首页

## 后续更新

每次更新代码后：

1. 推送代码到 main 分支
2. GitHub Actions 会自动触发部署
3. 等待 5-10 分钟
4. 网站自动更新

无需手动操作！

## 需要帮助？

如果遇到问题：

1. **查看 Actions 日志**：
   - Actions > 点击失败的运行 > 查看错误信息

2. **检查文件**：
   - 确保 `.github/workflows/deploy.yml` 存在
   - 确保 `package.json` 中 homepage 正确

3. **GitHub 文档**：
   - https://docs.github.com/pages
   - https://docs.github.com/actions

---

**提示**：如果配置后没有立即看到 GitHub Actions 选项，等待几分钟后刷新页面。GitHub 需要一些时间来识别工作流文件。
