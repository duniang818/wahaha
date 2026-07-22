import React, { useMemo, useState } from 'react';
import { cities985, getAll985Universities } from '../data/985Universities';
import { cities211, getAll211Universities } from '../data/universities211';
import './ChineseUniversities.css';

function ChineseUniversities() {
  const [viewMode, setViewMode] = useState('city'); // 'city' or 'ranking'
  const [selectedCity, setSelectedCity] = useState('');

  // 合并985和211大学数据
  const allChineseUniversities = useMemo(() => {
    const all = [];
    
    // 添加985大学
    getAll985Universities().forEach(uni => {
      all.push({
        ...uni,
        city: Object.keys(cities985).find(city => cities985[city].some(u => u.id === uni.id)),
        is985: true,
        is211: true // 985都是211
      });
    });
    
    // 添加211大学（排除已经是985的）
    const existingIds = new Set(all.map(u => u.id));
    getAll211Universities().forEach(uni => {
      if (!existingIds.has(uni.id)) {
        all.push({
          ...uni,
          city: Object.keys(cities211).find(city => cities211[city].some(u => u.id === uni.id)),
          is985: false,
          is211: true
        });
      }
    });
    
    return all;
  }, []);

  // 按城市分组
  const universitiesByCity = useMemo(() => {
    const grouped = {};
    allChineseUniversities.forEach(uni => {
      if (!grouped[uni.city]) {
        grouped[uni.city] = [];
      }
      grouped[uni.city].push(uni);
    });
    
    // 每个城市内按排名排序
    Object.keys(grouped).forEach(city => {
      grouped[city].sort((a, b) => a.ranking - b.ranking);
    });
    
    return grouped;
  }, [allChineseUniversities]);

  // 所有城市列表
  const allCities = useMemo(() => {
    return Object.keys(universitiesByCity).sort();
  }, [universitiesByCity]);

  // 按排名排序的所有大学
  const universitiesByRanking = useMemo(() => {
    return [...allChineseUniversities].sort((a, b) => a.ranking - b.ranking);
  }, [allChineseUniversities]);

  // 统计信息
  const stats = useMemo(() => {
    const total985 = allChineseUniversities.filter(u => u.is985).length;
    const total211 = allChineseUniversities.filter(u => u.is211 && !u.is985).length;
    return {
      total: allChineseUniversities.length,
      total985,
      total211,
      cities: allCities.length
    };
  }, [allChineseUniversities, allCities]);

  // 筛选后的城市列表
  const filteredCities = useMemo(() => {
    if (!selectedCity) return allCities;
    return allCities.filter(city => city.includes(selectedCity));
  }, [selectedCity, allCities]);

  return (
    <div className="chinese-universities-page">
      <div className="container">
        <h1 className="page-title">中国名校（985/211）</h1>
        
        {/* 统计信息 */}
        <div className="summary-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">名校总数</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.total985}</div>
            <div className="stat-label">985大学</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.total211}</div>
            <div className="stat-label">211大学</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.cities}</div>
            <div className="stat-label">覆盖城市</div>
          </div>
        </div>

        {/* 视图切换和筛选 */}
        <div className="view-controls">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'city' ? 'active' : ''}`}
              onClick={() => setViewMode('city')}
            >
              📍 按城市
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'ranking' ? 'active' : ''}`}
              onClick={() => setViewMode('ranking')}
            >
              🏆 按排名
            </button>
          </div>
          
          {viewMode === 'city' && (
            <div className="city-filter">
              <input
                type="text"
                placeholder="搜索城市..."
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="filter-input"
              />
            </div>
          )}
        </div>

        {/* 按城市显示 */}
        {viewMode === 'city' && (
          <div className="city-sections">
            {filteredCities.map(city => {
              const cityUnis = universitiesByCity[city];
              const city985Count = cityUnis.filter(u => u.is985).length;
              const city211Count = cityUnis.filter(u => u.is211 && !u.is985).length;
              
              return (
                <div key={city} className="city-section">
                  <h2 className="city-name">
                    <span className="city-icon">🏙️</span>
                    {city}
                    <span className="city-count">
                      ({cityUnis.length}所 - 985: {city985Count}, 211: {city211Count})
                    </span>
                  </h2>
                  <div className="universities-grid">
                    {cityUnis.map(university => (
                      <div 
                        key={university.id} 
                        className="university-card"
                        onClick={() => {
                          // 如果是985/211大学，可以跳转到详情页（如果有的话）
                          // 或者显示大学信息
                        }}
                      >
                        <div className="university-header">
                          <div className="university-rank">#{university.ranking}</div>
                          <div className="university-badges">
                            {university.is985 && <span className="badge badge-985">985</span>}
                            {university.is211 && <span className="badge badge-211">211</span>}
                          </div>
                        </div>
                        <h3 className="university-name">{university.name}</h3>
                        <div className="university-meta">
                          <span className="university-type">{university.type}</span>
                          <span className="university-year">建校 {university.established}年</span>
                        </div>
                        {university.admissionScore && (
                          <div className="university-score">
                            <span className="score-label">2024分数线:</span>
                            <span className="score-value">{university.admissionScore[2024]}分</span>
                            <span className="score-province">({university.admissionScore.province})</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 按排名显示 */}
        {viewMode === 'ranking' && (
          <div className="ranking-section">
            <div className="universities-grid">
              {universitiesByRanking.map(university => (
                <div 
                  key={university.id} 
                  className="university-card"
                >
                  <div className="university-header">
                    <div className="university-rank">#{university.ranking}</div>
                    <div className="university-badges">
                      {university.is985 && <span className="badge badge-985">985</span>}
                      {university.is211 && <span className="badge badge-211">211</span>}
                    </div>
                  </div>
                  <h3 className="university-name">{university.name}</h3>
                  <div className="university-meta">
                    <span className="university-city">📍 {university.city}</span>
                    <span className="university-type">{university.type}</span>
                    <span className="university-year">建校 {university.established}年</span>
                  </div>
                  {university.admissionScore && (
                    <div className="university-score">
                      <span className="score-label">2024分数线:</span>
                      <span className="score-value">{university.admissionScore[2024]}分</span>
                      <span className="score-province">({university.admissionScore.province})</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChineseUniversities;
