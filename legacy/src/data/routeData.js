// 城市间真实交通数据（基于2024年典型票价与时长）
// 距离单位：公里 | 高铁：二等座票价/时长 | 飞机：经济舱票价/总时长(含候机) | 自驾：油费+过路费 | 大巴：票价
// 数据来源：12306、携程等公开信息，供参考，实际以购票时为准

export const routeData = {
  '北京-上海': { dist: 1318, train: { price: 553, hours: 4.5 }, plane: { price: 600, hours: 3.5 }, car: { price: 1320, hours: 12 }, bus: { price: 350, hours: 14 } },
  '北京-杭州': { dist: 1280, train: { price: 538, hours: 4.8 }, plane: { price: 550, hours: 3.5 }, car: { price: 1280, hours: 13 }, bus: { price: 340, hours: 15 } },
  '北京-广州': { dist: 2120, train: { price: 862, hours: 8 }, plane: { price: 800, hours: 4 }, car: { price: 2120, hours: 22 }, bus: { price: 450, hours: 24 } },
  '北京-深圳': { dist: 2200, train: { price: 944, hours: 8.5 }, plane: { price: 750, hours: 4 }, car: { price: 2200, hours: 23 }, bus: { price: 480, hours: 26 } },
  '北京-成都': { dist: 1870, train: { price: 778, hours: 7.5 }, plane: { price: 650, hours: 3.5 }, car: { price: 1870, hours: 20 }, bus: { price: 420, hours: 22 } },
  '北京-重庆': { dist: 1950, train: { price: 794, hours: 11 }, plane: { price: 600, hours: 3.5 }, car: { price: 1950, hours: 21 }, bus: { price: 430, hours: 24 } },
  '北京-西安': { dist: 1080, train: { price: 515, hours: 4.5 }, plane: { price: 450, hours: 3 }, car: { price: 1080, hours: 11 }, bus: { price: 280, hours: 14 } },
  '北京-武汉': { dist: 1200, train: { price: 520, hours: 4.5 }, plane: { price: 500, hours: 3 }, car: { price: 1200, hours: 12 }, bus: { price: 300, hours: 14 } },
  '北京-南京': { dist: 1020, train: { price: 443, hours: 3.5 }, plane: { price: 480, hours: 3 }, car: { price: 1020, hours: 11 }, bus: { price: 260, hours: 13 } },
  '上海-杭州': { dist: 180, train: { price: 73, hours: 1 }, plane: null, car: { price: 180, hours: 2 }, bus: { price: 55, hours: 2.5 } },
  '上海-南京': { dist: 300, train: { price: 140, hours: 1 }, plane: null, car: { price: 300, hours: 3.5 }, bus: { price: 90, hours: 4 } },
  '上海-苏州': { dist: 100, train: { price: 39, hours: 0.5 }, plane: null, car: { price: 100, hours: 1.5 }, bus: { price: 35, hours: 1.5 } },
  '上海-广州': { dist: 1380, train: { price: 793, hours: 7 }, plane: { price: 650, hours: 3.5 }, car: { price: 1380, hours: 15 }, bus: { price: 380, hours: 18 } },
  '上海-深圳': { dist: 1450, train: { price: 554, hours: 7.5 }, plane: { price: 600, hours: 3.5 }, car: { price: 1450, hours: 16 }, bus: { price: 400, hours: 20 } },
  '上海-成都': { dist: 1980, train: { price: 603, hours: 11.5 }, plane: { price: 700, hours: 4 }, car: { price: 1980, hours: 22 }, bus: { price: 450, hours: 26 } },
  '上海-武汉': { dist: 830, train: { price: 304, hours: 4 }, plane: { price: 450, hours: 2.5 }, car: { price: 830, hours: 9 }, bus: { price: 220, hours: 12 } },
  '广州-深圳': { dist: 150, train: { price: 74, hours: 0.5 }, plane: null, car: { price: 150, hours: 2 }, bus: { price: 50, hours: 2 } },
  '广州-武汉': { dist: 980, train: { price: 463, hours: 4 }, plane: { price: 500, hours: 2.5 }, car: { price: 980, hours: 10 }, bus: { price: 260, hours: 12 } },
  '广州-成都': { dist: 1300, train: { price: 540, hours: 7.5 }, plane: { price: 600, hours: 3 }, car: { price: 1300, hours: 16 }, bus: { price: 350, hours: 20 } },
  '广州-长沙': { dist: 700, train: { price: 314, hours: 2.5 }, plane: { price: 400, hours: 2 }, car: { price: 700, hours: 7 }, bus: { price: 180, hours: 9 } },
  '深圳-武汉': { dist: 1100, train: { price: 538, hours: 4.5 }, plane: { price: 500, hours: 2.5 }, car: { price: 1100, hours: 12 }, bus: { price: 280, hours: 14 } },
  '杭州-南京': { dist: 280, train: { price: 117, hours: 1 }, plane: null, car: { price: 280, hours: 3 }, bus: { price: 80, hours: 4 } },
  '杭州-武汉': { dist: 760, train: { price: 334, hours: 4 }, plane: { price: 420, hours: 2.5 }, car: { price: 760, hours: 8 }, bus: { price: 200, hours: 10 } },
  '成都-重庆': { dist: 300, train: { price: 154, hours: 1.5 }, plane: null, car: { price: 300, hours: 3.5 }, bus: { price: 90, hours: 4 } },
  '成都-西安': { dist: 700, train: { price: 263, hours: 3.5 }, plane: { price: 400, hours: 2 }, car: { price: 700, hours: 8 }, bus: { price: 180, hours: 10 } },
  '武汉-西安': { dist: 780, train: { price: 374, hours: 4 }, plane: { price: 450, hours: 2 }, car: { price: 780, hours: 9 }, bus: { price: 200, hours: 11 } },
  '武汉-成都': { dist: 1150, train: { price: 502, hours: 6 }, plane: { price: 550, hours: 2.5 }, car: { price: 1150, hours: 13 }, bus: { price: 300, hours: 16 } },
  '武汉-宜昌': { dist: 330, train: { price: 108, hours: 2 }, plane: null, car: { price: 330, hours: 4 }, bus: { price: 90, hours: 4.5 } },
  '西安-重庆': { dist: 650, train: { price: 279, hours: 5 }, plane: { price: 400, hours: 2 }, car: { price: 650, hours: 8 }, bus: { price: 170, hours: 10 } },
  '南京-成都': { dist: 1650, train: { price: 591, hours: 10 }, plane: { price: 650, hours: 3.5 }, car: { price: 1650, hours: 18 }, bus: { price: 420, hours: 22 } },
  '长沙-广州': { dist: 700, train: { price: 314, hours: 2.5 }, plane: { price: 400, hours: 2 }, car: { price: 700, hours: 7 }, bus: { price: 180, hours: 9 } },
  '长沙-武汉': { dist: 350, train: { price: 164, hours: 1.5 }, plane: null, car: { price: 350, hours: 4 }, bus: { price: 95, hours: 5 } },
  '北京-三亚': { dist: 2900, train: null, plane: { price: 800, hours: 4.5 }, car: { price: 2900, hours: 32 }, bus: null },
  '上海-三亚': { dist: 2000, train: null, plane: { price: 650, hours: 3.5 }, car: { price: 2000, hours: 24 }, bus: null },
  '广州-三亚': { dist: 800, train: null, plane: { price: 350, hours: 1.5 }, car: { price: 800, hours: 10 }, bus: { price: 220, hours: 12 } },
  '深圳-三亚': { dist: 850, train: null, plane: { price: 380, hours: 1.5 }, car: { price: 850, hours: 11 }, bus: { price: 230, hours: 13 } },
  '成都-三亚': { dist: 1500, train: null, plane: { price: 550, hours: 2.5 }, car: { price: 1500, hours: 18 }, bus: null },
  '武汉-恩施': { dist: 520, train: { price: 218, hours: 4 }, plane: null, car: { price: 520, hours: 6 }, bus: { price: 140, hours: 7 } },
  '武汉-襄阳': { dist: 330, train: { price: 129, hours: 2 }, plane: null, car: { price: 330, hours: 4 }, bus: { price: 90, hours: 4.5 } },
  '武汉-十堰': { dist: 450, train: { price: 194, hours: 3 }, plane: null, car: { price: 450, hours: 5 }, bus: { price: 120, hours: 6 } },
};

