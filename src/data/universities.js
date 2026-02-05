// 世界名校TOP10和中国名校TOP10数据
// 基于2024年QS世界大学排名

export const worldUniversities = [
  {
    id: 1,
    name: "麻省理工学院",
    nameEn: "Massachusetts Institute of Technology (MIT)",
    country: "美国",
    ranking: 1,
    introduction: "麻省理工学院是世界顶尖的理工科大学，以工程、计算机科学和商科闻名。成立于1861年，培养了众多诺贝尔奖得主和科技界领袖。",
    top5Majors: [
      { name: "计算机科学", teacher: "Patrick Winston", description: "人工智能和机器学习领域的先驱" },
      { name: "工程学", teacher: "Robert Langer", description: "生物医学工程专家，多项专利发明人" },
      { name: "经济学", teacher: "Esther Duflo", description: "2019年诺贝尔经济学奖得主" },
      { name: "物理学", teacher: "Frank Wilczek", description: "2004年诺贝尔物理学奖得主" },
      { name: "数学", teacher: "Gilbert Strang", description: "线性代数教材作者，数学教育专家" }
    ],
    bottom5Majors: [
      { name: "艺术史", teacher: "Caroline Jones", description: "现代艺术研究专家" },
      { name: "语言学", teacher: "Norvin Richards", description: "句法学和音系学专家" },
      { name: "音乐", teacher: "Evan Ziporyn", description: "当代音乐作曲家和演奏家" },
      { name: "哲学", teacher: "Sally Haslanger", description: "社会哲学和认识论专家" },
      { name: "文学", teacher: "Shankar Raman", description: "早期现代文学研究专家" }
    ],
    famousAlumni: [
      { name: "巴兹·奥尔德林", achievement: "阿波罗11号宇航员，第二位登上月球的人" },
      { name: "本·伯南克", achievement: "前美联储主席，2006-2014年" },
      { name: "科菲·安南", achievement: "前联合国秘书长，2001年诺贝尔和平奖得主" },
      { name: "蒂姆·库克", achievement: "苹果公司CEO" },
      { name: "理查德·费曼", achievement: "1965年诺贝尔物理学奖得主，量子电动力学奠基人" }
    ],
    admissionRequirements: {
      threshold: "极高",
      entryWays: [
        "本科申请：通过Common Application或Coalition Application",
        "转学申请：接受转学生，需提供大学成绩单",
        "研究生申请：各学院独立申请"
      ],
      exams: [
        "SAT/ACT（本科申请，2024年起可选）",
        "TOEFL/IELTS（国际学生）",
        "GRE/GMAT（研究生申请，视专业而定）",
        "学科专项考试（部分专业要求）"
      ],
      examDates: [
        "本科申请截止：11月1日（早申请），1月1日（常规申请）",
        "研究生申请：各专业不同，通常在12月-2月",
        "SAT考试：全年多次，需提前注册",
        "GRE考试：全年可考，需提前预约"
      ],
      tips: "MIT重视学术成绩、科研经历、推荐信和申请文书。建议GPA 4.0+，SAT 1500+，有突出的科研或竞赛成果。"
    }
  },
  {
    id: 2,
    name: "剑桥大学",
    nameEn: "University of Cambridge",
    country: "英国",
    ranking: 2,
    introduction: "剑桥大学是英语世界第二古老的大学，成立于1209年。以其卓越的学术传统和美丽的建筑闻名，培养了120多位诺贝尔奖得主。",
    top5Majors: [
      { name: "数学", teacher: "Timothy Gowers", description: "1998年菲尔兹奖得主，组合数学专家" },
      { name: "物理学", teacher: "Stephen Hawking", description: "已故理论物理学家，黑洞研究先驱" },
      { name: "文学", teacher: "Marina Warner", description: "著名作家和文学评论家" },
      { name: "经济学", teacher: "Amartya Sen", description: "1998年诺贝尔经济学奖得主" },
      { name: "医学", teacher: "Sir Paul Nurse", description: "2001年诺贝尔生理学或医学奖得主" }
    ],
    bottom5Majors: [
      { name: "教育学", teacher: "Anna Vignoles", description: "教育经济学专家" },
      { name: "社会学", teacher: "John Thompson", description: "媒体社会学专家" },
      { name: "人类学", teacher: "Marilyn Strathern", description: "社会人类学专家" },
      { name: "地理学", teacher: "Mike Hulme", description: "气候科学专家" },
      { name: "考古学", teacher: "Cyprian Broodbank", description: "地中海考古学专家" }
    ],
    famousAlumni: [
      { name: "艾萨克·牛顿", achievement: "物理学家、数学家，万有引力定律发现者" },
      { name: "查尔斯·达尔文", achievement: "生物学家，进化论创始人" },
      { name: "斯蒂芬·霍金", achievement: "理论物理学家，黑洞研究先驱" },
      { name: "艾伦·图灵", achievement: "计算机科学之父，人工智能先驱" },
      { name: "约翰·梅纳德·凯恩斯", achievement: "经济学家，宏观经济学奠基人" }
    ],
    admissionRequirements: {
      threshold: "极高",
      entryWays: [
        "本科申请：通过UCAS系统申请",
        "研究生申请：直接向学院申请",
        "访问学者：通过学术交流项目"
      ],
      exams: [
        "A-Level或IB成绩（本科申请）",
        "IELTS 7.5+或TOEFL 110+（国际学生）",
        "STEP考试（数学、工程等专业）",
        "LNAT考试（法律专业）",
        "BMAT考试（医学专业）"
      ],
      examDates: [
        "UCAS申请截止：10月15日（医学、兽医、牙医），1月26日（其他专业）",
        "STEP考试：6月",
        "BMAT考试：11月",
        "IELTS/TOEFL：全年可考"
      ],
      tips: "剑桥要求A-Level成绩A*A*A*或IB 42+，重视学术能力和面试表现。建议提前准备专业相关知识和面试技巧。"
    }
  },
  {
    id: 3,
    name: "牛津大学",
    nameEn: "University of Oxford",
    country: "英国",
    ranking: 3,
    introduction: "牛津大学是英语世界最古老的大学，成立于1096年。以其卓越的学术声誉和独特的学院制闻名，培养了70多位诺贝尔奖得主。",
    top5Majors: [
      { name: "哲学", teacher: "Timothy Williamson", description: "分析哲学专家，形而上学和认识论权威" },
      { name: "政治学", teacher: "Anne Phillips", description: "政治理论专家，性别研究学者" },
      { name: "历史学", teacher: "Peter Frankopan", description: "拜占庭和中世纪历史专家" },
      { name: "英语文学", teacher: "Valentine Cunningham", description: "维多利亚文学和现代主义专家" },
      { name: "医学", teacher: "Sir John Bell", description: "医学研究专家，前英国医学科学院院长" }
    ],
    bottom5Majors: [
      { name: "教育学", teacher: "Ian Menter", description: "教师教育专家" },
      { name: "社会学", teacher: "Stefan Collini", description: "文化社会学专家" },
      { name: "人类学", teacher: "Harvey Whitehouse", description: "认知人类学专家" },
      { name: "地理学", teacher: "Danny Dorling", description: "社会地理学专家" },
      { name: "考古学", teacher: "Barry Cunliffe", description: "欧洲史前考古学专家" }
    ],
    famousAlumni: [
      { name: "斯蒂芬·霍金", achievement: "理论物理学家，黑洞研究先驱" },
      { name: "玛格丽特·撒切尔", achievement: "前英国首相，第一位女性首相" },
      { name: "J.R.R.托尔金", achievement: "《指环王》作者，语言学家" },
      { name: "奥斯卡·王尔德", achievement: "作家、诗人，唯美主义代表人物" },
      { name: "比尔·克林顿", achievement: "前美国总统" }
    ],
    admissionRequirements: {
      threshold: "极高",
      entryWays: [
        "本科申请：通过UCAS系统申请",
        "研究生申请：直接向学院申请",
        "访问学者：通过学术交流项目"
      ],
      exams: [
        "A-Level或IB成绩（本科申请）",
        "IELTS 7.5+或TOEFL 110+（国际学生）",
        "MAT考试（数学、计算机专业）",
        "PAT考试（物理、工程专业）",
        "TSA考试（部分专业）"
      ],
      examDates: [
        "UCAS申请截止：10月15日（医学、兽医、牙医），1月26日（其他专业）",
        "MAT考试：11月",
        "PAT考试：11月",
        "TSA考试：11月"
      ],
      tips: "牛津要求A-Level成绩A*A*A*或IB 42+，重视学术能力、面试表现和入学考试。建议提前准备专业知识和面试技巧。"
    }
  },
  {
    id: 4,
    name: "哈佛大学",
    nameEn: "Harvard University",
    country: "美国",
    ranking: 4,
    introduction: "哈佛大学是美国最古老的高等学府，成立于1636年。以其卓越的学术声誉和丰富的资源闻名，培养了160多位诺贝尔奖得主。",
    top5Majors: [
      { name: "法学", teacher: "Laurence Tribe", description: "宪法学专家，最高法院案件顾问" },
      { name: "医学", teacher: "Eric Lander", description: "人类基因组计划负责人" },
      { name: "商学", teacher: "Michael Porter", description: "竞争战略专家，波特五力模型创始人" },
      { name: "政治学", teacher: "Joseph Nye", description: "软实力理论创始人" },
      { name: "经济学", teacher: "Gregory Mankiw", description: "宏观经济学教材作者" }
    ],
    bottom5Majors: [
      { name: "艺术史", teacher: "Jennifer Roberts", description: "美国艺术史专家" },
      { name: "语言学", teacher: "Steven Pinker", description: "认知语言学家" },
      { name: "音乐", teacher: "Vijay Iyer", description: "爵士音乐家和作曲家" },
      { name: "戏剧", teacher: "Diane Paulus", description: "戏剧导演，艺术总监" },
      { name: "宗教研究", teacher: "Karen King", description: "早期基督教研究专家" }
    ],
    famousAlumni: [
      { name: "巴拉克·奥巴马", achievement: "前美国总统，2009年诺贝尔和平奖得主" },
      { name: "马克·扎克伯格", achievement: "Facebook创始人" },
      { name: "比尔·盖茨", achievement: "微软创始人，慈善家" },
      { name: "约翰·F·肯尼迪", achievement: "前美国总统" },
      { name: "拉尔夫·沃尔多·爱默生", achievement: "作家、哲学家，超验主义代表人物" }
    ],
    admissionRequirements: {
      threshold: "极高",
      entryWays: [
        "本科申请：通过Common Application或Coalition Application",
        "转学申请：接受转学生，需提供大学成绩单",
        "研究生申请：各学院独立申请"
      ],
      exams: [
        "SAT/ACT（本科申请，2024年起可选）",
        "TOEFL/IELTS（国际学生）",
        "GRE/GMAT/LSAT/MCAT（研究生申请，视专业而定）"
      ],
      examDates: [
        "本科申请截止：11月1日（早申请），1月1日（常规申请）",
        "研究生申请：各专业不同，通常在12月-2月",
        "SAT考试：全年多次",
        "LSAT考试：全年多次（法学院）"
      ],
      tips: "哈佛重视学术成绩、领导力、社区服务和申请文书。建议GPA 4.0+，SAT 1500+，有突出的课外活动和领导经历。"
    }
  },
  {
    id: 5,
    name: "斯坦福大学",
    nameEn: "Stanford University",
    country: "美国",
    ranking: 5,
    introduction: "斯坦福大学位于硅谷中心，以其在科技和创新领域的卓越表现闻名。培养了众多科技界和商界领袖，是创业文化的摇篮。",
    top5Majors: [
      { name: "计算机科学", teacher: "Andrew Ng", description: "机器学习专家，Coursera联合创始人" },
      { name: "工程学", teacher: "Sebastian Thrun", description: "自动驾驶和机器人专家" },
      { name: "商学", teacher: "Jennifer Aaker", description: "行为科学和市场营销专家" },
      { name: "医学", teacher: "Irving Weissman", description: "干细胞研究专家" },
      { name: "经济学", teacher: "Alvin Roth", description: "2012年诺贝尔经济学奖得主" }
    ],
    bottom5Majors: [
      { name: "艺术史", teacher: "Alexander Nemerov", description: "美国艺术史专家" },
      { name: "语言学", teacher: "Eve Clark", description: "语言习得专家" },
      { name: "音乐", teacher: "Mark Applebaum", description: "当代音乐作曲家" },
      { name: "戏剧", teacher: "Harry Elam", description: "戏剧研究专家" },
      { name: "宗教研究", teacher: "Robert Gregg", description: "早期基督教研究专家" }
    ],
    famousAlumni: [
      { name: "拉里·佩奇", achievement: "Google联合创始人" },
      { name: "谢尔盖·布林", achievement: "Google联合创始人" },
      { name: "伊隆·马斯克", achievement: "特斯拉和SpaceX CEO" },
      { name: "瑞德·霍夫曼", achievement: "LinkedIn联合创始人" },
      { name: "桑德拉·戴·奥康纳", achievement: "前美国最高法院大法官" }
    ],
    admissionRequirements: {
      threshold: "极高",
      entryWays: [
        "本科申请：通过Common Application",
        "转学申请：接受转学生",
        "研究生申请：各学院独立申请"
      ],
      exams: [
        "SAT/ACT（本科申请，2024年起可选）",
        "TOEFL/IELTS（国际学生）",
        "GRE/GMAT（研究生申请）"
      ],
      examDates: [
        "本科申请截止：11月1日（限制性早申请），1月5日（常规申请）",
        "研究生申请：各专业不同",
        "SAT考试：全年多次"
      ],
      tips: "斯坦福重视学术成绩、创新精神、领导力和申请文书。建议GPA 4.0+，SAT 1500+，有突出的创新项目或创业经历。"
    }
  },
  {
    id: 6,
    name: "帝国理工学院",
    nameEn: "Imperial College London",
    country: "英国",
    ranking: 6,
    introduction: "帝国理工学院专注于科学、工程、医学和商科，以其卓越的研究和教学质量闻名。位于伦敦市中心，培养了众多科技和医学领域的领袖。",
    top5Majors: [
      { name: "工程学", teacher: "Lord Ara Darzi", description: "外科手术机器人专家" },
      { name: "医学", teacher: "Sir Roy Anderson", description: "传染病流行病学专家" },
      { name: "计算机科学", teacher: "Murray Shanahan", description: "人工智能和认知科学专家" },
      { name: "物理学", teacher: "Joachim Kopp", description: "粒子物理学专家" },
      { name: "数学", teacher: "Martin Hairer", description: "2014年菲尔兹奖得主" }
    ],
    bottom5Majors: [
      { name: "管理学", teacher: "David Gann", description: "创新管理专家" },
      { name: "生物科学", teacher: "Armand Leroi", description: "进化生物学专家" },
      { name: "化学", teacher: "Tom Welton", description: "绿色化学专家" },
      { name: "材料科学", teacher: "Molly Stevens", description: "生物材料专家" },
      { name: "地球科学", teacher: "Joanna Morgan", description: "地球物理学专家" }
    ],
    famousAlumni: [
      { name: "亚历山大·弗莱明", achievement: "青霉素发现者，1945年诺贝尔生理学或医学奖得主" },
      { name: "H.G.威尔斯", achievement: "科幻小说作家，《时间机器》作者" },
      { name: "布赖恩·梅", achievement: "Queen乐队吉他手，天体物理学家" },
      { name: "拉吉夫·甘地", achievement: "前印度总理" },
      { name: "托马斯·赫胥黎", achievement: "生物学家，达尔文进化论的坚定支持者" }
    ],
    admissionRequirements: {
      threshold: "极高",
      entryWays: [
        "本科申请：通过UCAS系统申请",
        "研究生申请：直接申请",
        "访问学者：通过学术交流项目"
      ],
      exams: [
        "A-Level或IB成绩（本科申请）",
        "IELTS 7.0+或TOEFL 100+（国际学生）",
        "MAT考试（数学专业）",
        "PAT考试（物理、工程专业）",
        "BMAT考试（医学专业）"
      ],
      examDates: [
        "UCAS申请截止：10月15日（医学），1月26日（其他专业）",
        "MAT考试：11月",
        "PAT考试：11月",
        "BMAT考试：11月"
      ],
      tips: "帝国理工要求A-Level成绩A*A*A或IB 40+，重视学术能力和专业相关经验。建议提前准备专业知识和相关实习经历。"
    }
  },
  {
    id: 7,
    name: "苏黎世联邦理工学院",
    nameEn: "ETH Zurich",
    country: "瑞士",
    ranking: 7,
    introduction: "苏黎世联邦理工学院是瑞士最著名的理工大学，以其在工程、科学和技术领域的卓越表现闻名。培养了21位诺贝尔奖得主，包括爱因斯坦。",
    top5Majors: [
      { name: "工程学", teacher: "Bradley Nelson", description: "微机器人和纳米技术专家" },
      { name: "计算机科学", teacher: "Donald Kossmann", description: "数据库系统专家" },
      { name: "物理学", teacher: "Tilman Esslinger", description: "量子光学专家" },
      { name: "数学", teacher: "Alessio Figalli", description: "2018年菲尔兹奖得主" },
      { name: "化学", teacher: "Wendelin Stark", description: "材料化学专家" }
    ],
    bottom5Majors: [
      { name: "建筑学", teacher: "Christoph Girot", description: "景观建筑专家" },
      { name: "环境科学", teacher: "Reto Knutti", description: "气候科学专家" },
      { name: "地球科学", teacher: "Stephan Gruber", description: "永久冻土研究专家" },
      { name: "材料科学", teacher: "Ralph Spolenak", description: "纳米材料专家" },
      { name: "生物科学", teacher: "Yves Barral", description: "细胞生物学专家" }
    ],
    famousAlumni: [
      { name: "阿尔伯特·爱因斯坦", achievement: "理论物理学家，1921年诺贝尔物理学奖得主，相对论创始人" },
      { name: "约翰·冯·诺伊曼", achievement: "数学家，计算机科学奠基人" },
      { name: "威廉·伦琴", achievement: "物理学家，1895年诺贝尔物理学奖得主，X射线发现者" },
      { name: "卡尔·荣格", achievement: "心理学家，分析心理学创始人" },
      { name: "弗里茨·哈伯", achievement: "化学家，1918年诺贝尔化学奖得主" }
    ],
    admissionRequirements: {
      threshold: "极高",
      entryWays: [
        "本科申请：直接向学校申请",
        "研究生申请：直接申请",
        "交换生：通过交换项目"
      ],
      exams: [
        "高中毕业证书和成绩单",
        "德语C1水平（德语授课专业）或英语C1水平（英语授课专业）",
        "入学考试（部分专业）",
        "GRE（部分研究生专业）"
      ],
      examDates: [
        "本科申请截止：4月30日（秋季入学），11月30日（春季入学）",
        "研究生申请：各专业不同",
        "德语考试：全年可考",
        "入学考试：6月或8月"
      ],
      tips: "ETH要求优秀的学术成绩，德语或英语流利。建议提前学习德语，准备专业相关知识和研究经历。"
    }
  },
  {
    id: 8,
    name: "伦敦大学学院",
    nameEn: "University College London (UCL)",
    country: "英国",
    ranking: 8,
    introduction: "UCL是伦敦第一所大学，成立于1826年。以其多元化的学科设置和卓越的研究闻名，培养了30多位诺贝尔奖得主。",
    top5Majors: [
      { name: "建筑学", teacher: "Peter Cook", description: "建筑大师，Archigram创始人" },
      { name: "教育学", teacher: "Dylan Wiliam", description: "教育评估专家" },
      { name: "医学", teacher: "Sir Michael Marmot", description: "公共卫生专家" },
      { name: "心理学", teacher: "Uta Frith", description: "认知心理学专家" },
      { name: "经济学", teacher: "Sir Richard Blundell", description: "劳动经济学专家" }
    ],
    bottom5Majors: [
      { name: "艺术史", teacher: "Briony Fer", description: "现代艺术专家" },
      { name: "语言学", teacher: "Neil Smith", description: "语言习得专家" },
      { name: "音乐", teacher: "Laurence Dreyfus", description: "音乐学专家" },
      { name: "哲学", teacher: "Tim Crane", description: "心灵哲学专家" },
      { name: "历史学", teacher: "Michael Branch", description: "俄罗斯历史专家" }
    ],
    famousAlumni: [
      { name: "圣雄甘地", achievement: "印度独立运动领袖" },
      { name: "亚历山大·格雷厄姆·贝尔", achievement: "电话发明者" },
      { name: "弗朗西斯·克里克", achievement: "DNA双螺旋结构发现者，1962年诺贝尔生理学或医学奖得主" },
      { name: "拉宾德拉纳特·泰戈尔", achievement: "诗人，1913年诺贝尔文学奖得主" },
      { name: "克里斯托弗·诺兰", achievement: "电影导演，《盗梦空间》《星际穿越》导演" }
    ],
    admissionRequirements: {
      threshold: "高",
      entryWays: [
        "本科申请：通过UCAS系统申请",
        "研究生申请：直接申请",
        "访问学者：通过学术交流项目"
      ],
      exams: [
        "A-Level或IB成绩（本科申请）",
        "IELTS 6.5-7.5+或TOEFL 92-109+（视专业而定）",
        "LNAT考试（法律专业）",
        "BMAT考试（医学专业）"
      ],
      examDates: [
        "UCAS申请截止：10月15日（医学），1月26日（其他专业）",
        "LNAT考试：9月-1月",
        "BMAT考试：11月",
        "IELTS/TOEFL：全年可考"
      ],
      tips: "UCL要求A-Level成绩AAB-AAA或IB 36-38+，重视学术能力和个人陈述。建议提前准备专业相关知识和申请材料。"
    }
  },
  {
    id: 9,
    name: "加州大学伯克利分校",
    nameEn: "University of California, Berkeley",
    country: "美国",
    ranking: 9,
    introduction: "UC Berkeley是加州大学系统的旗舰校区，以其卓越的学术研究和自由开放的校园文化闻名。培养了110多位诺贝尔奖得主。",
    top5Majors: [
      { name: "计算机科学", teacher: "David Patterson", description: "计算机架构专家，RISC架构创始人" },
      { name: "工程学", teacher: "Jennifer Doudna", description: "2020年诺贝尔化学奖得主，CRISPR基因编辑技术发明者" },
      { name: "物理学", teacher: "Saul Perlmutter", description: "2011年诺贝尔物理学奖得主，暗能量发现者" },
      { name: "经济学", teacher: "George Akerlof", description: "2001年诺贝尔经济学奖得主" },
      { name: "化学", teacher: "Yuan T. Lee", description: "1986年诺贝尔化学奖得主" }
    ],
    bottom5Majors: [
      { name: "艺术史", teacher: "T.J. Clark", description: "现代艺术史专家" },
      { name: "语言学", teacher: "George Lakoff", description: "认知语言学专家" },
      { name: "音乐", teacher: "Richard Taruskin", description: "音乐学专家" },
      { name: "戏剧", teacher: "Shannon Jackson", description: "表演研究专家" },
      { name: "宗教研究", teacher: "Robert Sharf", description: "佛教研究专家" }
    ],
    famousAlumni: [
      { name: "史蒂夫·沃兹尼亚克", achievement: "苹果公司联合创始人" },
      { name: "戈登·摩尔", achievement: "英特尔联合创始人，摩尔定律提出者" },
      { name: "厄尔·沃伦", achievement: "前美国最高法院首席大法官" },
      { name: "珍妮特·耶伦", achievement: "前美联储主席，现任美国财政部长" },
      { name: "张忠谋", achievement: "台积电创始人" }
    ],
    admissionRequirements: {
      threshold: "极高",
      entryWays: [
        "本科申请：通过UC系统申请",
        "转学申请：接受社区大学转学生",
        "研究生申请：各学院独立申请"
      ],
      exams: [
        "SAT/ACT（本科申请，2024年起可选）",
        "TOEFL 80+或IELTS 6.5+（国际学生）",
        "GRE（研究生申请，视专业而定）"
      ],
      examDates: [
        "UC申请截止：11月30日",
        "研究生申请：各专业不同，通常在12月-1月",
        "SAT考试：全年多次"
      ],
      tips: "UC Berkeley重视学术成绩、课外活动和申请文书。建议GPA 3.9+，SAT 1400+，有突出的课外活动和社区服务经历。"
    }
  },
  {
    id: 10,
    name: "芝加哥大学",
    nameEn: "University of Chicago",
    country: "美国",
    ranking: 10,
    introduction: "芝加哥大学以其卓越的学术研究和严谨的学术传统闻名。培养了100多位诺贝尔奖得主，在经济学、社会学和物理学领域享有盛誉。",
    top5Majors: [
      { name: "经济学", teacher: "Eugene Fama", description: "2013年诺贝尔经济学奖得主，有效市场假说提出者" },
      { name: "物理学", teacher: "Enrico Fermi", description: "已故物理学家，1938年诺贝尔物理学奖得主，核反应堆发明者" },
      { name: "社会学", teacher: "Gary Becker", description: "1992年诺贝尔经济学奖得主，社会经济学专家" },
      { name: "数学", teacher: "Shing-Tung Yau", description: "1982年菲尔兹奖得主，微分几何专家" },
      { name: "法学", teacher: "Richard Posner", description: "法律经济学专家" }
    ],
    bottom5Majors: [
      { name: "艺术史", teacher: "Wu Hung", description: "中国艺术史专家" },
      { name: "语言学", teacher: "Jerrold Sadock", description: "句法学专家" },
      { name: "音乐", teacher: "Martha Feldman", description: "音乐学专家" },
      { name: "戏剧", teacher: "David Bevington", description: "莎士比亚研究专家" },
      { name: "宗教研究", teacher: "Wendy Doniger", description: "印度宗教研究专家" }
    ],
    famousAlumni: [
      { name: "米尔顿·弗里德曼", achievement: "1976年诺贝尔经济学奖得主，货币主义经济学创始人" },
      { name: "詹姆斯·沃森", achievement: "DNA双螺旋结构发现者，1962年诺贝尔生理学或医学奖得主" },
      { name: "索尔·贝娄", achievement: "1976年诺贝尔文学奖得主" },
      { name: "巴拉克·奥巴马", achievement: "前美国总统，曾在法学院任教" },
      { name: "卡尔·萨根", achievement: "天文学家，科普作家" }
    ],
    admissionRequirements: {
      threshold: "极高",
      entryWays: [
        "本科申请：通过Common Application或Coalition Application",
        "转学申请：接受转学生",
        "研究生申请：各学院独立申请"
      ],
      exams: [
        "SAT/ACT（本科申请，2024年起可选）",
        "TOEFL/IELTS（国际学生）",
        "GRE/GMAT/LSAT（研究生申请，视专业而定）"
      ],
      examDates: [
        "本科申请截止：11月1日（早申请），1月2日（常规申请）",
        "研究生申请：各专业不同，通常在12月-1月",
        "SAT考试：全年多次"
      ],
      tips: "芝加哥大学重视学术成绩、研究能力和申请文书。建议GPA 3.9+，SAT 1500+，有突出的研究经历和学术成果。"
    }
  }
];

