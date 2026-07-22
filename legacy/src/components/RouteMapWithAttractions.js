import React, { useEffect, useRef } from 'react';
import { getCityCoordinate, getDirection } from '../data/cityCoordinates';
import './RouteMap.css';

const cityDistances = {
  '北京-上海': 1213, '北京-杭州': 1280, '北京-西安': 1080, '北京-成都': 1550,
  '上海-杭州': 180, '上海-南京': 300, '西安-成都': 700, '成都-重庆': 300,
  '广州-深圳': 150, '北京-广州': 2120
};

const getDistance = (city1, city2) => {
  if (city1 === city2) return 0;
  const key1 = `${city1}-${city2}`;
  const key2 = `${city2}-${city1}`;
  return cityDistances[key1] || cityDistances[key2] || 500;
};

// 不同类型徽章样式
const getBadgeStyle = (type) => {
  switch (type) {
    case '5A': return { bg: '#e53935', text: '5A' };
    case '4A': return { bg: '#1976d2', text: '4A' };
    case '3A': return { bg: '#43a047', text: '3A' };
    case 'museum': return { bg: '#7b1fa2', text: '博' };
    case 'university': return { bg: '#f57c00', text: '校' };
    case 'accommodation': return { bg: '#00838f', text: '宿' };
    default: return { bg: '#666', text: '·' };
  }
};

function RouteMapWithAttractions({ orderedItems, routeSteps }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!orderedItems || orderedItems.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    const width = container?.clientWidth || 800;
    const height = 500;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    // 计算每个景点的画布坐标（同城景点做小偏移）
    const cityIndex = {};
    const itemsWithCoord = orderedItems.map((item, idx) => {
      const coord = getCityCoordinate(item.city);
      if (!coord) return null;
      let offsetX = 0, offsetY = 0;
      if (cityIndex[item.city] !== undefined) {
        const n = cityIndex[item.city];
        const angle = (n / 6) * Math.PI * 2;
        offsetX = (n % 3 - 1) * 0.02;
        offsetY = Math.floor(n / 3) * 0.02 - 0.02;
      }
      cityIndex[item.city] = (cityIndex[item.city] || 0) + 1;
      return {
        ...item,
        x: coord.x + offsetX,
        y: coord.y + offsetY,
        seq: idx + 1
      };
    }).filter(Boolean);

    if (itemsWithCoord.length === 0) return;

    const minX = Math.min(...itemsWithCoord.map(c => c.x));
    const maxX = Math.max(...itemsWithCoord.map(c => c.x));
    const minY = Math.min(...itemsWithCoord.map(c => c.y));
    const maxY = Math.max(...itemsWithCoord.map(c => c.y));
    const padding = 0.12;
    const rangeX = maxX - minX || 0.2;
    const rangeY = maxY - minY || 0.2;
    const scaleX = (width * (1 - 2 * padding)) / rangeX;
    const scaleY = (height * (1 - 2 * padding)) / rangeY;
    const offsetX = width * padding - minX * scaleX;
    const offsetY = height * padding - minY * scaleY;
    const toCanvasX = (x) => x * scaleX + offsetX;
    const toCanvasY = (y) => y * scaleY + offsetY;

    // 绘制连线
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    for (let i = 0; i < itemsWithCoord.length - 1; i++) {
      const a = itemsWithCoord[i];
      const b = itemsWithCoord[i + 1];
      ctx.beginPath();
      ctx.moveTo(toCanvasX(a.x), toCanvasY(a.y));
      ctx.lineTo(toCanvasX(b.x), toCanvasY(b.y));
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 绘制每个景点
    itemsWithCoord.forEach((item) => {
      const x = toCanvasX(item.x);
      const y = toCanvasY(item.y);
      const style = getBadgeStyle(item.type);

      ctx.fillStyle = style.bg;
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.seq.toString(), x, y);

      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      const label = `${item.name} (${style.text})`;
      ctx.fillText(label, x, y + 24);
    });
  }, [orderedItems, routeSteps]);

  if (!orderedItems || orderedItems.length === 0) {
    return (
      <div className="route-map-container">
        <p className="map-placeholder">选择景点后将在地图上显示路线和序号</p>
      </div>
    );
  }

  return (
    <div className="route-map-container" ref={containerRef}>
      <div className="map-header">
        <h3>路线地图（按序号浏览）</h3>
        <div className="map-legend">
          <span className="legend-badge badge-5a">5A</span>
          <span className="legend-badge badge-4a">4A</span>
          <span className="legend-badge badge-3a">3A</span>
          <span className="legend-badge badge-museum">博</span>
          <span className="legend-badge badge-uni">校</span>
          <span className="legend-badge badge-acc">宿</span>
        </div>
      </div>
      <canvas ref={canvasRef} className="route-map-canvas" style={{ height: 500 }}></canvas>
    </div>
  );
}

export default RouteMapWithAttractions;
