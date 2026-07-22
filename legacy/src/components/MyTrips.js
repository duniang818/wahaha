import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyTrips.css';

function MyTrips() {
  const navigate = useNavigate();
  const [savedRoutes, setSavedRoutes] = useState([]);

  useEffect(() => {
    loadSavedRoutes();
  }, []);

  const loadSavedRoutes = () => {
    const routes = JSON.parse(localStorage.getItem('savedRoutes') || '[]');
    setSavedRoutes(routes);
  };

  const deleteRoute = (id) => {
    if (window.confirm('确定要删除这个行程吗？')) {
      const updated = savedRoutes.filter(r => r.id !== id);
      localStorage.setItem('savedRoutes', JSON.stringify(updated));
      setSavedRoutes(updated);
    }
  };

  const viewRoute = (route) => {
    // 将行程数据存储到sessionStorage，然后跳转到规划页面
    sessionStorage.setItem('viewRoute', JSON.stringify(route));
    navigate('/travel');
  };

  if (savedRoutes.length === 0) {
    return (
      <div className="my-trips-page">
        <div className="container">
          <h1 className="page-title">我的行程</h1>
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h2>还没有保存的行程</h2>
            <p>在旅行规划页面规划并保存您的行程，它们会显示在这里</p>
            <button className="goto-plan-btn" onClick={() => navigate('/travel')}>
              开始规划 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-trips-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">我的行程</h1>
          <button className="new-plan-btn" onClick={() => navigate('/travel')}>
            + 新建行程
          </button>
        </div>

        <div className="trips-grid">
          {savedRoutes.map(route => (
            <div key={route.id} className="trip-card">
              <div className="trip-header">
                <h3>{route.name}</h3>
                <button 
                  className="delete-btn"
                  onClick={() => deleteRoute(route.id)}
                  title="删除行程"
                >
                  ×
                </button>
              </div>
              
              <div className="trip-info">
                <div className="trip-stat">
                  <span className="stat-icon">📍</span>
                  <span>{route.cities.length} 个城市</span>
                </div>
                <div className="trip-stat">
                  <span className="stat-icon">⏱️</span>
                  <span>{route.totalTime} 天</span>
                </div>
                <div className="trip-stat">
                  <span className="stat-icon">💰</span>
                  <span>¥{route.totalCost.toLocaleString()}</span>
                </div>
              </div>

              <div className="trip-cities">
                {route.cities.map((city, index) => (
                  <span key={index} className="city-badge">
                    {index + 1}. {city}
                  </span>
                ))}
              </div>

              <div className="trip-actions">
                <button className="view-btn" onClick={() => viewRoute(route)}>
                  查看详情
                </button>
              </div>

              {route.createdAt && (
                <div className="trip-date">
                  创建于: {new Date(route.createdAt).toLocaleDateString('zh-CN')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyTrips;
