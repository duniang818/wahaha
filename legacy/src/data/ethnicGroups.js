// 少数民族分布数据

// 少数民族基本信息
export const ethnicGroups = [
  {
    id: 'zhuang',
    name: '壮族',
    population: '约1693万',
    language: '壮语',
    description: '壮族是中国人口最多的少数民族，主要分布在广西壮族自治区、云南省文山壮族苗族自治州、广东省连山壮族瑶族自治县、贵州省黔东南苗族侗族自治州等地。'
  },
  {
    id: 'hui',
    name: '回族',
    population: '约1138万',
    language: '汉语',
    description: '回族是中国分布最广的少数民族，主要聚居于宁夏回族自治区，在新疆、青海、甘肃、陕西、山西、河北、天津、北京、上海、江苏、云南、河南、山东、内蒙古、辽宁、吉林、黑龙江也有不少聚居区。'
  },
  {
    id: 'manchu',
    name: '满族',
    population: '约1038万',
    language: '满语',
    description: '满族主要分布在东北三省，以辽宁省最多。另外，在内蒙古、河北、山东、新疆等省、自治区以及北京、成都、兰州、福州、银川、西安等大中城市均有少数散居满族。'
  },
  {
    id: 'yi',
    name: '彝族',
    population: '约983万',
    language: '彝语',
    description: '彝族是中国第六大少数民族，主要分布在云南、四川、贵州和广西的山区和半山区。彝族有自己的语言文字，彝文是中国最早的音节文字之一。'
  },
  {
    id: 'tujia',
    name: '土家族',
    population: '约835万',
    language: '土家语',
    description: '土家族主要分布在湖南、湖北、重庆、贵州毗连的武陵山地区，共有2个土家族自治州，24个土家族自治县，1个联合自治县。'
  },
  {
    id: 'mongol',
    name: '蒙古族',
    population: '约629万',
    language: '蒙古语',
    description: '蒙古族是主要分布于东亚地区的一个传统游牧民族，是中国的少数民族之一，同时也是蒙古国的主体民族。此外，蒙古族在俄罗斯等亚欧国家也有分布。'
  },
  {
    id: 'zang',
    name: '藏族',
    population: '约706万',
    language: '藏语',
    description: '藏族是中国的一个古老民族，主要分布在西藏自治区和青海、四川、甘肃、云南等省的部分地区。藏族人民创造了灿烂的文化，在文学、音乐、舞蹈、绘画、雕塑、建筑艺术等方面，都有丰富的文化遗产。'
  },
  {
    id: 'yao',
    name: '瑶族',
    population: '约330万',
    language: '瑶语',
    description: '瑶族是中国的少数民族之一，主要分布在广西、湖南、云南、广东、贵州和江西等省区。瑶族人民热情好客，能歌善舞，瑶族的歌舞具有独特的民族风格。'
  },
  {
    id: 'miao',
    name: '苗族',
    population: '约942万',
    language: '苗语',
    description: '苗族是中国的少数民族之一，主要分布在贵州、湖南、云南、广西、四川、重庆、湖北等省区。苗族人民能歌善舞，有丰富的民间文学艺术。'
  },
  {
    id: 'dong',
    name: '侗族',
    population: '约349万',
    language: '侗语',
    description: '侗族是中国的少数民族之一，主要分布在贵州、湖南、广西等省区的交界处。侗族人民擅长建筑，鼓楼和风雨桥是侗族建筑的代表。'
  },
  {
    id: 'uyghur',
    name: '维吾尔族',
    population: '约1162万',
    language: '维吾尔语',
    description: '维吾尔族是中国的少数民族之一，主要分布在新疆维吾尔自治区。维吾尔族人民能歌善舞，有丰富的民间文学艺术。'
  },
  {
    id: 'bai',
    name: '白族',
    population: '约209万',
    language: '白语',
    description: '白族是中国的少数民族之一，主要分布在云南省大理白族自治州。白族人民擅长建筑和手工艺，有丰富的民间文学艺术。'
  }
];

