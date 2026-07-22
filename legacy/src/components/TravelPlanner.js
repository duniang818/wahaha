import React, { useState, useMemo, useCallback } from 'react';
import { getAllCities } from '../data/985Universities';
import { getAttractionCities, getAll5AAttractions } from '../data/attractions5A';
import { get4AAttractionCities, getAll4AAttractions } from '../data/attractions4A';
import { get3AAttractionCities, getAll3AAttractions } from '../data/attractions3A';
import { getMuseumCities, getAllMuseums } from '../data/museums';
import { getFoodCities, cityFoods } from '../data/cityFood';
import { getAccommodationCities, getAllAccommodations } from '../data/accommodations';
import { cities985 } from '../data/985Universities';
import { cities211 } from '../data/universities211';
import { getRouteInfo } from '../data/routeData';
import { getCitiesWithCoordinates } from '../data/cityCoordinates';
import RouteMap from './RouteMap';
import './TravelPlanner.css';

const transportationOptions = [
  { value: 'plane', label: '飞机', icon: '✈️', speed: 600, costPerKm: 0.8 },
  { value: 'train', label: '高铁', icon: '🚄', speed: 300, costPerKm: 0.4 },
  { value: 'car', label: '自驾', icon: '🚗', speed: 100, costPerKm: 0.6 },
  { value: 'bus', label: '大巴', icon: '🚌', speed: 80, costPerKm: 0.2 }
];

// 城市间距离（公里）- 真实数据
const cityDistances = {
  '北京-上海': 1213, '北京-杭州': 1280, '北京-西安': 1080, '北京-成都': 1550,
  '上海-杭州': 180, '上海-南京': 300, '上海-苏州': 100, '上海-西安': 1350,
  '杭州-南京': 280, '杭州-苏州': 150, '杭州-西安': 1400, '杭州-成都': 1650,
  '西安-成都': 700, '西安-重庆': 650, '成都-重庆': 300, '成都-广州': 1300,
  '广州-深圳': 150, '北京-广州': 2120, '上海-广州': 1380,
  '广州-三亚': 800, '深圳-三亚': 850, '北京-三亚': 2900, '上海-三亚': 2000,
  '成都-三亚': 1500, '重庆-三亚': 1400, '西安-三亚': 2200,
  '西安-张家界': 1000, '张家界-长沙': 300
};

// 城市间可用的交通方式（真实情况）
const cityTransportOptions = {
  '广州-三亚': ['plane', 'car', 'bus'], // 没有直达高铁，需要转车
  '深圳-三亚': ['plane', 'car', 'bus'],
  '北京-三亚': ['plane', 'train'], // 有直达高铁（需要转车）
  '上海-三亚': ['plane', 'train'],
  '成都-三亚': ['plane', 'train'],
  '重庆-三亚': ['plane', 'train'],
  '西安-三亚': ['plane', 'train']
};

// 计算两个城市间的距离
const getDistance = (city1, city2) => {
  if (city1 === city2) return 0;
  const key1 = `${city1}-${city2}`;
  const key2 = `${city2}-${city1}`;
  return cityDistances[key1] || cityDistances[key2] || 500; // 默认500公里
};

// 检查两个城市间是否可以使用指定交通方式
const canUseTransport = (city1, city2, transport) => {
  if (city1 === city2) return true;
  const key1 = `${city1}-${city2}`;
  const key2 = `${city2}-${city1}`;
  const routeKey = cityTransportOptions[key1] || cityTransportOptions[key2];
  
  // 如果没有特殊限制，所有交通方式都可用
  if (!routeKey) return true;
  
  // 检查是否在允许的交通方式列表中
  return routeKey.includes(transport);
};

