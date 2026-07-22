import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { attractions5A, getAttractionCities, getAll5AAttractions, searchAttractions } from '../data/attractions5A';
import './Attractions5A.css';

function Attractions5A() {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  const cities = getAttractionCities();
  const totalAttractions = Object.values(attractions5A).reduce((sum, arr) => sum + arr.length, 0);
  
  // 搜索和筛选逻辑
  const filteredAttractions = useMemo(() => {
    let attractions = getAll5AAttractions();
    
    // 如果有关键词，进行搜索
    if (searchKeyword.trim()) {
      attractions = searchAttractions(searchKeyword);
    }
    
    // 如果选择了城市，进行筛选
    if (selectedCity) {
      attractions = attractions.filter(attraction => attraction.city === selectedCity);
    }
    
    return attractions;
  }, [searchKeyword, selectedCity]);
  
  // 按城市分组显示
  const groupedByCity = useMemo(() => {
    const grouped = {};
    filteredAttractions.forEach(attraction => {
      if (!grouped[attraction.city]) {
        grouped[attraction.city] = [];
      }
      grouped[attraction.city].push(attraction);
    });
    return grouped;
  }, [filteredAttractions]);

  return (
    <div className="attractions5a-page">
      <div className="container">
        <h1 className="page-title">全国5A级旅游景区</h1>
        
        <div className="summary-stats">
          <div className="stat-card">
            <div className="stat-number">{totalAttractions}</div>
            <div className="stat-label">5A景区总数</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{cities.length}</div>
            <div className="stat-label">覆盖城市</div>
          </div>
          {searchKeyword && (
            <div className="stat-card">
              <div className="stat-number">{filteredAttractions.length}</div>
              <div className="stat-label">搜索结果</div>
            </div>
          )}
        </div>

        {/* 搜索和筛选区域 */}
        <div className="search-filter-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="搜索景区（支持中文、英文、城市名、城市首字母如bj/sh）..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  // 回车键自动触发搜索（通过onChange已实现）
                }
              }}
              className="search-input"
            />
            <button 
              className="search-btn"
              onClick={() => {
                // 搜索按钮点击（搜索已通过onChange实时触发）
                // 这里可以添加额外的搜索逻辑，如高亮显示等
              }}
            >
              🔍 搜索
            </button>
          </div>
          
          <div className="filter-box">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="city-filter"
            >
              <option value="">所有城市</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {selectedCity && (
              <button 
                className="clear-filter-btn"
                onClick={() => setSelectedCity('')}
              >
                清除筛选
              </button>
            )}
          </div>
        </div>

        {/* 搜索结果提示 */}
        {searchKeyword && filteredAttractions.length === 0 && (
          <div className="no-results">
            <p>未找到匹配的景区，请尝试其他关键词</p>
            <button onClick={() => setSearchKeyword('')}>清除搜索</button>
          </div>
        )}

        {/* 景区列表 */}
        {Object.keys(groupedByCity).length > 0 ? (
          <div className="city-sections">
            {Object.keys(groupedByCity).sort().map(city => (
              <div key={city} className="city-section">
                <h2 className="city-name">
                  <span className="city-icon">🏛️</span>
                  {city}
                  <span className="city-count">({groupedByCity[city].length}个)</span>
                </h2>
                <div className="attractions-grid">
                  {groupedByCity[city].map(attraction => (
                    <div 
                      key={attraction.id} 
                      className="attraction-card"
                      onClick={() => navigate(`/attraction/${attraction.id}`)}
                    >
                      <div className="attraction-type-badge">{attraction.type}</div>
                      <h3 className="attraction-name">{attraction.name}</h3>
                      {attraction.nameEn && (
                        <p className="attraction-name-en">{attraction.nameEn}</p>
                      )}
                      <p className="attraction-description">{attraction.description}</p>
                      <div className="attraction-footer">
                        <div className="attraction-badge">5A级</div>
                        {attraction.isFree !== undefined && (
                          <div className={`price-indicator ${attraction.isFree ? 'free' : 'paid'}`}>
                            {attraction.isFree ? '🆓 免费' : '💰 收费'}
                          </div>
                        )}
                      </div>
                      <button className="view-details-btn">查看详情 →</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : !searchKeyword && !selectedCity && (
          <div className="city-sections">
            {cities.map(city => (
              <div key={city} className="city-section">
                <h2 className="city-name">
                  <span className="city-icon">🏛️</span>
                  {city}
                  <span className="city-count">({attractions5A[city].length}个)</span>
                </h2>
                <div className="attractions-grid">
                  {attractions5A[city].map(attraction => (
                    <div 
                      key={attraction.id} 
                      className="attraction-card"
                      onClick={() => navigate(`/attraction/${attraction.id}`)}
                    >
                      <div className="attraction-type-badge">{attraction.type}</div>
                      <h3 className="attraction-name">{attraction.name}</h3>
                      {attraction.nameEn && (
                        <p className="attraction-name-en">{attraction.nameEn}</p>
                      )}
                      <p className="attraction-description">{attraction.description}</p>
                      <div className="attraction-footer">
                        <div className="attraction-badge">5A级</div>
                        {attraction.isFree !== undefined && (
                          <div className={`price-indicator ${attraction.isFree ? 'free' : 'paid'}`}>
                            {attraction.isFree ? '🆓 免费' : '💰 收费'}
                          </div>
                        )}
                      </div>
                      <button className="view-details-btn">查看详情 →</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Attractions5A;
