import React, { useEffect, useRef, useState } from 'react';
import { getCityCoordinate } from '../data/cityCoordinates';
import './RouteMap.css';

// 高德地图组件 - 需在 .env 中设置 REACT_APP_AMAP_KEY
// 申请地址：https://lbs.amap.com/
const AMAP_KEY = process.env.REACT_APP_AMAP_KEY;

function RouteMapAmap({ fromCity, toCity, transport }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error | no-key

  useEffect(() => {
    if (!fromCity || !toCity || fromCity === toCity) {
      setStatus('ready');
      return;
    }

    if (!AMAP_KEY) {
      setStatus('no-key');
      return;
    }

    let scriptLoaded = !!window.AMap;
    
    const initMap = () => {
      if (!containerRef.current || !window.AMap) return;
      
      const coord1 = getCityCoordinate(fromCity);
      const coord2 = getCityCoordinate(toCity);
      if (!coord1 || !coord2) {
        setStatus('error');
        return;
      }

      // 中心点
      const center = [(coord1.lng + coord2.lng) / 2, (coord1.lat + coord2.lat) / 2];
      
      const map = new window.AMap.Map(containerRef.current, {
        zoom: 6,
        center,
        viewMode: '2D'
      });

      // 起点、终点标记
      const fromMarker = new window.AMap.Marker({
        position: [coord1.lng, coord1.lat],
        title: fromCity,
        label: { content: 'A ' + fromCity, direction: 'top' }
      });
      const toMarker = new window.AMap.Marker({
        position: [coord2.lng, coord2.lat],
        title: toCity,
        label: { content: 'B ' + toCity, direction: 'top' }
      });
      map.add([fromMarker, toMarker]);

      // 驾车路线规划（0=速度优先，1=费用优先）
      window.AMap.plugin('AMap.Driving', () => {
        const driving = new window.AMap.Driving({
          policy: window.AMap.DrivingPolicy.LEAST_TIME,
          extensions: 'all'
        });
        driving.search(
          [coord1.lng, coord1.lat],
          [coord2.lng, coord2.lat],
          (status, result) => {
            if (status === 'complete' && result.routes && result.routes[0]) {
              const path = result.routes[0].steps.flatMap(s => s.path || []);
              if (path.length > 0) {
                const polyline = new window.AMap.Polyline({
                  path,
                  strokeColor: '#667eea',
                  strokeWeight: 5
                });
                map.add(polyline);
              }
              map.setFitView();
            }
          }
        );
      });

      mapRef.current = map;
      setStatus('ready');
    };

    if (scriptLoaded) {
      initMap();
      return () => { if (mapRef.current) mapRef.current.destroy(); };
    }

    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}`;
    script.async = true;
    script.onload = () => {
      window.AMap.plugin(['AMap.Driving', 'AMap.Marker', 'AMap.Polyline'], () => {
        initMap();
      });
    };
    script.onerror = () => setStatus('error');
    document.head.appendChild(script);

    return () => {
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, [fromCity, toCity, transport]);

  if (!fromCity || !toCity || fromCity === toCity) {
    return (
      <div className="route-map-amap empty">
        <p>请选择出发和到达城市</p>
      </div>
    );
  }

  if (status === 'no-key') {
    return (
      <div className="route-map-amap no-key">
        <p>💡 如需显示真实地图路线，请在项目根目录创建 .env 文件，添加：</p>
        <code>REACT_APP_AMAP_KEY=您的高德地图Key</code>
        <p className="hint">Key 申请地址：<a href="https://lbs.amap.com/" target="_blank" rel="noopener noreferrer">高德开放平台</a></p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="route-map-amap error">
        <p>地图加载失败，请检查网络或 Key 配置</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="route-map-amap" 
      style={{ width: '100%', height: 400, minHeight: 400 }}
    />
  );
}

export default RouteMapAmap;
