import React, { useState, useMemo } from 'react';
import { getTop3HotelsByCity, getAccommodationCities } from '../data/accommodations';
import './Accommodations.css';

function Accommodations() {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedStar, setSelectedStar] = useState(''); // '5' or '4' or ''

  const top3HotelsByCity = useMemo(() => getTop3HotelsByCity(), []);
  const allCities = useMemo(() => getAccommodationCities(), []);

  // 筛选后的数据
  const filteredData = useMemo(() => {
    let data = top3HotelsByCity;

    // 城市筛选
    if (selectedCity) {
      const filtered = {};
      if (data[selectedCity]) {
        filtered[selectedCity] = data[selectedCity];
      }
      data = filtered;
    }

    // 星级筛选
    if (selectedStar) {
      const filtered = {};
      Object.keys(data).forEach(city => {
        const cityHotels = data[city].filter(hotel => hotel.star === parseInt(selectedStar));
        if (cityHotels.length > 0) {
          filtered[city] = cityHotels;
        }
      });
      data = filtered;
    }

    return data;
  }, [top3HotelsByCity, selectedCity, selectedStar]);

  const cities = Object.keys(filteredData).sort();

  // 统计信息
  const stats = useMemo(() => {
    let total = 0;
    let star5 = 0;
    let star4 = 0;
    
    Object.values(filteredData).forEach(cityHotels => {
      total += cityHotels.length;
      cityHotels.forEach(hotel => {
        if (hotel.star === 5) star5++;
        else if (hotel.star === 4) star4++;
      });
    });

    return { total, star5, star4, cities: cities.length };
  }, [filteredData, cities]);

  return (
    <div className="accommodations-page">
      <div className="container">
        <h1 className="page-title">4星+酒店推荐</h1>
        <p className="page-subtitle">每个城市性价比最好的前3家酒店</p>
        
        {/* 统计信息 */}
        <div className="summary-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">推荐酒店</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.star5}</div>
            <div className="stat-label">五星级</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.star4}</div>
            <div className="stat-label">四星级</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.cities}</div>
            <div className="stat-label">覆盖城市</div>
          </div>
        </div>

        {/* 筛选区域 */}
        <div className="filter-section">
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
            value={selectedStar}
            onChange={(e) => setSelectedStar(e.target.value)}
            className="star-filter"
          >
            <option value="">所有星级</option>
            <option value="5">五星级</option>
            <option value="4">四星级</option>
          </select>
          
          {(selectedCity || selectedStar) && (
            <button 
              className="clear-filter-btn"
              onClick={() => {
                setSelectedCity('');
                setSelectedStar('');
              }}
            >
              清除筛选
            </button>
          )}
        </div>

        {/* 酒店列表 - 按城市和星级排序 */}
        {cities.length > 0 ? (
          <div className="city-sections">
            {cities.map(city => {
              const cityHotels = filteredData[city]
                .sort((a, b) => {
                  // 先按星级排序（5星在前），再按性价比排序
                  if (a.star !== b.star) {
                    return b.star - a.star;
                  }
                  return b.valueScore - a.valueScore;
                });

              return (
                <div key={city} className="city-section">
                  <h2 className="city-name">
                    <span className="city-icon">🏙️</span>
                    {city}
                    <span className="city-count">({cityHotels.length}家推荐)</span>
                  </h2>
                  
                  {/* 五星级酒店 */}
                  {cityHotels.filter(h => h.star === 5).length > 0 && (
                    <div className="star-section">
                      <h3 className="star-title">
                        <span className="star-badge badge-5">⭐⭐⭐⭐⭐</span>
                        五星级酒店
                      </h3>
                      <div className="hotels-grid">
                        {cityHotels
                          .filter(h => h.star === 5)
                          .map((hotel, index) => (
                            <div key={hotel.id} className="hotel-card top3">
                              {index < 3 && (
                                <div className="top3-badge">TOP {index + 1}</div>
                              )}
                              <div className="hotel-header">
                                <h4>{hotel.name}</h4>
                                <span className="value-score">性价比: {hotel.valueScore}/15</span>
                              </div>
                              {hotel.nameEn && (
                                <p className="hotel-name-en">{hotel.nameEn}</p>
                              )}
                              <p className="hotel-description">{hotel.description}</p>
                              <div className="hotel-footer">
                                <span className="price-tag">{hotel.price}</span>
                                <span className="star-badge badge-5">5星</span>
                              </div>
                              <div className="hotel-detail">{hotel.priceDetail}</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* 四星级酒店 */}
                  {cityHotels.filter(h => h.star === 4).length > 0 && (
                    <div className="star-section">
                      <h3 className="star-title">
                        <span className="star-badge badge-4">⭐⭐⭐⭐</span>
                        四星级酒店
                      </h3>
                      <div className="hotels-grid">
                        {cityHotels
                          .filter(h => h.star === 4)
                          .map((hotel, index) => (
                            <div key={hotel.id} className="hotel-card top3">
                              {index < 3 && (
                                <div className="top3-badge">TOP {index + 1}</div>
                              )}
                              <div className="hotel-header">
                                <h4>{hotel.name}</h4>
                                <span className="value-score">性价比: {hotel.valueScore}/15</span>
                              </div>
                              {hotel.nameEn && (
                                <p className="hotel-name-en">{hotel.nameEn}</p>
                              )}
                              <p className="hotel-description">{hotel.description}</p>
                              <div className="hotel-footer">
                                <span className="price-tag">{hotel.price}</span>
                                <span className="star-badge badge-4">4星</span>
                              </div>
                              <div className="hotel-detail">{hotel.priceDetail}</div>
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
            <p>未找到匹配的酒店</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Accommodations;
