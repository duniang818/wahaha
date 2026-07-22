// 3A级景区数据（部分主要城市）
export const attractions3A = {
  "北京": [
    { id: 1001, name: "恭王府花园", nameEn: "Prince Gong's Garden", type: "历史文化", description: "清代王府花园", isFree: false, price: "40元/人", priceDetail: "门票40元。学生、老人有优惠" },
    { id: 1002, name: "什刹海酒吧街", nameEn: "Shichahai Bar Street", type: "休闲娱乐", description: "北京夜生活聚集地", isFree: true, price: "免费", priceDetail: "免费进入，消费另计" },
    { id: 1003, name: "烟袋斜街", nameEn: "Yandai Xiejie", type: "历史文化", description: "北京传统商业街", isFree: true, price: "免费", priceDetail: "免费开放，购物消费另计" }
  ],
  "上海": [
    { id: 2001, name: "多伦路文化名人街", nameEn: "Duolun Road", type: "历史文化", description: "上海文化名人街", isFree: true, price: "免费", priceDetail: "免费开放" },
    { id: 2002, name: "思南公馆", nameEn: "Sinan Mansions", type: "历史文化", description: "上海历史建筑群", isFree: true, price: "免费", priceDetail: "免费开放，部分展览和餐厅消费另计" },
    { id: 2003, name: "1933老场坊", nameEn: "1933 Old Millfun", type: "现代艺术", description: "创意园区", isFree: true, price: "免费", priceDetail: "免费开放，部分展览需购票" }
  ],
  "杭州": [
    { id: 3001, name: "白堤", nameEn: "Bai Causeway", type: "自然风光", description: "西湖著名景点", isFree: true, price: "免费", priceDetail: "免费开放" },
    { id: 3002, name: "苏堤", nameEn: "Su Causeway", type: "自然风光", description: "西湖著名景点", isFree: true, price: "免费", priceDetail: "免费开放" },
    { id: 3003, name: "断桥残雪", nameEn: "Broken Bridge", type: "自然风光", description: "西湖十景之一", isFree: true, price: "免费", priceDetail: "免费开放" }
  ],
  "西安": [
    { id: 4001, name: "书院门", nameEn: "Shuyuanmen", type: "历史文化", description: "西安文化街", isFree: true, price: "免费", priceDetail: "免费开放，购物消费另计" },
    { id: 4002, name: "大雁塔北广场", nameEn: "Big Wild Goose Pagoda North Square", type: "现代建筑", description: "音乐喷泉广场", isFree: true, price: "免费", priceDetail: "免费开放" },
    { id: 4003, name: "小雁塔", nameEn: "Small Wild Goose Pagoda", type: "历史文化", description: "唐代古塔", isFree: false, price: "免费", priceDetail: "免费开放，登塔需购票" }
  ],
  "成都": [
    { id: 5001, name: "文殊院", nameEn: "Wenshu Monastery", type: "历史文化", description: "成都著名佛教寺院", isFree: true, price: "免费", priceDetail: "免费开放" },
    { id: 5002, name: "人民公园", nameEn: "People's Park", type: "自然风光", description: "成都市民休闲公园", isFree: true, price: "免费", priceDetail: "免费开放，喝茶消费另计" },
    { id: 5003, name: "东郊记忆", nameEn: "East Suburb Memory", type: "现代艺术", description: "工业文化创意园区", isFree: true, price: "免费", priceDetail: "免费开放，部分展览需购票" }
  ]
};

// 获取所有3A景点
export const getAll3AAttractions = () => {
  const all = [];
  Object.keys(attractions3A).forEach(city => {
    attractions3A[city].forEach(attraction => {
      all.push({ ...attraction, city });
    });
  });
  return all;
};

// 获取有3A景点的城市列表
export const get3AAttractionCities = () => {
  return Object.keys(attractions3A).sort();
};
