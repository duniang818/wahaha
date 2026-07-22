// 全国5A级旅游景区数据，按城市划分

export const attractions5A = {
  "北京": [
    { id: 1, name: "故宫博物院", nameEn: "Forbidden City", type: "历史文化", description: "明清两朝的皇家宫殿，世界文化遗产", isFree: false, price: "旺季60元/人，淡季40元/人", priceDetail: "4月1日-10月31日：60元；11月1日-3月31日：40元。学生票半价，60岁以上老人、残疾人、军人等免费" },
    { id: 2, name: "天坛公园", nameEn: "Temple of Heaven", type: "历史文化", description: "明清皇帝祭天的场所，古代建筑艺术的杰作", isFree: false, price: "联票34元/人，门票15元/人", priceDetail: "联票（含祈年殿、回音壁、圜丘）：34元；门票：15元。学生、老人、残疾人等有优惠" },
    { id: 3, name: "颐和园", nameEn: "Summer Palace", type: "历史文化", description: "中国古典园林之首，皇家园林博物馆", isFree: false, price: "旺季30元/人，淡季20元/人", priceDetail: "4月1日-10月31日：30元；11月1日-3月31日：20元。联票60元（含园中园）。学生票半价" },
    { id: 4, name: "八达岭-慕田峪长城旅游区", nameEn: "Badaling-Mutianyu Great Wall", type: "历史文化", description: "万里长城的精华段，世界文化遗产", isFree: false, price: "八达岭45元/人，慕田峪45元/人", priceDetail: "八达岭长城：45元；慕田峪长城：45元。缆车、索道等另收费。学生、老人有优惠" },
    { id: 5, name: "明十三陵景区", nameEn: "Ming Tombs", type: "历史文化", description: "明朝十三位皇帝的陵墓群", isFree: false, price: "定陵65元/人，长陵45元/人", priceDetail: "定陵：65元；长陵：45元；昭陵：30元。联票135元。学生、老人有优惠" },
    { id: 6, name: "恭王府景区", nameEn: "Prince Gong's Mansion", type: "历史文化", description: "清代规模最大的一座王府", isFree: false, price: "40元/人", priceDetail: "门票40元。学生、老人、残疾人等有优惠，需持有效证件" },
    { id: 7, name: "北京奥林匹克公园", nameEn: "Beijing Olympic Park", type: "现代建筑", description: "2008年北京奥运会主会场", isFree: true, price: "免费", priceDetail: "公园免费开放。鸟巢、水立方等场馆需单独购票：鸟巢50-100元，水立方30元" },
    { id: 8, name: "圆明园遗址公园", nameEn: "Yuanmingyuan Park", type: "历史文化", description: "清代著名皇家园林，历史见证", isFree: false, price: "10元/人", priceDetail: "门票10元。西洋楼遗址景区15元。学生、老人、残疾人等有优惠" }
  ],
  "上海": [
    { id: 9, name: "东方明珠广播电视塔", nameEn: "Oriental Pearl Tower", type: "现代建筑", description: "上海标志性建筑，黄浦江畔的璀璨明珠", isFree: false, price: "180-220元/人", priceDetail: "二球联票：180元；三球联票：220元。不同高度价格不同，学生、老人有优惠" },
    { id: 10, name: "上海野生动物园", nameEn: "Shanghai Wild Animal Park", type: "自然生态", description: "大型野生动物园，近距离接触珍稀动物", isFree: false, price: "130元/人", priceDetail: "成人票130元。学生票65元，1.3米以下儿童免费。投喂车、表演等另收费" },
    { id: 11, name: "上海科技馆", nameEn: "Shanghai Science and Technology Museum", type: "科普教育", description: "大型科普教育基地，寓教于乐", isFree: false, price: "45元/人", priceDetail: "成人票45元。学生票22元，1.3米以下儿童免费。70岁以上老人免费" },
    { id: 12, name: "上海豫园", nameEn: "Yu Garden", type: "历史文化", description: "明代古典园林，江南园林艺术的代表", isFree: false, price: "30-40元/人", priceDetail: "旺季（4-6月，9-11月）：40元；淡季：30元。学生、老人有优惠" },
    { id: 13, name: "上海迪士尼乐园", nameEn: "Shanghai Disneyland", type: "主题公园", description: "中国大陆首座迪士尼主题乐园，融合经典迪士尼故事与中国特色", isFree: false, price: "475-719元/人", priceDetail: "标准票（1.4米以上）：475元起；儿童票（1.0-1.4米）：356元起；老人票（65岁以上）：356元起。高峰日（节假日、周末）价格更高，最高719元。年卡有多种选择" }
  ],
  "杭州": [
    { id: 14, name: "西湖风景名胜区", nameEn: "West Lake", type: "自然风光", description: "世界文化遗产，人间天堂", isFree: true, price: "免费", priceDetail: "西湖景区免费开放。部分景点如雷峰塔（40元）、三潭印月（55元）等需单独购票" },
    { id: 15, name: "千岛湖风景名胜区", nameEn: "Qiandao Lake", type: "自然风光", description: "中国最大的人工湖，湖光山色", isFree: false, price: "旺季130元/人，淡季110元/人", priceDetail: "4-10月：130元；11月-3月：110元。含中心湖区或东南湖区船票。学生、老人有优惠" },
    { id: 16, name: "西溪国家湿地公园", nameEn: "Xixi National Wetland Park", type: "自然生态", description: "城市中的天然湿地，生态旅游胜地", isFree: false, price: "80元/人", priceDetail: "门票80元。电瓶船60元，摇橹船100-360元不等。学生、老人有优惠" }
  ],
  "南京": [
    { id: 17, name: "夫子庙-秦淮风光带", nameEn: "Confucius Temple-Qinhuai Scenic Area", type: "历史文化", description: "南京历史文化名街，江南文化荟萃", isFree: true, price: "免费", priceDetail: "夫子庙-秦淮风光带免费开放。部分景点如夫子庙大成殿（30元）、江南贡院（50元）等需单独购票" },
    { id: 18, name: "钟山风景名胜区-中山陵园风景区", nameEn: "Zhongshan Mausoleum", type: "历史文化", description: "孙中山先生陵墓，近代建筑艺术典范", isFree: true, price: "免费", priceDetail: "中山陵免费开放。明孝陵70元，灵谷寺35元，音乐台10元。联票100元" },
    { id: 19, name: "总统府景区", nameEn: "Presidential Palace", type: "历史文化", description: "中国近代历史的重要见证", isFree: false, price: "40元/人", priceDetail: "门票40元。学生、老人、残疾人等有优惠，需持有效证件" }
  ],
  "苏州": [
    { id: 20, name: "苏州园林（拙政园、留园、虎丘）", nameEn: "Suzhou Gardens", type: "历史文化", description: "世界文化遗产，中国古典园林代表", isFree: false, price: "拙政园80元，留园55元，虎丘70元", priceDetail: "拙政园：80元；留园：55元；虎丘：70元。学生、老人有优惠。联票有折扣" },
    { id: 21, name: "周庄古镇", nameEn: "Zhouzhuang Ancient Town", type: "历史文化", description: "中国第一水乡，江南古镇典范", isFree: false, price: "100元/人", priceDetail: "门票100元。夜游80元。学生、老人有优惠。包含古镇内主要景点" },
    { id: 22, name: "同里古镇", nameEn: "Tongli Ancient Town", type: "历史文化", description: "江南六大古镇之一，水乡风情", isFree: false, price: "100元/人", priceDetail: "门票100元。学生、老人有优惠。包含退思园、珍珠塔等景点" }
  ],
  "西安": [
    { id: 23, name: "秦始皇兵马俑博物馆", nameEn: "Terracotta Warriors Museum", type: "历史文化", description: "世界第八大奇迹，秦代艺术瑰宝", isFree: false, price: "120元/人", priceDetail: "门票120元。学生票60元，65岁以上老人免费。包含兵马俑坑和秦始皇陵" },
    { id: 24, name: "华清宫景区", nameEn: "Huaqing Palace", type: "历史文化", description: "唐代皇家离宫，历史名园", isFree: false, price: "120元/人", priceDetail: "门票120元。学生、老人有优惠。长恨歌演出另收费（238-988元）" },
    { id: 25, name: "大雁塔-大唐芙蓉园景区", nameEn: "Big Wild Goose Pagoda-Tang Paradise", type: "历史文化", description: "唐代文化地标，盛唐风貌", isFree: false, price: "大雁塔50元，芙蓉园120元", priceDetail: "大雁塔：50元；大唐芙蓉园：120元。学生、老人有优惠。联票有折扣" },
    { id: 26, name: "城墙-碑林历史文化景区", nameEn: "City Wall-Forest of Steles", type: "历史文化", description: "中国现存最完整的古代城垣", isFree: false, price: "城墙54元，碑林65元", priceDetail: "城墙：54元；碑林：65元。联票100元。学生、老人有优惠" }
  ],
  "成都": [
    { id: 27, name: "青城山-都江堰旅游景区", nameEn: "Mount Qingcheng-Dujiangyan", type: "历史文化", description: "世界文化遗产，古代水利工程奇迹", isFree: false, price: "青城山80元，都江堰80元", priceDetail: "青城山：80元；都江堰：80元。联票160元。学生、老人有优惠。索道另收费" },
    { id: 28, name: "成都大熊猫繁育研究基地", nameEn: "Chengdu Panda Base", type: "自然生态", description: "大熊猫科研繁育基地，国宝家园", isFree: false, price: "55元/人", priceDetail: "门票55元。学生票27元，60岁以上老人免费。建议上午参观，熊猫更活跃" },
    { id: 29, name: "武侯祠博物馆", nameEn: "Wuhou Shrine", type: "历史文化", description: "三国文化圣地，蜀汉历史见证", isFree: false, price: "50元/人", priceDetail: "门票50元。学生、老人有优惠。包含武侯祠和锦里古街" },
    { id: 30, name: "杜甫草堂博物馆", nameEn: "Du Fu Thatched Cottage", type: "历史文化", description: "诗圣杜甫故居，文学圣地", isFree: false, price: "50元/人", priceDetail: "门票50元。学生、老人有优惠。包含草堂遗址和杜甫纪念馆" }
  ],
  "重庆": [
    { id: 31, name: "大足石刻景区", nameEn: "Dazu Rock Carvings", type: "历史文化", description: "世界文化遗产，石窟艺术瑰宝", isFree: false, price: "宝顶山115元，北山70元", priceDetail: "宝顶山：115元；北山：70元。联票140元。学生、老人有优惠" },
    { id: 32, name: "巫山小三峡-小小三峡", nameEn: "Wushan Little Three Gorges", type: "自然风光", description: "长江三峡精华段，山水画廊", isFree: false, price: "150元/人", priceDetail: "门票150元。包含船票和景区门票。学生、老人有优惠" },
    { id: 33, name: "武隆喀斯特旅游区", nameEn: "Wulong Karst", type: "自然风光", description: "世界自然遗产，喀斯特地貌奇观", isFree: false, price: "天生三桥135元，仙女山60元", priceDetail: "天生三桥：135元；仙女山：60元；芙蓉洞：120元。学生、老人有优惠" },
    { id: 34, name: "金佛山景区", nameEn: "Jinfo Mountain", type: "自然风光", description: "世界自然遗产，巴蜀名山", isFree: false, price: "80元/人", priceDetail: "门票80元。索道80元。学生、老人有优惠。不同季节价格可能调整" }
  ],
  "广州": [
    { id: 35, name: "长隆旅游度假区", nameEn: "Chimelong Resort", type: "主题乐园", description: "大型主题乐园，娱乐休闲胜地", isFree: false, price: "长隆欢乐世界250元，长隆野生动物世界300元", priceDetail: "长隆欢乐世界：250元；长隆野生动物世界：300元；长隆水上乐园：200元。学生、老人有优惠" },
    { id: 35, name: "白云山风景区", nameEn: "Baiyun Mountain", type: "自然风光", description: "羊城第一秀，城市绿肺", isFree: false, price: "5元/人", priceDetail: "门票5元。索道25元。学生、老人有优惠。部分景点另收费" },
    { id: 36, name: "广州塔景区", nameEn: "Canton Tower", type: "现代建筑", description: "广州新地标，小蛮腰", isFree: false, price: "150-298元/人", priceDetail: "433米观光层：150元；450米观景平台：228元；488米观景平台：298元。不同高度价格不同" }
  ],
  "深圳": [
    { id: 37, name: "华侨城旅游度假区", nameEn: "OCT Resort", type: "主题乐园", description: "大型主题公园群，欢乐之都", isFree: false, price: "世界之窗200元，欢乐谷230元", priceDetail: "世界之窗：200元；欢乐谷：230元；锦绣中华：200元。学生、老人有优惠。联票有折扣" },
    { id: 38, name: "观澜湖休闲旅游区", nameEn: "Mission Hills Resort", type: "休闲度假", description: "世界级高尔夫度假区", isFree: false, price: "根据项目收费", priceDetail: "高尔夫球场、SPA、酒店等不同项目价格不同。建议咨询景区了解具体价格" }
  ],
  "桂林": [
    { id: 39, name: "漓江景区", nameEn: "Li River", type: "自然风光", description: "桂林山水甲天下，世界自然遗产", isFree: false, price: "210-450元/人", priceDetail: "漓江游船：210-450元（不同航段价格不同）。学生、老人有优惠。包含船票和景区门票" },
    { id: 40, name: "乐满地度假世界", nameEn: "Leman Resort", type: "主题乐园", description: "大型主题乐园，欢乐无限", isFree: false, price: "150元/人", priceDetail: "门票150元。学生、老人有优惠。包含主题乐园和度假酒店" }
  ],
  "昆明": [
    { id: 41, name: "石林风景区", nameEn: "Stone Forest", type: "自然风光", description: "世界自然遗产，天下第一奇观", isFree: false, price: "175元/人", priceDetail: "门票175元。学生、老人有优惠。包含大小石林、乃古石林等景区" },
    { id: 42, name: "世博园景区", nameEn: "World Expo Garden", type: "主题公园", description: "1999年世界园艺博览会会址", isFree: false, price: "100元/人", priceDetail: "门票100元。学生、老人有优惠。包含各国展园和主题展区" }
  ],
  "丽江": [
    { id: 43, name: "丽江古城景区", nameEn: "Lijiang Ancient Town", type: "历史文化", description: "世界文化遗产，纳西族文化中心", isFree: true, price: "免费", priceDetail: "丽江古城免费开放。古城维护费80元（部分时段收取）。部分景点如木府（60元）需单独购票" },
    { id: 44, name: "玉龙雪山景区", nameEn: "Jade Dragon Snow Mountain", type: "自然风光", description: "北半球最南的大雪山，纳西族神山", isFree: false, price: "130元/人", priceDetail: "进山费130元。大索道180元，云杉坪索道55元，牦牛坪索道60元。学生、老人有优惠" }
  ],
  "拉萨": [
    { id: 45, name: "布达拉宫景区", nameEn: "Potala Palace", type: "历史文化", description: "世界文化遗产，藏传佛教圣地", isFree: false, price: "200元/人", priceDetail: "门票200元。需提前预约。学生、老人有优惠。旺季（5-10月）一票难求，建议提前预订" },
    { id: 46, name: "大昭寺", nameEn: "Jokhang Temple", type: "历史文化", description: "藏传佛教寺院，藏式宗教建筑典范", isFree: false, price: "85元/人", priceDetail: "门票85元。学生、老人有优惠。建议上午参观，可看到信徒朝拜" }
  ],
  "乌鲁木齐": [
    { id: 47, name: "天山天池风景名胜区", nameEn: "Heavenly Lake", type: "自然风光", description: "高山湖泊，天山明珠", isFree: false, price: "155元/人", priceDetail: "门票+区间车155元。学生、老人有优惠。包含天池和周边景点" }
  ],
  "张家界": [
    { id: 48, name: "武陵源-天门山旅游区", nameEn: "Wulingyuan-Tianmen Mountain", type: "自然风光", description: "世界自然遗产，奇峰异石", isFree: false, price: "武陵源228元，天门山258元", priceDetail: "武陵源：228元（4日有效）；天门山：258元（含索道）。学生、老人有优惠" },
    { id: 49, name: "张家界大峡谷", nameEn: "Zhangjiajie Grand Canyon", type: "自然风光", description: "天然地质博物馆，峡谷奇观", isFree: false, price: "118元/人", priceDetail: "门票118元。玻璃桥另收费128元。学生、老人有优惠" }
  ],
  "黄山": [
    { id: 50, name: "黄山风景区", nameEn: "Mount Huangshan", type: "自然风光", description: "世界自然文化双遗产，天下第一奇山", isFree: false, price: "旺季190元，淡季150元", priceDetail: "旺季（3-11月）：190元；淡季（12-2月）：150元。索道80-100元。学生、老人有优惠" },
    { id: 51, name: "古徽州文化旅游区", nameEn: "Ancient Huizhou Cultural Area", type: "历史文化", description: "徽州文化发源地，古建筑群", isFree: false, price: "220元/人", priceDetail: "联票220元。包含徽州古城、棠樾牌坊群、新安江山水画廊等。学生、老人有优惠" }
  ],
  "九寨沟": [
    { id: 52, name: "九寨沟景区", nameEn: "Jiuzhaigou Valley", type: "自然风光", description: "世界自然遗产，童话世界", isFree: false, price: "旺季220元，淡季80元", priceDetail: "旺季（4-11月）：220元；淡季（12-3月）：80元。观光车90元。学生、老人有优惠" },
    { id: 53, name: "黄龙风景名胜区", nameEn: "Huanglong Scenic Area", type: "自然风光", description: "世界自然遗产，人间瑶池", isFree: false, price: "旺季200元，淡季60元", priceDetail: "旺季（4-11月）：200元；淡季（12-3月）：60元。索道上行80元，下行40元。学生、老人有优惠" }
  ],
  "泰山": [
    { id: 54, name: "泰山景区", nameEn: "Mount Tai", type: "自然风光", description: "世界自然文化双遗产，五岳之首", isFree: false, price: "115元/人", priceDetail: "门票115元。中天门索道100元，桃花源索道100元。学生、老人有优惠。建议夜爬看日出" }
  ],
  "曲阜": [
    { id: 55, name: "三孔旅游区", nameEn: "Three Confucian Sites", type: "历史文化", description: "世界文化遗产，儒家文化圣地", isFree: false, price: "140元/人", priceDetail: "联票140元。包含孔庙、孔府、孔林。学生、老人有优惠。单票：孔庙90元，孔府60元，孔林40元" }
  ],
  "承德": [
    { id: 56, name: "承德避暑山庄及周围寺庙景区", nameEn: "Chengde Mountain Resort", type: "历史文化", description: "世界文化遗产，清代皇家园林", isFree: false, price: "避暑山庄130元，外八庙80-80元", priceDetail: "避暑山庄：130元；外八庙：各80元。联票有折扣。学生、老人有优惠" }
  ],
  "大连": [
    { id: 57, name: "金石滩国家旅游度假区", nameEn: "Golden Pebble Beach", type: "自然风光", description: "黄金海岸，地质奇观", isFree: false, price: "根据景点收费", priceDetail: "金石滩免费开放。各景点单独收费：金石园20元，地质公园100元，发现王国220元等" },
    { id: 58, name: "老虎滩海洋公园", nameEn: "Tiger Beach Ocean Park", type: "主题公园", description: "海洋主题公园，极地动物世界", isFree: false, price: "190元/人", priceDetail: "门票190元。学生、老人有优惠。包含极地馆、珊瑚馆、海兽馆等" }
  ],
  "青岛": [
    { id: 59, name: "崂山景区", nameEn: "Mount Laoshan", type: "自然风光", description: "海上第一名山，道教名山", isFree: false, price: "130元/人", priceDetail: "门票130元。太清索道45元，巨峰索道40元。学生、老人有优惠" },
    { id: 60, name: "青岛啤酒博物馆", nameEn: "Tsingtao Beer Museum", type: "工业旅游", description: "百年啤酒文化，工业旅游典范", isFree: false, price: "60元/人", priceDetail: "门票60元。学生、老人有优惠。包含啤酒品尝" }
  ],
  "哈尔滨": [
    { id: 61, name: "太阳岛景区", nameEn: "Sun Island", type: "自然风光", description: "城市中的绿洲，避暑胜地", isFree: false, price: "30元/人", priceDetail: "门票30元。学生、老人有优惠。冬季雪博会另收费" },
    { id: 62, name: "冰雪大世界", nameEn: "Ice and Snow World", type: "主题公园", description: "世界最大冰雪主题乐园", isFree: false, price: "330元/人", priceDetail: "门票330元。学生、老人有优惠。仅冬季开放（12月-2月），建议晚上参观" }
  ],
  "洛阳": [
    { id: 63, name: "龙门石窟景区", nameEn: "Longmen Grottoes", type: "历史文化", description: "世界文化遗产，石窟艺术宝库", isFree: false, price: "90元/人", priceDetail: "门票90元。学生、老人有优惠。包含西山石窟、东山石窟、香山寺、白园" },
    { id: 64, name: "白云山景区", nameEn: "Baiyun Mountain", type: "自然风光", description: "中原第一峰，天然氧吧", isFree: false, price: "75元/人", priceDetail: "门票75元。索道60元。学生、老人有优惠" }
  ],
  "开封": [
    { id: 65, name: "清明上河园", nameEn: "Millennium City Park", type: "历史文化", description: "宋代文化主题公园，再现《清明上河图》", isFree: false, price: "120元/人", priceDetail: "门票120元。学生、老人有优惠。包含大型实景演出《大宋·东京梦华》（另收费）" }
  ],
  "武汉": [
    { id: 66, name: "黄鹤楼公园", nameEn: "Yellow Crane Tower", type: "历史文化", description: "江南三大名楼之一，千古名楼", isFree: false, price: "70元/人", priceDetail: "门票70元。学生、老人有优惠。包含黄鹤楼主楼和周边景点" },
    { id: 67, name: "东湖生态旅游风景区", nameEn: "East Lake", type: "自然风光", description: "中国最大城中湖，城市绿心", isFree: true, price: "免费", priceDetail: "东湖景区免费开放。部分景点如磨山（60元）、听涛（免费）、落雁（13元）等需单独购票" },
    { id: 75, name: "黄陂木兰文化生态旅游区", nameEn: "Mulan Cultural Eco-Tourism Zone", type: "自然风光", description: "木兰故里，包含木兰山、木兰天池、木兰草原、云雾山等景区", isFree: false, price: "各景区50-80元/人", priceDetail: "木兰天池60元、木兰草原78元、木兰云雾山65元等。学生、老人有优惠。可购联票" }
  ],
  "宜昌": [
    { id: 76, name: "三峡大坝-屈原故里旅游区", nameEn: "Three Gorges Dam-Qu Yuan Hometown", type: "历史文化", description: "世界最大水利枢纽工程与爱国诗人屈原故里", isFree: true, price: "大坝免费，换乘车35元；屈原故里80元", priceDetail: "三峡大坝免费开放，需购换乘车票35元。屈原故里80元。学生、老人有优惠" },
    { id: 77, name: "三峡人家风景区", nameEn: "Three Gorges Tribe", type: "自然风光", description: "长江三峡最秀丽的峡谷，巴楚文化风情", isFree: false, price: "210元/人", priceDetail: "套票210元（含门票150元+换乘30元+渡船30元）。索道30元、手扶梯30元另计。学生、老人有优惠" },
    { id: 78, name: "清江画廊景区", nameEn: "Qingjiang Gallery", type: "自然风光", description: "八百里清江美如画，土家民俗风情", isFree: false, price: "145元/人", priceDetail: "A线圣境游145元（门票90元+班船55元）。学生、老人有优惠。套票含演艺215元" },
    { id: 79, name: "三峡大瀑布景区", nameEn: "Three Gorges Great Waterfall", type: "自然风光", description: "中国十大名瀑之一，可穿瀑而过", isFree: false, price: "127元/人", priceDetail: "门票127元。学生、老人有优惠。含观光车，穿瀑雨衣另购" }
  ],
  "恩施": [
    { id: 80, name: "恩施大峡谷景区", nameEn: "Enshi Grand Canyon", type: "自然风光", description: "可与美国科罗拉多大峡谷媲美的喀斯特地貌奇观", isFree: false, price: "地面缆车+门票170元/人", priceDetail: "门票+地面缆车170元。七星寨105元、云龙地缝50元。索道105元另计。学生、老人有优惠" },
    { id: 81, name: "神农溪纤夫文化旅游区", nameEn: "Shennong Stream Rafting", type: "自然风光", description: "原始峡谷漂流，纤夫文化活化石", isFree: false, price: "200元/人", priceDetail: "门票+船票约200元。学生、老人有优惠。包含神农溪、纤夫文化展示" },
    { id: 82, name: "腾龙洞景区", nameEn: "Tenglong Cave", type: "自然风光", description: "亚洲第一大溶洞，洞穴激光秀与土家歌舞", isFree: false, price: "170元/人", priceDetail: "门票170元（含洞内交通、激光秀、土家歌舞）。学生、老人有优惠" }
  ],
  "十堰": [
    { id: 83, name: "武当山风景区", nameEn: "Wudang Mountains", type: "历史文化", description: "世界文化遗产，道教圣地，张三丰太极拳发源地", isFree: false, price: "164元/人", priceDetail: "门票164元。金顶27元、紫霄宫15元。索道往返150元。学生、老人有优惠" }
  ],
  "神农架": [
    { id: 84, name: "神农架生态旅游区", nameEn: "Shennongjia Forestry District", type: "自然风光", description: "世界自然遗产，华中屋脊，野人传说发源地", isFree: false, price: "六大景区联票299元/人", priceDetail: "联票299元（5日有效，含神农顶、大九湖、天燕、天生桥、官门山、神农坛）。学生、老人有优惠" }
  ],
  "咸宁": [
    { id: 85, name: "三国赤壁古战场景区", nameEn: "Chibi Ancient Battlefield", type: "历史文化", description: "赤壁之战发生地，三国文化圣地", isFree: false, price: "135元/人", priceDetail: "门票135元。学生、老人有优惠。包含赤壁摩崖、周瑜石像、凤雏庵等" }
  ],
  "襄阳": [
    { id: 86, name: "古隆中景区", nameEn: "Ancient Longzhong", type: "历史文化", description: "诸葛亮隐居地，三顾茅庐发生地", isFree: false, price: "87元/人", priceDetail: "门票87元。学生、老人有优惠。包含隆中书院、武侯祠、草庐等" }
  ],
  "荆门": [
    { id: 87, name: "明显陵文化旅游景区", nameEn: "Xianling Mausoleum", type: "历史文化", description: "世界文化遗产，明代帝陵中最大的单体陵墓", isFree: false, price: "65元/人", priceDetail: "门票65元。学生、老人有优惠。位于钟祥市，明代嘉靖皇帝父亲之陵" }
  ],
  "长沙": [
    { id: 68, name: "岳麓山-橘子洲旅游区", nameEn: "Yuelu Mountain-Orange Isle", type: "历史文化", description: "湖湘文化发源地，红色旅游胜地", isFree: true, price: "免费", priceDetail: "岳麓山和橘子洲免费开放。岳麓书院50元，橘子洲观光车20元。学生、老人有优惠" },
    { id: 69, name: "花明楼景区", nameEn: "Huaminglou", type: "历史文化", description: "刘少奇同志故居，红色教育基地", isFree: true, price: "免费", priceDetail: "花明楼景区免费开放。包含刘少奇故居、纪念馆、铜像广场等" }
  ],
  "厦门": [
    { id: 70, name: "鼓浪屿风景名胜区", nameEn: "Gulangyu Island", type: "历史文化", description: "世界文化遗产，万国建筑博览", isFree: false, price: "上岛免费，核心景点联票100元", priceDetail: "上岛船票35-50元。核心景点联票100元（含日光岩、菽庄花园、皓月园、风琴博物馆）。学生、老人有优惠" },
    { id: 71, name: "厦门园林植物园", nameEn: "Xiamen Botanical Garden", type: "自然生态", description: "植物王国，科普教育基地", isFree: false, price: "30元/人", priceDetail: "门票30元。学生、老人有优惠。包含多肉植物区、雨林世界等" }
  ],
  "三亚": [
    { id: 72, name: "南山文化旅游区", nameEn: "Nanshan Cultural Tourism Zone", type: "历史文化", description: "南海观音，佛教文化圣地", isFree: false, price: "129元/人", priceDetail: "门票129元。学生、老人有优惠。包含海上观音、南山寺等。电瓶车30元" },
    { id: 73, name: "大小洞天旅游区", nameEn: "Fairyland", type: "自然风光", description: "道教文化圣地，海山奇观", isFree: false, price: "90元/人", priceDetail: "门票90元。学生、老人有优惠。包含大小洞天、南山不老松等景点" },
    { id: 74, name: "蜈支洲岛旅游区", nameEn: "Wuzhizhou Island", type: "自然风光", description: "中国马尔代夫，潜水天堂", isFree: false, price: "144元/人", priceDetail: "门票+船票144元。学生、老人有优惠。水上项目另收费：潜水、摩托艇、拖伞等" }
  ]
};

