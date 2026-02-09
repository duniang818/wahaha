import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import { worldUniversities, chineseUniversities } from './data/universities';
import UniversityList from './components/UniversityList';
import UniversityDetail from './components/UniversityDetail';
import DailyPush from './components/DailyPush';
import City985List from './components/City985List';
import Attractions5A from './components/Attractions5A';
import CityFood from './components/CityFood';
import TravelPlanner from './components/TravelPlanner';

function App() {
  return (
    <Router basename="/">
      <div className="App">
        <HeaderWrapper />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/world" element={<UniversityList universities={worldUniversities} title="世界名校TOP10" />} />
          <Route path="/china" element={<UniversityList universities={chineseUniversities} title="中国名校TOP10" />} />
          <Route path="/university/:id" element={<UniversityDetail />} />
          <Route path="/985" element={<City985List />} />
          <Route path="/attractions" element={<Attractions5A />} />
          <Route path="/food" element={<CityFood />} />
          <Route path="/travel" element={<TravelPlanner />} />
          <Route path="/daily" element={<DailyPush />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

function HeaderWrapper() {
  return <Header />;
}

function Header() {
  const navigate = useNavigate();
  
  return (
    <header className="header">
      <div className="container">
        <h1 className="logo" onClick={() => navigate('/')}>
          名校与旅行导航
        </h1>
        <nav className="nav">
          <Link to="/" className="nav-link">首页</Link>
          <Link to="/world" className="nav-link">世界名校</Link>
          <Link to="/china" className="nav-link">中国名校</Link>
          <Link to="/985" className="nav-link">985大学</Link>
          <Link to="/attractions" className="nav-link">5A景区</Link>
          <Link to="/food" className="nav-link">城市美食</Link>
          <Link to="/travel" className="nav-link">旅行规划</Link>
          <Link to="/daily" className="nav-link">每日推送</Link>
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
            <h2>中国名校TOP10</h2>
            <p>了解中国最优秀的10所大学，包括专业设置、知名校友和入学途径</p>
            <div className="card-count">{chineseUniversities.length} 所大学</div>
          </div>
          
          <div className="card" onClick={() => navigate('/985')}>
            <h2>985大学分布</h2>
            <p>按城市查看985大学分布，了解各城市的教育资源</p>
            <div className="card-count">按城市分类</div>
          </div>
          
          <div className="card" onClick={() => navigate('/attractions')}>
            <h2>5A级景区</h2>
            <p>全国5A级旅游景区，按城市划分，规划您的旅行路线</p>
            <div className="card-count">按城市分类</div>
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
          
          <div className="card" onClick={() => navigate('/daily')}>
            <h2>每日推送</h2>
            <p>每天为您推送一所学校的详细信息，助您深入了解心仪的大学</p>
            <div className="card-count">每日更新</div>
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
              <h3>🎓 985大学分布</h3>
              <p>按城市查看985大学分布，了解各城市的教育资源</p>
            </div>
            <div className="feature-item">
              <h3>🏛️ 5A级景区</h3>
              <p>全国5A级旅游景区，按城市划分，规划您的旅行路线</p>
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