function TravelPlanner() {
  const allCities = useMemo(() => {
    const cities = new Set();
    getAllCities().forEach(c => cities.add(c));
    getAttractionCities().forEach(c => cities.add(c));
    getFoodCities().forEach(c => cities.add(c));
    get4AAttractionCities().forEach(c => cities.add(c));
    get3AAttractionCities().forEach(c => cities.add(c));
    getMuseumCities().forEach(c => cities.add(c));
    getAccommodationCities().forEach(c => cities.add(c));
    return Array.from(cities).sort();
  }, []);

  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedAttractions5A, setSelectedAttractions5A] = useState([]);
  const [selectedAttractions4A, setSelectedAttractions4A] = useState([]);
  const [selectedAttractions3A, setSelectedAttractions3A] = useState([]);
  const [selectedMuseums, setSelectedMuseums] = useState([]);
  const [selectedUniversities, setSelectedUniversities] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [selectedAccommodations, setSelectedAccommodations] = useState([]);
  const [transport, setTransport] = useState('train');
  const [route, setRoute] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'timeline'
  const [citySearchKeyword, setCitySearchKeyword] = useState('');
  const [showCitySearchResults, setShowCitySearchResults] = useState(false);
  const [routeRecommendations, setRouteRecommendations] = useState([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  
  // 新增：搜索类型和搜索结果
  const [searchType, setSearchType] = useState('city'); // city, attraction, hotel, food
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPOIs, setSelectedPOIs] = useState([]); // 选择的景点/酒店/美食

  // 城市拼音首字母映射（用于搜索）- 必须在使用前定义
  const cityPinyinMap = useMemo(() => ({
    '北京': 'bj', '上海': 'sh', '杭州': 'hz', '南京': 'nj', '苏州': 'sz',
    '西安': 'xa', '成都': 'cd', '重庆': 'cq', '广州': 'gz', '深圳': 'sz',
    '桂林': 'gl', '昆明': 'km', '丽江': 'lj', '拉萨': 'ls', '乌鲁木齐': 'wlmq',
    '张家界': 'zjj', '黄山': 'hs', '九寨沟': 'jzg', '泰山': 'ts', '曲阜': 'qf',
    '承德': 'cd', '大连': 'dl', '青岛': 'qd', '哈尔滨': 'heb', '洛阳': 'ly',
    '开封': 'kf', '武汉': 'wh', '长沙': 'cs', '厦门': 'xm', '三亚': 'sy',
    '合肥': 'hf', '天津': 'tj', '济南': 'jn', '福州': 'fz', '南昌': 'nc',
    '宜昌': 'yc', '恩施': 'es', '十堰': 'syy', '神农架': 'snj', '咸宁': 'xn', '襄阳': 'xy', '荆门': 'jm',
    '郑州': 'zz', '沈阳': 'sy', '贵阳': 'gy', '南宁': 'nn',
    '石家庄': 'sjz', '太原': 'ty', '呼和浩特': 'hhht', '银川': 'yc', '西宁': 'xn', '兰州': 'lz'
  }), []);
  
  // 搜索类型配置
  const searchTypeOptions = [
    { value: 'city', label: '城市', icon: '🏙️' },
    { value: 'attraction', label: '景点', icon: '🎫' },
    { value: 'hotel', label: '酒店', icon: '🏨' },
    { value: 'food', label: '美食', icon: '🍜' }
  ];

  // 搜索函数
  const handleSearch = useCallback((keyword) => {
    setCitySearchKeyword(keyword);
    if (!keyword.trim()) {
      setSearchResults([]);
      return;
    }

    const term = keyword.toLowerCase();
    const results = [];

    if (searchType === 'city') {
      // 搜索城市
      const matchedCities = allCities.filter(c => 
        c.toLowerCase().includes(term) || 
        (cityPinyinMap[c] || '').toLowerCase().includes(term)
      );
      results.push(...matchedCities.map(c => ({ type: 'city', name: c, city: c })));
    } else if (searchType === 'attraction') {
      // 搜索景点
      const all5A = getAll5AAttractions();
      const all4A = getAll4AAttractions();
      const all3A = getAll3AAttractions();
      const allM = getAllMuseums();
      
      [...all5A, ...all4A, ...all3A, ...allM].forEach(a => {
        if (a.name.toLowerCase().includes(term)) {
          results.push({ 
            type: 'attraction', 
            name: a.name, 
            city: a.city, 
            level: a.level || '博物馆',
            price: a.price || '免费',
            id: a.id
          });
        }
      });
    } else if (searchType === 'hotel') {
      // 搜索酒店
      const hotels = getAllAccommodations();
      hotels.forEach(h => {
        if (h.name.toLowerCase().includes(term)) {
          results.push({ 
            type: 'hotel', 
            name: h.name, 
            city: h.city, 
            price: h.price,
            id: h.id
          });
        }
      });
    } else if (searchType === 'food') {
      // 搜索美食
      const foods = cityFoods;
      foods.forEach(f => {
        if (f.name.toLowerCase().includes(term)) {
          results.push({ 
            type: 'food', 
            name: f.name, 
            city: f.city,
            id: f.name
          });
        }
      });
    }

    setSearchResults(results.slice(0, 10));
  }, [searchType, allCities, cityPinyinMap]);

  // 添加搜索结果到行程
  const addSearchResult = (result) => {
    if (result.type === 'city') {
      if (!selectedCities.includes(result.name)) {
        setSelectedCities([...selectedCities, result.name]);
      }
    } else {
      // 检查是否已添加
      const exists = selectedPOIs.find(p => p.name === result.name && p.type === result.type);
      if (!exists) {
        setSelectedPOIs([...selectedPOIs, result]);
      }
    }
    setCitySearchKeyword('');
    setSearchResults([]);
  };

  // 移除POI
  const removePOI = (index) => {
    setSelectedPOIs(selectedPOIs.filter((_, i) => i !== index));
  };

  // 移动POI顺序
  const movePOI = (index, direction) => {
    const newPOIs = [...selectedPOIs];
    if (direction === 'up' && index > 0) {
      [newPOIs[index], newPOIs[index - 1]] = [newPOIs[index - 1], newPOIs[index]];
    } else if (direction === 'down' && index < newPOIs.length - 1) {
      [newPOIs[index], newPOIs[index + 1]] = [newPOIs[index + 1], newPOIs[index]];
    }
    setSelectedPOIs(newPOIs);
  };

  // 通用城市搜索函数（首字母、中文）
  const searchCities = useCallback((searchTerm, cities, limit = 15) => {
    const term = (searchTerm || '').toLowerCase().trim();
    if (!term) return limit ? cities.slice(0, limit) : cities;
    const filtered = cities.filter(c => 
      c.toLowerCase().includes(term) || 
      (cityPinyinMap[c] || '').toLowerCase().includes(term)
    );
    return limit ? filtered.slice(0, limit) : filtered;
  }, [cityPinyinMap]);

  // 搜索城市
  const filteredCities = useMemo(() => {
    return searchCities(citySearchKeyword, allCities, 10);
  }, [citySearchKeyword, allCities, searchCities]);

  // 添加城市
  const addCity = (city) => {
    if (!selectedCities.includes(city)) {
      setSelectedCities([...selectedCities, city]);
      setCitySearchKeyword('');
      setShowCitySearchResults(false);
    } else {
      alert('该城市已添加');
    }
  };

  // 移除城市
  const removeCity = (city) => {
    setSelectedCities(selectedCities.filter(c => c !== city));
    // 同时移除该城市的所有选择
    setSelectedAttractions5A(selectedAttractions5A.filter(a => a.city !== city));
    setSelectedAttractions4A(selectedAttractions4A.filter(a => a.city !== city));
    setSelectedAttractions3A(selectedAttractions3A.filter(a => a.city !== city));
    setSelectedMuseums(selectedMuseums.filter(m => m.city !== city));
    setSelectedUniversities(selectedUniversities.filter(u => u.city !== city));
    setSelectedFoods(selectedFoods.filter(f => f.city !== city));
    setSelectedAccommodations(selectedAccommodations.filter(a => a.city !== city));
  };

  // 移动城市顺序
  const moveCity = (index, direction) => {
    const newCities = [...selectedCities];
    if (direction === 'up' && index > 0) {
      [newCities[index], newCities[index - 1]] = [newCities[index - 1], newCities[index]];
    } else if (direction === 'down' && index < newCities.length - 1) {
      [newCities[index], newCities[index + 1]] = [newCities[index + 1], newCities[index]];
    }
    setSelectedCities(newCities);
  };

  // 计算路线
  const calculateRoute = () => {
    if (selectedCities.length === 0) {
      alert('请至少选择一个城市');
      return;
    }
    if (selectedCities.length === 1) {
      alert('请选择至少两个城市，包括出发城市和到达城市');
      return;
    }

    const transportInfo = transportationOptions.find(t => t.value === transport);
    
    // 规划路线（按城市顺序）
    const routeSteps = [];
    let totalTime = 0; // 总时间（小时）
    let totalCost = 0; // 总费用（元）
    const routeDetails = [];

    // 1. 计算城市间交通
    for (let i = 0; i < selectedCities.length; i++) {
      const city = selectedCities[i];
      
      // 城市停留信息
      const cityStay = {
        city,
        attractions5A: selectedAttractions5A.filter(a => a.city === city),
        attractions4A: selectedAttractions4A.filter(a => a.city === city),
        attractions3A: selectedAttractions3A.filter(a => a.city === city),
        museums: selectedMuseums.filter(m => m.city === city),
        universities: selectedUniversities.filter(u => u.city === city),
        foods: selectedFoods.filter(f => f.city === city),
        accommodations: selectedAccommodations.filter(a => a.city === city)
      };

      // 计算该城市的停留时间（天）
      const itemsCount = 
        cityStay.attractions5A.length + cityStay.attractions4A.length + 
        cityStay.attractions3A.length + cityStay.museums.length + 
        cityStay.universities.length + cityStay.foods.length;
      const stayDays = Math.max(1, Math.ceil(itemsCount / 3)); // 每天约3个景点

      // 计算该城市的费用
      let cityCost = 0;
      
      // 景点费用
      [...cityStay.attractions5A, ...cityStay.attractions4A, ...cityStay.attractions3A].forEach(attraction => {
        if (!attraction.isFree && attraction.price) {
          const priceMatch = attraction.price.match(/(\d+)/);
          if (priceMatch) {
            cityCost += parseInt(priceMatch[1]);
          }
        }
      });

      // 博物馆费用
      cityStay.museums.forEach(museum => {
        if (!museum.isFree && museum.price) {
          const priceMatch = museum.price.match(/(\d+)/);
          if (priceMatch) {
            cityCost += parseInt(priceMatch[1]);
          }
        }
      });

      // 住宿费用
      if (cityStay.accommodations.length > 0) {
        const accommodation = cityStay.accommodations[0];
        const priceMatch = accommodation.price.match(/(\d+)/);
        if (priceMatch) {
          cityCost += parseInt(priceMatch[1]) * stayDays;
        }
      } else {
        // 默认住宿费用（经济型）
        cityCost += 200 * stayDays;
      }

      // 餐饮费用（每天约200元）
      cityCost += 200 * stayDays;

      // 城市间交通
      if (i > 0) {
        const prevCity = selectedCities[i - 1];
        const distance = getDistance(prevCity, city);
        
        // 根据实际路线调整交通方式和费用
        let actualTransport = transport;
        let actualTransportInfo = transportInfo;
        
        // 如果选择的交通方式不可用，自动调整为飞机
        if (!canUseTransport(prevCity, city, transport)) {
          actualTransport = 'plane';
          actualTransportInfo = transportationOptions.find(t => t.value === 'plane');
        }
        
        const travelTime = Math.ceil(distance / actualTransportInfo.speed);
        const travelCost = Math.ceil(distance * actualTransportInfo.costPerKm);
        
        totalTime += travelTime;
        totalCost += travelCost;

        routeSteps.push({
          type: 'travel',
          from: prevCity,
          to: city,
          distance,
          time: travelTime,
          cost: travelCost,
          transport: actualTransportInfo.label,
          transportIcon: actualTransportInfo.icon,
          note: actualTransport !== transport ? `（已自动调整为${actualTransportInfo.label}）` : ''
        });
      }

      // 城市停留
      totalTime += stayDays * 24; // 转换为小时
      totalCost += cityCost;

      routeSteps.push({
        type: 'stay',
        city,
        stayDays,
        cost: cityCost,
        ...cityStay
      });

      routeDetails.push({
        city,
        stayDays,
        cost: cityCost,
        items: cityStay
      });
    }

    setRoute({
      cities: selectedCities,
      transport: transportInfo.label,
      transportIcon: transportInfo.icon,
      totalTime: Math.ceil(totalTime / 24), // 转换为天数
      totalCost,
      steps: routeSteps,
      details: routeDetails,
      createdAt: new Date().toISOString()
    });
  };

  // 一键优化路线（按距离优化城市顺序）
  const optimizeRoute = () => {
    if (selectedCities.length <= 2) {
      alert('至少需要3个城市才能优化路线');
      return;
    }

    // 简单的贪心算法：从第一个城市开始，每次选择最近的城市
    const optimized = [selectedCities[0]];
    const remaining = [...selectedCities.slice(1)];

    while (remaining.length > 0) {
      const lastCity = optimized[optimized.length - 1];
      let nearestCity = remaining[0];
      let minDistance = getDistance(lastCity, nearestCity);

      for (const city of remaining) {
        const distance = getDistance(lastCity, city);
        if (distance < minDistance) {
          minDistance = distance;
          nearestCity = city;
        }
      }

      optimized.push(nearestCity);
      remaining.splice(remaining.indexOf(nearestCity), 1);
    }

    setSelectedCities(optimized);
    alert('路线已优化！请重新规划查看优化后的路线');
  };

  // 计算不同交通方式的路线推荐
  const calculateRouteRecommendations = () => {
    if (selectedCities.length < 2) return;

    const recommendations = [];

    // 计算每种交通方式的费用和时间
    transportationOptions.forEach(transportOption => {
      let totalTime = 0;
      let totalCost = 0;
      const transportDetails = [];

      for (let i = 1; i < selectedCities.length; i++) {
        const prevCity = selectedCities[i - 1];
        const city = selectedCities[i];
        const distance = getDistance(prevCity, city);
        
        let actualTransport = transportOption.value;
        let actualTransportInfo = transportOption;
        
        if (!canUseTransport(prevCity, city, transportOption.value)) {
          actualTransport = 'plane';
          actualTransportInfo = transportationOptions.find(t => t.value === 'plane');
        }
        
        const travelTime = Math.ceil(distance / actualTransportInfo.speed);
        const travelCost = Math.ceil(distance * actualTransportInfo.costPerKm);
        
        totalTime += travelTime;
        totalCost += travelCost;
        
        transportDetails.push({
          from: prevCity,
          to: city,
          transport: actualTransportInfo.label,
          icon: actualTransportInfo.icon,
          time: travelTime,
          cost: travelCost,
          distance
        });
      }

      recommendations.push({
        id: transportOption.value,
        name: transportOption.label,
        icon: transportOption.icon,
        totalTime,
        totalCost,
        details: transportDetails
      });
    });

    // 按时间和费用排序
    const timeSorted = [...recommendations].sort((a, b) => a.totalTime - b.totalTime);
    const costSorted = [...recommendations].sort((a, b) => a.totalCost - b.totalCost);

    // 找出最优解
    const fastest = timeSorted[0];
    const cheapest = costSorted[0];

    // 找出平衡方案（时间和费用都相对较低）
    const balanced = recommendations.reduce((best, current) => {
      const currentScore = current.totalTime * 0.5 + current.totalCost * 0.01;
      const bestScore = best.totalTime * 0.5 + best.totalCost * 0.01;
      return currentScore < bestScore ? current : best;
    }, recommendations[0]);

    // 为每个推荐添加标签
    recommendations.forEach(rec => {
      if (rec.id === fastest.id) rec.type = 'time';
      if (rec.id === cheapest.id) rec.type = 'cost';
      if (rec.id === balanced.id) rec.type = 'balanced';
    });

    setRouteRecommendations(recommendations);
    setSelectedRecommendation(null);
  };

  // 选择推荐路线
  const selectRecommendation = (rec) => {
    setSelectedRecommendation(rec.id);
    const transportOption = transportationOptions.find(t => t.value === rec.id);
    setTransport(rec.id);
    
    // 重新计算路线
    setTimeout(() => {
      calculateRoute();
    }, 100);
  };

  // 保存行程到本地存储
  const saveRoute = () => {
    if (!route) {
      alert('请先规划路线');
      return;
    }

    const savedRoutes = JSON.parse(localStorage.getItem('savedRoutes') || '[]');
    const newRoute = {
      ...route,
      id: Date.now(),
      name: `${route.cities.join(' → ')} (${route.totalTime}天)`,
      createdAt: new Date().toISOString()
    };
    savedRoutes.push(newRoute);
    localStorage.setItem('savedRoutes', JSON.stringify(savedRoutes));
    alert('行程已保存到本地！');
  };

  // 分享路线
  const shareRoute = () => {
    if (!route) {
      alert('请先规划路线');
      return;
    }

    // 生成路线文本
    let shareText = `🗺️ 我的旅行路线：${route.cities.join(' → ')}\n\n`;
    shareText += `⏱️ 总时长：${route.totalTime}天\n`;
    shareText += `💰 预计费用：¥${route.totalCost.toLocaleString()}\n\n`;
    shareText += `📍 行程安排：\n`;
    
    route.steps.forEach((step, index) => {
      if (step.type === 'travel') {
        shareText += `${index + 1}. ${step.from} → ${step.to} (${step.transportIcon} ${step.transport})\n`;
      } else {
        shareText += `${index + 1}. 📍 ${step.city} 停留${step.stayDays}天\n`;
      }
    });
    
    shareText += `\n分享自：名校与旅行导航`;

    // 复制到剪贴板
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('路线已复制到剪贴板，可以粘贴分享到社交媒体！');
      }).catch(() => {
        // 备用方案
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('路线已复制到剪贴板，可以粘贴分享到社交媒体！');
      });
    } else {
      // 备用方案
      const textarea = document.createElement('textarea');
      textarea.value = shareText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('路线已复制到剪贴板，可以粘贴分享到社交媒体！');
    }
  };

  // 从URL参数读取城市（用于从城市详情页跳转）
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cityParam = params.get('city');
    if (cityParam && !selectedCities.includes(cityParam) && allCities.includes(cityParam)) {
      setSelectedCities([cityParam]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 分数段划分逻辑
  const scoreRanges = useMemo(() => [
    { min: 700, max: 750, name: '700-750分', level: '顶尖名校' },
    { min: 650, max: 700, name: '650-700分', level: '985/顶尖211高校' },
    { min: 600, max: 650, name: '600-650分', level: '中上游211/强势一本院校' },
    { min: 550, max: 600, name: '550-600分', level: '普通一本/优质二本院校' },
    { min: 500, max: 550, name: '500-550分', level: '二本院校（公办/民办）' },
    { min: 450, max: 500, name: '450-500分', level: '三本/民办本科/专科（高分段）' },
    { min: 400, max: 450, name: '400-450分', level: '专科院校（中分段）' },
    { min: 350, max: 400, name: '350-400分', level: '专科院校（低分段）' },
    { min: 0, max: 350, name: '350分以下', level: '专科院校（末段）/高职' }
  ], []);

  // 获取所有大学数据（985 + 211）
  const allUniversities = useMemo(() => {
    const universities = [];
    
    // 添加985大学
    Object.keys(cities985).forEach(city => {
      cities985[city].forEach(uni => {
        universities.push({ ...uni, city, type: '985' });
      });
    });
    
    // 添加211大学
    Object.keys(cities211).forEach(city => {
      cities211[city].forEach(uni => {
        universities.push({ ...uni, city, type: '211' });
      });
    });
    
    return universities;
  }, []);

  // 按分数段划分大学
  const universitiesByScoreRange = useMemo(() => {
    const result = {};
    scoreRanges.forEach(range => {
      result[range.name] = allUniversities.filter(uni => {
        if (!uni.admissionScore || !uni.admissionScore[2024]) return false;
        const score = uni.admissionScore[2024];
        return score >= range.min && score < range.max;
      });
    });
    return result;
  }, [allUniversities, scoreRanges]);

  return (
    <div className="planner-page-wrapper">
      <div className="travel-planner-page">
        <div className="container">
          <h1 className="page-title">智能旅行路线规划</h1>
          <p className="page-subtitle">像导航一样，一键生成单城市深度游或多城市连线游的智能路线</p>

          <div className="planner-layout">
            {/* 侧边栏 */}
            <div className="planner-sidebar">
            {/* 城市选择 */}
            <div className="planner-section">
              <h2>1. 选择城市</h2>
              <p className="section-hint">提示：可以选择多个城市，按顺序规划路线（至少需要选择出发城市和到达城市）</p>
              
              {/* 快速添加常用城市 */}
              <div className="quick-add-cities">
                <span className="quick-add-label">快速添加：</span>
                <div className="quick-add-buttons">
                  <button onClick={() => {
                    if (!selectedCities.includes('西安')) addCity('西安');
                    if (!selectedCities.includes('张家界')) addCity('张家界');
                  }} className="quick-add-btn">西安 → 张家界</button>
                  <button onClick={() => {
                    if (!selectedCities.includes('北京')) addCity('北京');
                    if (!selectedCities.includes('上海')) addCity('上海');
                  }} className="quick-add-btn">北京 → 上海</button>
                  <button onClick={() => {
                    if (!selectedCities.includes('成都')) addCity('成都');
                    if (!selectedCities.includes('重庆')) addCity('重庆');
                  }} className="quick-add-btn">成都 → 重庆</button>
                </div>
              </div>
              
              {/* 搜索类型切换 */}
              <div className="search-type-tabs">
                {searchTypeOptions.map(option => (
                  <button
                    key={option.value}
                    className={`search-type-tab ${searchType === option.value ? 'active' : ''}`}
                    onClick={() => {
                      setSearchType(option.value);
                      setCitySearchKeyword('');
                      setSearchResults([]);
                    }}
                  >
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="city-selector">
                <div className="city-search-box">
                  <input
                    type="text"
                    placeholder={`搜索${searchTypeOptions.find(o => o.value === searchType)?.label || '地点'}...`}
                    value={citySearchKeyword}
                    onChange={(e) => {
                      handleSearch(e.target.value);
                      setShowCitySearchResults(true);
                    }}
                    onFocus={() => {
                      setShowCitySearchResults(true);
                    }}
                    className="city-search-input"
                  />
                </div>
                
                {/* 搜索结果下拉列表 */}
                {showCitySearchResults && (
                  <div 
                    className="city-search-results"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {searchResults.length > 0 ? (
                      searchResults.map((result, index) => (
                        <div
                          key={`${result.type}-${result.name}-${index}`}
                          className="city-search-item"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            addSearchResult(result);
                          }}
                        >
                          <span className="result-icon">
                            {result.type === 'city' ? '🏙️' : 
                             result.type === 'attraction' ? '🎫' : 
                             result.type === 'hotel' ? '🏨' : '🍜'}
                          </span>
                          <div className="result-info">
                            <span className="result-name">{result.name}</span>
                            <span className="result-city">{result.city}</span>
                          </div>
                          {result.price && <span className="result-price">{result.price}</span>}
                        </div>
                      ))
                    ) : (
                      <div className="city-search-empty">
                        {citySearchKeyword ? '未找到匹配的地点' : `请输入关键词搜索${searchTypeOptions.find(o => o.value === searchType)?.label || '地点'}`}
                      </div>
                    )}
                  </div>
                )}
                
                {/* 点击外部关闭下拉列表 */}
                {showCitySearchResults && (
                  <div 
                    className="city-search-overlay"
                    onClick={() => setShowCitySearchResults(false)}
                  />
                )}

                {/* 已选择的城市/POI列表 */}
                {(selectedCities.length > 0 || selectedPOIs.length > 0) && (
                  <div className="selected-cities">
                    <div className="selected-cities-label">
                      已选择的地点（拖拽调整顺序）：
                    </div>
                    <div className="selected-poi-list">
                      {/* 城市 */}
                      {selectedCities.map((city, index) => (
                        <div key={`city-${city}`} className="poi-item">
                          <span className="poi-drag">⋮⋮</span>
                          <span className="poi-icon">🏙️</span>
                          <span className="poi-name">{city}</span>
                          <span className="poi-type">城市</span>
                          <div className="poi-actions">
                            <button onClick={() => moveCity(index, 'up')} disabled={index === 0}>↑</button>
                            <button onClick={() => moveCity(index, 'down')} disabled={index === selectedCities.length - 1}>↓</button>
                            <button onClick={() => removeCity(city)}>×</button>
                          </div>
                        </div>
                      ))}
                      {/* POI */}
                      {selectedPOIs.map((poi, index) => (
                        <div key={`poi-${poi.type}-${poi.name}`} className="poi-item">
                          <span className="poi-drag">⋮⋮</span>
                          <span className="poi-icon">
                            {poi.type === 'attraction' ? '🎫' : 
                             poi.type === 'hotel' ? '🏨' : '🍜'}
                          </span>
                          <div className="poi-info">
                            <span className="poi-name">{poi.name}</span>
                            <span className="poi-city">{poi.city}</span>
                          </div>
                          <div className="poi-actions">
                            <button onClick={() => movePOI(index, 'up')} disabled={index === 0}>↑</button>
                            <button onClick={() => movePOI(index, 'down')} disabled={index === selectedPOIs.length - 1}>↓</button>
                            <button onClick={() => removePOI(index)}>×</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 景点选择 */}
              {selectedCities.length > 0 && (
                <div className="attractions-selector">
                    <div className="attractions-label">选择景点：</div>
                    {selectedCities.map((city) => (
                      <div key={city} className="city-attractions">
                        <div className="city-attractions-header">
                          <h4>{city}的景点</h4>
                          <button 
                            className="select-all-btn"
                            onClick={() => {
                              // 全选该城市的所有景点
                              const all5A = getAll5AAttractions().filter(a => a.city === city);
                              const all4A = getAll4AAttractions().filter(a => a.city === city);
                              const all3A = getAll3AAttractions().filter(a => a.city === city);
                              const allMuseums = getAllMuseums().filter(m => m.city === city);
                              
                              setSelectedAttractions5A(prev => [...new Set([...prev, ...all5A])]);
                              setSelectedAttractions4A(prev => [...new Set([...prev, ...all4A])]);
                              setSelectedAttractions3A(prev => [...new Set([...prev, ...all3A])]);
                              setSelectedMuseums(prev => [...new Set([...prev, ...allMuseums])]);
                            }}
                          >
                            全选
                          </button>
                        </div>
                        
                        {/* 5A景区 */}
                        <div className="attraction-group">
                          <div className="group-header">
                            <span>5A景区</span>
                          </div>
                          <div className="attraction-list">
                            {selectedAttractions5A.filter(a => a.city === city).map((attraction, index) => (
                              <div key={attraction.id} className="attraction-item">
                                <input
                                  type="checkbox"
                                  checked={true}
                                  onChange={(e) => {
                                    if (!e.target.checked) {
                                      setSelectedAttractions5A(prev => prev.filter(a => a.id !== attraction.id));
                                    }
                                  }}
                                />
                                <span>{attraction.name}</span>
                                <div className="attraction-actions">
                                  <button 
                                    className="move-btn move-up"
                                    onClick={() => {
                                      if (index > 0) {
                                        const newAttractions = [...selectedAttractions5A];
                                        const [movedAttraction] = newAttractions.splice(index, 1);
                                        newAttractions.splice(index - 1, 0, movedAttraction);
                                        setSelectedAttractions5A(newAttractions);
                                      }
                                    }}
                                    disabled={index === 0}
                                  >
                                    ↑
                                  </button>
                                  <button 
                                    className="move-btn move-down"
                                    onClick={() => {
                                      if (index < selectedAttractions5A.filter(a => a.city === city).length - 1) {
                                        const newAttractions = [...selectedAttractions5A];
                                        const [movedAttraction] = newAttractions.splice(index, 1);
                                        newAttractions.splice(index + 1, 0, movedAttraction);
                                        setSelectedAttractions5A(newAttractions);
                                      }
                                    }}
                                    disabled={index === selectedAttractions5A.filter(a => a.city === city).length - 1}
                                  >
                                    ↓
                                  </button>
                                </div>
                              </div>
                            ))}
                            {getAll5AAttractions().filter(a => a.city === city && !selectedAttractions5A.some(sa => sa.id === a.id)).map(attraction => (
                              <div key={attraction.id} className="attraction-item">
                                <input
                                  type="checkbox"
                                  checked={false}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedAttractions5A(prev => [...prev, attraction]);
                                    }
                                  }}
                                />
                                <span>{attraction.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* 4A景区 */}
                        <div className="attraction-group">
                          <div className="group-header">
                            <span>4A景区</span>
                          </div>
                          <div className="attraction-list">
                            {selectedAttractions4A.filter(a => a.city === city).map((attraction, index) => (
                              <div key={attraction.id} className="attraction-item">
                                <input
                                  type="checkbox"
                                  checked={true}
                                  onChange={(e) => {
                                    if (!e.target.checked) {
                                      setSelectedAttractions4A(prev => prev.filter(a => a.id !== attraction.id));
                                    }
                                  }}
                                />
                                <span>{attraction.name}</span>
                                <div className="attraction-actions">
                                  <button 
                                    className="move-btn move-up"
                                    onClick={() => {
                                      if (index > 0) {
                                        const newAttractions = [...selectedAttractions4A];
                                        const [movedAttraction] = newAttractions.splice(index, 1);
                                        newAttractions.splice(index - 1, 0, movedAttraction);
                                        setSelectedAttractions4A(newAttractions);
                                      }
                                    }}
                                    disabled={index === 0}
                                  >
                                    ↑
                                  </button>
                                  <button 
                                    className="move-btn move-down"
                                    onClick={() => {
                                      if (index < selectedAttractions4A.filter(a => a.city === city).length - 1) {
                                        const newAttractions = [...selectedAttractions4A];
                                        const [movedAttraction] = newAttractions.splice(index, 1);
                                        newAttractions.splice(index + 1, 0, movedAttraction);
                                        setSelectedAttractions4A(newAttractions);
                                      }
                                    }}
                                    disabled={index === selectedAttractions4A.filter(a => a.city === city).length - 1}
                                  >
                                    ↓
                                  </button>
                                </div>
                              </div>
                            ))}
                            {getAll4AAttractions().filter(a => a.city === city && !selectedAttractions4A.some(sa => sa.id === a.id)).map(attraction => (
                              <div key={attraction.id} className="attraction-item">
                                <input
                                  type="checkbox"
                                  checked={false}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedAttractions4A(prev => [...prev, attraction]);
                                    }
                                  }}
                                />
                                <span>{attraction.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* 博物馆 */}
                        <div className="attraction-group">
                          <div className="group-header">
                            <span>博物馆</span>
                          </div>
                          <div className="attraction-list">
                            {selectedMuseums.filter(m => m.city === city).map((museum, index) => (
                              <div key={museum.id} className="attraction-item">
                                <input
                                  type="checkbox"
                                  checked={true}
                                  onChange={(e) => {
                                    if (!e.target.checked) {
                                      setSelectedMuseums(prev => prev.filter(m => m.id !== museum.id));
                                    }
                                  }}
                                />
                                <span>{museum.name}</span>
                                <div className="attraction-actions">
                                  <button 
                                    className="move-btn move-up"
                                    onClick={() => {
                                      if (index > 0) {
                                        const newMuseums = [...selectedMuseums];
                                        const [movedMuseum] = newMuseums.splice(index, 1);
                                        newMuseums.splice(index - 1, 0, movedMuseum);
                                        setSelectedMuseums(newMuseums);
                                      }
                                    }}
                                    disabled={index === 0}
                                  >
                                    ↑
                                  </button>
                                  <button 
                                    className="move-btn move-down"
                                    onClick={() => {
                                      if (index < selectedMuseums.filter(m => m.city === city).length - 1) {
                                        const newMuseums = [...selectedMuseums];
                                        const [movedMuseum] = newMuseums.splice(index, 1);
                                        newMuseums.splice(index + 1, 0, movedMuseum);
                                        setSelectedMuseums(newMuseums);
                                      }
                                    }}
                                    disabled={index === selectedMuseums.filter(m => m.city === city).length - 1}
                                  >
                                    ↓
                                  </button>
                                </div>
                              </div>
                            ))}
                            {getAllMuseums().filter(m => m.city === city && !selectedMuseums.some(sm => sm.id === m.id)).map(museum => (
                              <div key={museum.id} className="attraction-item">
                                <input
                                  type="checkbox"
                                  checked={false}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedMuseums(prev => [...prev, museum]);
                                    }
                                  }}
                                />
                                <span>{museum.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 交通方式 */}
            <div className="planner-section">
              <h2>2. 选择交通方式</h2>
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

            {/* 规划按钮 */}
            <div className="plan-action">
              {selectedCities.length > 2 && (
                <button className="optimize-btn" onClick={optimizeRoute}>
                  ⚡ 一键优化路线
                </button>
              )}
              <button className="plan-btn" onClick={calculateRoute}>
                🗺️ 规划路线
              </button>
            </div>
          </div>

        <div className="planner-main">
            {/* 大学分数段划分 */}
            <div className="university-score-sections">
              <h3>🎓 中国大学按录取分数段划分</h3>
              <div className="score-sections-container">
                {scoreRanges.map((range, index) => {
                  const universities = universitiesByScoreRange[range.name];
                  return (
                    <div key={index} className="score-section">
                      <div className="score-section-header">
                        <h4>{range.name}</h4>
                        <span className="score-section-level">{range.level}</span>
                      </div>
                      <div className="score-section-content">
                        {universities.length > 0 ? (
                          <ul className="university-list">
                            {universities.map((uni) => (
                              <li key={uni.id} className="university-item">
                                <div className="university-basic-info">
                                  <span className="university-name">{uni.name}</span>
                                  <span className="university-type">{uni.type === '985' ? '985' : '211'}</span>
                                  <span className="university-score">{uni.admissionScore[2024]}分</span>
                                  <span className="university-city">{uni.city}</span>
                                </div>
                                {uni.zhangXuefeng && (
                                  <div className="university-zhangxuefeng">
                                    <div className="zhangxuefeng-evaluation">
                                      <strong>张雪峰评价：</strong>{uni.zhangXuefeng.evaluation}
                                    </div>
                                    <div className="zhangxuefeng-advice">
                                      <strong>就业建议：</strong>{uni.zhangXuefeng.careerAdvice}
                                    </div>
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="no-universities">该分数段暂无数据</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 路线推荐 */}
            {selectedCities.length >= 2 && !route && (
              <div className="route-recommendations">
                <h3>🚄 路线推荐（选择最优方案）</h3>
                <div className="recommendation-cards">
                  {routeRecommendations.length > 0 ? (
                    routeRecommendations.map(rec => (
                      <div 
                        key={rec.id}
                        className={`recommendation-card ${selectedRecommendation === rec.id ? 'selected' : ''}`}
                        onClick={() => selectRecommendation(rec)}
                      >
                        <div className="rec-title">
                          <span className="transport-icon">{rec.icon}</span>
                          <span>{rec.name}</span>
                          {rec.type === 'time' && <span className="badge badge-time">最快</span>}
                          {rec.type === 'cost' && <span className="badge badge-cost">最省钱</span>}
                          {rec.type === 'balanced' && <span className="badge badge-balanced">推荐</span>}
                        </div>
                        <div className="rec-details">
                          <div>总时长：{rec.totalTime} 小时</div>
                          <div>交通费用：¥{rec.totalCost.toLocaleString()}</div>
                        </div>
                        <div className="rec-transport">
                          {rec.details.map((d, idx) => (
                            <span key={idx}>{d.icon} {d.transport}</span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <button 
                      className="plan-btn" 
                      onClick={calculateRouteRecommendations}
                      style={{ gridColumn: '1 / -1' }}
                    >
                      查看路线推荐对比
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 路线结果 */}
            {route && (
              <div className="route-result">
                <div className="route-header">
                  <div className="route-header-top">
                    <h2>路线规划结果</h2>
                    <div className="route-actions">
                      <button className="view-toggle" onClick={() => setViewMode(viewMode === 'list' ? 'timeline' : 'list')}>
                        {viewMode === 'list' ? '📅 时间轴视图' : '📋 列表视图'}
                      </button>
                      <button className="save-btn" onClick={shareRoute}>
                        📤 分享路线
                      </button>
                      <button className="save-btn" onClick={saveRoute}>
                        💾 保存行程
                      </button>
                    </div>
                  </div>
                  <div className="route-summary">
                    <div className="summary-item">
                      <span className="summary-icon">📍</span>
                      <span>{route.cities.length} 个城市</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-icon">⏱️</span>
                      <span>{route.totalTime} 天</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-icon">💰</span>
                      <span>¥{route.totalCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* 路线图 */}
                {selectedCities.length > 0 && (
                  <RouteMap 
                    cities={selectedCities} 
                    routeSteps={route.steps} 
                    onCityOrderChange={(newCities) => {
                      setSelectedCities(newCities);
                      // 重新计算路线
                      if (route) {
                        calculateRoute();
                      }
                    }} 
                  />
                )}

                <div className="route-map">
                  <h3>{viewMode === 'timeline' ? '时间轴视图' : '路线图'}</h3>
                  {viewMode === 'timeline' ? (
                    <div className="timeline-view">
                      {route.details.map((detail, dayIndex) => {
                        let currentDay = 1;
                        // 计算这是第几天
                        for (let i = 0; i < dayIndex; i++) {
                          currentDay += route.details[i].stayDays;
                        }
                        return (
                          <div key={dayIndex} className="timeline-day">
                            <div className="timeline-marker">
                              <div className="timeline-dot"></div>
                              <div className="timeline-line"></div>
                            </div>
                            <div className="timeline-content">
                              <div className="timeline-header">
                                <h4>第 {currentDay}-{currentDay + detail.stayDays - 1} 天 · {detail.city}</h4>
                                <span className="timeline-days">{detail.stayDays} 天</span>
                              </div>
                              <div className="timeline-items">
                                {detail.items.attractions5A.length > 0 && (
                                  <div className="timeline-item-group">
                                    <span className="group-label">5A景区:</span>
                                    {detail.items.attractions5A.map((a, idx) => (
                                      <span key={a.id} className="timeline-item">
                                        <span className="item-seq">{idx + 1}.</span> {a.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {detail.items.attractions4A.length > 0 && (
                                  <div className="timeline-item-group">
                                    <span className="group-label">4A景区:</span>
                                    {detail.items.attractions4A.map((a, idx) => (
                                      <span key={a.id} className="timeline-item">
                                        <span className="item-seq">{idx + 1}.</span> {a.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {detail.items.museums.length > 0 && (
                                  <div className="timeline-item-group">
                                    <span className="group-label">博物馆:</span>
                                    {detail.items.museums.map((m, idx) => (
                                      <span key={m.id} className="timeline-item">
                                        <span className="item-seq">{idx + 1}.</span> {m.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {detail.items.universities.length > 0 && (
                                  <div className="timeline-item-group">
                                    <span className="group-label">学校:</span>
                                    {detail.items.universities.map((u, idx) => (
                                      <span key={u.id} className="timeline-item">
                                        <span className="item-seq">{idx + 1}.</span> {u.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {detail.items.foods.length > 0 && (
                                  <div className="timeline-item-group">
                                    <span className="group-label">美食:</span>
                                    {detail.items.foods.map((f, idx) => (
                                      <span key={f.name} className="timeline-item">
                                        <span className="item-seq">{idx + 1}.</span> {f.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="timeline-cost">
                                费用：¥{detail.cost.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="route-path">
                      {route.steps.map((step, index) => (
                        <div key={index} className={`route-step ${step.type === 'travel' ? 'travel-step' : 'stay-step'}`}>
                          <div className="step-connector">
                            {step.type === 'travel' && (
                              <span className="transport-icon-small">{step.transportIcon}</span>
                            )}
                            {index < route.steps.length - 1 && (
                              <div className="connector-line"></div>
                            )}
                          </div>
                          <div className="step-info">
                            {step.type === 'travel' ? (
                              <>
                                <div className="step-cities">
                                  {step.from} → {step.to}
                                </div>
                                <div className="step-details">
                                  <span>🚗 {step.transport}</span>
                                  <span>📏 {step.distance} 公里</span>
                                  <span>⏱️ {step.time} 小时</span>
                                  <span>💰 ¥{step.cost}</span>
                                  {step.note && <span className="step-note">{step.note}</span>}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="step-city">{step.city}</div>
                                <div className="step-stay-info">
                                  <div className="stay-duration">
                                    📅 停留 {step.stayDays} 天
                                  </div>
                                  <div className="stay-items">
                                    {step.attractions5A.map(a => (
                                      <span key={a.id} className="item-badge">{a.name}</span>
                                    ))}
                                    {step.attractions4A.map(a => (
                                      <span key={a.id} className="item-badge">{a.name}</span>
                                    ))}
                                    {step.attractions3A.map(a => (
                                      <span key={a.id} className="item-badge">{a.name}</span>
                                    ))}
                                    {step.museums.map(m => (
                                      <span key={m.id} className="item-badge">{m.name}</span>
                                    ))}
                                    {step.universities.map(u => (
                                      <span key={u.id} className="item-badge">{u.name}</span>
                                    ))}
                                    {step.foods.map(f => (
                                      <span key={f.name} className="item-badge">{f.name}</span>
                                    ))}
                                  </div>
                                  <div className="stay-cost">
                                    💰 ¥{step.cost}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 费用明细 */}
                <div className="cost-breakdown">
                  <h3>费用明细</h3>
                  <div className="cost-list">
                    {route.details.map((detail, index) => (
                      <div key={index} className="cost-item">
                        <div className="cost-city">{detail.city}</div>
                        <div className="cost-details">
                          <span>停留 {detail.stayDays} 天</span>
                          <div className="cost-total">
                            费用：¥{detail.cost.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="cost-total-final">
                    总费用：¥{route.totalCost.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TravelPlanner;