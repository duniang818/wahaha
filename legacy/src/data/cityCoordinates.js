// 中国主要城市坐标（经纬度）
// 用于地图可视化，显示城市相对位置

export const cityCoordinates = {
  "北京": { lng: 116.4074, lat: 39.9042, x: 0.65, y: 0.25 }, // 相对坐标用于简化地图显示
  "上海": { lng: 121.4737, lat: 31.2304, x: 0.75, y: 0.45 },
  "杭州": { lng: 120.1551, lat: 30.2741, x: 0.72, y: 0.48 },
  "南京": { lng: 118.7969, lat: 32.0603, x: 0.70, y: 0.42 },
  "苏州": { lng: 120.5853, lat: 31.2989, x: 0.73, y: 0.44 },
  "西安": { lng: 108.9398, lat: 34.3416, x: 0.50, y: 0.35 },
  "成都": { lng: 104.0668, lat: 30.5728, x: 0.42, y: 0.50 },
  "重庆": { lng: 106.5516, lat: 29.5630, x: 0.45, y: 0.55 },
  "广州": { lng: 113.2644, lat: 23.1291, x: 0.68, y: 0.70 },
  "深圳": { lng: 114.0579, lat: 22.5431, x: 0.69, y: 0.72 },
  "三亚": { lng: 109.5119, lat: 18.2528, x: 0.60, y: 0.90 },
  "武汉": { lng: 114.3162, lat: 30.5810, x: 0.62, y: 0.45 },
  "宜昌": { lng: 111.2908, lat: 30.7026, x: 0.60, y: 0.48 },
  "恩施": { lng: 109.4867, lat: 30.2722, x: 0.55, y: 0.50 },
  "十堰": { lng: 110.7979, lat: 32.6294, x: 0.60, y: 0.42 },
  "神农架": { lng: 110.6765, lat: 31.7447, x: 0.58, y: 0.46 },
  "咸宁": { lng: 114.3221, lat: 29.8413, x: 0.63, y: 0.50 },
  "襄阳": { lng: 112.1226, lat: 32.0090, x: 0.61, y: 0.42 },
  "荆门": { lng: 112.1991, lat: 31.0354, x: 0.61, y: 0.44 },
  "长沙": { lng: 112.9388, lat: 28.2282, x: 0.64, y: 0.58 },
  "郑州": { lng: 113.6254, lat: 34.7466, x: 0.63, y: 0.38 },
  "济南": { lng: 117.1205, lat: 36.6512, x: 0.70, y: 0.32 },
  "青岛": { lng: 120.3826, lat: 36.0671, x: 0.73, y: 0.30 },
  "大连": { lng: 121.6147, lat: 38.9140, x: 0.78, y: 0.20 },
  "沈阳": { lng: 123.4315, lat: 41.8057, x: 0.80, y: 0.15 },
  "哈尔滨": { lng: 126.5358, lat: 45.8021, x: 0.85, y: 0.08 },
  "昆明": { lng: 102.7146, lat: 25.0492, x: 0.38, y: 0.65 },
  "贵阳": { lng: 106.6302, lat: 26.6477, x: 0.45, y: 0.60 },
  "南宁": { lng: 108.3669, lat: 22.8170, x: 0.55, y: 0.75 },
  "福州": { lng: 119.2965, lat: 26.0745, x: 0.72, y: 0.62 },
  "厦门": { lng: 118.1108, lat: 24.4798, x: 0.71, y: 0.66 },
  "南昌": { lng: 115.8921, lat: 28.6765, x: 0.68, y: 0.52 },
  "合肥": { lng: 117.2272, lat: 31.8206, x: 0.69, y: 0.43 },
  "石家庄": { lng: 114.5149, lat: 38.0428, x: 0.64, y: 0.28 },
  "太原": { lng: 112.5489, lat: 37.8706, x: 0.58, y: 0.30 },
  "呼和浩特": { lng: 111.7519, lat: 40.8414, x: 0.56, y: 0.22 },
  "乌鲁木齐": { lng: 87.6168, lat: 43.8256, x: 0.20, y: 0.25 },
  "拉萨": { lng: 91.1409, lat: 29.6456, x: 0.30, y: 0.60 },
  "银川": { lng: 106.2309, lat: 38.4872, x: 0.48, y: 0.28 },
  "西宁": { lng: 101.7782, lat: 36.6171, x: 0.40, y: 0.32 },
  "兰州": { lng: 103.8236, lat: 36.0581, x: 0.42, y: 0.33 }
};

// 获取城市的相对坐标（用于简化地图显示）
export const getCityCoordinate = (cityName) => {
  return cityCoordinates[cityName] || null;
};

// 获取所有有坐标的城市
export const getCitiesWithCoordinates = () => {
  return Object.keys(cityCoordinates);
};

// 计算两个城市之间的相对距离（用于地图显示）
export const calculateRelativeDistance = (city1, city2) => {
  const coord1 = cityCoordinates[city1];
  const coord2 = cityCoordinates[city2];
  if (!coord1 || !coord2) return 0;
  
  const dx = (coord1.x - coord2.x) * 1000; // 假设地图宽度为1000
  const dy = (coord1.y - coord2.y) * 1000; // 假设地图高度为1000
  return Math.sqrt(dx * dx + dy * dy);
};

// 获取方向（东西南北）
export const getDirection = (city1, city2) => {
  const coord1 = cityCoordinates[city1];
  const coord2 = cityCoordinates[city2];
  if (!coord1 || !coord2) return '';
  
  const dx = coord2.x - coord1.x;
  const dy = coord2.y - coord1.y;
  
  let direction = '';
  
  // 东西方向
  if (Math.abs(dx) > Math.abs(dy)) {
    direction = dx > 0 ? '东' : '西';
  } else {
    direction = dy > 0 ? '南' : '北';
  }
  
  // 如果有明显的斜向，添加次要方向
  if (Math.abs(dx) > 0.1 && Math.abs(dy) > 0.1) {
    if (Math.abs(dx) > Math.abs(dy)) {
      direction += dy > 0 ? '南' : '北';
    } else {
      direction = (dy > 0 ? '南' : '北') + (dx > 0 ? '东' : '西');
    }
  }
  
  return direction;
};
