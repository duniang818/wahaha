import React, { useEffect, useRef, useState } from 'react';
import { getCityCoordinate, getDirection } from '../data/cityCoordinates';
import './RouteMap.css';

// 城市间距离（公里）- 与TravelPlanner保持一致
const cityDistances = {
  '北京-上海': 1213, '北京-杭州': 1280, '北京-西安': 1080, '北京-成都': 1550,
  '上海-杭州': 180, '上海-南京': 300, '上海-苏州': 100, '上海-西安': 1350,
  '杭州-南京': 280, '杭州-苏州': 150, '杭州-西安': 1400, '杭州-成都': 1650,
  '西安-成都': 700, '西安-重庆': 650, '成都-重庆': 300, '成都-广州': 1300,
  '广州-深圳': 150, '北京-广州': 2120, '上海-广州': 1380,
  '广州-三亚': 800, '深圳-三亚': 850, '北京-三亚': 2900, '上海-三亚': 2000,
  '成都-三亚': 1500, '重庆-三亚': 1400, '西安-三亚': 2200
};

// 计算两个城市间的距离
const getDistance = (city1, city2) => {
  if (city1 === city2) return 0;
  const key1 = `${city1}-${city2}`;
  const key2 = `${city2}-${city1}`;
  return cityDistances[key1] || cityDistances[key2] || 500; // 默认500公里
};