export const chineseUniversities = [
  {
    id: 11,
    name: "清华大学",
    nameEn: "Tsinghua University",
    country: "中国",
    ranking: 1,
    introduction: "清华大学是中国最顶尖的综合性大学之一，以工程、计算机科学和管理学闻名。成立于1911年，培养了众多科技和商界领袖。",
    top5Majors: [
      { name: "计算机科学与技术", teacher: "姚期智", description: "2000年图灵奖得主，量子计算专家" },
      { name: "工程学", teacher: "施一公", description: "结构生物学家，前副校长" },
      { name: "经济学", teacher: "钱颖一", description: "经济学家，前经管学院院长" },
      { name: "物理学", teacher: "薛其坤", description: "凝聚态物理专家，中科院院士" },
      { name: "建筑学", teacher: "吴良镛", description: "建筑学家，2011年国家最高科学技术奖得主" }
    ],
    bottom5Majors: [
      { name: "艺术史", teacher: "尚刚", description: "中国古代艺术史专家" },
      { name: "语言学", teacher: "黄国营", description: "现代汉语语法专家" },
      { name: "音乐", teacher: "赵元任", description: "已故语言学家和音乐家" },
      { name: "哲学", teacher: "陈来", description: "中国哲学史专家" },
      { name: "文学", teacher: "格非", description: "作家，先锋文学代表人物" }
    ],
    famousAlumni: [
      { name: "习近平", achievement: "中华人民共和国国家主席" },
      { name: "胡锦涛", achievement: "前中华人民共和国国家主席" },
      { name: "杨振宁", achievement: "1957年诺贝尔物理学奖得主" },
      { name: "邓稼先", achievement: "两弹一星功勋奖章获得者" },
      { name: "钱学森", achievement: "中国航天之父，两弹一星功勋奖章获得者" }
    ],
    admissionRequirements: {
      threshold: "极高",
      entryWays: [
        "高考统招：通过全国统一高考",
        "保送生：通过学科竞赛保送",
        "自主招生：通过自主招生考试",
        "强基计划：通过强基计划选拔",
        "港澳台招生：通过港澳台联考"
      ],
      exams: [
        "高考（语文、数学、外语、理综/文综）",
        "自主招生考试（数学、物理、化学等）",
        "强基计划校测（学科基础能力测试）",
        "面试（部分专业）"
      ],
      examDates: [
        "高考：6月7-8日",
        "自主招生考试：6月中旬",
        "强基计划校测：7月初",
        "港澳台联考：5月"
      ],
      tips: "清华要求高考成绩极高（通常需要全省前100名），重视学科竞赛成绩和综合素质。建议提前准备学科竞赛，提高综合素质。"
    }
  },
  {
    id: 12,
    name: "北京大学",
    nameEn: "Peking University",
    country: "中国",
    ranking: 2,
    introduction: "北京大学是中国最著名的综合性大学，以人文、社会科学和基础科学闻名。成立于1898年，是中国现代高等教育的发源地。",
    top5Majors: [
      { name: "中国语言文学", teacher: "钱理群", description: "现代文学研究专家" },
      { name: "历史学", teacher: "阎步克", description: "中国古代史专家" },
      { name: "哲学", teacher: "陈来", description: "中国哲学史专家" },
      { name: "数学", teacher: "田刚", description: "中科院院士，微分几何专家" },
      { name: "物理学", teacher: "王恩哥", description: "中科院院士，凝聚态物理专家" }
    ],
    bottom5Majors: [
      { name: "工程学", teacher: "高文", description: "计算机视觉专家" },
      { name: "医学", teacher: "韩启德", description: "病理生理学专家" },
      { name: "管理学", teacher: "厉以宁", description: "经济学家" },
      { name: "法学", teacher: "朱苏力", description: "法学家" },
      { name: "经济学", teacher: "林毅夫", description: "经济学家" }
    ],
    famousAlumni: [
      { name: "李大钊", achievement: "中国共产党创始人之一" },
      { name: "鲁迅", achievement: "文学家、思想家，现代文学奠基人" },
      { name: "钱钟书", achievement: "作家、文学研究家，《围城》作者" },
      { name: "李政道", achievement: "1957年诺贝尔物理学奖得主" },
      { name: "屠呦呦", achievement: "2015年诺贝尔生理学或医学奖得主，青蒿素发现者" }
    ],
    admissionRequirements: {
      threshold: "极高",
      entryWays: [
        "高考统招：通过全国统一高考",
        "保送生：通过学科竞赛保送",
        "自主招生：通过自主招生考试",
        "强基计划：通过强基计划选拔",
        "港澳台招生：通过港澳台联考"
      ],
      exams: [
        "高考（语文、数学、外语、理综/文综）",
        "自主招生考试（学科能力测试）",
        "强基计划校测（学科基础能力测试）",
        "面试（部分专业）"
      ],
      examDates: [
        "高考：6月7-8日",
        "自主招生考试：6月中旬",
        "强基计划校测：7月初",
        "港澳台联考：5月"
      ],
      tips: "北大要求高考成绩极高（通常需要全省前100名），重视人文素养和综合素质。建议提前准备学科竞赛，提高人文素养。"
    }
  },
  {
    id: 13,
    name: "复旦大学",
    nameEn: "Fudan University",
    country: "中国",
    ranking: 3,
    introduction: "复旦大学是中国著名的综合性大学，以人文、社会科学和医学闻名。成立于1905年，位于上海，培养了众多人文和社会科学领域的学者。",
    top5Majors: [
      { name: "新闻学", teacher: "李良荣", description: "新闻传播学专家" },
      { name: "经济学", teacher: "张军", description: "经济学家，经济学院院长" },
      { name: "医学", teacher: "汤钊猷", description: "肝癌研究专家，中科院院士" },
      { name: "哲学", teacher: "俞吾金", description: "已故哲学家，西方哲学专家" },
      { name: "历史学", teacher: "葛兆光", description: "中国思想史专家" }
    ],
    bottom5Majors: [
      { name: "工程学", teacher: "金亚秋", description: "电磁波专家" },
      { name: "计算机科学", teacher: "周傲英", description: "数据库专家" },
      { name: "数学", teacher: "李大潜", description: "偏微分方程专家" },
      { name: "物理学", teacher: "封东来", description: "凝聚态物理专家" },
      { name: "化学", teacher: "赵东元", description: "材料化学专家" }
    ],
    famousAlumni: [
      { name: "陈望道", achievement: "《共产党宣言》中文首译者，前校长" },
      { name: "苏步青", achievement: "数学家，中科院院士" },
      { name: "谈家桢", achievement: "遗传学家，中国现代遗传学奠基人" },
      { name: "谢希德", achievement: "物理学家，前校长，中科院院士" },
      { name: "王安忆", achievement: "作家，茅盾文学奖得主" }
    ],
    admissionRequirements: {
      threshold: "极高",
      entryWays: [
        "高考统招：通过全国统一高考",
        "保送生：通过学科竞赛保送",
        "自主招生：通过自主招生考试",
        "强基计划：通过强基计划选拔",
        "综合评价：通过综合评价录取"
      ],
      exams: [
        "高考（语文、数学、外语、理综/文综）",
        "自主招生考试（学科能力测试）",
        "强基计划校测（学科基础能力测试）",
        "综合评价面试"
      ],
      examDates: [
        "高考：6月7-8日",
        "自主招生考试：6月中旬",
        "强基计划校测：7月初",
        "综合评价面试：6月下旬"
      ],
      tips: "复旦要求高考成绩极高（通常需要全省前500名），重视综合素质和面试表现。建议提前准备学科竞赛，提高综合素质。"
    }
  },
  {
    id: 14,
    name: "浙江大学",
    nameEn: "Zhejiang University",
    country: "中国",
    ranking: 4,
    introduction: "浙江大学是中国著名的综合性大学，以工程、医学和农学闻名。成立于1897年，位于杭州，在多个学科领域具有优势。",
    top5Majors: [
      { name: "工程学", teacher: "杨卫", description: "固体力学专家，前校长" },
      { name: "计算机科学", teacher: "潘云鹤", description: "人工智能专家，前校长" },
      { name: "医学", teacher: "李兰娟", description: "传染病学专家，中科院院士" },
      { name: "农学", teacher: "陈剑平", description: "植物病理学专家" },
      { name: "化学", teacher: "张泽", description: "材料科学专家" }
    ],
    bottom5Majors: [
      { name: "文学", teacher: "吴秀明", description: "中国现当代文学专家" },
      { name: "历史学", teacher: "包伟民", description: "中国古代史专家" },
      { name: "哲学", teacher: "董平", description: "中国哲学专家" },
      { name: "艺术学", teacher: "陈振濂", description: "书法家" },
      { name: "教育学", teacher: "眭依凡", description: "高等教育学专家" }
    ],
    famousAlumni: [
      { name: "竺可桢", achievement: "气象学家，前校长，中科院院士" },
      { name: "路甬祥", achievement: "机械工程专家，前中科院院长" },
      { name: "段永平", achievement: "步步高、OPPO、vivo创始人" },
      { name: "史玉柱", achievement: "巨人网络创始人" },
      { name: "黄峥", achievement: "拼多多创始人" }
    ],
    admissionRequirements: {
      threshold: "极高",
      entryWays: [
        "高考统招：通过全国统一高考",
        "保送生：通过学科竞赛保送",
        "自主招生：通过自主招生考试",
        "强基计划：通过强基计划选拔",
        "三位一体：通过三位一体综合评价"
      ],
      exams: [
        "高考（语文、数学、外语、理综/文综）",
        "自主招生考试（学科能力测试）",
        "强基计划校测（学科基础能力测试）",
        "三位一体面试"
      ],
      examDates: [
        "高考：6月7-8日",
        "自主招生考试：6月中旬",
        "强基计划校测：7月初",
        "三位一体面试：6月下旬"
      ],
      tips: "浙大要求高考成绩极高（通常需要全省前1000名），重视学科竞赛和综合素质。建议提前准备学科竞赛，提高综合素质。"
    }
  },
  {
    id: 15,
    name: "上海交通大学",
    nameEn: "Shanghai Jiao Tong University",
    country: "中国",
    ranking: 5,
    introduction: "上海交通大学是中国著名的综合性大学，以工程、医学和管理学闻名。成立于1896年，位于上海，在船舶、机械等领域具有传统优势。",
    top5Majors: [
      { name: "船舶与海洋工程", teacher: "杨槱", description: "船舶设计专家，中科院院士" },
      { name: "机械工程", teacher: "林忠钦", description: "制造工程专家，校长" },
      { name: "医学", teacher: "陈国强", description: "肿瘤学专家，中科院院士" },
      { name: "计算机科学", teacher: "梅宏", description: "软件工程专家，中科院院士" },
      { name: "管理学", teacher: "王方华", description: "管理学家" }
    ],
    bottom5Majors: [
      { name: "文学", teacher: "王宁", description: "比较文学专家" },
      { name: "历史学", teacher: "曹树基", description: "中国近现代史专家" },
      { name: "哲学", teacher: "高瑞泉", description: "中国哲学专家" },
      { name: "艺术学", teacher: "周平", description: "设计学专家" },
      { name: "教育学", teacher: "刘念才", description: "高等教育学专家" }
    ],
    famousAlumni: [
      { name: "钱学森", achievement: "中国航天之父，两弹一星功勋奖章获得者" },
      { name: "江泽民", achievement: "前中华人民共和国国家主席" },
      { name: "茅以升", achievement: "桥梁工程专家，中科院院士" },
      { name: "吴文俊", achievement: "数学家，2000年国家最高科学技术奖得主" },
      { name: "张杰", achievement: "物理学家，前校长，中科院院士" }
    ],
    admissionRequirements: {
      threshold: "极高",
      entryWays: [
        "高考统招：通过全国统一高考",
        "保送生：通过学科竞赛保送",
        "自主招生：通过自主招生考试",
        "强基计划：通过强基计划选拔",
        "综合评价：通过综合评价录取"
      ],
      exams: [
        "高考（语文、数学、外语、理综/文综）",
        "自主招生考试（学科能力测试）",
        "强基计划校测（学科基础能力测试）",
        "综合评价面试"
      ],
      examDates: [
        "高考：6月7-8日",
        "自主招生考试：6月中旬",
        "强基计划校测：7月初",
        "综合评价面试：6月下旬"
      ],
      tips: "交大要求高考成绩极高（通常需要全省前500名），重视学科竞赛和综合素质。建议提前准备学科竞赛，提高综合素质。"
    }
  },
  {
    id: 16,
    name: "中国科学技术大学",
    nameEn: "University of Science and Technology of China",
    country: "中国",
    ranking: 6,
    introduction: "中国科学技术大学是中国著名的理工科大学，以基础科学和前沿技术研究闻名。成立于1958年，位于合肥，培养了众多科技人才。",
    top5Majors: [
      { name: "物理学", teacher: "潘建伟", description: "量子物理专家，中科院院士，量子通信领域领军人物" },
      { name: "数学", teacher: "陈秀雄", description: "微分几何专家" },
      { name: "化学", teacher: "谢毅", description: "无机化学专家，中科院院士" },
      { name: "计算机科学", teacher: "陈国良", description: "并行计算专家" },
      { name: "工程学", teacher: "杜江峰", description: "量子计算专家，中科院院士" }
    ],
    bottom5Majors: [
      { name: "管理学", teacher: "方兆本", description: "管理科学专家" },
      { name: "人文科学", teacher: "刘钝", description: "科学史专家" },
      { name: "社会科学", teacher: "汤书昆", description: "科技传播专家" },
      { name: "艺术学", teacher: "陈林", description: "设计学专家" },
      { name: "教育学", teacher: "孔燕", description: "心理学专家" }
    ],
    famousAlumni: [
      { name: "杨振宁", achievement: "1957年诺贝尔物理学奖得主" },
      { name: "李政道", achievement: "1957年诺贝尔物理学奖得主" },
      { name: "潘建伟", achievement: "量子物理专家，中科院院士" },
      { name: "郭光灿", achievement: "量子信息专家，中科院院士" },
      { name: "施一公", achievement: "结构生物学家，中科院院士" }
    ],
    admissionRequirements: {
      threshold: "极高",
      entryWays: [
        "高考统招：通过全国统一高考",
        "保送生：通过学科竞赛保送",
        "自主招生：通过自主招生考试",
        "强基计划：通过强基计划选拔",
        "少年班：通过少年班选拔"
      ],
      exams: [
        "高考（语文、数学、外语、理综）",
        "自主招生考试（数学、物理）",
        "强基计划校测（学科基础能力测试）",
        "少年班考试（数学、物理、英语）"
      ],
      examDates: [
        "高考：6月7-8日",
        "自主招生考试：6月中旬",
        "强基计划校测：7月初",
        "少年班考试：1月"
      ],
      tips: "中科大要求高考成绩极高（通常需要全省前500名），特别重视数学和物理成绩。建议提前准备学科竞赛，特别是数学和物理竞赛。"
    }
  },
  {
    id: 17,
    name: "南京大学",
    nameEn: "Nanjing University",
    country: "中国",
    ranking: 7,
    introduction: "南京大学是中国著名的综合性大学，以人文、社会科学和基础科学闻名。成立于1902年，位于南京，在文学、历史等领域具有传统优势。",
    top5Majors: [
      { name: "中国语言文学", teacher: "程千帆", description: "已故文学研究专家" },
      { name: "历史学", teacher: "茅家琦", description: "中国近现代史专家" },
      { name: "物理学", teacher: "闵乃本", description: "凝聚态物理专家，中科院院士" },
      { name: "化学", teacher: "陈洪渊", description: "分析化学专家，中科院院士" },
      { name: "天文学", teacher: "方成", description: "太阳物理专家，中科院院士" }
    ],
    bottom5Majors: [
      { name: "工程学", teacher: "施毅", description: "微电子专家" },
      { name: "计算机科学", teacher: "周志华", description: "机器学习专家" },
      { name: "医学", teacher: "张辰宇", description: "生物化学专家" },
      { name: "管理学", teacher: "赵曙明", description: "人力资源管理专家" },
      { name: "经济学", teacher: "洪银兴", description: "经济学家" }
    ],
    famousAlumni: [
      { name: "陶行知", achievement: "教育家，生活教育理论创始人" },
      { name: "吴健雄", achievement: "物理学家，实验物理学家" },
      { name: "程千帆", achievement: "文学研究专家" },
      { name: "余光中", achievement: "诗人、作家" },
      { name: "厉以宁", achievement: "经济学家" }
    ],
    admissionRequirements: {
      threshold: "极高",
      entryWays: [
        "高考统招：通过全国统一高考",
        "保送生：通过学科竞赛保送",
        "自主招生：通过自主招生考试",
        "强基计划：通过强基计划选拔",
        "综合评价：通过综合评价录取"
      ],
      exams: [
        "高考（语文、数学、外语、理综/文综）",
        "自主招生考试（学科能力测试）",
        "强基计划校测（学科基础能力测试）",
        "综合评价面试"
      ],
      examDates: [
        "高考：6月7-8日",
        "自主招生考试：6月中旬",
        "强基计划校测：7月初",
        "综合评价面试：6月下旬"
      ],
      tips: "南大要求高考成绩极高（通常需要全省前1000名），重视人文素养和综合素质。建议提前准备学科竞赛，提高人文素养。"
    }
  },
  {
    id: 18,
    name: "中山大学",
    nameEn: "Sun Yat-sen University",
    country: "中国",
    ranking: 8,
    introduction: "中山大学是中国著名的综合性大学，以人文、社会科学和医学闻名。成立于1924年，位于广州，由孙中山先生创办。",
    top5Majors: [
      { name: "医学", teacher: "钟南山", description: "呼吸病学专家，中国工程院院士，抗疫英雄" },
      { name: "哲学", teacher: "陈来", description: "中国哲学专家" },
      { name: "历史学", teacher: "桑兵", description: "中国近现代史专家" },
      { name: "经济学", teacher: "王珺", description: "经济学家" },
      { name: "管理学", teacher: "李新春", description: "管理学家" }
    ],
    bottom5Majors: [
      { name: "工程学", teacher: "许宁生", description: "材料科学专家" },
      { name: "计算机科学", teacher: "罗笑南", description: "计算机图形学专家" },
      { name: "数学", teacher: "朱熹平", description: "微分几何专家" },
      { name: "物理学", teacher: "许宁生", description: "凝聚态物理专家" },
      { name: "化学", teacher: "陈小明", description: "配位化学专家" }
    ],
    famousAlumni: [
      { name: "孙中山", achievement: "革命家，中华民国国父，学校创办人" },
      { name: "鲁迅", achievement: "文学家、思想家，曾在学校任教" },
      { name: "郭沫若", achievement: "文学家、历史学家" },
      { name: "钟南山", achievement: "呼吸病学专家，中国工程院院士" },
      { name: "丁肇中", achievement: "1976年诺贝尔物理学奖得主" }
    ],
    admissionRequirements: {
      threshold: "高",
      entryWays: [
        "高考统招：通过全国统一高考",
        "保送生：通过学科竞赛保送",
        "自主招生：通过自主招生考试",
        "强基计划：通过强基计划选拔",
        "综合评价：通过综合评价录取"
      ],
      exams: [
        "高考（语文、数学、外语、理综/文综）",
        "自主招生考试（学科能力测试）",
        "强基计划校测（学科基础能力测试）",
        "综合评价面试"
      ],
      examDates: [
        "高考：6月7-8日",
        "自主招生考试：6月中旬",
        "强基计划校测：7月初",
        "综合评价面试：6月下旬"
      ],
      tips: "中大要求高考成绩高（通常需要全省前2000名），重视综合素质和面试表现。建议提前准备学科竞赛，提高综合素质。"
    }
  },
  {
    id: 19,
    name: "华中科技大学",
    nameEn: "Huazhong University of Science and Technology",
    country: "中国",
    ranking: 9,
    introduction: "华中科技大学是中国著名的理工科大学，以工程、医学和管理学闻名。成立于1952年，位于武汉，在机械、电气等领域具有优势。",
    top5Majors: [
      { name: "机械工程", teacher: "段正澄", description: "机械制造专家，中国工程院院士" },
      { name: "电气工程", teacher: "程时杰", description: "电力系统专家，中科院院士" },
      { name: "医学", teacher: "裘法祖", description: "已故外科学家，中国现代外科学奠基人" },
      { name: "计算机科学", teacher: "金海", description: "分布式计算专家" },
      { name: "光学工程", teacher: "骆清铭", description: "生物医学光学专家" }
    ],
    bottom5Majors: [
      { name: "文学", teacher: "何锡章", description: "中国现当代文学专家" },
      { name: "历史学", teacher: "罗家祥", description: "中国古代史专家" },
      { name: "哲学", teacher: "欧阳康", description: "马克思主义哲学专家" },
      { name: "艺术学", teacher: "张道一", description: "艺术学专家" },
      { name: "教育学", teacher: "别敦荣", description: "高等教育学专家" }
    ],
    famousAlumni: [
      { name: "周济", achievement: "机械工程专家，前教育部部长" },
      { name: "罗俊", achievement: "引力物理专家，前校长" },
      { name: "张小龙", achievement: "微信创始人" },
      { name: "孟晚舟", achievement: "华为公司副董事长" },
      { name: "李娜", achievement: "网球运动员，大满贯冠军" }
    ],
    admissionRequirements: {
      threshold: "高",
      entryWays: [
        "高考统招：通过全国统一高考",
        "保送生：通过学科竞赛保送",
        "自主招生：通过自主招生考试",
        "强基计划：通过强基计划选拔",
        "综合评价：通过综合评价录取"
      ],
      exams: [
        "高考（语文、数学、外语、理综/文综）",
        "自主招生考试（学科能力测试）",
        "强基计划校测（学科基础能力测试）",
        "综合评价面试"
      ],
      examDates: [
        "高考：6月7-8日",
        "自主招生考试：6月中旬",
        "强基计划校测：7月初",
        "综合评价面试：6月下旬"
      ],
      tips: "华科要求高考成绩高（通常需要全省前3000名），重视学科竞赛和工程实践能力。建议提前准备学科竞赛，提高工程实践能力。"
    }
  },
  {
    id: 20,
    name: "西安交通大学",
    nameEn: "Xi'an Jiaotong University",
    country: "中国",
    ranking: 10,
    introduction: "西安交通大学是中国著名的综合性大学，以工程、医学和管理学闻名。成立于1896年，位于西安，在能源、动力等领域具有传统优势。",
    top5Majors: [
      { name: "能源与动力工程", teacher: "陶文铨", description: "传热学专家，中科院院士" },
      { name: "电气工程", teacher: "王锡凡", description: "电力系统专家，中科院院士" },
      { name: "机械工程", teacher: "卢秉恒", description: "3D打印专家，中国工程院院士" },
      { name: "医学", teacher: "张心湜", description: "泌尿外科专家" },
      { name: "管理学", teacher: "席酉民", description: "管理学家" }
    ],
    bottom5Majors: [
      { name: "文学", teacher: "李建群", description: "中国现当代文学专家" },
      { name: "历史学", teacher: "张岂之", description: "中国思想史专家" },
      { name: "哲学", teacher: "张再林", description: "中国哲学专家" },
      { name: "艺术学", teacher: "钟明善", description: "书法家" },
      { name: "教育学", teacher: "陆根书", description: "高等教育学专家" }
    ],
    famousAlumni: [
      { name: "钱学森", achievement: "中国航天之父，两弹一星功勋奖章获得者" },
      { name: "江泽民", achievement: "前中华人民共和国国家主席" },
      { name: "张光斗", achievement: "水利工程专家，中国工程院院士" },
      { name: "周惠久", achievement: "材料科学专家，中科院院士" },
      { name: "侯洵", achievement: "光电子专家，中科院院士" }
    ],
    admissionRequirements: {
      threshold: "高",
      entryWays: [
        "高考统招：通过全国统一高考",
        "保送生：通过学科竞赛保送",
        "自主招生：通过自主招生考试",
        "强基计划：通过强基计划选拔",
        "综合评价：通过综合评价录取"
      ],
      exams: [
        "高考（语文、数学、外语、理综/文综）",
        "自主招生考试（学科能力测试）",
        "强基计划校测（学科基础能力测试）",
        "综合评价面试"
      ],
      examDates: [
        "高考：6月7-8日",
        "自主招生考试：6月中旬",
        "强基计划校测：7月初",
        "综合评价面试：6月下旬"
      ],
      tips: "西交大要求高考成绩高（通常需要全省前3000名），重视学科竞赛和工程实践能力。建议提前准备学科竞赛，提高工程实践能力。"
    }
  }
];
