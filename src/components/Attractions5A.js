import React from 'react';
import { attractions5A, getAttractionCities } from '../data/attractions5A';
import './Attractions5A.css';

function Attractions5A() {
  const cities = getAttractionCities();
  const totalAttractions = Object.values(attractions5A).reduce((sum, arr) => sum + arr.length, 0);

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
        </div>

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
                  <div key={attraction.id} className="attraction-card">
                    <div className="attraction-type-badge">{attraction.type}</div>
                    <h3 className="attraction-name">{attraction.name}</h3>
                    <p className="attraction-description">{attraction.description}</p>
                    <div className="attraction-badge">5A级</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Attractions5A;