// 根据距离估算（当无精确数据时）
const estimateByDistance = (dist, transport) => {
  const estimates = {
    train: { price: Math.round(dist * 0.42), hours: Math.round(dist / 250 * 10) / 10 },
    plane: dist > 800 ? { price: Math.round(400 + dist * 0.25), hours: 2 + dist / 1000 } : null,
    car: { price: Math.round(dist * 1.0), hours: Math.round(dist / 90 * 10) / 10 },
    bus: { price: Math.round(dist * 0.26), hours: Math.round(dist / 70 * 10) / 10 }
  };
  return estimates[transport];
};

// 获取路线数据
export const getRouteInfo = (from, to, transport) => {
  if (from === to) return { dist: 0, price: 0, hours: 0, available: true };
  const key1 = `${from}-${to}`;
  const key2 = `${to}-${from}`;
  const data = routeData[key1] || routeData[key2];
  
  if (!data) {
    // 使用 cityCoordinates 估算距离（需单独 import 避免循环依赖）
    const cityCoordinates = {
      "北京": { lng: 116.4074, lat: 39.9042 }, "上海": { lng: 121.4737, lat: 31.2304 },
      "杭州": { lng: 120.1551, lat: 30.2741 }, "南京": { lng: 118.7969, lat: 32.0603 },
      "武汉": { lng: 114.3162, lat: 30.5810 }, "广州": { lng: 113.2644, lat: 23.1291 },
      "深圳": { lng: 114.0579, lat: 22.5431 }, "成都": { lng: 104.0668, lat: 30.5728 },
      "重庆": { lng: 106.5516, lat: 29.5630 }, "西安": { lng: 108.9398, lat: 34.3416 },
      "宜昌": { lng: 111.2908, lat: 30.7026 }, "恩施": { lng: 109.4867, lat: 30.2722 },
      "十堰": { lng: 110.7979, lat: 32.6294 }, "神农架": { lng: 110.6765, lat: 31.7447 },
      "咸宁": { lng: 114.3221, lat: 29.8413 }, "襄阳": { lng: 112.1226, lat: 32.0090 },
      "荆门": { lng: 112.1991, lat: 31.0354 }, "长沙": { lng: 112.9388, lat: 28.2282 },
      "三亚": { lng: 109.5119, lat: 18.2528 }
    };
    const c1 = cityCoordinates[from] || {};
    const c2 = cityCoordinates[to] || {};
    if (!c1.lng || !c2.lng) return { dist: 500, price: 0, hours: 0, available: false };
    // 简单位球面距离估算（1度≈111km）
    const dist = Math.round(Math.sqrt(Math.pow((c1.lng - c2.lng) * 85, 2) + Math.pow((c1.lat - c2.lat) * 111, 2)));
    const est = estimateByDistance(dist, transport);
    if (!est) return { dist, price: 0, hours: 0, available: false };
    return { dist, price: est.price, hours: est.hours, available: true, estimated: true };
  }

  const t = transport === 'train' ? 'train' : transport === 'plane' ? 'plane' : transport === 'car' ? 'car' : 'bus';
  const info = data[t];
  if (!info) return { dist: data.dist, price: 0, hours: 0, available: false };
  return { dist: data.dist, price: info.price, hours: info.hours, available: true };
};
