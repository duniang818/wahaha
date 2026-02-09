# GitHub Pages 部署指南

## 部署方法

项目已配置好GitHub Actions自动部署工作流。当网络连接恢复后，按照以下步骤操作：

### 方法1：使用GitHub Actions自动部署（推荐）

1. **推送代码到GitHub**
   ```bash
   git push -u origin main
   ```

2. **在GitHub上启用Pages**
   - 访问你的仓库：https://github.com/duniang818/duniang818.github.io
   - 点击仓库设置（Settings）
   - 在左侧菜单中找到 "Pages"
   - 在 "Source" 部分，选择 "GitHub Actions"
   - 保存设置

3. **自动部署**
   - 推送代码后，GitHub Actions会自动运行
   - 在仓库的 "Actions" 标签页可以查看部署进度
   - 部署完成后，网站将在几分钟内上线：https://duniang818.github.io

### 方法2：手动部署（如果GitHub Actions不可用）

1. **构建项目**
   ```bash
   npm run build
   ```

2. **手动推送到gh-pages分支**
   ```bash
   # 安装gh-pages工具（如果还没安装）
   npm install -g gh-pages
   
   # 部署到gh-pages分支
   gh-pages -d build
   ```

3. **在GitHub上启用Pages**
   - 访问仓库设置 > Pages
   - 在 "Source" 部分，选择 "Deploy from a branch"
   - 选择 "gh-pages" 分支和 "/ (root)" 文件夹
   - 保存设置

### 方法3：使用GitHub Desktop（图形界面）

1. 打开GitHub Desktop
2. 添加本地仓库
3. 提交所有更改
4. 推送到GitHub
5. 在GitHub网站上启用Pages

## 当前项目状态

✅ 所有代码已提交到本地Git仓库
✅ GitHub Actions工作流已配置
✅ 构建配置正确（homepage: "https://duniang818.github.io"）
✅ 所有ESLint警告已修复

## 网络问题解决

如果遇到网络连接问题，可以尝试：

1. **使用代理**
   ```bash
   git config --global http.proxy http://proxy.example.com:8080
   git config --global https.proxy https://proxy.example.com:8080
   ```

2. **使用SSH代替HTTPS**
   ```bash
   git remote set-url origin git@github.com:duniang818/duniang818.github.io.git
   ```

3. **检查防火墙设置**
   - 确保443端口（HTTPS）未被阻止

## 验证部署

部署成功后，访问：
- https://duniang818.github.io

网站应包含以下功能：
- ✅ 世界名校TOP10
- ✅ 中国名校TOP10  
- ✅ 985大学分布（按城市）
- ✅ 5A级景区（按城市）
- ✅ 城市美食
- ✅ 旅行路线规划器
- ✅ 每日推送

## 后续更新

每次更新代码后，只需：
```bash
git add .
git commit -m "更新说明"
git push origin main
```

GitHub Actions会自动构建并部署到GitHub Pages。
