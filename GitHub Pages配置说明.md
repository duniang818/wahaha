# GitHub Pages 配置说明 - 显示网站而非README

## 问题说明

如果访问 https://duniang818.github.io 时看到的是README文档而不是网站内容，说明GitHub Pages的Source配置不正确。

## 解决方案

### 关键配置：必须选择 "GitHub Actions" 作为Source

**重要**：GitHub Pages的Source必须设置为 **"GitHub Actions"**，而不是 "Deploy from a branch"。

### 正确配置步骤

1. **访问仓库设置**
   - 打开：https://github.com/duniang818/duniang818.github.io/settings/pages

2. **检查Source设置**
   - 在 "Source" 部分，应该显示：
     ```
     Source: GitHub Actions
     ```
   
   ⚠️ **如果显示的是**：
   ```
   Source: Deploy from a branch
   Branch: main / (root)
   ```
   这就是问题所在！

3. **修改Source**
   - 点击 "Source" 下拉菜单
   - 选择：**GitHub Actions**
   - 点击 Save

4. **验证**
   - 页面应该显示：
     ```
     ✅ Your site is live at https://duniang818.github.io
     ```
   - 或者显示最近的部署记录

### 为什么会出现这个问题？

- **如果选择 "Deploy from a branch"**：
  - GitHub Pages会直接从代码仓库的main分支读取文件
  - 会显示README.md、源代码文件等
  - 不会显示构建后的网站

- **如果选择 "GitHub Actions"**：
  - GitHub Actions会运行构建流程
  - 构建React应用生成静态文件
  - 部署构建后的文件到GitHub Pages
  - 正确显示网站内容

## 已修复的配置

项目已包含以下配置确保正确部署：

1. **GitHub Actions工作流** (`.github/workflows/deploy.yml`)
   - 自动构建React应用
   - 部署build文件夹到GitHub Pages
   - 包含404.html处理SPA路由

2. **package.json配置**
   - `homepage: "https://duniang818.github.io"` - 确保构建路径正确

3. **404.html文件** (`public/404.html`)
   - 处理React Router的路由
   - 确保刷新页面不会404

## 验证部署

### 方法1：检查Actions

1. 访问：https://github.com/duniang818/duniang818.github.io/actions
2. 查看 "Deploy to GitHub Pages" 工作流
3. 应该看到成功的部署记录（绿色✓）

### 方法2：检查Pages设置

1. Settings > Pages
2. 应该显示：
   - Source: GitHub Actions
   - 最近的部署记录
   - 网站地址：https://duniang818.github.io

### 方法3：访问网站

1. 访问：https://duniang818.github.io
2. 应该看到网站首页（不是README）
3. 应该和 localhost:3000 显示的内容一样

## 如果还是显示README？

### 检查清单

- [ ] Source是否设置为 "GitHub Actions"？
- [ ] Actions工作流是否成功运行？
- [ ] 是否等待了5-10分钟让部署完成？
- [ ] 是否清除了浏览器缓存？

### 重新部署

如果配置正确但还没生效：

1. **手动触发部署**：
   - Actions > Deploy to GitHub Pages > Run workflow
   - 选择 main 分支
   - 点击 Run workflow

2. **或者推送一个小的更改**：
   ```bash
   # 做一个小的更改
   echo " " >> README.md
   git add README.md
   git commit -m "Trigger deployment"
   git push origin main
   ```

## 预期结果

配置正确后：

✅ 访问 https://duniang818.github.io 显示网站首页
✅ 和 localhost:3000 显示的内容完全一样
✅ 所有路由正常工作（/world, /china, /985等）
✅ 刷新页面不会404

## 本地测试

在部署前，可以本地测试构建结果：

```bash
# 构建项目
npm run build

# 本地预览构建结果
npx serve -s build
```

访问 http://localhost:3000 应该和最终部署的网站一样。

---

**记住**：GitHub Pages的Source必须选择 **"GitHub Actions"**，这是关键！
