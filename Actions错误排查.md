# GitHub Actions 部署错误排查指南

## 常见错误及解决方案

### 错误1：找不到 package.json 或依赖安装失败

**错误信息**：
```
npm ERR! code ENOENT
npm ERR! syscall open
npm ERR! path /home/runner/work/.../package.json
npm ERR! errno -2
```

**解决方案**：
- 确保 `package.json` 文件已上传到仓库
- 检查文件路径是否正确
- 确保在仓库根目录

### 错误2：构建失败 - CI环境变量

**错误信息**：
```
Treating warnings as errors because process.env.CI = true
```

**解决方案**：
✅ 已修复：工作流中已设置 `CI: false`

### 错误3：权限不足

**错误信息**：
```
Error: Resource not accessible by integration
Permission denied
```

**解决方案**：
1. 检查仓库设置：
   - Settings > Actions > General
   - 确保 "Workflow permissions" 设置为：
     - ✅ Read and write permissions
     - ✅ Allow GitHub Actions to create and approve pull requests

2. 检查工作流权限：
   - 确保 `.github/workflows/deploy.yml` 中包含：
     ```yaml
     permissions:
       contents: read
       pages: write
       id-token: write
     ```

### 错误4：Pages部署失败

**错误信息**：
```
Error: No uploaded artifact was found
```

**解决方案**：
- 确保构建步骤成功完成
- 检查 `path: './build'` 是否正确
- 确保构建生成了 `build` 文件夹

### 错误5：Node版本不兼容

**错误信息**：
```
The engine "node" is incompatible with this module
```

**解决方案**：
✅ 已修复：工作流中使用 Node.js 18

### 错误6：找不到构建文件

**错误信息**：
```
Error: ENOENT: no such file or directory, stat 'build/index.html'
```

**解决方案**：
- 确保 `npm run build` 成功执行
- 检查构建输出
- 确保 `package.json` 中的 `homepage` 设置正确

## 检查清单

在报告错误前，请检查：

- [ ] `package.json` 文件是否存在？
- [ ] `.github/workflows/deploy.yml` 文件是否存在？
- [ ] 仓库设置中 Actions 权限是否正确？
- [ ] 构建步骤是否成功？
- [ ] 是否有足够的仓库权限？

## 如何查看详细错误信息

1. **访问Actions页面**：
   - https://github.com/duniang818/duniang818.github.io/actions

2. **点击失败的workflow运行**

3. **查看错误步骤**：
   - 点击失败的步骤（红色✗）
   - 查看详细的错误日志

4. **复制错误信息**：
   - 复制完整的错误信息
   - 包括错误堆栈

## 调试步骤

### 步骤1：检查工作流文件

确保 `.github/workflows/deploy.yml` 内容正确：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          CI: false
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './build'
          
      - name: Add 404.html for SPA routing
        run: |
          cp build/index.html build/404.html

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 步骤2：检查package.json

确保包含：
```json
{
  "homepage": "https://duniang818.github.io",
  "scripts": {
    "build": "react-scripts build"
  }
}
```

### 步骤3：检查仓库权限

1. Settings > Actions > General
2. Workflow permissions：
   - ✅ Read and write permissions
3. 保存

### 步骤4：手动触发测试

1. Actions > Deploy to GitHub Pages
2. Run workflow
3. 选择 main 分支
4. 查看运行结果

## 需要帮助？

如果以上方法都无法解决，请提供：

1. **完整的错误信息**（从Actions日志中复制）
2. **失败的步骤名称**
3. **工作流运行的链接**

这样我可以提供更准确的解决方案。
