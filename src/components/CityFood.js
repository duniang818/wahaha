import React from 'react';
import { cityFoods, getFoodCities } from '../data/cityFood';
import './CityFood.css';

function CityFood() {
  const cities = getFoodCities();

  return (
    <div className="city-food-page">
      <div className="container">
        <h1 className="page-title">各城市特色美食</h1>
        
        <div className="city-sections">
          {cities.map(city => (
            <div key={city} className="city-section">
              <h2 className="city-name">
                <span className="city-icon">🍜</span>
                {city}
                <span className="city-count">({cityFoods[city].length}种)</span>
              </h2>
              <div className="foods-grid">
                {cityFoods[city].map((food, index) => (
                  <div key={index} className="food-card">
                    <div className="food-type-badge">{food.type}</div>
                    <h3 className="food-name">{food.name}</h3>
                    <p className="food-description">{food.description}</p>
                    {food.famous && (
                      <div className="food-famous">
                        <span className="famous-label">推荐：</span>
                        <span className="famous-name">{food.famous}</span>
                      </div>
                    )}
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

export default CityFood;
