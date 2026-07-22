// 985大学数据，按城市和排名排序
// 基于2024年中国大学排名

export const cities985 = {
  "北京": [
    { id: 1, name: "清华大学", ranking: 1, type: "综合", established: 1911, admissionScore: { 2024: 680, province: "北京" },
      zhangXuefeng: {
        evaluation: "中国最顶尖的大学，综合实力全国第一，理工科尤其强势。如果孩子能考上清华，未来发展前景非常广阔，无论是继续深造还是直接就业，都能获得最好的资源和机会。",
        careerAdvice: "适合追求学术高峰或顶尖科技企业的学生，推荐专业：计算机、电子、自动化、建筑等。"
      }
    },
    { id: 2, name: "北京大学", ranking: 2, type: "综合", established: 1898, admissionScore: { 2024: 675, province: "北京" },
      zhangXuefeng: {
        evaluation: "人文社科领域全国第一，综合实力与清华齐名。北大的学生视野开阔，思维活跃，适合喜欢人文、社会科学的学生。",
        careerAdvice: "推荐专业：经济学、法学、中文、历史、哲学等，未来可进入政府、金融、教育等领域。"
      }
    },
    { id: 3, name: "中国人民大学", ranking: 15, type: "综合", established: 1937, admissionScore: { 2024: 650, province: "北京" },
      zhangXuefeng: {
        evaluation: "人文社科领域的顶尖高校，尤其在经济学、法学、新闻学等专业实力强劲。毕业生在政府机关、金融机构、媒体等领域非常受欢迎。",
        careerAdvice: "适合对人文社科感兴趣的学生，推荐专业：经济学、法学、新闻学、公共管理等。"
      }
    },
    { id: 4, name: "北京师范大学", ranking: 18, type: "师范", established: 1902, admissionScore: { 2024: 640, province: "北京" },
      zhangXuefeng: {
        evaluation: "师范类院校的顶尖代表，教育学、心理学、中国语言文学等专业全国领先。如果孩子想从事教育行业，北师大是最佳选择。",
        careerAdvice: "推荐专业：教育学、心理学、汉语言文学、历史学等，未来可成为中小学教师、教育研究者等。"
      }
    },
    { id: 5, name: "北京航空航天大学", ranking: 20, type: "理工", established: 1952, admissionScore: { 2024: 645, province: "北京" },
      zhangXuefeng: {
        evaluation: "航空航天领域的顶尖高校，飞行器设计、航空发动机等专业全国第一。毕业生在航空航天、国防科技等领域非常抢手。",
        careerAdvice: "适合对航空航天、机械、电子等领域感兴趣的学生，推荐专业：飞行器设计与工程、航空航天工程等。"
      }
    },
    { id: 6, name: "北京理工大学", ranking: 25, type: "理工", established: 1940, admissionScore: { 2024: 635, province: "北京" },
      zhangXuefeng: {
        evaluation: "国防科技领域的重要高校，兵器科学与技术、机械工程等专业实力强劲。毕业生在国防军工、机械制造等行业就业前景好。",
        careerAdvice: "推荐专业：兵器科学与技术、机械工程、自动化等，未来可进入军工企业、科研院所等。"
      }
    },
    { id: 7, name: "中国农业大学", ranking: 30, type: "农林", established: 1905, admissionScore: { 2024: 610, province: "北京" },
      zhangXuefeng: {
        evaluation: "农业领域的顶尖高校，农业科学、植物保护等专业全国领先。虽然专业偏冷门，但在农业现代化、食品科学等领域有重要地位。",
        careerAdvice: "适合对农业、生物、食品科学感兴趣的学生，推荐专业：农业科学、食品科学与工程、生物工程等。"
      }
    },
    { id: 8, name: "中央民族大学", ranking: 85, type: "民族", established: 1941, admissionScore: { 2024: 590, province: "北京" },
      zhangXuefeng: {
        evaluation: "民族类院校的代表，民族学、中国少数民族语言文学等专业全国领先。毕业生在民族事务、文化教育等领域有独特优势。",
        careerAdvice: "适合对民族学、文化研究感兴趣的学生，推荐专业：民族学、中国少数民族语言文学、社会学等。"
      }
    }
  ],
  "上海": [
    { id: 9, name: "复旦大学", ranking: 3, type: "综合", established: 1905, admissionScore: { 2024: 670, province: "上海" },
      zhangXuefeng: {
        evaluation: "华东地区最顶尖的综合大学，人文社科和自然科学都很强。地理位置优越，毕业生在上海及长三角地区就业优势明显。",
        careerAdvice: "推荐专业：经济学、法学、新闻传播、数学、生物科学等，未来可进入金融、媒体、科研等领域。"
      }
    },
    { id: 10, name: "上海交通大学", ranking: 5, type: "综合", established: 1896, admissionScore: { 2024: 665, province: "上海" },
      zhangXuefeng: {
        evaluation: "理工科实力强劲，尤其在船舶与海洋工程、机械工程等领域全国领先。与上海的产业结合紧密，就业前景非常好。",
        careerAdvice: "推荐专业：船舶与海洋工程、机械工程、计算机科学与技术、电子信息工程等。"
      }
    },
    { id: 11, name: "同济大学", ranking: 12, type: "理工", established: 1907, admissionScore: { 2024: 650, province: "上海" },
      zhangXuefeng: {
        evaluation: "建筑、土木领域的顶尖高校，城市规划、土木工程等专业全国领先。毕业生在建筑设计、房地产、基础设施建设等行业非常受欢迎。",
        careerAdvice: "推荐专业：建筑学、土木工程、城市规划、环境科学与工程等。"
      }
    },
    { id: 12, name: "华东师范大学", ranking: 28, type: "师范", established: 1951, admissionScore: { 2024: 620, province: "上海" },
      zhangXuefeng: {
        evaluation: "华东地区最好的师范大学，教育学、心理学、地理学等专业实力强劲。毕业生在教育、科研等领域就业前景好。",
        careerAdvice: "推荐专业：教育学、心理学、地理学、汉语言文学等，未来可成为教师、教育研究者等。"
      }
    }
  ],
  "杭州": [
    { id: 13, name: "浙江大学", ranking: 4, type: "综合", established: 1897, admissionScore: { 2024: 660, province: "浙江" },
      zhangXuefeng: {
        evaluation: "综合实力全国前三，学科门类齐全，尤其在计算机、光学工程等领域非常强势。与阿里巴巴等浙江企业合作紧密，就业前景广阔。",
        careerAdvice: "推荐专业：计算机科学与技术、光学工程、控制科学与工程、临床医学等。"
      }
    }
  ],
  "南京": [
    { id: 14, name: "南京大学", ranking: 7, type: "综合", established: 1902, admissionScore: { 2024: 655, province: "江苏" },
      zhangXuefeng: {
        evaluation: "人文社科和自然科学都很强，尤其是物理学、化学、天文学等基础学科全国领先。学术氛围浓厚，适合喜欢研究的学生。",
        careerAdvice: "推荐专业：物理学、化学、天文学、中国语言文学、历史学等，未来可进入科研院所、高校等。"
      }
    },
    { id: 15, name: "东南大学", ranking: 16, type: "综合", established: 1902, admissionScore: { 2024: 640, province: "江苏" },
      zhangXuefeng: {
        evaluation: "建筑、土木、电子等领域实力强劲，尤其是建筑学科与同济大学齐名。毕业生在长三角地区就业优势明显。",
        careerAdvice: "推荐专业：建筑学、土木工程、电子科学与技术、信息与通信工程等。"
      }
    }
  ],
  "合肥": [
    { id: 16, name: "中国科学技术大学", ranking: 6, type: "理工", established: 1958, admissionScore: { 2024: 660, province: "安徽" },
      zhangXuefeng: {
        evaluation: "理工科尤其是基础学科的顶尖高校，物理学、化学、地球物理学等专业全国领先。学术氛围浓厚，适合对科研有浓厚兴趣的学生。",
        careerAdvice: "推荐专业：物理学、化学、地球物理学、计算机科学与技术等，未来可进入科研院所、高校等。"
      }
    }
  ],
  "武汉": [
    { id: 17, name: "华中科技大学", ranking: 9, type: "综合", established: 1952, admissionScore: { 2024: 645, province: "湖北" },
      zhangXuefeng: {
        evaluation: "理工科实力强劲，尤其是机械工程、光学工程、计算机等专业全国领先。毕业生在华中地区就业优势明显。",
        careerAdvice: "推荐专业：机械工程、光学工程、计算机科学与技术、电气工程等。"
      }
    },
    { id: 18, name: "武汉大学", ranking: 10, type: "综合", established: 1893, admissionScore: { 2024: 640, province: "湖北" },
      zhangXuefeng: {
        evaluation: "综合实力强劲，尤其是法学、新闻学、图书馆学等专业全国领先。校园环境优美，学术氛围浓厚。",
        careerAdvice: "推荐专业：法学、新闻学、图书馆学、测绘科学与技术等。"
      }
    }
  ],
  "广州": [
    { id: 19, name: "中山大学", ranking: 8, type: "综合", established: 1924, admissionScore: { 2024: 640, province: "广东" },
      zhangXuefeng: {
        evaluation: "华南地区最顶尖的综合大学，医学、工商管理、历史学等专业实力强劲。地理位置优越，毕业生在珠三角地区就业优势明显。",
        careerAdvice: "推荐专业：临床医学、工商管理、历史学、汉语言文学等。"
      }
    },
    { id: 20, name: "华南理工大学", ranking: 24, type: "理工", established: 1952, admissionScore: { 2024: 630, province: "广东" },
      zhangXuefeng: {
        evaluation: "华南地区最好的理工科大学，轻工技术与工程、建筑学等专业全国领先。与珠三角的制造业、建筑业等产业结合紧密。",
        careerAdvice: "推荐专业：轻工技术与工程、建筑学、机械工程、计算机科学与技术等。"
      }
    }
  ],
  "西安": [
    { id: 21, name: "西安交通大学", ranking: 11, type: "综合", established: 1896, admissionScore: { 2024: 635, province: "陕西" },
      zhangXuefeng: {
        evaluation: "西北地区最顶尖的大学，机械工程、电气工程、管理科学与工程等专业全国领先。毕业生在西北及全国范围内都有很好的就业前景。",
        careerAdvice: "推荐专业：机械工程、电气工程、管理科学与工程、计算机科学与技术等。"
      }
    },
    { id: 22, name: "西北工业大学", ranking: 26, type: "理工", established: 1938, admissionScore: { 2024: 625, province: "陕西" },
      zhangXuefeng: {
        evaluation: "航空航天、航海、材料等领域的顶尖高校，飞行器设计、材料科学与工程等专业全国领先。毕业生在国防科技领域非常抢手。",
        careerAdvice: "推荐专业：飞行器设计与工程、材料科学与工程、航空航天工程等。"
      }
    }
  ],
  "成都": [
    { id: 23, name: "四川大学", ranking: 13, type: "综合", established: 1896, admissionScore: { 2024: 620, province: "四川" },
      zhangXuefeng: {
        evaluation: "西南地区最顶尖的综合大学，口腔医学、临床医学、数学等专业实力强劲。毕业生在西南地区就业优势明显。",
        careerAdvice: "推荐专业：口腔医学、临床医学、数学、汉语言文学等。"
      }
    },
    { id: 24, name: "电子科技大学", ranking: 29, type: "理工", established: 1956, admissionScore: { 2024: 630, province: "四川" },
      zhangXuefeng: {
        evaluation: "电子信息领域的顶尖高校，电子科学与技术、信息与通信工程等专业全国领先。毕业生在IT行业非常受欢迎。",
        careerAdvice: "推荐专业：电子科学与技术、信息与通信工程、计算机科学与技术等。"
      }
    }
  ],
  "天津": [
    { id: 25, name: "天津大学", ranking: 19, type: "理工", established: 1895, admissionScore: { 2024: 630, province: "天津" },
      zhangXuefeng: {
        evaluation: "建筑、化工、机械等领域实力强劲，尤其是化学工程与技术专业全国领先。毕业生在天津及京津冀地区就业优势明显。",
        careerAdvice: "推荐专业：化学工程与技术、建筑学、机械工程、土木工程等。"
      }
    },
    { id: 26, name: "南开大学", ranking: 14, type: "综合", established: 1919, admissionScore: { 2024: 635, province: "天津" },
      zhangXuefeng: {
        evaluation: "综合实力强劲，尤其是经济学、历史学、数学等专业全国领先。学术氛围浓厚，适合喜欢研究的学生。",
        careerAdvice: "推荐专业：经济学、历史学、数学、化学等，未来可进入金融、科研、教育等领域。"
      }
    }
  ],
  "长沙": [
    { id: 27, name: "中南大学", ranking: 17, type: "综合", established: 2000, admissionScore: { 2024: 625, province: "湖南" },
      zhangXuefeng: {
        evaluation: "材料科学与工程、矿业工程、临床医学等专业全国领先。毕业生在中南地区就业优势明显。",
        careerAdvice: "推荐专业：材料科学与工程、矿业工程、临床医学、计算机科学与技术等。"
      }
    },
    { id: 28, name: "湖南大学", ranking: 31, type: "综合", established: 976, admissionScore: { 2024: 615, province: "湖南" },
      zhangXuefeng: {
        evaluation: "机械工程、土木工程、化学等专业实力强劲。历史悠久，学术氛围浓厚。",
        careerAdvice: "推荐专业：机械工程、土木工程、化学、经济学等。"
      }
    },
    { id: 29, name: "国防科技大学", ranking: 27, type: "军事", established: 1953, admissionScore: { 2024: 640, province: "湖南" },
      zhangXuefeng: {
        evaluation: "军事院校的顶尖代表，计算机科学与技术、软件工程等专业全国领先。毕业生主要进入军队和国防科技领域。",
        careerAdvice: "推荐专业：计算机科学与技术、软件工程、信息与通信工程等，适合有参军意愿的学生。"
      }
    }
  ],
  "大连": [
    { id: 30, name: "大连理工大学", ranking: 21, type: "理工", established: 1949, admissionScore: { 2024: 620, province: "辽宁" },
      zhangXuefeng: {
        evaluation: "化工、机械、土木工程等专业实力强劲。地理位置优越，毕业生在东北地区及沿海地区就业前景好。",
        careerAdvice: "推荐专业：化学工程与技术、机械工程、土木工程、船舶与海洋工程等。"
      }
    }
  ],
  "哈尔滨": [
    { id: 31, name: "哈尔滨工业大学", ranking: 22, type: "理工", established: 1920, admissionScore: { 2024: 625, province: "黑龙江" },
      zhangXuefeng: {
        evaluation: "土木工程、机械工程、航空航天等专业全国领先。毕业生在国防科技、装备制造等领域非常受欢迎。",
        careerAdvice: "推荐专业：土木工程、机械工程、航空航天工程、计算机科学与技术等。"
      }
    }
  ],
  "厦门": [
    { id: 32, name: "厦门大学", ranking: 23, type: "综合", established: 1921, admissionScore: { 2024: 625, province: "福建" },
      zhangXuefeng: {
        evaluation: "经济学、会计学、化学等专业实力强劲。校园环境优美，地理位置优越，毕业生在福建及长三角地区就业优势明显。",
        careerAdvice: "推荐专业：经济学、会计学、化学、海洋科学等。"
      }
    }
  ],
  "重庆": [
    { id: 33, name: "重庆大学", ranking: 32, type: "综合", established: 1929, admissionScore: { 2024: 615, province: "重庆" },
      zhangXuefeng: {
        evaluation: "机械工程、电气工程、土木工程等专业实力强劲。毕业生在西南地区就业优势明显。",
        careerAdvice: "推荐专业：机械工程、电气工程、土木工程、计算机科学与技术等。"
      }
    }
  ],
  "济南": [
    { id: 34, name: "山东大学", ranking: 14, type: "综合", established: 1901, admissionScore: { 2024: 620, province: "山东" },
      zhangXuefeng: {
        evaluation: "综合实力强劲，尤其是材料科学与工程、数学、化学等专业全国领先。毕业生在山东及周边地区就业优势明显。",
        careerAdvice: "推荐专业：材料科学与工程、数学、化学、临床医学等。"
      }
    }
  ],
  "青岛": [
    { id: 35, name: "中国海洋大学", ranking: 50, type: "综合", established: 1924, admissionScore: { 2024: 600, province: "山东" },
      zhangXuefeng: {
        evaluation: "海洋科学、水产养殖等专业全国领先，是中国海洋领域的顶尖高校。毕业生在海洋相关行业就业前景好。",
        careerAdvice: "推荐专业：海洋科学、水产养殖、海洋技术、环境科学等。"
      }
    }
  ],
  "长春": [
    { id: 36, name: "吉林大学", ranking: 13, type: "综合", established: 1946, admissionScore: { 2024: 615, province: "吉林" },
      zhangXuefeng: {
        evaluation: "综合实力强劲，尤其是化学、车辆工程、法学等专业全国领先。毕业生在东北地区就业优势明显。",
        careerAdvice: "推荐专业：化学、车辆工程、法学、计算机科学与技术等。"
      }
    }
  ],
  "沈阳": [
    { id: 37, name: "东北大学", ranking: 33, type: "综合", established: 1923, admissionScore: { 2024: 610, province: "辽宁" },
      zhangXuefeng: {
        evaluation: "冶金工程、材料科学与工程、计算机科学与技术等专业实力强劲。毕业生在东北地区及全国范围内都有较好的就业前景。",
        careerAdvice: "推荐专业：冶金工程、材料科学与工程、计算机科学与技术、自动化等。"
      }
    }
  ],
  "兰州": [
    { id: 38, name: "兰州大学", ranking: 34, type: "综合", established: 1909, admissionScore: { 2024: 600, province: "甘肃" },
      zhangXuefeng: {
        evaluation: "化学、物理学、大气科学等专业全国领先，是西北地区的重要高校。虽然地理位置偏远，但学术实力强劲。",
        careerAdvice: "推荐专业：化学、物理学、大气科学、生物学等，适合对科研有兴趣的学生。"
      }
    }
  ]
};

// 获取所有985大学（按排名排序）
export const getAll985Universities = () => {
  const all = [];
  Object.values(cities985).forEach(cityUniversities => {
    all.push(...cityUniversities);
  });
  return all.sort((a, b) => a.ranking - b.ranking);
};

// 获取所有城市列表
export const getAllCities = () => {
  return Object.keys(cities985).sort();
};