// 获取所有城市列表
export const getAttractionCities = () => {
  return Object.keys(attractions5A).sort();
};

// 获取所有5A景点
export const getAll5AAttractions = () => {
  const all = [];
  Object.entries(attractions5A).forEach(([city, attractions]) => {
    attractions.forEach(attraction => {
      all.push({ ...attraction, city });
    });
  });
  return all;
};

// 根据ID获取景点详情
export const getAttractionById = (id) => {
  const all = getAll5AAttractions();
  return all.find(attraction => attraction.id === parseInt(id));
};

// 搜索景点（支持中文、英文、城市名、城市首字母、城市英文名）
export const searchAttractions = (keyword) => {
  if (!keyword || keyword.trim() === '') {
    return getAll5AAttractions();
  }
  
  const searchTerm = keyword.toLowerCase().trim();
  const all = getAll5AAttractions();
  
  return all.filter(attraction => {
    // 1. 中文名称搜索
    const nameMatch = attraction.name.toLowerCase().includes(searchTerm);
    
    // 2. 英文名称搜索（完整匹配、部分匹配、单词首字母）
    let nameEnMatch = false;
    if (attraction.nameEn) {
      const nameEnLower = attraction.nameEn.toLowerCase();
      const words = nameEnLower.split(/[\s-]+/);
      
      // 完整包含
      nameEnMatch = nameEnLower.includes(searchTerm);
      
      // 单词匹配（支持部分单词搜索）
      if (!nameEnMatch) {
        nameEnMatch = words.some(word => 
          word.startsWith(searchTerm) || word.includes(searchTerm)
        );
      }
      
      // 首字母组合（如 "Forbidden City" 可以搜索 "fc"）
      if (!nameEnMatch && searchTerm.length <= 3) {
        const initials = words.map(w => w[0] || '').join('');
        nameEnMatch = initials.includes(searchTerm);
      }
    }
    
    // 3. 城市中文名搜索
    const cityMatch = attraction.city.toLowerCase().includes(searchTerm);
    
    // 4. 城市拼音首字母搜索（如 "bj" 搜索 "北京"）
    const cityPinyin = cityPinyinMap[attraction.city]?.toLowerCase() || '';
    const cityPinyinMatch = cityPinyin && (
      cityPinyin.startsWith(searchTerm) || cityPinyin.includes(searchTerm)
    );
    
    // 5. 城市英文名搜索（如 "beijing" 搜索 "北京"）
    const cityEnglish = cityEnglishMap[attraction.city]?.toLowerCase() || '';
    const cityEnglishMatch = cityEnglish && (
      cityEnglish.startsWith(searchTerm) || cityEnglish.includes(searchTerm)
    );
    
    // 6. 景区名称拼音首字母搜索
    const attractionPinyin = getPinyinInitials(attraction.name, 'attraction').toLowerCase();
    const attractionPinyinMatch = attractionPinyin && attractionPinyin.includes(searchTerm);
    
    // 7. 类型搜索
    const typeMatch = attraction.type.toLowerCase().includes(searchTerm);
    
    // 8. 描述搜索
    const descMatch = attraction.description.toLowerCase().includes(searchTerm);
    
    return nameMatch || nameEnMatch || cityMatch || cityPinyinMatch || 
           cityEnglishMatch || attractionPinyinMatch || typeMatch || descMatch;
  });
};

