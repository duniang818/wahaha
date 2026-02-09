// 985大学数据，按城市和排名排序
// 基于2024年中国大学排名

export const cities985 = {
  "北京": [
    { id: 1, name: "清华大学", ranking: 1, type: "综合", established: 1911 },
    { id: 2, name: "北京大学", ranking: 2, type: "综合", established: 1898 },
    { id: 3, name: "中国人民大学", ranking: 15, type: "综合", established: 1937 },
    { id: 4, name: "北京师范大学", ranking: 18, type: "师范", established: 1902 },
    { id: 5, name: "北京航空航天大学", ranking: 20, type: "理工", established: 1952 },
    { id: 6, name: "北京理工大学", ranking: 25, type: "理工", established: 1940 },
    { id: 7, name: "中国农业大学", ranking: 30, type: "农林", established: 1905 },
    { id: 8, name: "中央民族大学", ranking: 85, type: "民族", established: 1941 }
  ],
  "上海": [
    { id: 9, name: "复旦大学", ranking: 3, type: "综合", established: 1905 },
    { id: 10, name: "上海交通大学", ranking: 5, type: "综合", established: 1896 },
    { id: 11, name: "同济大学", ranking: 12, type: "理工", established: 1907 },
    { id: 12, name: "华东师范大学", ranking: 28, type: "师范", established: 1951 }
  ],
  "杭州": [
    { id: 13, name: "浙江大学", ranking: 4, type: "综合", established: 1897 }
  ],
  "南京": [
    { id: 14, name: "南京大学", ranking: 7, type: "综合", established: 1902 },
    { id: 15, name: "东南大学", ranking: 16, type: "综合", established: 1902 }
  ],
  "合肥": [
    { id: 16, name: "中国科学技术大学", ranking: 6, type: "理工", established: 1958 }
  ],
  "武汉": [
    { id: 17, name: "华中科技大学", ranking: 9, type: "综合", established: 1952 },
    { id: 18, name: "武汉大学", ranking: 10, type: "综合", established: 1893 }
  ],
  "广州": [
    { id: 19, name: "中山大学", ranking: 8, type: "综合", established: 1924 },
    { id: 20, name: "华南理工大学", ranking: 24, type: "理工", established: 1952 }
  ],
  "西安": [
    { id: 21, name: "西安交通大学", ranking: 11, type: "综合", established: 1896 },
    { id: 22, name: "西北工业大学", ranking: 26, type: "理工", established: 1938 }
  ],
  "成都": [
    { id: 23, name: "四川大学", ranking: 13, type: "综合", established: 1896 },
    { id: 24, name: "电子科技大学", ranking: 29, type: "理工", established: 1956 }
  ],
  "天津": [
    { id: 25, name: "天津大学", ranking: 19, type: "理工", established: 1895 },
    { id: 26, name: "南开大学", ranking: 14, type: "综合", established: 1919 }
  ],
  "长沙": [
    { id: 27, name: "中南大学", ranking: 17, type: "综合", established: 2000 },
    { id: 28, name: "湖南大学", ranking: 31, type: "综合", established: 976 },
    { id: 29, name: "国防科技大学", ranking: 27, type: "军事", established: 1953 }
  ],
  "大连": [
    { id: 30, name: "大连理工大学", ranking: 21, type: "理工", established: 1949 }
  ],
  "哈尔滨": [
    { id: 31, name: "哈尔滨工业大学", ranking: 22, type: "理工", established: 1920 }
  ],
  "厦门": [
    { id: 32, name: "厦门大学", ranking: 23, type: "综合", established: 1921 }
  ],
  "重庆": [
    { id: 33, name: "重庆大学", ranking: 32, type: "综合", established: 1929 }
  ],
  "济南": [
    { id: 34, name: "山东大学", ranking: 14, type: "综合", established: 1901 }
  ],
  "青岛": [
    { id: 35, name: "中国海洋大学", ranking: 50, type: "综合", established: 1924 }
  ],
  "长春": [
    { id: 36, name: "吉林大学", ranking: 13, type: "综合", established: 1946 }
  ],
  "沈阳": [
    { id: 37, name: "东北大学", ranking: 33, type: "综合", established: 1923 }
  ],
  "兰州": [
    { id: 38, name: "兰州大学", ranking: 34, type: "综合", established: 1909 }
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
