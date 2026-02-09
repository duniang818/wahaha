import React from 'react';
import { cities985, getAll985Universities } from '../data/985Universities';
import './City985List.css';

function City985List() {
  const allUniversities = getAll985Universities();
  const cityList = Object.keys(cities985).sort();

  return (
    <div className="city985-page">
      <div className="container">
        <h1 className="page-title">985大学分布（按城市）</h1>
        
        <div className="summary-stats">
          <div className="stat-card">
            <div className="stat-number">{allUniversities.length}</div>
            <div className="stat-label">985大学总数</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{cityList.length}</div>
            <div className="stat-label">覆盖城市</div>
          </div>
        </div>

        <div className="city-sections">
          {cityList.map(city => (
            <div key={city} className="city-section">
              <h2 className="city-name">
                <span className="city-icon">🏙️</span>
                {city}
                <span className="city-count">({cities985[city].length}所)</span>
              </h2>
              <div className="universities-grid">
                {cities985[city]
                  .sort((a, b) => a.ranking - b.ranking)
                  .map(university => (
                    <div key={university.id} className="university-card">
                      <div className="university-rank">#{university.ranking}</div>
                      <h3 className="university-name">{university.name}</h3>
                      <div className="university-meta">
                        <span className="university-type">{university.type}</span>
                        <span className="university-year">建校 {university.established}年</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="ranking-section">
          <h2 className="section-title">全国985大学排名（TOP20）</h2>
          <div className="ranking-list">
            {allUniversities.slice(0, 20).map((university, index) => (
              <div key={university.id} className="ranking-item">
                <div className="ranking-number">{index + 1}</div>
                <div className="ranking-content">
                  <div className="ranking-name">{university.name}</div>
                  <div className="ranking-meta">
                    <span className="ranking-city">{Object.keys(cities985).find(city => 
                      cities985[city].some(u => u.id === university.id)
                    )}</span>
                    <span className="ranking-type">{university.type}</span>
                  </div>
                </div>
                <div className="ranking-badge">#{university.ranking}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default City985List;