// 城市拼音首字母映射（支持首字母搜索）
const cityPinyinMap = {
  '北京': 'bj', '上海': 'sh', '杭州': 'hz', '南京': 'nj', '苏州': 'sz',
  '西安': 'xa', '成都': 'cd', '重庆': 'cq', '广州': 'gz', '深圳': 'sz',
  '桂林': 'gl', '昆明': 'km', '丽江': 'lj', '拉萨': 'ls', '乌鲁木齐': 'wlmq',
  '张家界': 'zjj', '黄山': 'hs', '九寨沟': 'jzg', '泰山': 'ts', '曲阜': 'qf',
  '承德': 'cd', '大连': 'dl', '青岛': 'qd', '哈尔滨': 'heb', '洛阳': 'ly',
  '开封': 'kf', '武汉': 'wh', '长沙': 'cs', '厦门': 'xm', '三亚': 'sy',
  '宜昌': 'yc', '恩施': 'es', '十堰': 'syy', '神农架': 'snj', '咸宁': 'xn', '襄阳': 'xy', '荆门': 'jm'
};

// 城市英文名映射（支持英文搜索）
const cityEnglishMap = {
  '北京': 'beijing', '上海': 'shanghai', '杭州': 'hangzhou', '南京': 'nanjing', '苏州': 'suzhou',
  '西安': 'xian', '成都': 'chengdu', '重庆': 'chongqing', '广州': 'guangzhou', '深圳': 'shenzhen',
  '桂林': 'guilin', '昆明': 'kunming', '丽江': 'lijiang', '拉萨': 'lasa', '乌鲁木齐': 'urumqi',
  '张家界': 'zhangjiajie', '黄山': 'huangshan', '九寨沟': 'jiuzhaigou', '泰山': 'taishan', '曲阜': 'qufu',
  '承德': 'chengde', '大连': 'dalian', '青岛': 'qingdao', '哈尔滨': 'harbin', '洛阳': 'luoyang',
  '开封': 'kaifeng', '武汉': 'wuhan', '长沙': 'changsha', '厦门': 'xiamen', '三亚': 'sanya',
  '宜昌': 'yichang', '恩施': 'enshi', '十堰': 'shiyan', '神农架': 'shennongjia', '咸宁': 'xianning', '襄阳': 'xiangyang', '荆门': 'jingmen'
};

// 景区名称拼音首字母映射
const attractionPinyinMap = {
  '故宫': 'gg', '天坛': 'tt', '颐和园': 'yhy', '长城': 'cc', '西湖': 'xh',
  '兵马俑': 'bmy', '大熊猫': 'dxm', '黄山': 'hs', '泰山': 'ts', '九寨沟': 'jzg',
  '布达拉宫': 'bdlg', '大昭寺': 'dzs', '石林': 'sl', '漓江': 'lj', '千岛湖': 'qdh'
};

// 获取拼音首字母（用于搜索）
const getPinyinInitials = (text, type = 'attraction') => {
  const map = type === 'city' ? cityPinyinMap : attractionPinyinMap;
  
  // 检查是否在映射中
  for (const [key, value] of Object.entries(map)) {
    if (text.includes(key)) {
      return value;
    }
  }
  
  return '';
};
