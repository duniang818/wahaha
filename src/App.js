import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import { worldUniversities, chineseUniversities } from './data/universities';
import UniversityList from './components/UniversityList';
import UniversityDetail from './components/UniversityDetail';
import DailyPush from './components/DailyPush';
import HistoryList from './components/HistoryList';

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
          <Route path="/daily" element={<DailyPush />} />
          <Route path="/history" element={<HistoryList />} />
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
          世界名校导航
        </h1>
        <nav className="nav">
          <Link to="/" className="nav-link">首页</Link>
          <Link to="/world" className="nav-link">世界名校</Link>
          <Link to="/china" className="nav-link">中国名校</Link>
          <Link to="/daily" className="nav-link">每日推送</Link>
          <Link to="/history" className="nav-link">往期推送</Link>
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
            <p>世界名校导航致力于为广大留学生和家长提供最准确、最及时的世界名校信息。</p>
          </div>
          <div className="footer-section">
            <h3>关注我们</h3>
            <div className="social-links">
              <a href="#" className="social-link wechat" onClick={(e) => {e.preventDefault(); alert('请搜索微信公众号：世界名校导航');}}>
                <span className="icon">📱</span> 微信公众号
              </a>
              <a href="#" className="social-link xiaohongshu" onClick={(e) => {e.preventDefault(); alert('请搜索小红书号：WorldUniversities');}}>
                <span className="icon">📕</span> 小红书
              </a>
              <a href="#" className="social-link douyin" onClick={(e) => {e.preventDefault(); alert('请搜索抖音号：WorldUniversities');}}>
                <span className="icon">🎵</span> 抖音
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} 世界名校导航. All rights reserved.</p>
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
        <h1>探索世界顶尖学府</h1>
        <p>基于最新QS排名，为您提供世界名校和中国名校的详细信息</p>
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
              <h3>🎓 专业信息</h3>
              <p>提供TOP5和BOTTOM5专业，以及对应的知名教授信息</p>
            </div>
            <div className="feature-item">
              <h3>👥 知名校友</h3>
              <p>了解各校培养的杰出人才及其重要成就</p>
            </div>
            <div className="feature-item">
              <h3>📝 招生信息</h3>
              <p>详细的招生门槛、考试科目、考试时间等实用信息</p>
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
