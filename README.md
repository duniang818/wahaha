# 名校与旅行导航网站

基于最新QS排名的世界名校和中国名校信息展示网站，同时提供985大学分布、5A级景区、城市美食和旅行规划服务。

🌐 **网站地址**: https://duniang818.github.io

## 功能特点

### 📚 教育信息
- **世界名校TOP10**：基于最新QS排名，展示全球最顶尖的10所大学
- **中国名校TOP10**：了解中国最优秀的10所大学
- **985大学分布**：按城市查看985大学分布，了解各城市的教育资源
- **学校详情**：包含专业信息、知名教授、校友、招生要求等

### 🏛️ 旅游信息
- **5A级景区**：全国5A级旅游景区，按城市划分
- **城市美食**：各城市特色美食，推荐知名餐厅
- **旅行规划**：智能规划旅行路线，选择交通工具，优化行程安排

### 📅 其他功能
- **每日推送**：每天自动推送一所学校的详细信息

## 技术栈

- React 18
- React Router 6
- CSS3 (响应式设计)
- GitHub Pages (部署)

## 本地开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

应用将在 http://localhost:3000 打开

### 构建生产版本

```bash
npm run build
```

## 部署

项目使用GitHub Actions自动部署。详细部署说明请查看 [DEPLOY.md](./DEPLOY.md)

### 快速部署

1. 推送代码到GitHub：
   ```bash
   git push origin main
   ```

2. 在GitHub仓库设置中启用Pages（选择GitHub Actions作为源）

3. 等待自动部署完成

## 项目结构

```
.
├── public/
│   └── index.html          # HTML模板
├── src/
│   ├── components/         # React组件
│   │   ├── UniversityList.js      # 学校列表
│   │   ├── UniversityDetail.js    # 学校详情
│   │   ├── DailyPush.js           # 每日推送
│   │   ├── City985List.js         # 985大学列表
│   │   ├── Attractions5A.js       # 5A景区列表
│   │   ├── CityFood.js            # 城市美食
│   │   └── TravelPlanner.js       # 旅行规划器
│   ├── data/              # 数据文件
│   │   ├── universities.js        # 世界/中国名校数据
│   │   ├── 985Universities.js     # 985大学数据
│   │   ├── attractions5A.js       # 5A景区数据
│   │   └── cityFood.js            # 城市美食数据
│   ├── App.js             # 主应用组件
│   ├── index.js           # 入口文件
│   └── *.css              # 样式文件
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions部署配置
├── package.json
└── README.md
```

## 数据说明

- **世界名校**：基于2024年QS世界大学排名
- **中国名校**：基于2024年中国大学排名
- **985大学**：38所985工程大学，按城市和排名分类
- **5A景区**：74个5A级旅游景区，覆盖主要城市
- **城市美食**：20+城市的特色美食和推荐餐厅

## 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！