// 按照人口数量排序
export const sortedEthnicGroups = [...ethnicGroups].sort((a, b) => {
  // 提取人口数字进行比较
  const popA = parseInt(a.population.replace(/[^0-9]/g, ''));
  const popB = parseInt(b.population.replace(/[^0-9]/g, ''));
  return popB - popA; // 降序排列
});

// 少数民族分布信息
export const ethnicDistribution = [
  {
    ethnicId: 'zhuang',
    regions: [
      {
        province: '广西',
        percentage: '32%',
        customs: [
          '壮族的传统节日有三月三歌圩节',
          '壮族的传统民居是干栏式建筑',
          '壮族的传统服饰色彩鲜艳，图案精美'
        ]
      },
      {
        province: '云南',
        percentage: '2%',
        customs: [
          '云南壮族主要分布在文山壮族苗族自治州',
          '壮族的饮食以大米、玉米为主',
          '壮族的传统音乐是山歌'
        ]
      }
    ]
  },
  {
    ethnicId: 'uyghur',
    regions: [
      {
        province: '新疆',
        percentage: '45%',
        customs: [
          '维吾尔族的传统节日有肉孜节、古尔邦节等',
          '维吾尔族的传统民居是阿以旺式建筑',
          '维吾尔族的传统服饰色彩鲜艳，图案精美',
          '维吾尔族的饮食以面食、牛羊肉为主'
        ]
      }
    ]
  },
  {
    ethnicId: 'hui',
    regions: [
      {
        province: '宁夏',
        percentage: '36%',
        customs: [
          '回族信仰伊斯兰教，主要节日有开斋节、古尔邦节等',
          '回族的传统服饰是白帽和盖头',
          '回族的饮食禁忌较多，禁食猪肉等'
        ]
      },
      {
        province: '甘肃',
        percentage: '7%',
        customs: [
          '甘肃回族主要分布在临夏、平凉等地',
          '回族的传统手工业较为发达，如制毯、制革等',
          '回族的建筑风格受伊斯兰教影响较大'
        ]
      }
    ]
  },
  {
    ethnicId: 'manchu',
    regions: [
      {
        province: '辽宁',
        percentage: '12%',
        customs: [
          '满族的传统节日有颁金节',
          '满族的传统民居是口袋房',
          '满族的传统服饰是旗袍'
        ]
      },
      {
        province: '黑龙江',
        percentage: '5%',
        customs: [
          '黑龙江满族主要分布在黑河、齐齐哈尔等地',
          '满族的饮食以大米、小米、高粱为主',
          '满族的传统音乐是萨满调'
        ]
      }
    ]
  },
  {
    ethnicId: 'yi',
    regions: [
      {
        province: '云南',
        percentage: '10%',
        customs: [
          '火把节是彝族最隆重的传统节日',
          '彝族的传统民居是土掌房',
          '彝族人民能歌善舞，有丰富的民间文学艺术'
        ]
      },
      {
        province: '四川',
        percentage: '4%',
        customs: [
          '四川彝族主要分布在凉山彝族自治州',
          '彝族的传统服饰色彩鲜艳，图案精美',
          '彝族的饮食以玉米、土豆、荞麦为主'
        ]
      }
    ]
  },
  {
    ethnicId: 'miao',
    regions: [
      {
        province: '贵州',
        percentage: '12%',
        customs: [
          '苗族的传统节日有苗年、四月八等',
          '苗族的传统民居是吊脚楼',
          '苗族的传统服饰色彩鲜艳，图案精美',
          '苗族的传统音乐是飞歌'
        ]
      },
      {
        province: '湖南',
        percentage: '3%',
        customs: [
          '湖南苗族主要分布在湘西土家族苗族自治州',
          '苗族的饮食以大米、玉米为主',
          '苗族的传统舞蹈是芦笙舞'
        ]
      }
    ]
  },
  {
    ethnicId: 'tujia',
    regions: [
      {
        province: '湖南',
        percentage: '10%',
        customs: [
          '土家族的传统节日有赶年、四月八等',
          '土家族的传统民居是吊脚楼',
          '土家族的传统舞蹈是摆手舞'
        ]
      },
      {
        province: '湖北',
        percentage: '5%',
        customs: [
          '湖北土家族主要分布在恩施土家族苗族自治州',
          '土家族的饮食以玉米、土豆、大米为主',
          '土家族的传统音乐是哭嫁歌'
        ]
      }
    ]
  },
  {
    ethnicId: 'zang',
    regions: [
      {
        province: '西藏',
        percentage: '90%',
        customs: [
          '酥油茶和青稞酒是藏族的传统饮品',
          '藏族人民信仰藏传佛教',
          '雪顿节是藏族的重要节日，主要活动有展佛、藏戏表演等',
          '藏族的传统服饰是藏袍，具有保暖、实用的特点'
        ]
      },
      {
        province: '青海',
        percentage: '25%',
        customs: [
          '青海藏族以游牧为主，主要饲养牦牛、绵羊等',
          '那达慕大会是青海藏族的传统节日',
          '青海藏族的饮食以牛羊肉、奶制品为主'
        ]
      },
      {
        province: '四川',
        percentage: '6%',
        customs: [
          '四川藏族主要分布在甘孜、阿坝等地',
          '嘉绒藏族是四川藏族的一个分支，具有独特的文化',
          '四川藏族的建筑风格以碉楼为主'
        ]
      }
    ]
  },
  {
    ethnicId: 'mongol',
    regions: [
      {
        province: '内蒙古',
        percentage: '17%',
        customs: [
          '蒙古族的传统民居是蒙古包',
          '那达慕大会是蒙古族的传统节日，主要活动有摔跤、赛马、射箭等',
          '蒙古族的传统服饰是蒙古袍'
        ]
      },
      {
        province: '新疆',
        percentage: '5%',
        customs: [
          '新疆蒙古族主要分布在巴音郭楞、博尔塔拉等地',
          '蒙古族的饮食以牛羊肉、奶制品为主',
          '蒙古族的传统音乐是长调'
        ]
      }
    ]
  },
  {
    ethnicId: 'dong',
    regions: [
      {
        province: '贵州',
        percentage: '5%',
        customs: [
          '侗族的传统节日有侗年、三月三等',
          '侗族的传统民居是鼓楼和风雨桥',
          '侗族的传统音乐是大歌'
        ]
      },
      {
        province: '湖南',
        percentage: '2%',
        customs: [
          '湖南侗族主要分布在怀化等地',
          '侗族的饮食以大米、玉米为主',
          '侗族的传统舞蹈是哆耶舞'
        ]
      }
    ]
  },
  {
    ethnicId: 'yao',
    regions: [
      {
        province: '广西',
        percentage: '8%',
        customs: [
          '瑶族的传统节日有盘王节',
          '瑶族的传统民居是吊脚楼',
          '瑶族的传统服饰色彩鲜艳，图案精美'
        ]
      },
      {
        province: '湖南',
        percentage: '3%',
        customs: [
          '湖南瑶族主要分布在永州、郴州等地',
          '瑶族的饮食以玉米、大米、红薯为主',
          '瑶族的传统音乐是长鼓歌'
        ]
      }
    ]
  },
  {
    ethnicId: 'bai',
    regions: [
      {
        province: '云南',
        percentage: '3%',
        customs: [
          '白族的传统节日有三月街、火把节等',
          '白族的传统民居是三坊一照壁',
          '白族的传统服饰色彩鲜艳，图案精美',
          '白族的传统音乐是大本曲'
        ]
      }
    ]
  }
];

// 获取所有少数民族
export const getAllEthnicGroups = () => sortedEthnicGroups;

// 根据ID获取少数民族
export const getEthnicGroupById = (id) => ethnicGroups.find(group => group.id === id);

// 获取少数民族分布信息
export const getEthnicDistribution = (ethnicId) => {
  const distribution = ethnicDistribution.find(item => item.ethnicId === ethnicId);
  return distribution ? distribution.regions : [];
};

// 获取所有省份的少数民族分布
export const getProvinceEthnicGroups = (province) => {
  const result = [];
  ethnicDistribution.forEach(item => {
    item.regions.forEach(region => {
      if (region.province === province) {
        result.push({
          ethnicId: item.ethnicId,
          ethnicName: ethnicGroups.find(g => g.id === item.ethnicId)?.name,
          percentage: region.percentage,
          customs: region.customs
        });
      }
    });
  });
  return result;
};
