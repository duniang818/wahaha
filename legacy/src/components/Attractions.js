import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAll5AAttractions, getAttractionCities } from '../data/attractions5A';
import { getAll4AAttractions, get4AAttractionCities } from '../data/attractions4A';
import { getAll3AAttractions, get3AAttractionCities } from '../data/attractions3A';
import { getAllMuseums, getMuseumCities } from '../data/museums';
import './Attractions.css';

function Attractions() {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(''); // '5A', '4A', '3A', 'museum', ''

  // 合并所有景区和博物馆数据
  const allAttractions = useMemo(() => {
    const attractions = [];
    
    // 添加5A景区
    getAll5AAttractions().forEach(attraction => {
      attractions.push({ ...attraction, level: '5A', category: 'attraction' });
    });
    
    // 添加4A景区
    getAll4AAttractions().forEach(attraction => {
      attractions.push({ ...attraction, level: '4A', category: 'attraction' });
    });
    
    // 添加3A景区
    getAll3AAttractions().forEach(attraction => {
      attractions.push({ ...attraction, level: '3A', category: 'attraction' });
    });
    
    // 添加博物馆
    getAllMuseums().forEach(museum => {
      attractions.push({ ...museum, level: 'museum', category: 'museum' });
    });
    
    return attractions;
  }, []);

  // 获取所有城市
  const allCities = useMemo(() => {
    const cities = new Set();
    getAttractionCities().forEach(c => cities.add(c));
    get4AAttractionCities().forEach(c => cities.add(c));
    get3AAttractionCities().forEach(c => cities.add(c));
    getMuseumCities().forEach(c => cities.add(c));
    return Array.from(cities).sort();
  }, []);

  // 搜索功能（复用5A的搜索逻辑）
  const cityPinyinMap = useMemo(() => ({
    '北京': 'bj', '上海': 'sh', '杭州': 'hz', '南京': 'nj', '苏州': 'sz',
    '西安': 'xa', '成都': 'cd', '重庆': 'cq', '广州': 'gz', '深圳': 'sz',
    '桂林': 'gl', '昆明': 'km', '丽江': 'lj', '拉萨': 'ls', '乌鲁木齐': 'wlmq',
    '张家界': 'zjj', '黄山': 'hs', '九寨沟': 'jzg', '泰山': 'ts', '曲阜': 'qf',
    '承德': 'cd', '大连': 'dl', '青岛': 'qd', '哈尔滨': 'heb', '洛阳': 'ly',
    '开封': 'kf', '武汉': 'wh', '长沙': 'cs', '厦门': 'xm', '三亚': 'sy',
    '宜昌': 'yc', '恩施': 'es', '十堰': 'syy', '神农架': 'snj', '咸宁': 'xn', '襄阳': 'xy', '荆门': 'jm'
  }), []);

  const getPinyinInitials = useMemo(() => {
    return (text) => {
      for (const [key, value] of Object.entries(cityPinyinMap)) {
        if (text.includes(key)) {
          return value;
        }
      }
      return '';
    };
  }, [cityPinyinMap]);

  // 筛选后的景区
  const filteredAttractions = useMemo(() => {
    let filtered = allAttractions;

    // 城市筛选
    if (selectedCity) {
      filtered = filtered.filter(a => a.city === selectedCity);
    }

    // 等级筛选
    if (selectedLevel) {
      filtered = filtered.filter(a => a.level === selectedLevel);
    }

    // 搜索筛选
    if (searchKeyword) {
      const searchTerm = searchKeyword.toLowerCase().trim();
      filtered = filtered.filter(attraction => {
        const nameMatch = attraction.name.toLowerCase().includes(searchTerm);
        const nameEnMatch = attraction.nameEn && attraction.nameEn.toLowerCase().includes(searchTerm);
        const cityMatch = attraction.city.toLowerCase().includes(searchTerm);
        const cityPinyin = getPinyinInitials(attraction.city)?.toLowerCase() || '';
        const cityPinyinMatch = cityPinyin && cityPinyin.includes(searchTerm);
        const typeMatch = attraction.type && attraction.type.toLowerCase().includes(searchTerm);
        const descMatch = attraction.description.toLowerCase().includes(searchTerm);
        
        return nameMatch || nameEnMatch || cityMatch || cityPinyinMatch || typeMatch || descMatch;
      });
    }

    return filtered;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAttractions, selectedCity, selectedLevel, searchKeyword, getPinyinInitials]);

  // 按城市和等级分组
  const groupedByCity = useMemo(() => {
    const grouped = {};
    filteredAttractions.forEach(attraction => {
      if (!grouped[attraction.city]) {
        grouped[attraction.city] = {
          '5A': [],
          '4A': [],
          '3A': [],
          'museum': []
        };
      }
      grouped[attraction.city][attraction.level].push(attraction);
    });

    // 每个等级内按名称排序
    Object.keys(grouped).forEach(city => {
      ['5A', '4A', '3A', 'museum'].forEach(level => {
        grouped[city][level].sort((a, b) => a.name.localeCompare(b.name));
      });
    });

    return grouped;
  }, [filteredAttractions]);

  const cities = Object.keys(groupedByCity).sort();

  // 统计信息
  const stats = useMemo(() => {
    const level5A = filteredAttractions.filter(a => a.level === '5A').length;
    const level4A = filteredAttractions.filter(a => a.level === '4A').length;
    const level3A = filteredAttractions.filter(a => a.level === '3A').length;
    const museums = filteredAttractions.filter(a => a.level === 'museum').length;
    
    return {
      total: filteredAttractions.length,
      level5A,
      level4A,
      level3A,
      museums,
      cities: cities.length
    };
  }, [filteredAttractions, cities]);

  return (
    <div className="attractions-page">
      <div className="container">
        <h1 className="page-title">景区与博物馆</h1>
        
        {/* 统计信息 */}
        <div className="summary-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">总数</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.level5A}</div>
            <div className="stat-label">5A景区</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.level4A}</div>
            <div className="stat-label">4A景区</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.level3A}</div>
            <div className="stat-label">3A景区</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.museums}</div>
            <div className="stat-label">博物馆</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.cities}</div>
            <div className="stat-label">覆盖城市</div>
          </div>
        </div>

        {/* 搜索和筛选区域 */}
        <div className="search-filter-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="搜索景区（支持中文、英文、城市名、城市首字母如bj/sh）..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="search-input"
            />
            <button className="search-btn">🔍 搜索</button>
          </div>
          
          <div className="filter-box">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="city-filter"
            >
              <option value="">所有城市</option>
              {allCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="level-filter"
            >
              <option value="">所有等级</option>
              <option value="5A">5A级景区</option>
              <option value="4A">4A级景区</option>
              <option value="3A">3A级景区</option>
              <option value="museum">博物馆</option>
            </select>
            
            {(selectedCity || selectedLevel) && (
              <button 
                className="clear-filter-btn"
                onClick={() => {
                  setSelectedCity('');
                  setSelectedLevel('');
                }}
              >
                清除筛选
              </button>
            )}
          </div>
        </div>

        {/* 景区列表 - 按城市和等级分组 */}
        {cities.length > 0 ? (
          <div className="city-sections">
            {cities.map(city => {
              const cityData = groupedByCity[city];
              const hasData = cityData['5A'].length > 0 || cityData['4A'].length > 0 || 
                             cityData['3A'].length > 0 || cityData['museum'].length > 0;
              
              if (!hasData) return null;

              return (
                <div key={city} className="city-section">
                  <h2 className="city-name">
                    <span className="city-icon">🏙️</span>
                    {city}
                  </h2>
                  
                  {/* 5A景区 */}
                  {cityData['5A'].length > 0 && (
                    <div className="level-section">
                      <h3 className="level-title">
                        <span className="level-badge badge-5a">5A</span>
                        5A级景区 ({cityData['5A'].length}个)
                      </h3>
                      <div className="attractions-grid">
                        {cityData['5A'].map(attraction => (
                          <div
                            key={attraction.id}
                            className="attraction-card"
                            onClick={() => navigate(`/attraction/${attraction.id}`)}
                          >
                            <div className="attraction-header">
                              <h4>{attraction.name}</h4>
                              <span className="level-badge badge-5a">5A</span>
                            </div>
                            {attraction.nameEn && (
                              <p className="attraction-name-en">{attraction.nameEn}</p>
                            )}
                            <p className="attraction-description">{attraction.description}</p>
                            <div className="attraction-footer">
                              <span className={`price-tag ${attraction.isFree ? 'free' : 'paid'}`}>
                                {attraction.price}
                              </span>
                              <button className="view-btn">查看详情 →</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4A景区 */}
                  {cityData['4A'].length > 0 && (
                    <div className="level-section">
                      <h3 className="level-title">
                        <span className="level-badge badge-4a">4A</span>
                        4A级景区 ({cityData['4A'].length}个)
                      </h3>
                      <div className="attractions-grid">
                        {cityData['4A'].map(attraction => (
                          <div
                            key={attraction.id}
                            className="attraction-card"
                            onClick={() => navigate(`/attraction/${attraction.id}`)}
                          >
                            <div className="attraction-header">
                              <h4>{attraction.name}</h4>
                              <span className="level-badge badge-4a">4A</span>
                            </div>
                            {attraction.nameEn && (
                              <p className="attraction-name-en">{attraction.nameEn}</p>
                            )}
                            <p className="attraction-description">{attraction.description}</p>
                            <div className="attraction-footer">
                              <span className={`price-tag ${attraction.isFree ? 'free' : 'paid'}`}>
                                {attraction.price}
                              </span>
                              <button className="view-btn">查看详情 →</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3A景区 */}
                  {cityData['3A'].length > 0 && (
                    <div className="level-section">
                      <h3 className="level-title">
                        <span className="level-badge badge-3a">3A</span>
                        3A级景区 ({cityData['3A'].length}个)
                      </h3>
                      <div className="attractions-grid">
                        {cityData['3A'].map(attraction => (
                          <div
                            key={attraction.id}
                            className="attraction-card"
                          >
                            <div className="attraction-header">
                              <h4>{attraction.name}</h4>
                              <span className="level-badge badge-3a">3A</span>
                            </div>
                            {attraction.nameEn && (
                              <p className="attraction-name-en">{attraction.nameEn}</p>
                            )}
                            <p className="attraction-description">{attraction.description}</p>
                            <div className="attraction-footer">
                              <span className={`price-tag ${attraction.isFree ? 'free' : 'paid'}`}>
                                {attraction.price}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 博物馆 */}
                  {cityData['museum'].length > 0 && (
                    <div className="level-section">
                      <h3 className="level-title">
                        <span className="level-badge badge-museum">🏛️</span>
                        博物馆 ({cityData['museum'].length}个)
                      </h3>
                      <div className="attractions-grid">
                        {cityData['museum'].map(museum => (
                          <div
                            key={museum.id}
                            className="attraction-card"
                          >
                            <div className="attraction-header">
                              <h4>{museum.name}</h4>
                              <span className="level-badge badge-museum">博物馆</span>
                            </div>
                            {museum.nameEn && (
                              <p className="attraction-name-en">{museum.nameEn}</p>
                            )}
                            <p className="attraction-description">{museum.description}</p>
                            <div className="attraction-footer">
                              <span className={`price-tag ${museum.isFree ? 'free' : 'paid'}`}>
                                {museum.price}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-results">
            <p>未找到匹配的景区</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Attractions;
