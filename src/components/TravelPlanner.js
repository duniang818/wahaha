import React, { useState } from 'react';
import { getAllCities } from '../data/985Universities';
import { getAttractionCities } from '../data/attractions5A';
import { getFoodCities } from '../data/cityFood';
import './TravelPlanner.css';

const transportationOptions = [
  { value: 'plane', label: '飞机', icon: '✈️', speed: 'fast', cost: 'high' },
  { value: 'train', label: '高铁', icon: '🚄', speed: 'fast', cost: 'medium' },
  { value: 'car', label: '自驾', icon: '🚗', speed: 'medium', cost: 'medium' },
  { value: 'bus', label: '大巴', icon: '🚌', speed: 'slow', cost: 'low' }
];

function TravelPlanner() {
  const allCities = [...new Set([...getAllCities(), ...getAttractionCities(), ...getFoodCities()])].sort();
  
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [transport, setTransport] = useState('');
  const [route, setRoute] = useState(null);

  const calculateRoute = () => {
    if (!departure || !destination || !transport) {
      alert('请选择出发地、目的地和交通工具');
      return;
    }

    if (departure === destination) {
      alert('出发地和目的地不能相同');
      return;
    }

    const transportInfo = transportationOptions.find(t => t.value === transport);
    
    // 模拟路线规划
    const estimatedTime = calculateTime(departure, destination, transport);
    const estimatedCost = calculateCost(departure, destination, transport);
    const suggestions = generateSuggestions(destination);
    const steps = generateRouteSteps(departure, destination, transport, estimatedTime);

    setRoute({
      departure,
      destination,
      transport: transportInfo.label,
      transportIcon: transportInfo.icon,
      estimatedTime,
      estimatedCost,
      suggestions,
      steps
    });
  };

  const calculateTime = (from, to, transportType) => {
    // 简化的时间计算（实际应该基于真实距离）
    const baseTimes = {
      'plane': { min: 1, max: 3 },
      'train': { min: 2, max: 8 },
      'car': { min: 4, max: 12 },
      'bus': { min: 6, max: 15 }
    };
    
    const time = baseTimes[transportType];
    return `${time.min}-${time.max}小时`;
  };

  const calculateCost = (from, to, transportType) => {
    // 简化的成本计算
    const baseCosts = {
      'plane': { min: 500, max: 2000 },
      'train': { min: 200, max: 800 },
      'car': { min: 300, max: 1000 },
      'bus': { min: 100, max: 400 }
    };
    
    const cost = baseCosts[transportType];
    return `¥${cost.min}-${cost.max}`;
  };

  const generateSuggestions = (city) => {
    // 根据目的地生成建议
    return {
      attractions: '建议游览该城市的5A级景区',
      food: '品尝当地特色美食',
      universities: '如有兴趣可参观当地985大学'
    };
  };

  const generateRouteSteps = (from, to, transportType, estimatedTime) => {
    const steps = [];
    
    if (transportType === 'plane') {
      steps.push(
        { step: 1, action: `前往${from}机场`, time: '提前2小时' },
        { step: 2, action: '办理登机手续', time: '30分钟' },
        { step: 3, action: '登机', time: '按航班时间' },
        { step: 4, action: `抵达${to}机场`, time: estimatedTime },
        { step: 5, action: '前往市区', time: '1小时' }
      );
    } else if (transportType === 'train') {
      steps.push(
        { step: 1, action: `前往${from}火车站`, time: '提前1小时' },
        { step: 2, action: '检票进站', time: '20分钟' },
        { step: 3, action: '乘坐高铁', time: estimatedTime },
        { step: 4, action: `抵达${to}火车站`, time: '' },
        { step: 5, action: '前往市区', time: '30分钟' }
      );
    } else if (transportType === 'car') {
      steps.push(
        { step: 1, action: '检查车辆', time: '30分钟' },
        { step: 2, action: '出发', time: '按计划时间' },
        { step: 3, action: '途中休息', time: '每2-3小时' },
        { step: 4, action: `抵达${to}`, time: estimatedTime }
      );
    } else {
      steps.push(
        { step: 1, action: `前往${from}汽车站`, time: '提前30分钟' },
        { step: 2, action: '乘坐大巴', time: estimatedTime },
        { step: 3, action: `抵达${to}汽车站`, time: '' }
      );
    }
    
    return steps;
  };

  return (
    <div className="travel-planner-page">
      <div className="container">
        <h1 className="page-title">旅行路线规划</h1>
        
        <div className="planner-form">
          <div className="form-group">
            <label htmlFor="departure">出发地</label>
            <select 
              id="departure"
              value={departure} 
              onChange={(e) => setDeparture(e.target.value)}
              className="form-select"
            >
              <option value="">请选择出发城市</option>
              {allCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="destination">目的地</label>
            <select 
              id="destination"
              value={destination} 
              onChange={(e) => setDestination(e.target.value)}
              className="form-select"
            >
              <option value="">请选择目的地城市</option>
              {allCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="transport">交通工具</label>
            <div className="transport-options">
              {transportationOptions.map(option => (
                <div 
                  key={option.value}
                  className={`transport-option ${transport === option.value ? 'active' : ''}`}
                  onClick={() => setTransport(option.value)}
                >
                  <span className="transport-icon">{option.icon}</span>
                  <span className="transport-label">{option.label}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="plan-btn" onClick={calculateRoute}>
            规划路线
          </button>
        </div>

        {route && (
          <div className="route-result">
            <div className="route-header">
              <h2>路线规划结果</h2>
              <div className="route-summary">
                <span className="route-icon">{route.transportIcon}</span>
                <span>{route.departure} → {route.destination}</span>
              </div>
            </div>

            <div className="route-info-grid">
              <div className="info-card">
                <div className="info-icon">⏱️</div>
                <div className="info-content">
                  <div className="info-label">预计时间</div>
                  <div className="info-value">{route.estimatedTime}</div>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon">💰</div>
                <div className="info-content">
                  <div className="info-label">预计费用</div>
                  <div className="info-value">{route.estimatedCost}</div>
                </div>
              </div>
            </div>

            <div className="route-steps">
              <h3>行程步骤</h3>
              {route.steps.map((step, index) => (
                <div key={index} className="step-item">
                  <div className="step-number">{step.step}</div>
                  <div className="step-content">
                    <div className="step-action">{step.action}</div>
                    {step.time && <div className="step-time">{step.time}</div>}
                  </div>
                </div>
              ))}
            </div>

            <div className="route-suggestions">
              <h3>旅行建议</h3>
              <div className="suggestions-grid">
                <div className="suggestion-item">
                  <span className="suggestion-icon">🏛️</span>
                  <span>{route.suggestions.attractions}</span>
                </div>
                <div className="suggestion-item">
                  <span className="suggestion-icon">🍜</span>
                  <span>{route.suggestions.food}</span>
                </div>
                <div className="suggestion-item">
                  <span className="suggestion-icon">🎓</span>
                  <span>{route.suggestions.universities}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TravelPlanner;
