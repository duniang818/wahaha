// 博物馆数据（按城市）
export const museums = {
  "北京": [
    { id: 1, name: "中国国家博物馆", nameEn: "National Museum of China", type: "综合", description: "中国最大的综合性历史博物馆", isFree: true, price: "免费", priceDetail: "免费开放，需提前预约。开放时间：9:00-17:00（周一闭馆）" },
    { id: 2, name: "故宫博物院", nameEn: "Palace Museum", type: "历史", description: "明清两朝皇家宫殿", isFree: false, price: "旺季60元，淡季40元", priceDetail: "4-10月：60元；11-3月：40元。学生、老人有优惠。需提前预约" },
    { id: 3, name: "首都博物馆", nameEn: "Capital Museum", type: "历史", description: "北京历史文化博物馆", isFree: true, price: "免费", priceDetail: "免费开放，需提前预约。开放时间：9:00-17:00（周一闭馆）" },
    { id: 4, name: "中国科学技术馆", nameEn: "China Science and Technology Museum", type: "科技", description: "国家级综合性科技馆", isFree: false, price: "30元/人", priceDetail: "门票30元。学生、老人有优惠。开放时间：9:30-17:00（周一闭馆）" },
    { id: 5, name: "中国人民革命军事博物馆", nameEn: "Military Museum", type: "军事", description: "中国唯一的大型综合性军事历史博物馆", isFree: true, price: "免费", priceDetail: "免费开放，需提前预约" }
  ],
  "上海": [
    { id: 101, name: "上海博物馆", nameEn: "Shanghai Museum", type: "历史", description: "中国古代艺术博物馆", isFree: true, price: "免费", priceDetail: "免费开放，需提前预约。开放时间：9:00-17:00（周一闭馆）" },
    { id: 102, name: "上海自然博物馆", nameEn: "Shanghai Natural History Museum", type: "自然", description: "自然历史博物馆", isFree: false, price: "30元/人", priceDetail: "门票30元。学生、老人有优惠" },
    { id: 103, name: "上海科技馆", nameEn: "Shanghai Science and Technology Museum", type: "科技", description: "大型科普教育基地", isFree: false, price: "45元/人", priceDetail: "门票45元。学生、老人有优惠" },
    { id: 104, name: "中共一大会址纪念馆", nameEn: "Site of the First National Congress", type: "历史", description: "中国共产党诞生地", isFree: true, price: "免费", priceDetail: "免费开放，需提前预约" }
  ],
  "杭州": [
    { id: 201, name: "浙江省博物馆", nameEn: "Zhejiang Museum", type: "历史", description: "浙江省最大的综合性人文科学博物馆", isFree: true, price: "免费", priceDetail: "免费开放，需提前预约" },
    { id: 202, name: "中国丝绸博物馆", nameEn: "China National Silk Museum", type: "专题", description: "全国性的丝绸专业博物馆", isFree: true, price: "免费", priceDetail: "免费开放，需提前预约" },
    { id: 203, name: "杭州博物馆", nameEn: "Hangzhou Museum", type: "历史", description: "杭州历史文化博物馆", isFree: true, price: "免费", priceDetail: "免费开放，需提前预约" }
  ],
  "西安": [
    { id: 301, name: "陕西历史博物馆", nameEn: "Shaanxi History Museum", type: "历史", description: "中国第一座大型现代化国家级博物馆", isFree: true, price: "免费", priceDetail: "免费开放，需提前预约。部分特展需购票" },
    { id: 302, name: "西安博物院", nameEn: "Xi'an Museum", type: "历史", description: "西安历史文化博物馆", isFree: true, price: "免费", priceDetail: "免费开放，需提前预约" },
    { id: 303, name: "碑林博物馆", nameEn: "Forest of Steles Museum", type: "历史", description: "中国古代碑刻艺术博物馆", isFree: false, price: "65元/人", priceDetail: "门票65元。学生、老人有优惠" }
  ],
  "成都": [
    { id: 401, name: "四川博物院", nameEn: "Sichuan Museum", type: "历史", description: "四川省最大的综合性博物馆", isFree: true, price: "免费", priceDetail: "免费开放，需提前预约" },
    { id: 402, name: "成都博物馆", nameEn: "Chengdu Museum", type: "历史", description: "成都历史文化博物馆", isFree: true, price: "免费", priceDetail: "免费开放，需提前预约" },
    { id: 403, name: "金沙遗址博物馆", nameEn: "Jinsha Site Museum", type: "历史", description: "古蜀文明遗址博物馆", isFree: false, price: "70元/人", priceDetail: "门票70元。学生、老人有优惠" }
  ],
  "南京": [
    { id: 501, name: "南京博物院", nameEn: "Nanjing Museum", type: "历史", description: "中国三大博物馆之一", isFree: true, price: "免费", priceDetail: "免费开放，需提前预约" },
    { id: 502, name: "侵华日军南京大屠杀遇难同胞纪念馆", nameEn: "Memorial Hall", type: "历史", description: "历史纪念馆", isFree: true, price: "免费", priceDetail: "免费开放，需提前预约" }
  ],
  "广州": [
    { id: 601, name: "广东省博物馆", nameEn: "Guangdong Museum", type: "历史", description: "广东省最大的综合性博物馆", isFree: true, price: "免费", priceDetail: "免费开放，需提前预约" },
    { id: 602, name: "广州博物馆", nameEn: "Guangzhou Museum", type: "历史", description: "广州历史文化博物馆", isFree: false, price: "10元/人", priceDetail: "门票10元。学生、老人有优惠" }
  ]
};

// 获取所有博物馆
export const getAllMuseums = () => {
  const all = [];
  Object.keys(museums).forEach(city => {
    museums[city].forEach(museum => {
      all.push({ ...museum, city });
    });
  });
  return all;
};

// 获取有博物馆的城市列表
export const getMuseumCities = () => {
  return Object.keys(museums).sort();
};