function RouteMap({ cities, routeSteps, onCityOrderChange }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!cities || cities.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    
    // 设置画布大小
    const width = container.clientWidth || 800;
    const height = 600;
    canvas.width = width;
    canvas.height = height;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 设置样式
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 获取所有城市的坐标
    const cityCoords = cities
      .map(city => {
        const coord = getCityCoordinate(city);
        return coord ? { city, ...coord } : null;
      })
      .filter(c => c !== null);

    if (cityCoords.length === 0) return;

    // 计算边界
    const minX = Math.min(...cityCoords.map(c => c.x));
    const maxX = Math.max(...cityCoords.map(c => c.x));
    const minY = Math.min(...cityCoords.map(c => c.y));
    const maxY = Math.max(...cityCoords.map(c => c.y));

    // 添加边距
    const padding = 0.1;
    const rangeX = maxX - minX || 0.2;
    const rangeY = maxY - minY || 0.2;
    const scaleX = (width * (1 - 2 * padding)) / rangeX;
    const scaleY = (height * (1 - 2 * padding)) / rangeY;
    const offsetX = width * padding - minX * scaleX;
    const offsetY = height * padding - minY * scaleY;

    // 转换坐标函数
    const toCanvasX = (x) => x * scaleX + offsetX;
    const toCanvasY = (y) => y * scaleY + offsetY;

    // 绘制背景网格（可选）
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i;
      const y = (height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 绘制方向指示（东西南北）
    ctx.fillStyle = '#999';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('北', width / 2, 20);
    ctx.fillText('南', width / 2, height - 10);
    ctx.fillText('西', 20, height / 2);
    ctx.fillText('东', width - 20, height / 2);

    // 绘制路线
    if (routeSteps && routeSteps.length > 0) {
      // 收集所有旅行步骤，按顺序绘制
      const travelSteps = routeSteps.filter(step => step.type === 'travel');
      for (let i = 0; i < travelSteps.length; i++) {
        const step = travelSteps[i];
        if (step.from && step.to) {
          const fromCoord = getCityCoordinate(step.from);
          const toCoord = getCityCoordinate(step.to);
          
          if (fromCoord && toCoord) {
            const x1 = toCanvasX(fromCoord.x);
            const y1 = toCanvasY(fromCoord.y);
            const x2 = toCanvasX(toCoord.x);
            const y2 = toCanvasY(toCoord.y);

            // 绘制路线
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 3;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            // 绘制箭头
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const arrowLength = 15;
            const arrowAngle = Math.PI / 6;

            ctx.fillStyle = '#667eea';
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(
              x2 - arrowLength * Math.cos(angle - arrowAngle),
              y2 - arrowLength * Math.sin(angle - arrowAngle)
            );
            ctx.lineTo(
              x2 - arrowLength * Math.cos(angle + arrowAngle),
              y2 - arrowLength * Math.sin(angle + arrowAngle)
            );
            ctx.closePath();
            ctx.fill();

            // 显示距离和方向
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            const distance = getDistance(step.from, step.to);
            const direction = getDirection(step.from, step.to);

            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 2;
            ctx.font = '12px Arial';
            const label = `${distance}km ${direction}`;
            const textWidth = ctx.measureText(label).width;
            
            ctx.fillRect(midX - textWidth / 2 - 5, midY - 10, textWidth + 10, 20);
            ctx.fillStyle = '#667eea';
            ctx.fillText(label, midX, midY);
          }
        }
      }
    } else {
      // 如果没有路线步骤，只连接城市
      for (let i = 0; i < cityCoords.length - 1; i++) {
        const from = cityCoords[i];
        const to = cityCoords[i + 1];
        
        const x1 = toCanvasX(from.x);
        const y1 = toCanvasY(from.y);
        const x2 = toCanvasX(to.x);
        const y2 = toCanvasY(to.y);

        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 绘制城市点
    cityCoords.forEach((cityData, index) => {
      const x = toCanvasX(cityData.x);
      const y = toCanvasY(cityData.y);

      // 绘制城市圆圈
      ctx.fillStyle = '#667eea';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();

      // 绘制城市名称
      ctx.fillStyle = '#333';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      
      // 根据位置调整标签位置，避免重叠
      let labelY = y - 20;
      if (y < 30) labelY = y + 25;
      
      ctx.fillText(cityData.city, x, labelY);

      // 绘制序号
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.fillText((index + 1).toString(), x, y);
    });
  }, [cities, routeSteps]);

  // 处理鼠标按下事件
  const handleMouseDown = (e) => {
    if (!cities || cities.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 获取所有城市的坐标
    const cityCoords = cities
      .map(city => {
        const coord = getCityCoordinate(city);
        return coord ? { city, ...coord } : null;
      })
      .filter(c => c !== null);

    // 计算边界
    const minX = Math.min(...cityCoords.map(c => c.x));
    const maxX = Math.max(...cityCoords.map(c => c.x));
    const minY = Math.min(...cityCoords.map(c => c.y));
    const maxY = Math.max(...cityCoords.map(c => c.y));

    // 添加边距
    const padding = 0.1;
    const width = canvas.width;
    const height = canvas.height;
    const rangeX = maxX - minX || 0.2;
    const rangeY = maxY - minY || 0.2;
    const scaleX = (width * (1 - 2 * padding)) / rangeX;
    const scaleY = (height * (1 - 2 * padding)) / rangeY;
    const offsetX = width * padding - minX * scaleX;
    const offsetY = height * padding - minY * scaleY;

    // 转换坐标函数
    const toCanvasX = (x) => x * scaleX + offsetX;
    const toCanvasY = (y) => y * scaleY + offsetY;

    // 检查是否点击了城市点
    for (let i = 0; i < cityCoords.length; i++) {
      const cityData = cityCoords[i];
      const x = toCanvasX(cityData.x);
      const y = toCanvasY(cityData.y);

      const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
      if (distance <= 12) { // 12是点击区域半径
        setDraggingIndex(i);
        setDragOffset({ x: mouseX - x, y: mouseY - y });
        return;
      }
    }
  };

  // 处理鼠标移动事件
  const handleMouseMove = (e) => {
    if (draggingIndex === null) return;
    
    // 这里可以添加视觉反馈，但实际排序需要在mouseup时处理
  };

  // 处理鼠标释放事件
  const handleMouseUp = (e) => {
    if (draggingIndex === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 获取所有城市的坐标
    const cityCoords = cities
      .map(city => {
        const coord = getCityCoordinate(city);
        return coord ? { city, ...coord } : null;
      })
      .filter(c => c !== null);

    // 计算边界
    const minX = Math.min(...cityCoords.map(c => c.x));
    const maxX = Math.max(...cityCoords.map(c => c.x));
    const minY = Math.min(...cityCoords.map(c => c.y));
    const maxY = Math.max(...cityCoords.map(c => c.y));

    // 添加边距
    const padding = 0.1;
    const width = canvas.width;
    const height = canvas.height;
    const rangeX = maxX - minX || 0.2;
    const rangeY = maxY - minY || 0.2;
    const scaleX = (width * (1 - 2 * padding)) / rangeX;
    const scaleY = (height * (1 - 2 * padding)) / rangeY;
    const offsetX = width * padding - minX * scaleX;
    const offsetY = height * padding - minY * scaleY;

    // 转换坐标函数
    const toCanvasX = (x) => x * scaleX + offsetX;
    const toCanvasY = (y) => y * scaleY + offsetY;

    // 找到鼠标释放位置最近的城市
    let closestIndex = draggingIndex;
    let minDistance = Infinity;

    for (let i = 0; i < cityCoords.length; i++) {
      if (i === draggingIndex) continue;

      const cityData = cityCoords[i];
      const x = toCanvasX(cityData.x);
      const y = toCanvasY(cityData.y);

      const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    // 如果拖动到了不同的位置，更新城市顺序
    if (closestIndex !== draggingIndex && onCityOrderChange) {
      const newCities = [...cities];
      const [movedCity] = newCities.splice(draggingIndex, 1);
      newCities.splice(closestIndex, 0, movedCity);
      onCityOrderChange(newCities);
    }

    setDraggingIndex(null);
    setDragOffset({ x: 0, y: 0 });
  };

  if (!cities || cities.length === 0) {
    return (
      <div className="route-map-container">
        <p className="map-placeholder">请选择城市以显示地图</p>
      </div>
    );
  }

  return (
    <div className="route-map-container" ref={containerRef}>
      <div className="map-header">
        <h3>路线地图</h3>
        <div className="map-legend">
          <div className="legend-item">
            <span className="legend-dot"></span>
            <span>城市位置</span>
          </div>
          <div className="legend-item">
            <span className="legend-line"></span>
            <span>旅行路线</span>
          </div>
        </div>
      </div>
      <canvas 
        ref={canvasRef} 
        className="route-map-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <div className="map-info">
        <p>💡 地图显示城市相对位置和旅行路线，标注了距离和方向（东西南北）</p>
        <p>📌 提示：可以拖动城市序号来调整游览顺序</p>
      </div>
    </div>
  );
}

export default RouteMap;
