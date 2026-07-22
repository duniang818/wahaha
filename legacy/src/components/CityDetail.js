import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAll5AAttractions } from '../data/attractions5A';
import { getAll4AAttractions } from '../data/attractions4A';
import { getAll3AAttractions } from '../data/attractions3A';
import { getAllMuseums } from '../data/museums';
import { cityFoods } from '../data/cityFood';
import { getAllAccommodations } from '../data/accommodations';
import { cities985 } from '../data/985Universities';
import { cities211 } from '../data/universities211';
import { getCityCulture } from '../data/cityCulture';
import './CityDetail.css';

function CityDetail() {
  const { cityName } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const cityData = useMemo(() => {
    if (!cityName) return null;

    return {
      name: cityName,
      attractions5A: getAll5AAttractions().filter(a => a.city === cityName),
      attractions4A: getAll4AAttractions().filter(a => a.city === cityName),
      attractions3A: getAll3AAttractions().filter(a => a.city === cityName),
      museums: getAllMuseums().filter(m => m.city === cityName),
      universities985: cities985[cityName] || [],
      universities211: cities211[cityName] || [],
      foods: cityFoods[cityName] || [],
      accommodations: getAllAccommodations().filter(a => a.city === cityName),
      culture: getCityCulture(cityName)
    };
  }, [cityName]);

  const totalItems = useMemo(() => {
    if (!cityData) return 0;
    return cityData.attractions5A.length + cityData.attractions4A.length + 
           cityData.attractions3A.length + cityData.museums.length + 
           cityData.universities985.length + cityData.universities211.length + 
           cityData.foods.length;
  }, [cityData]);

  const bestVisitTime = useMemo(() => {
    // 根据城市推荐最佳游览时间
    const seasonMap = {
      '北京': '春季(3-5月)和秋季(9-11月)，气候宜人',
      '上海': '春季(3-5月)和秋季(9-11月)，温度适宜',
      '杭州': '春季(3-5月)和秋季(9-11月)，西湖最美',
      '西安': '春季(3-5月)和秋季(9-11月)，避开夏季高温',
      '成都': '春季(3-5月)和秋季(9-11月)，气候舒适',
      '广州': '秋季(10-12月)和春季(2-4月)，避开夏季',
      '南京': '春季(3-5月)和秋季(9-11月)，气候宜人'
    };
    return seasonMap[cityName] || '四季皆宜，建议避开极端天气';
  }, [cityName]);

  if (!cityData || !cityName) {
    return <div className="city-detail-page"><div className="container">城市不存在</div></div>;
  }

  const quickAddToPlan = () => {
    navigate(`/travel?city=${encodeURIComponent(cityName)}`);
  };

  return (
    <div className="city-detail-page">
      <div className="city-hero">
        <div className="container">
          <h1>{cityName}</h1>
          <p className="city-subtitle">发现 {cityName} 的精彩</p>
          <div className="city-stats">
            <div className="stat-item">
              <span className="stat-number">{cityData.attractions5A.length + cityData.attractions4A.length + cityData.attractions3A.length}</span>
              <span className="stat-label">景点</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{cityData.museums.length}</span>
              <span className="stat-label">博物馆</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{cityData.universities985.length}</span>
              <span className="stat-label">985大学</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{cityData.universities211.length}</span>
              <span className="stat-label">211大学</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{cityData.foods.length}</span>
              <span className="stat-label">特色美食</span>
            </div>
          </div>
          <button className="quick-plan-btn" onClick={quickAddToPlan}>
            ✈️ 添加到行程规划
          </button>
        </div>
      </div>

      <div className="container">
        <div className="city-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            概览
          </button>
          <button 
            className={`tab-btn ${activeTab === 'attractions' ? 'active' : ''}`}
            onClick={() => setActiveTab('attractions')}
          >
            景点 ({cityData.attractions5A.length + cityData.attractions4A.length + cityData.attractions3A.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'museums' ? 'active' : ''}`}
            onClick={() => setActiveTab('museums')}
          >
            博物馆 ({cityData.museums.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'universities' ? 'active' : ''}`}
            onClick={() => setActiveTab('universities')}
          >
            大学 ({cityData.universities985.length + cityData.universities211.length})
          </button>
          {cityData.culture && (
            <button 
              className={`tab-btn ${activeTab === 'culture' ? 'active' : ''}`}
              onClick={() => setActiveTab('culture')}
            >
              人文风俗
            </button>
          )}
          <button 
            className={`tab-btn ${activeTab === 'food' ? 'active' : ''}`}
            onClick={() => setActiveTab('food')}
          >
            美食 ({cityData.foods.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'accommodations' ? 'active' : ''}`}
            onClick={() => setActiveTab('accommodations')}
          >
            住宿 ({cityData.accommodations.length})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="info-card">
                <h3>📍 最佳游览时间</h3>
                <p>{bestVisitTime}</p>
              </div>
              <div className="info-card">
                <h3>🎯 推荐行程</h3>
                <p>建议游览 {Math.ceil(totalItems / 3)} 天，每天安排 2-3 个景点</p>
              </div>
              <div className="info-card">
                <h3>💰 预估费用</h3>
                <p>根据选择的景点和住宿，人均每天约 300-800 元</p>
              </div>
              <div className="quick-links">
                <h3>快速链接</h3>
                <div className="link-grid">
                  <button onClick={() => setActiveTab('attractions')} className="link-card">
                    <span className="link-icon">🏛️</span>
                    <span>查看所有景点</span>
                  </button>
                  <button onClick={() => setActiveTab('food')} className="link-card">
                    <span className="link-icon">🍜</span>
                    <span>特色美食</span>
                  </button>
                  <button onClick={() => setActiveTab('museums')} className="link-card">
                    <span className="link-icon">🏛️</span>
                    <span>博物馆</span>
                  </button>
                  <button onClick={quickAddToPlan} className="link-card highlight">
                    <span className="link-icon">🗺️</span>
                    <span>开始规划</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attractions' && (
            <div className="items-grid">
              {cityData.attractions5A.length > 0 && (
                <div className="category-section">
                  <h3>5A级景区</h3>
                  <div className="items-list">
                    {cityData.attractions5A.map(attraction => (
                      <div key={attraction.id} className="item-card">
                        <div className="item-header">
                          <h4>{attraction.name}</h4>
                          <span className="item-badge badge-5a">5A</span>
                        </div>
                        <p className="item-desc">{attraction.description}</p>
                        <div className="item-footer">
                          <span className={`price-tag ${attraction.isFree ? 'free' : 'paid'}`}>
                            {attraction.price}
                          </span>
                          <button 
                            className="add-btn"
                            onClick={() => navigate(`/attraction/${attraction.id}`)}
                          >
                            查看详情 →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cityData.attractions4A.length > 0 && (
                <div className="category-section">
                  <h3>4A级景区</h3>
                  <div className="items-list">
                    {cityData.attractions4A.map(attraction => (
                      <div key={attraction.id} className="item-card">
                        <div className="item-header">
                          <h4>{attraction.name}</h4>
                          <span className="item-badge badge-4a">4A</span>
                        </div>
                        <p className="item-desc">{attraction.description}</p>
                        <div className="item-footer">
                          <span className={`price-tag ${attraction.isFree ? 'free' : 'paid'}`}>
                            {attraction.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cityData.attractions3A.length > 0 && (
                <div className="category-section">
                  <h3>3A级景区</h3>
                  <div className="items-list">
                    {cityData.attractions3A.map(attraction => (
                      <div key={attraction.id} className="item-card">
                        <div className="item-header">
                          <h4>{attraction.name}</h4>
                          <span className="item-badge badge-3a">3A</span>
                        </div>
                        <p className="item-desc">{attraction.description}</p>
                        <div className="item-footer">
                          <span className={`price-tag ${attraction.isFree ? 'free' : 'paid'}`}>
                            {attraction.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'museums' && (
            <div className="items-grid">
              <div className="items-list">
                {cityData.museums.map(museum => (
                  <div key={museum.id} className="item-card">
                    <div className="item-header">
                      <h4>{museum.name}</h4>
                      <span className="item-badge">{museum.type}</span>
                    </div>
                    <p className="item-desc">{museum.description}</p>
                    <div className="item-footer">
                      <span className={`price-tag ${museum.isFree ? 'free' : 'paid'}`}>
                        {museum.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'universities' && (
            <div className="items-grid">
              {cityData.universities985.length > 0 && (
                <div className="category-section">
                  <h3>985大学</h3>
                  <div className="items-list">
                    {cityData.universities985.map(uni => (
                      <div key={uni.id} className="item-card">
                        <div className="item-header">
                          <h4>{uni.name}</h4>
                          <span className="item-badge badge-985">985</span>
                          <span className="item-badge">排名 #{uni.ranking}</span>
                        </div>
                        <p className="item-desc">{uni.type} | 建校于 {uni.established}年</p>
                        {uni.admissionScore && (
                          <div className="item-footer">
                            <span className="admission-score">
                              2024年录取分数线: {uni.admissionScore[2024]}分 ({uni.admissionScore.province})
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {cityData.universities211.length > 0 && (
                <div className="category-section">
                  <h3>211大学</h3>
                  <div className="items-list">
                    {cityData.universities211.map(uni => (
                      <div key={uni.id} className="item-card">
                        <div className="item-header">
                          <h4>{uni.name}</h4>
                          <span className="item-badge badge-211">211</span>
                          <span className="item-badge">排名 #{uni.ranking}</span>
                        </div>
                        <p className="item-desc">{uni.type} | 建校于 {uni.established}年</p>
                        {uni.admissionScore && (
                          <div className="item-footer">
                            <span className="admission-score">
                              2024年录取分数线: {uni.admissionScore[2024]}分 ({uni.admissionScore.province})
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'culture' && cityData.culture && (
            <div className="culture-section">
              <div className="culture-card">
                <h3>城市概览</h3>
                <p>{cityData.culture.culture.overview}</p>
              </div>
              
              <div className="culture-card">
                <h3>文化特色</h3>
                <ul className="culture-list">
                  {cityData.culture.culture.characteristics.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="culture-card">
                <h3>风俗习惯</h3>
                <ul className="culture-list">
                  {cityData.culture.culture.customs.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="culture-card highlight">
                <h3>有趣知识</h3>
                <ul className="culture-list">
                  {cityData.culture.culture.interestingFacts.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="culture-card">
                <h3>最佳游览时间</h3>
                <p>{cityData.culture.culture.bestTime}</p>
              </div>

              <div className="culture-card">
                <h3>旅行建议</h3>
                <p>{cityData.culture.culture.tips}</p>
              </div>
            </div>
          )}

          {activeTab === 'food' && (
            <div className="items-grid">
              <div className="items-list">
                {cityData.foods.map((food, index) => (
                  <div key={index} className="item-card">
                    <div className="item-header">
                      <h4>{food.name}</h4>
                      <span className="item-badge">{food.type}</span>
                    </div>
                    <p className="item-desc">{food.description}</p>
                    {food.famous && (
                      <div className="item-footer">
                        <span className="famous-place">📍 {food.famous}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'accommodations' && (
            <div className="items-grid">
              <div className="items-list">
                {cityData.accommodations.map(acc => (
                  <div key={acc.id} className="item-card">
                    <div className="item-header">
                      <h4>{acc.name}</h4>
                      <span className="item-badge">{acc.type}</span>
                    </div>
                    <p className="item-desc">{acc.description}</p>
                    <div className="item-footer">
                      <span className="price-tag paid">{acc.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CityDetail;
