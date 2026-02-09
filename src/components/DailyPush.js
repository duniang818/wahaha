import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { worldUniversities, chineseUniversities } from '../data/universities';
import './DailyPush.css';

function DailyPush() {
  const navigate = useNavigate();
  const allUniversities = useMemo(() => [...worldUniversities, ...chineseUniversities], []);
  
  // 根据日期计算今天应该推送的学校
  const getTodayUniversity = () => {
    const today = new Date();
    const startDate = new Date('2024-01-01'); // 起始日期
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const index = daysSinceStart % allUniversities.length;
    return allUniversities[index];
  };
  
  const [todayUniversity, setTodayUniversity] = useState(getTodayUniversity());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  useEffect(() => {
    const updateUniversity = () => {
      const date = new Date(selectedDate);
      const startDate = new Date('2024-01-01');
      const daysSinceStart = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
      const index = daysSinceStart % allUniversities.length;
      setTodayUniversity(allUniversities[index]);
    };
    updateUniversity();
  }, [selectedDate, allUniversities]);
  
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };
  
  const resetToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };
  
  if (!todayUniversity) {
    return <div>加载中...</div>;
  }
  
  return (
    <div className="daily-push-page">
      <div className="container">
        <h1 className="page-title">每日推送</h1>
        
        <div className="date-selector">
          <label htmlFor="date-input">选择日期：</label>
          <input 
            type="date" 
            id="date-input"
            value={selectedDate} 
            onChange={handleDateChange}
            max={new Date().toISOString().split('T')[0]}
          />
          <button onClick={resetToToday} className="today-btn">今天</button>
        </div>
        
        <div className="daily-university-card">
          <div className="daily-header">
            <div className="daily-date">
              {new Date(selectedDate).toLocaleDateString('zh-CN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </div>
            <div className="daily-rank">QS排名 #{todayUniversity.ranking}</div>
          </div>
          
          <h2 className="daily-university-name">{todayUniversity.name}</h2>
          <p className="daily-university-name-en">{todayUniversity.nameEn}</p>
          
          <div className="daily-university-country">
            <span className="flag">🌍</span>
            {todayUniversity.country}
          </div>
          
          <div className="daily-intro">
            <h3>学校简介</h3>
            <p>{todayUniversity.introduction}</p>
          </div>
          
          <div className="daily-highlights">
            <div className="highlight-item">
              <div className="highlight-icon">🏆</div>
              <div className="highlight-content">
                <strong>优势专业</strong>
                <p>{todayUniversity.top5Majors.slice(0, 3).map(m => m.name).join('、')}等</p>
              </div>
            </div>
            
            <div className="highlight-item">
              <div className="highlight-icon">👥</div>
              <div className="highlight-content">
                <strong>知名校友</strong>
                <p>{todayUniversity.famousAlumni.slice(0, 2).map(a => a.name).join('、')}等</p>
              </div>
            </div>
            
            <div className="highlight-item">
              <div className="highlight-icon">📋</div>
              <div className="highlight-content">
                <strong>招生门槛</strong>
                <p>{todayUniversity.admissionRequirements.threshold}</p>
              </div>
            </div>
          </div>
          
          <button 
            className="view-full-details-btn"
            onClick={() => navigate(`/university/${todayUniversity.id}`)}
          >
            查看完整信息 →
          </button>
        </div>
        
        <div className="daily-info">
          <p>💡 提示：每天系统会自动推送一所不同的学校，帮助您系统了解各校特色。您也可以选择其他日期查看历史推送。</p>
        </div>
      </div>
    </div>
  );
}

export default DailyPush;
