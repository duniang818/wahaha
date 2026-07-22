// 住宿数据（按城市，包含星级、价格和性价比评分）
// 性价比评分：价格合理度(1-5) + 位置便利度(1-5) + 设施完善度(1-5)，总分15分
// 只包含4星及以上酒店
export const accommodations = {
  "北京": [
    { id: 1, name: "北京饭店", nameEn: "Beijing Hotel", type: "五星级", star: 5, description: "位于王府井，交通便利", price: "800-1500元/晚", priceDetail: "标准间800-1200元，豪华间1200-1500元。含早餐", valueScore: 13, isTop3: true },
    { id: 2, name: "北京丽思卡尔顿酒店", nameEn: "The Ritz-Carlton Beijing", type: "五星级", star: 5, description: "金融街核心位置，豪华享受", price: "1200-2000元/晚", priceDetail: "标准间1200-1800元，套房1800-2000元。含早餐和行政酒廊", valueScore: 12, isTop3: false },
    { id: 3, name: "北京王府井希尔顿酒店", nameEn: "Hilton Beijing Wangfujing", type: "五星级", star: 5, description: "王府井商业区，购物便利", price: "1000-1800元/晚", priceDetail: "标准间1000-1500元，豪华间1500-1800元。含早餐", valueScore: 14, isTop3: true },
    { id: 4, name: "北京万豪酒店", nameEn: "Beijing Marriott Hotel", type: "五星级", star: 5, description: "CBD核心区域，商务首选", price: "900-1600元/晚", priceDetail: "标准间900-1400元，行政间1400-1600元。含早餐", valueScore: 13, isTop3: true },
    { id: 5, name: "北京四季酒店", nameEn: "Four Seasons Hotel Beijing", type: "五星级", star: 5, description: "亮马桥区域，服务一流", price: "1500-2500元/晚", priceDetail: "标准间1500-2200元，套房2200-2500元。含早餐", valueScore: 11, isTop3: false },
    { id: 6, name: "北京JW万豪酒店", nameEn: "JW Marriott Hotel Beijing", type: "五星级", star: 5, description: "华贸中心，高端商务", price: "1100-1900元/晚", priceDetail: "标准间1100-1600元，行政间1600-1900元。含早餐", valueScore: 12, isTop3: false },
    { id: 7, name: "北京香格里拉饭店", nameEn: "Shangri-La Hotel Beijing", type: "五星级", star: 5, description: "紫竹院区域，环境优雅", price: "1000-1700元/晚", priceDetail: "标准间1000-1500元，豪华间1500-1700元。含早餐", valueScore: 13, isTop3: false },
    { id: 8, name: "北京瑞吉酒店", nameEn: "The St. Regis Beijing", type: "五星级", star: 5, description: "建国门外，奢华体验", price: "1300-2100元/晚", priceDetail: "标准间1300-1800元，套房1800-2100元。含早餐和管家服务", valueScore: 12, isTop3: false },
    { id: 9, name: "北京柏悦酒店", nameEn: "Park Hyatt Beijing", type: "五星级", star: 5, description: "国贸CBD，现代设计", price: "1400-2200元/晚", priceDetail: "标准间1400-2000元，套房2000-2200元。含早餐", valueScore: 11, isTop3: false },
    { id: 10, name: "北京康莱德酒店", nameEn: "Conrad Beijing", type: "五星级", star: 5, description: "朝阳区，时尚现代", price: "950-1650元/晚", priceDetail: "标准间950-1500元，行政间1500-1650元。含早餐", valueScore: 13, isTop3: false },
    { id: 11, name: "北京凯宾斯基饭店", nameEn: "Kempinski Hotel Beijing", type: "五星级", star: 5, description: "亮马桥，欧式风格", price: "900-1550元/晚", priceDetail: "标准间900-1400元，豪华间1400-1550元。含早餐", valueScore: 13, isTop3: false },
    { id: 12, name: "北京洲际酒店", nameEn: "InterContinental Beijing", type: "五星级", star: 5, description: "建国门，国际品牌", price: "1000-1700元/晚", priceDetail: "标准间1000-1500元，行政间1500-1700元。含早餐", valueScore: 13, isTop3: false },
    { id: 13, name: "北京威斯汀酒店", nameEn: "The Westin Beijing", type: "五星级", star: 5, description: "金融街，健康理念", price: "1050-1750元/晚", priceDetail: "标准间1050-1550元，行政间1550-1750元。含早餐", valueScore: 12, isTop3: false },
    { id: 14, name: "北京索菲特酒店", nameEn: "Sofitel Beijing", type: "五星级", star: 5, description: "建国门，法式优雅", price: "950-1600元/晚", priceDetail: "标准间950-1450元，豪华间1450-1600元。含早餐", valueScore: 13, isTop3: false },
    { id: 15, name: "北京丽晶酒店", nameEn: "Regent Beijing", type: "五星级", star: 5, description: "王府井，经典奢华", price: "1100-1800元/晚", priceDetail: "标准间1100-1600元，套房1600-1800元。含早餐", valueScore: 12, isTop3: false },
    { id: 16, name: "北京新世界酒店", nameEn: "New World Beijing Hotel", type: "四星级", star: 4, description: "崇文门，性价比高", price: "500-900元/晚", priceDetail: "标准间500-700元，豪华间700-900元。含早餐", valueScore: 14, isTop3: true },
    { id: 17, name: "北京民族饭店", nameEn: "Minzu Hotel", type: "四星级", star: 4, description: "西单商业区，位置优越", price: "550-950元/晚", priceDetail: "标准间550-750元，豪华间750-950元。含早餐", valueScore: 13, isTop3: true },
    { id: 18, name: "北京建国饭店", nameEn: "Jianguo Hotel Beijing", type: "四星级", star: 4, description: "建国门外，交通便利", price: "600-1000元/晚", priceDetail: "标准间600-800元，豪华间800-1000元。含早餐", valueScore: 13, isTop3: true }
  ],
  "上海": [
    { id: 101, name: "上海外滩茂悦大酒店", nameEn: "Hyatt on the Bund", type: "五星级", star: 5, description: "外滩景观，豪华享受", price: "1500-3000元/晚", priceDetail: "江景房1500-2500元，套房2500-3000元", valueScore: 13, isTop3: true },
    { id: 102, name: "上海浦东丽思卡尔顿酒店", nameEn: "The Ritz-Carlton Shanghai", type: "五星级", star: 5, description: "陆家嘴，顶级奢华", price: "1800-3500元/晚", priceDetail: "标准间1800-2800元，套房2800-3500元。含早餐", valueScore: 12, isTop3: false },
    { id: 103, name: "上海和平饭店", nameEn: "Fairmont Peace Hotel", type: "五星级", star: 5, description: "外滩历史建筑，经典优雅", price: "1600-3200元/晚", priceDetail: "标准间1600-2600元，套房2600-3200元。含早餐", valueScore: 13, isTop3: true },
    { id: 104, name: "上海半岛酒店", nameEn: "The Peninsula Shanghai", type: "五星级", star: 5, description: "外滩，极致奢华", price: "2000-4000元/晚", priceDetail: "标准间2000-3200元，套房3200-4000元。含早餐", valueScore: 11, isTop3: false },
    { id: 105, name: "上海华尔道夫酒店", nameEn: "Waldorf Astoria Shanghai", type: "五星级", star: 5, description: "外滩，历史与现代结合", price: "1700-3300元/晚", priceDetail: "标准间1700-2700元，套房2700-3300元。含早餐", valueScore: 12, isTop3: false },
    { id: 106, name: "上海四季酒店", nameEn: "Four Seasons Hotel Shanghai", type: "五星级", star: 5, description: "静安区，服务一流", price: "1400-2800元/晚", priceDetail: "标准间1400-2300元，套房2300-2800元。含早餐", valueScore: 12, isTop3: false },
    { id: 107, name: "上海新天地朗廷酒店", nameEn: "The Langham Shanghai", type: "五星级", star: 5, description: "新天地，时尚现代", price: "1300-2600元/晚", priceDetail: "标准间1300-2200元，套房2200-2600元。含早餐", valueScore: 13, isTop3: true },
    { id: 108, name: "上海静安香格里拉大酒店", nameEn: "Jing An Shangri-La", type: "五星级", star: 5, description: "静安区，商务首选", price: "1200-2400元/晚", priceDetail: "标准间1200-2000元，行政间2000-2400元。含早餐", valueScore: 13, isTop3: false },
    { id: 109, name: "上海浦东香格里拉大酒店", nameEn: "Pudong Shangri-La", type: "五星级", star: 5, description: "陆家嘴，江景房", price: "1500-2900元/晚", priceDetail: "江景房1500-2500元，套房2500-2900元。含早餐", valueScore: 12, isTop3: false },
    { id: 110, name: "上海外滩W酒店", nameEn: "W Shanghai", type: "五星级", star: 5, description: "外滩，年轻时尚", price: "1400-2700元/晚", priceDetail: "标准间1400-2300元，套房2300-2700元。含早餐", valueScore: 12, isTop3: false },
    { id: 111, name: "上海新世界丽笙大酒店", nameEn: "Radisson Blu Hotel Shanghai", type: "四星级", star: 4, description: "人民广场，位置优越", price: "600-1100元/晚", priceDetail: "标准间600-900元，豪华间900-1100元。含早餐", valueScore: 14, isTop3: true },
    { id: 112, name: "上海锦江饭店", nameEn: "Jinjiang Hotel", type: "四星级", star: 4, description: "淮海中路，历史名店", price: "650-1150元/晚", priceDetail: "标准间650-950元，豪华间950-1150元。含早餐", valueScore: 13, isTop3: true },
    { id: 113, name: "上海国际饭店", nameEn: "Park Hotel Shanghai", type: "四星级", star: 4, description: "人民广场，经典老店", price: "600-1100元/晚", priceDetail: "标准间600-900元，豪华间900-1100元。含早餐", valueScore: 13, isTop3: true }
  ],
  "杭州": [
    { id: 201, name: "杭州西湖国宾馆", nameEn: "West Lake State Guest House", type: "五星级", star: 5, description: "西湖边，环境优美", price: "1000-2000元/晚", priceDetail: "湖景房1000-1800元，套房1800-2000元", valueScore: 14, isTop3: true },
    { id: 202, name: "杭州西子湖四季酒店", nameEn: "Four Seasons Hotel Hangzhou", type: "五星级", star: 5, description: "西湖景区，园林式酒店", price: "1800-3500元/晚", priceDetail: "标准间1800-3000元，别墅3000-3500元。含早餐", valueScore: 12, isTop3: false },
    { id: 203, name: "杭州凯悦酒店", nameEn: "Hyatt Regency Hangzhou", type: "五星级", star: 5, description: "西湖边，位置绝佳", price: "1200-2400元/晚", priceDetail: "湖景房1200-2000元，套房2000-2400元。含早餐", valueScore: 13, isTop3: true },
    { id: 204, name: "杭州香格里拉饭店", nameEn: "Shangri-La Hotel Hangzhou", type: "五星级", star: 5, description: "西湖边，经典奢华", price: "1100-2200元/晚", priceDetail: "标准间1100-1900元，套房1900-2200元。含早餐", valueScore: 13, isTop3: true },
    { id: 205, name: "杭州黄龙饭店", nameEn: "Dragon Hotel", type: "五星级", star: 5, description: "黄龙体育中心，商务首选", price: "900-1800元/晚", priceDetail: "标准间900-1600元，行政间1600-1800元。含早餐", valueScore: 13, isTop3: false },
    { id: 206, name: "杭州温德姆至尊豪廷大酒店", nameEn: "Wyndham Grand Plaza Royale", type: "五星级", star: 5, description: "钱江新城，现代豪华", price: "1000-2000元/晚", priceDetail: "标准间1000-1800元，套房1800-2000元。含早餐", valueScore: 12, isTop3: false },
    { id: 207, name: "杭州维景国际大酒店", nameEn: "Metropark Hotel Hangzhou", type: "四星级", star: 4, description: "西湖区，性价比高", price: "500-900元/晚", priceDetail: "标准间500-700元，豪华间700-900元。含早餐", valueScore: 14, isTop3: true },
    { id: 208, name: "杭州新新饭店", nameEn: "New Hotel Hangzhou", type: "四星级", star: 4, description: "西湖边，历史名店", price: "550-950元/晚", priceDetail: "标准间550-750元，豪华间750-950元。含早餐", valueScore: 13, isTop3: true },
    { id: 209, name: "杭州世贸君澜大饭店", nameEn: "Narada Grand Hotel Hangzhou", type: "四星级", star: 4, description: "黄龙商圈，位置便利", price: "600-1000元/晚", priceDetail: "标准间600-800元，豪华间800-1000元。含早餐", valueScore: 13, isTop3: true }
  ],
  "西安": [
    { id: 301, name: "西安索菲特人民大厦", nameEn: "Sofitel Xian", type: "五星级", star: 5, description: "市中心，交通便利", price: "600-1200元/晚", priceDetail: "标准间600-900元，豪华间900-1200元", valueScore: 14, isTop3: true },
    { id: 302, name: "西安香格里拉大酒店", nameEn: "Shangri-La Hotel Xian", type: "五星级", star: 5, description: "高新区，现代豪华", price: "800-1600元/晚", priceDetail: "标准间800-1400元，套房1400-1600元。含早餐", valueScore: 13, isTop3: true },
    { id: 303, name: "西安凯悦酒店", nameEn: "Hyatt Regency Xian", type: "五星级", star: 5, description: "曲江新区，环境优美", price: "900-1700元/晚", priceDetail: "标准间900-1500元，套房1500-1700元。含早餐", valueScore: 13, isTop3: true },
    { id: 304, name: "西安威斯汀大酒店", nameEn: "The Westin Xian", type: "五星级", star: 5, description: "大雁塔，位置绝佳", price: "1000-1800元/晚", priceDetail: "标准间1000-1600元，套房1600-1800元。含早餐", valueScore: 12, isTop3: false },
    { id: 305, name: "西安喜来登大酒店", nameEn: "Sheraton Xian Hotel", type: "五星级", star: 5, description: "高新区，商务首选", price: "850-1650元/晚", priceDetail: "标准间850-1450元，行政间1450-1650元。含早餐", valueScore: 12, isTop3: false },
    { id: 306, name: "西安皇冠假日酒店", nameEn: "Crowne Plaza Xian", type: "四星级", star: 4, description: "市中心，性价比高", price: "450-850元/晚", priceDetail: "标准间450-700元，豪华间700-850元。含早餐", valueScore: 14, isTop3: true },
    { id: 307, name: "西安钟楼饭店", nameEn: "Bell Tower Hotel", type: "四星级", star: 4, description: "钟楼，位置优越", price: "500-900元/晚", priceDetail: "标准间500-750元，豪华间750-900元。含早餐", valueScore: 13, isTop3: true },
    { id: 308, name: "西安古都新世界大酒店", nameEn: "New World Xian Hotel", type: "四星级", star: 4, description: "市中心，交通便利", price: "480-880元/晚", priceDetail: "标准间480-730元，豪华间730-880元。含早餐", valueScore: 13, isTop3: true }
  ],
  "成都": [
    { id: 401, name: "成都香格里拉大酒店", nameEn: "Shangri-La Chengdu", type: "五星级", star: 5, description: "市中心，豪华享受", price: "800-1500元/晚", priceDetail: "标准间800-1200元，豪华间1200-1500元", valueScore: 14, isTop3: true },
    { id: 402, name: "成都瑞吉酒店", nameEn: "The St. Regis Chengdu", type: "五星级", star: 5, description: "春熙路，奢华体验", price: "1200-2200元/晚", priceDetail: "标准间1200-2000元，套房2000-2200元。含早餐和管家服务", valueScore: 12, isTop3: false },
    { id: 403, name: "成都群光君悦酒店", nameEn: "Grand Hyatt Chengdu", type: "五星级", star: 5, description: "春熙路，时尚现代", price: "1100-2100元/晚", priceDetail: "标准间1100-1900元，套房1900-2100元。含早餐", valueScore: 13, isTop3: true },
    { id: 404, name: "成都富力丽思卡尔顿酒店", nameEn: "The Ritz-Carlton Chengdu", type: "五星级", star: 5, description: "金融街，顶级奢华", price: "1300-2400元/晚", priceDetail: "标准间1300-2200元，套房2200-2400元。含早餐", valueScore: 12, isTop3: false },
    { id: 405, name: "成都世纪城天堂洲际大饭店", nameEn: "InterContinental Chengdu", type: "五星级", star: 5, description: "高新区，商务首选", price: "900-1700元/晚", priceDetail: "标准间900-1500元，行政间1500-1700元。含早餐", valueScore: 13, isTop3: true },
    { id: 406, name: "成都首座万豪酒店", nameEn: "Chengdu Marriott Hotel", type: "五星级", star: 5, description: "高新区，现代豪华", price: "950-1750元/晚", priceDetail: "标准间950-1550元，行政间1550-1750元。含早餐", valueScore: 12, isTop3: false },
    { id: 407, name: "成都总府皇冠假日酒店", nameEn: "Crowne Plaza Chengdu", type: "四星级", star: 4, description: "春熙路，位置优越", price: "500-950元/晚", priceDetail: "标准间500-800元，豪华间800-950元。含早餐", valueScore: 14, isTop3: true },
    { id: 408, name: "成都天府丽都喜来登饭店", nameEn: "Sheraton Chengdu", type: "四星级", star: 4, description: "市中心，性价比高", price: "550-1000元/晚", priceDetail: "标准间550-850元，豪华间850-1000元。含早餐", valueScore: 13, isTop3: true },
    { id: 409, name: "成都明宇尚雅饭店", nameEn: "Minyoun Hotel Chengdu", type: "四星级", star: 4, description: "高新区，现代舒适", price: "480-900元/晚", priceDetail: "标准间480-750元，豪华间750-900元。含早餐", valueScore: 13, isTop3: true }
  ],
  "南京": [
    { id: 501, name: "南京金陵饭店", nameEn: "Jinling Hotel", type: "五星级", star: 5, description: "市中心，交通便利", price: "700-1300元/晚", priceDetail: "标准间700-1000元，豪华间1000-1300元", valueScore: 14, isTop3: true },
    { id: 502, name: "南京香格里拉大酒店", nameEn: "Shangri-La Hotel Nanjing", type: "五星级", star: 5, description: "鼓楼区，现代豪华", price: "900-1700元/晚", priceDetail: "标准间900-1500元，套房1500-1700元。含早餐", valueScore: 13, isTop3: true },
    { id: 503, name: "南京威斯汀大酒店", nameEn: "The Westin Nanjing", type: "五星级", star: 5, description: "新街口，商务首选", price: "950-1750元/晚", priceDetail: "标准间950-1550元，行政间1550-1750元。含早餐", valueScore: 13, isTop3: true },
    { id: 504, name: "南京绿地洲际酒店", nameEn: "InterContinental Nanjing", type: "五星级", star: 5, description: "鼓楼区，地标建筑", price: "1000-1800元/晚", priceDetail: "标准间1000-1600元，套房1600-1800元。含早餐", valueScore: 12, isTop3: false },
    { id: 505, name: "南京金丝利喜来登酒店", nameEn: "Sheraton Nanjing", type: "四星级", star: 4, description: "新街口，位置优越", price: "500-950元/晚", priceDetail: "标准间500-800元，豪华间800-950元。含早餐", valueScore: 14, isTop3: true },
    { id: 506, name: "南京维景国际大酒店", nameEn: "Metropark Hotel Nanjing", type: "四星级", star: 4, description: "市中心，性价比高", price: "550-1000元/晚", priceDetail: "标准间550-850元，豪华间850-1000元。含早餐", valueScore: 13, isTop3: true },
    { id: 507, name: "南京古南都饭店", nameEn: "Gunandu Hotel", type: "四星级", star: 4, description: "新街口，历史名店", price: "520-920元/晚", priceDetail: "标准间520-770元，豪华间770-920元。含早餐", valueScore: 13, isTop3: true }
  ],
  "广州": [
    { id: 601, name: "广州白天鹅宾馆", nameEn: "White Swan Hotel", type: "五星级", star: 5, description: "珠江边，景观优美", price: "900-1800元/晚", priceDetail: "江景房900-1500元，套房1500-1800元", valueScore: 14, isTop3: true },
    { id: 602, name: "广州富力丽思卡尔顿酒店", nameEn: "The Ritz-Carlton Guangzhou", type: "五星级", star: 5, description: "珠江新城，顶级奢华", price: "1300-2500元/晚", priceDetail: "标准间1300-2200元，套房2200-2500元。含早餐", valueScore: 12, isTop3: false },
    { id: 603, name: "广州四季酒店", nameEn: "Four Seasons Hotel Guangzhou", type: "五星级", star: 5, description: "珠江新城，服务一流", price: "1200-2300元/晚", priceDetail: "标准间1200-2100元，套房2100-2300元。含早餐", valueScore: 13, isTop3: true },
    { id: 604, name: "广州香格里拉大酒店", nameEn: "Shangri-La Hotel Guangzhou", type: "五星级", star: 5, description: "天河区，现代豪华", price: "1000-1900元/晚", priceDetail: "标准间1000-1700元，套房1700-1900元。含早餐", valueScore: 13, isTop3: true },
    { id: 605, name: "广州W酒店", nameEn: "W Guangzhou", type: "五星级", star: 5, description: "珠江新城，年轻时尚", price: "1100-2000元/晚", priceDetail: "标准间1100-1800元，套房1800-2000元。含早餐", valueScore: 12, isTop3: false },
    { id: 606, name: "广州中国大酒店", nameEn: "China Hotel", type: "四星级", star: 4, description: "流花湖，位置优越", price: "550-1000元/晚", priceDetail: "标准间550-850元，豪华间850-1000元。含早餐", valueScore: 14, isTop3: true },
    { id: 607, name: "广州花园酒店", nameEn: "Garden Hotel Guangzhou", type: "四星级", star: 4, description: "环市东路，经典老店", price: "600-1050元/晚", priceDetail: "标准间600-900元，豪华间900-1050元。含早餐", valueScore: 13, isTop3: true },
    { id: 608, name: "广州东方宾馆", nameEn: "Dongfang Hotel", type: "四星级", star: 4, description: "流花湖，性价比高", price: "520-950元/晚", priceDetail: "标准间520-800元，豪华间800-950元。含早餐", valueScore: 13, isTop3: true }
  ],
  "深圳": [
    { id: 701, name: "深圳瑞吉酒店", nameEn: "The St. Regis Shenzhen", type: "五星级", star: 5, description: "罗湖区，奢华体验", price: "1400-2600元/晚", priceDetail: "标准间1400-2400元，套房2400-2600元。含早餐和管家服务", valueScore: 12, isTop3: false },
    { id: 702, name: "深圳香格里拉大酒店", nameEn: "Shangri-La Hotel Shenzhen", type: "五星级", star: 5, description: "罗湖区，现代豪华", price: "1100-2100元/晚", priceDetail: "标准间1100-1900元，套房1900-2100元。含早餐", valueScore: 13, isTop3: true },
    { id: 703, name: "深圳四季酒店", nameEn: "Four Seasons Hotel Shenzhen", type: "五星级", star: 5, description: "福田区，服务一流", price: "1200-2200元/晚", priceDetail: "标准间1200-2000元，套房2000-2200元。含早餐", valueScore: 13, isTop3: true },
    { id: 704, name: "深圳君悦酒店", nameEn: "Grand Hyatt Shenzhen", type: "五星级", star: 5, description: "罗湖区，时尚现代", price: "1000-1900元/晚", priceDetail: "标准间1000-1700元，套房1700-1900元。含早餐", valueScore: 13, isTop3: true },
    { id: 705, name: "深圳大中华喜来登酒店", nameEn: "Sheraton Shenzhen", type: "四星级", star: 4, description: "福田区，位置优越", price: "600-1100元/晚", priceDetail: "标准间600-950元，豪华间950-1100元。含早餐", valueScore: 14, isTop3: true },
    { id: 706, name: "深圳威尼斯皇冠假日酒店", nameEn: "Crowne Plaza Shenzhen", type: "四星级", star: 4, description: "南山区，性价比高", price: "550-1000元/晚", priceDetail: "标准间550-850元，豪华间850-1000元。含早餐", valueScore: 13, isTop3: true },
    { id: 707, name: "深圳富苑皇冠假日酒店", nameEn: "Crowne Plaza Shenzhen", type: "四星级", star: 4, description: "罗湖区，交通便利", price: "580-1050元/晚", priceDetail: "标准间580-880元，豪华间880-1050元。含早餐", valueScore: 13, isTop3: true }
  ],
  "三亚": [
    { id: 801, name: "三亚亚龙湾瑞吉度假酒店", nameEn: "The St. Regis Sanya", type: "五星级", star: 5, description: "亚龙湾，奢华度假", price: "2000-5000元/晚", priceDetail: "海景房2000-4000元，别墅4000-5000元。含早餐", valueScore: 12, isTop3: false },
    { id: 802, name: "三亚海棠湾天房洲际度假酒店", nameEn: "InterContinental Sanya", type: "五星级", star: 5, description: "海棠湾，海景绝佳", price: "1500-3500元/晚", priceDetail: "海景房1500-3000元，套房3000-3500元。含早餐", valueScore: 13, isTop3: true },
    { id: 803, name: "三亚亚龙湾美高梅度假酒店", nameEn: "MGM Grand Sanya", type: "五星级", star: 5, description: "亚龙湾，娱乐丰富", price: "1800-4200元/晚", priceDetail: "海景房1800-3600元，别墅3600-4200元。含早餐", valueScore: 12, isTop3: false },
    { id: 804, name: "三亚半山半岛洲际度假酒店", nameEn: "InterContinental Sanya Resort", type: "五星级", star: 5, description: "大东海，性价比高", price: "1200-2800元/晚", priceDetail: "海景房1200-2400元，套房2400-2800元。含早餐", valueScore: 14, isTop3: true },
    { id: 805, name: "三亚湾海居铂尔曼度假酒店", nameEn: "Pullman Sanya", type: "五星级", star: 5, description: "三亚湾，位置便利", price: "1000-2500元/晚", priceDetail: "海景房1000-2200元，套房2200-2500元。含早餐", valueScore: 14, isTop3: true },
    { id: 806, name: "三亚湾红树林度假世界", nameEn: "Mangrove Tree Resort", type: "四星级", star: 4, description: "三亚湾，性价比高", price: "600-1400元/晚", priceDetail: "标准间600-1200元，海景房1200-1400元。含早餐", valueScore: 14, isTop3: true },
    { id: 807, name: "三亚湾海韵度假酒店", nameEn: "Haiyun Resort Sanya", type: "四星级", star: 4, description: "三亚湾，海景房", price: "550-1300元/晚", priceDetail: "标准间550-1100元，海景房1100-1300元。含早餐", valueScore: 13, isTop3: true },
    { id: 808, name: "三亚湾胜意海景度假酒店", nameEn: "ShengYi Resort Sanya", type: "四星级", star: 4, description: "三亚湾，位置优越", price: "500-1200元/晚", priceDetail: "标准间500-1000元，海景房1000-1200元。含早餐", valueScore: 13, isTop3: true }
  ],
  "苏州": [
    { id: 901, name: "苏州金鸡湖凯宾斯基大酒店", nameEn: "Kempinski Hotel Suzhou", type: "五星级", star: 5, description: "金鸡湖畔，湖景优美", price: "900-1800元/晚", priceDetail: "湖景房900-1600元，套房1600-1800元。含早餐", valueScore: 13, isTop3: true },
    { id: 902, name: "苏州中茵皇冠假日酒店", nameEn: "Crowne Plaza Suzhou", type: "五星级", star: 5, description: "金鸡湖，位置绝佳", price: "1000-1900元/晚", priceDetail: "标准间1000-1700元，套房1700-1900元。含早餐", valueScore: 13, isTop3: true },
    { id: 903, name: "苏州香格里拉大酒店", nameEn: "Shangri-La Hotel Suzhou", type: "五星级", star: 5, description: "高新区，现代豪华", price: "950-1750元/晚", priceDetail: "标准间950-1550元，行政间1550-1750元。含早餐", valueScore: 13, isTop3: true },
    { id: 904, name: "苏州万豪酒店", nameEn: "Marriott Hotel Suzhou", type: "四星级", star: 4, description: "工业园区，性价比高", price: "500-950元/晚", priceDetail: "标准间500-800元，豪华间800-950元。含早餐", valueScore: 14, isTop3: true },
    { id: 905, name: "苏州新城花园丽呈华廷酒店", nameEn: "New City Garden Hotel", type: "四星级", star: 4, description: "高新区，位置便利", price: "550-1000元/晚", priceDetail: "标准间550-850元，豪华间850-1000元。含早餐", valueScore: 13, isTop3: true },
    { id: 906, name: "苏州南园宾馆", nameEn: "Nanyuan Hotel Suzhou", type: "四星级", star: 4, description: "古城区，园林式酒店", price: "600-1050元/晚", priceDetail: "标准间600-900元，豪华间900-1050元。含早餐", valueScore: 13, isTop3: true }
  ],
  "重庆": [
    { id: 1001, name: "重庆喜来登大酒店", nameEn: "Sheraton Chongqing", type: "五星级", star: 5, description: "南滨路，江景房", price: "800-1600元/晚", priceDetail: "江景房800-1400元，套房1400-1600元。含早餐", valueScore: 14, isTop3: true },
    { id: 1002, name: "重庆威斯汀大酒店", nameEn: "The Westin Chongqing", type: "五星级", star: 5, description: "解放碑，位置绝佳", price: "900-1700元/晚", priceDetail: "标准间900-1500元，套房1500-1700元。含早餐", valueScore: 13, isTop3: true },
    { id: 1003, name: "重庆香格里拉大酒店", nameEn: "Shangri-La Hotel Chongqing", type: "五星级", star: 5, description: "南滨路，江景优美", price: "850-1650元/晚", priceDetail: "江景房850-1450元，套房1450-1650元。含早餐", valueScore: 13, isTop3: true },
    { id: 1004, name: "重庆富力凯悦酒店", nameEn: "Hyatt Regency Chongqing", type: "四星级", star: 4, description: "江北区，性价比高", price: "500-950元/晚", priceDetail: "标准间500-800元，豪华间800-950元。含早餐", valueScore: 14, isTop3: true },
    { id: 1005, name: "重庆海逸酒店", nameEn: "Harbour Plaza Chongqing", type: "四星级", star: 4, description: "解放碑，位置优越", price: "550-1000元/晚", priceDetail: "标准间550-850元，豪华间850-1000元。含早餐", valueScore: 13, isTop3: true },
    { id: 1006, name: "重庆JW万豪酒店", nameEn: "JW Marriott Hotel Chongqing", type: "四星级", star: 4, description: "南岸区，现代舒适", price: "520-920元/晚", priceDetail: "标准间520-770元，豪华间770-920元。含早餐", valueScore: 13, isTop3: true }
  ]
};

// 获取所有住宿（只包含4星及以上）
export const getAllAccommodations = () => {
  const all = [];
  Object.keys(accommodations).forEach(city => {
    accommodations[city].forEach(accommodation => {
      all.push({ ...accommodation, city });
    });
  });
  return all;
};

// 获取每个城市性价比最好的前3个酒店
export const getTop3HotelsByCity = () => {
  const result = {};
  Object.keys(accommodations).forEach(city => {
    const cityHotels = accommodations[city]
      .filter(hotel => hotel.star >= 4) // 只包含4星及以上
      .sort((a, b) => b.valueScore - a.valueScore) // 按性价比排序
      .slice(0, 3); // 取前3个
    if (cityHotels.length > 0) {
      result[city] = cityHotels;
    }
  });
  return result;
};

// 获取有住宿的城市列表
export const getAccommodationCities = () => {
  return Object.keys(accommodations).sort();
};
