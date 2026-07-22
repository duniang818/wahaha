import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import { worldUniversities } from './data/universities';
import UniversityList from './components/UniversityList';
import UniversityDetail from './components/UniversityDetail';
import XiAnJiaotongDetail from './components/XiAnJiaotongDetail';
import DailyPush from './components/DailyPush';
import ChineseUniversities from './components/ChineseUniversities';
import Attractions from './components/Attractions';
import AttractionDetail from './components/AttractionDetail';
import CityFood from './components/CityFood';
import TravelPlanner from './components/TravelPlanner';
import CityDetail from './components/CityDetail';
import MyTrips from './components/MyTrips';
import Accommodations from './components/Accommodations';
import TravelJournal from './components/TravelJournal';
import EthnicGroups from './components/EthnicGroups';
import Stocks from './components/Stocks';
import StockDetail from './components/StockDetail';

function App() {
  // 确保basename正确设置
  const basename = process.env.PUBLIC_URL || "";
  return (
    <Router basename={basename}>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/world" element={<UniversityList universities={worldUniversities} title="世界名校TOP10" />} />
          <Route path="/china" element={<ChineseUniversities />} />
          <Route path="/university/:id" element={<UniversityDetail />} />
          <Route path="/xjtu" element={<XiAnJiaotongDetail />} />
          <Route path="/attractions" element={<Attractions />} />
          <Route path="/attraction/:id" element={<AttractionDetail />} />
          <Route path="/food" element={<CityFood />} />
          <Route path="/accommodations" element={<Accommodations />} />
          <Route path="/travel" element={<TravelPlanner />} />
          <Route path="/city/:cityName" element={<CityDetail />} />
          <Route path="/my-trips" element={<MyTrips />} />
          <Route path="/journal" element={<TravelJournal />} />
          <Route path="/daily" element={<DailyPush />} />
          <Route path="/stocks" element={<Stocks />} />
          <Route path="/stock/:symbol" element={<StockDetail />} />
          <Route path="/ethnic" element={<EthnicGroups />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

function Header() {
  const navigate = useNavigate();
  
  return (
    <header className="header">
      <div className="container">
        <h1 className="logo" onClick={() => navigate('/')}>
          个人空间
        </h1>
        <nav className="nav">
          <Link to="/" className="nav-link">首页</Link>
          <Link to="/world" className="nav-link">世界名校</Link>
          <Link to="/china" className="nav-link">中国名校</Link>
          <Link to="/attractions" className="nav-link">景点</Link>
          <Link to="/food" className="nav-link">美食</Link>
          <Link to="/accommodations" className="nav-link">住宿</Link>
          <Link to="/travel" className="nav-link">旅行规划</Link>
          <Link to="/my-trips" className="nav-link">我的行程</Link>
          <Link to="/journal" className="nav-link">旅游游记</Link>
          <Link to="/daily" className="nav-link">每日推送</Link>
          <Link to="/ethnic" className="nav-link">少数民族分布</Link>
          <Link to="/stocks" className="nav-link">股票</Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>关于我们</h3>
            <p>名校与旅行导航致力于为广大用户提供世界名校、985大学、5A景区、城市美食和旅行规划服务。</p>
          </div>
          <div className="footer-section">
            <h3>关注我们</h3>
            <div className="social-links">
              <button type="button" className="social-link wechat" onClick={() => alert('请搜索微信公众号：世界名校导航')}>
                <span className="icon">📱</span> 微信公众号
              </button>
              <button type="button" className="social-link xiaohongshu" onClick={() => alert('请搜索小红书号：WorldUniversities')}>
                <span className="icon">📕</span> 小红书
              </button>
              <button type="button" className="social-link douyin" onClick={() => alert('请搜索抖音号：WorldUniversities')}>
                <span className="icon">🎵</span> 抖音
              </button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} 名校与旅行导航. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function HomePage() {
  const navigate = useNavigate();
  
  return (
    <div className="home-page">
      <div className="hero">
        <h1>探索世界顶尖学府与旅行</h1>
        <p>基于最新QS排名，为您提供世界名校、985大学、5A景区、城市美食和旅行规划服务</p>
      </div>
      
      <div className="container">
        <div className="card-grid">
          <div className="card" onClick={() => navigate('/world')}>
            <h2>世界名校TOP10</h2>
            <p>探索全球最顶尖的10所大学，了解它们的专业优势、师资力量和招生要求</p>
            <div className="card-count">{worldUniversities.length} 所大学</div>
          </div>
          
          <div className="card" onClick={() => navigate('/china')}>
            <h2>中国名校（985/211）</h2>
            <p>按QS排名和城市分布查看所有985和211大学，包含录取分数线信息</p>
            <div className="card-count">985+211大学</div>
          </div>
          
          <div className="card" onClick={() => navigate('/attractions')}>
            <h2>景区与博物馆</h2>
            <p>5A/4A/3A级景区和博物馆，按城市和等级分类展示</p>
            <div className="card-count">多等级景区</div>
          </div>
          
          <div className="card" onClick={() => navigate('/accommodations')}>
            <h2>4星+酒店</h2>
            <p>每个城市性价比最好的前3家4星及以上酒店推荐</p>
            <div className="card-count">精选推荐</div>
          </div>
          
          <div className="card" onClick={() => navigate('/food')}>
            <h2>城市美食</h2>
            <p>各城市特色美食，品尝地道风味，推荐知名餐厅</p>
            <div className="card-count">多城市</div>
          </div>
          
          <div className="card" onClick={() => navigate('/travel')}>
            <h2>旅行规划</h2>
            <p>智能规划旅行路线，选择交通工具，优化行程安排</p>
            <div className="card-count">智能规划</div>
          </div>
          
          <div className="card" onClick={() => navigate('/journal')}>
            <h2>旅游游记</h2>
            <p>记录旅行故事，一键分享到小红书、微信公众号</p>
            <div className="card-count">写游记 · 分享</div>
          </div>
          
          <div className="card" onClick={() => navigate('/daily')}>
            <h2>每日推送</h2>
            <p>每天为您推送一所学校的详细信息，助您深入了解心仪的大学</p>
            <div className="card-count">每日更新</div>
          </div>
          
          <div className="card" onClick={() => navigate('/xjtu')}>
            <h2>🎓 西安交大深度解析</h2>
            <p>一周时间深入了解西安交通大学：历史、专业、招生、就业全攻略</p>
            <div className="card-count">7天学习计划</div>
          </div>
          
          <div className="card" onClick={() => navigate('/ethnic')}>
            <h2>少数民族分布</h2>
            <p>探索中国各少数民族的分布情况和传统习俗，了解多元文化</p>
            <div className="card-count">56个民族</div>
          </div>
        </div>
        
        <div className="features">
          <h2>网站功能</h2>
          <div className="feature-list">
            <div className="feature-item">
              <h3>📊 QS排名数据</h3>
              <p>基于最新QS世界大学排名，确保信息的准确性和时效性</p>
            </div>
            <div className="feature-item">
              <h3>🎓 中国名校（985/211）</h3>
              <p>按QS排名和城市分布查看所有985和211大学，包含录取分数线</p>
            </div>
            <div className="feature-item">
              <h3>🏛️ 景区与博物馆</h3>
              <p>5A/4A/3A级景区和博物馆，按城市和等级分类展示</p>
            </div>
            <div className="feature-item">
              <h3>🏨 4星+酒店</h3>
              <p>每个城市性价比最好的前3家4星及以上酒店推荐</p>
            </div>
            <div className="feature-item">
              <h3>🍜 城市美食</h3>
              <p>各城市特色美食，品尝地道风味，推荐知名餐厅</p>
            </div>
            <div className="feature-item">
              <h3>🗺️ 旅行规划</h3>
              <p>智能规划旅行路线，选择交通工具，优化行程安排</p>
            </div>
            <div className="feature-item">
              <h3>📅 每日推送</h3>
              <p>每天推送一所学校，帮助您系统了解各校特色</p>
            </div>
            <div className="feature-item">
              <h3>🌍 少数民族分布</h3>
              <p>探索中国各少数民族的分布情况和传统习俗，了解多元文化</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
