import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './XiAnJiaotongDetail.css';

function XiAnJiaotongDetail() {
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState(1);

  const weekSchedule = [
    { day: 1, date: '5.27', title: '交大历史与西迁精神', theme: '历史传承' },
    { day: 2, date: '5.28', title: '交大王牌专业与学科排名', theme: '学科专业' },
    { day: 3, date: '5.29', title: '交大招生政策与录取分数', theme: '招生信息' },
    { day: 4, date: '5.30', title: '交大校园与四大校区', theme: '校园环境' },
    { day: 5, date: '5.31', title: '交大知名校友', theme: '校友风采' },
    { day: 6, date: '6.1', title: '交大历任校长', theme: '领导团队' },
    { day: 7, date: '6.2', title: '交大就业与深造', theme: '就业发展' },
  ];

  return (
    <div className="xjtu-detail-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>← 返回</button>
        
        <div className="university-header">
          <div className="university-logo">📚</div>
          <div className="university-info">
            <h1 className="university-title">西安交通大学</h1>
            <p className="university-subtitle">Xi'an Jiaotong University</p>
            <div className="university-tags">
              <span className="tag">985工程</span>
              <span className="tag">211工程</span>
              <span className="tag">双一流</span>
              <span className="tag">C9联盟</span>
            </div>
          </div>
        </div>

        <div className="week-nav">
          <h3>📅 一周学习计划</h3>
          <div className="week-tabs">
            {weekSchedule.map((item) => (
              <button
                key={item.day}
                className={`week-tab ${activeDay === item.day ? 'active' : ''}`}
                onClick={() => setActiveDay(item.day)}
              >
                <div className="tab-day">Day{item.day}</div>
                <div className="tab-date">{item.date}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="content-section">
          {activeDay === 1 && renderDay1()}
          {activeDay === 2 && renderDay2()}
          {activeDay === 3 && renderDay3()}
          {activeDay === 4 && renderDay4()}
          {activeDay === 5 && renderDay5()}
          {activeDay === 6 && renderDay6()}
          {activeDay === 7 && renderDay7()}
        </div>

        <div className="zhangxuefeng-section">
          <h3>💬 张雪峰评价</h3>
          <div className="quote-box">
            <p>"西安交通大学是西北地区最顶尖的大学，机械工程、电气工程、管理科学与工程等专业全国领先。毕业生在西北及全国范围内都有很好的就业前景。"</p>
            <div className="quote-author">—— 张雪峰</div>
          </div>
        </div>

        <div className="deep-research-section">
          <h3>🎯 西安交大深度研究指南（完整资料）</h3>
          
          <div className="research-guide">
            <div className="research-phase">
              <h4>📚 第一阶段：基础信息收集</h4>
              <div className="phase-content">
                <div className="research-item">
                  <span className="item-number">1</span>
                  <div className="item-content">
                    <h5>官方网站深度浏览</h5>
                    <div className="data-box">
                      <div className="data-row"><span className="data-label">学校官网：</span><span className="data-value">www.xjtu.edu.cn</span></div>
                      <div className="data-row"><span className="data-label">办学层次：</span><span className="data-value">985工程 | 211工程 | 双一流A类</span></div>
                      <div className="data-row"><span className="data-label">建校时间：</span><span className="data-value">1896年（南洋公学）</span></div>
                      <div className="data-row"><span className="data-label">学校类型：</span><span className="data-value">综合性研究型大学</span></div>
                      <div className="data-row"><span className="data-label">校训：</span><span className="data-value">精勤求学、敦笃励志、果毅力行、忠恕任事</span></div>
                      <div className="data-row"><span className="data-label">西迁精神：</span><span className="data-value">胸怀大局、无私奉献、弘扬传统、艰苦创业</span></div>
                    </div>
                    <h6>🏛️ 学院设置（27个学院）：</h6>
                    <div className="college-grid">
                      <span>机械工程学院</span><span>电气工程学院</span><span>能源与动力工程学院</span><span>管理学院</span>
                      <span>经济与金融学院</span><span>数学与统计学院</span><span>物理学院</span><span>化学工程学院</span>
                      <span>材料科学与工程学院</span><span>电子与信息工程学院</span><span>计算机科学与技术学院</span><span>生命科学与技术学院</span>
                      <span>医学部</span><span>人文学院</span><span>马克思主义学院</span><span>外国语学院</span>
                    </div>
                  </div>
                </div>
                <div className="research-item">
                  <span className="item-number">2</span>
                  <div className="item-content">
                    <h5>教育部学科评估结果（第四轮）</h5>
                    <div className="evaluation-grid">
                      <div className="eval-card a-plus"><span className="eval-level">A+</span><span className="eval-subjects">电气工程、动力工程及工程热物理、数学、管理科学与工程</span></div>
                      <div className="eval-card a"><span className="eval-level">A</span><span className="eval-subjects">机械工程、工商管理</span></div>
                      <div className="eval-card a-minus"><span className="eval-level">A-</span><span className="eval-subjects">力学、材料科学与工程、电子科学与技术、控制科学与工程、计算机科学与技术、化学工程与技术、公共管理</span></div>
                      <div className="eval-card b-plus"><span className="eval-level">B+</span><span className="eval-subjects">物理学、生物学、临床医学、药学、哲学、应用经济学、法学、新闻传播学</span></div>
                    </div>
                    <h6>🌟 双一流建设学科（8个）：</h6>
                    <p>力学、机械工程、材料科学与工程、动力工程及工程热物理、电气工程、信息与通信工程、管理科学与工程、工商管理</p>
                  </div>
                </div>
                <div className="research-item">
                  <span className="item-number">3</span>
                  <div className="item-content">
                    <h5>招生章程与录取数据</h5>
                    <h6>📈 近3年陕西省理科录取分数线：</h6>
                    <div className="score-table">
                      <table>
                        <thead><tr><th>年份</th><th>理科最低分</th><th>位次</th><th>文科最低分</th><th>位次</th></tr></thead>
                        <tbody>
                          <tr><td>2024</td><td>635</td><td>2850</td><td>620</td><td>890</td></tr>
                          <tr><td>2023</td><td>628</td><td>3100</td><td>615</td><td>950</td></tr>
                          <tr><td>2022</td><td>638</td><td>2900</td><td>625</td><td>820</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <h6>🎯 各省录取位次参考：</h6>
                    <div className="province-rank">
                      <span>北京：前12%</span><span>上海：前10%</span><span>广东：前8%</span><span>江苏：前7%</span>
                      <span>浙江：前6%</span><span>山东：前5%</span><span>河南：前4%</span><span>四川：前3%</span>
                    </div>
                    <h6>📋 转专业政策：</h6>
                    <p>大一、大二各有一次转专业机会，成绩要求：专业排名前30%可申请热门专业，前50%可申请普通专业，无次数限制但需通过目标学院考核。</p>
                  </div>
                </div>
                <div className="research-item">
                  <span className="item-number">4</span>
                  <div className="item-content">
                    <h5>师资力量</h5>
                    <div className="faculty-stats">
                      <div className="fac-item"><span className="fac-num">37</span><span className="fac-label">中国科学院/工程院院士</span></div>
                      <div className="fac-item"><span className="fac-num">58</span><span className="fac-label">长江学者特聘教授</span></div>
                      <div className="fac-item"><span className="fac-num">47</span><span className="fac-label">国家杰出青年科学基金获得者</span></div>
                      <div className="fac-item"><span className="fac-num">6000+</span><span className="fac-label">专任教师</span></div>
                      <div className="fac-item"><span className="fac-num">85%</span><span className="fac-label">博士学位教师占比</span></div>
                      <div className="fac-item"><span className="fac-num">40%</span><span className="fac-label">海外经历教师占比</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="research-phase">
              <h4>🔍 第二阶段：深入分析</h4>
              <div className="phase-content">
                <div className="research-item">
                  <span className="item-number">1</span>
                  <div className="item-content">
                    <h5>学术研究实力</h5>
                    <h6>🏆 科研平台：</h6>
                    <div className="research-platforms">
                      <div className="platform-item"><span className="platform-icon">🔬</span><span>国家重点实验室（5个）：动力工程多相流、机械结构强度与振动、电力设备电气绝缘、金属材料强度、流体机械及工程</span></div>
                      <div className="platform-item"><span className="platform-icon">🏢</span><span>国家工程研究中心（3个）：快速制造、电力电子、煤炭清洁高效利用</span></div>
                      <div className="platform-item"><span className="platform-icon">🌐</span><span>国家协同创新中心（2个）：绿色智能制造、西部能源与环境</span></div>
                    </div>
                    <h6>📊 科研数据：</h6>
                    <div className="research-stats">
                      <div className="stat-box"><span className="stat-value">200+</span><span className="stat-name">国家级科研项目/年</span></div>
                      <div className="stat-box"><span className="stat-value">50亿+</span><span className="stat-name">科研经费/年</span></div>
                      <div className="stat-box"><span className="stat-value">4000+</span><span className="stat-name">SCI论文/年</span></div>
                      <div className="stat-box"><span className="stat-value">2000+</span><span className="stat-name">专利授权/年</span></div>
                    </div>
                    <h6>📈 ESI学科排名（全球前1%）：</h6>
                    <p>工程学、材料科学、计算机科学、物理学、化学、数学、临床医学、生物学与生物化学、药理学与毒理学、社会科学总论</p>
                  </div>
                </div>
                <div className="research-item">
                  <span className="item-number">2</span>
                  <div className="item-content">
                    <h5>就业质量报告（2023届）</h5>
                    <div className="employment-grid">
                      <div className="emp-card"><span className="emp-value">98.2%</span><span className="emp-label">就业率</span></div>
                      <div className="emp-card"><span className="emp-value">42.3%</span><span className="emp-label">深造率</span></div>
                      <div className="emp-card"><span className="emp-value">26.8%</span><span className="emp-label">国内读研</span></div>
                      <div className="emp-card"><span className="emp-value">15.5%</span><span className="emp-label">出国深造</span></div>
                      <div className="emp-card"><span className="emp-value">18.5万</span><span className="emp-label">平均年薪</span></div>
                      <div className="emp-card"><span className="emp-value">65%</span><span className="emp-label">进入央企/国企</span></div>
                    </div>
                    <h6>💼 主要就业行业：</h6>
                    <div className="industry-dist">
                      <div className="industry-item" style={{width: '25%'}}><span>信息技术</span></div>
                      <div className="industry-item" style={{width: '20%'}}><span>能源电力</span></div>
                      <div className="industry-item" style={{width: '18%'}}><span>金融</span></div>
                      <div className="industry-item" style={{width: '15%'}}><span>制造业</span></div>
                      <div className="industry-item" style={{width: '12%'}}><span>科研院所</span></div>
                      <div className="industry-item" style={{width: '10%'}}><span>其他</span></div>
                    </div>
                    <h6>🏢 主要就业单位：</h6>
                    <p>国家电网、华为、中兴、比亚迪、航天科工、中航工业、中国建筑、工商银行、中国银行、西安飞机工业集团等</p>
                  </div>
                </div>
                <div className="research-item">
                  <span className="item-number">3</span>
                  <div className="item-content">
                    <h5>校友网络与资源</h5>
                    <h6>👨‍🎓 校友数据：</h6>
                    <div className="alumni-stats">
                      <div className="alum-item"><span className="alum-num">30万+</span><span className="alum-label">校友总数</span></div>
                      <div className="alum-item"><span className="alum-num">150+</span><span className="alum-label">分布国家和地区</span></div>
                      <div className="alum-item"><span className="alum-num">2000+</span><span className="alum-label">校友组织</span></div>
                    </div>
                    <h6>🌟 知名校友（部分）：</h6>
                    <div className="famous-alumni">
                      <div className="alum-card"><span className="alum-icon">👨‍🔬</span><span className="alum-name">江泽民</span><span className="alum-title">中国工程院院士，著名电机工程专家</span></div>
                      <div className="alum-card"><span className="alum-icon">👨‍💼</span><span className="alum-name">柳传志</span><span className="alum-title">联想集团创始人</span></div>
                      <div className="alum-card"><span className="alum-icon">👨‍🔬</span><span className="alum-name">周济</span><span className="alum-title">中国工程院院士，原教育部部长</span></div>
                      <div className="alum-card"><span className="alum-icon">👨‍💼</span><span className="alum-name">孙宏斌</span><span className="alum-title">融创中国创始人</span></div>
                    </div>
                    <h6>🤝 校企合作单位：</h6>
                    <p>华为、腾讯、阿里巴巴、国家电网、中国航天科技集团、中国航空工业集团、西门子、博世、施耐德等200+家企业</p>
                  </div>
                </div>
                <div className="research-item">
                  <span className="item-number">4</span>
                  <div className="item-content">
                    <h5>校园文化与生活</h5>
                    <h6>🏫 四大校区：</h6>
                    <div className="campus-info">
                      <div className="camp-detail"><span className="camp-name">兴庆校区（主校区）</span><span className="camp-desc">历史悠久，核心教学区，占地1200亩</span></div>
                      <div className="camp-detail"><span className="camp-name">雁塔校区</span><span className="camp-desc">医学部所在地，毗邻大雁塔</span></div>
                      <div className="camp-detail"><span className="camp-name">曲江校区</span><span className="camp-desc">新兴学科和科研基地</span></div>
                      <div className="camp-detail"><span className="camp-name">中国西部科技创新港</span><span className="camp-desc">占地5000亩，产学研融合创新平台</span></div>
                    </div>
                    <h6>🏠 住宿条件：</h6>
                    <p>本科生：4-6人间，上床下桌，有空调、暖气、独立卫生间；住宿费：800-1200元/年</p>
                    <h6>🍽️ 食堂餐饮：</h6>
                    <p>10+个学生食堂，涵盖各地风味，餐费约15-25元/天</p>
                    <h6>💰 西安生活成本：</h6>
                    <p>每月生活费约1500-2500元（含餐饮、交通、日常开销）</p>
                    <h6>🎭 学生社团：</h6>
                    <p>300+个学生社团，涵盖学术科技、文化艺术、体育竞技、志愿服务等各类</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="research-phase">
              <h4>💡 第三阶段：深入对比分析</h4>
              <div className="phase-content">
                <div className="research-item">
                  <span className="item-number">1</span>
                  <div className="item-content">
                    <h5>同类院校对比矩阵</h5>
                    <div className="comparison-tips">
                      <table className="comparison-table">
                        <thead>
                          <tr>
                            <th>维度</th>
                            <th>西安交大</th>
                            <th>上海交大</th>
                            <th>浙江大学</th>
                            <th>华中科大</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr><td>综合排名（软科）</td><td>10</td><td>4</td><td>3</td><td>8</td></tr>
                          <tr><td>A+学科数</td><td>4</td><td>5</td><td>11</td><td>4</td></tr>
                          <tr><td>院士数量</td><td>37</td><td>59</td><td>48</td><td>31</td></tr>
                          <tr><td>科研经费/年</td><td>50亿</td><td>170亿</td><td>180亿</td><td>80亿</td></tr>
                          <tr><td>2025理科分数线</td><td>642</td><td>680</td><td>676</td><td>655</td></tr>
                          <tr><td>2024理科分数线</td><td>635</td><td>675</td><td>670</td><td>648</td></tr>
                          <tr><td>2023理科分数线</td><td>628</td><td>672</td><td>668</td><td>642</td></tr>
                          <tr><td>近3年平均分</td><td>635</td><td>676</td><td>671</td><td>648</td></tr>
                          <tr><td>陕西录取位次</td><td>3000</td><td>800</td><td>1200</td><td>2200</td></tr>
                          <tr><td>地理位置</td><td>西安（西北）</td><td>上海（华东）</td><td>杭州（华东）</td><td>武汉（华中）</td></tr>
                          <tr><td>优势领域</td><td>电气/能动/管理</td><td>工科/医学/商科</td><td>综合/农学</td><td>工科/医学</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="research-item">
                  <span className="item-number">2</span>
                  <div className="item-content">
                    <h5>专业选择深度分析</h5>
                    <h6>🏆 王牌专业推荐：</h6>
                    <div className="major-analysis">
                      <div className="major-card top">
                        <span className="major-rank">A+</span>
                        <span className="major-name">电气工程及其自动化</span>
                        <span className="major-desc">全国顶尖，就业去向：国家电网、华为、西门子</span>
                      </div>
                      <div className="major-card top">
                        <span className="major-rank">A+</span>
                        <span className="major-name">能源与动力工程</span>
                        <span className="major-desc">全国第一，就业去向：航天、能源、动力企业</span>
                      </div>
                      <div className="major-card top">
                        <span className="major-rank">A+</span>
                        <span className="major-name">管理科学与工程</span>
                        <span className="major-desc">全国顶尖，就业去向：咨询、金融、互联网</span>
                      </div>
                      <div className="major-card">
                        <span className="major-rank">A</span>
                        <span className="major-name">机械工程</span>
                        <span className="major-desc">全国前五，就业去向：智能制造、汽车、航空</span>
                      </div>
                      <div className="major-card">
                        <span className="major-rank">A-</span>
                        <span className="major-name">计算机科学与技术</span>
                        <span className="major-desc">实力强劲，就业去向：华为、腾讯、阿里</span>
                      </div>
                      <div className="major-card">
                        <span className="major-rank">A-</span>
                        <span className="major-name">材料科学与工程</span>
                        <span className="major-desc">就业广泛，去向：半导体、新能源、航空</span>
                      </div>
                    </div>
                    <h6>📉 性价比专业（分数相对较低但实力强）：</h6>
                    <p>工业工程、环境工程、生物医学工程、公共管理、药学</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="research-phase">
              <h4>📊 第四阶段：报考策略与规划建议</h4>
              <div className="phase-content">
                <div className="research-item">
                  <span className="item-number">1</span>
                  <div className="item-content">
                    <h5>保底录取策略</h5>
                    <h6>💰 保底分数参考：</h6>
                    <div className="safety-scores-detail">
                      <div className="score-card">
                        <span className="score-range">630-640</span>
                        <span className="score-label">理科保底区间</span>
                        <span className="score-desc">全省排名前10%可尝试</span>
                      </div>
                      <div className="score-card">
                        <span className="score-range">615-625</span>
                        <span className="score-label">文科保底区间</span>
                        <span className="score-desc">全省排名前8%可尝试</span>
                      </div>
                    </div>
                    <h6>🎯 保底途径：</h6>
                    <div className="safety-methods">
                      <div className="method-item"><span className="method-icon">🎁</span><span className="method-name">高校专项计划</span><span className="method-desc">面向农村考生，降分20-40分</span></div>
                      <div className="method-item"><span className="method-icon">🏛️</span><span className="method-name">国家专项计划</span><span className="method-desc">针对贫困地区，有专门名额</span></div>
                      <div className="method-item"><span className="method-icon">🤝</span><span className="method-name">定向培养</span><span className="method-desc">与企业签协议，享受降分</span></div>
                      <div className="method-item"><span className="method-icon">🌍</span><span className="method-name">中外合作办学</span><span className="method-desc">分数较低，可获双学位</span></div>
                    </div>
                  </div>
                </div>
                <div className="research-item">
                  <span className="item-number">2</span>
                  <div className="item-content">
                    <h5>给家长的规划建议</h5>
                    <div className="parent-guide">
                      <div className="guide-item">
                        <span className="guide-num">1</span>
                        <span className="guide-content"><strong>学业规划：</strong>高一打基础，高二确定兴趣方向，高三冲刺。建议参加学科竞赛、科技创新活动提升竞争力</span>
                      </div>
                      <div className="guide-item">
                        <span className="guide-num">2</span>
                        <span className="guide-content"><strong>专业选择：</strong>结合孩子兴趣、能力和未来职业规划，优先考虑学校优势专业</span>
                      </div>
                      <div className="guide-item">
                        <span className="guide-num">3</span>
                        <span className="guide-content"><strong>地域考虑：</strong>西安生活成本较低，教育资源丰富，适合注重性价比的家庭</span>
                      </div>
                      <div className="guide-item">
                        <span className="guide-num">4</span>
                        <span className="guide-content"><strong>长期发展：</strong>西安交大在西北地区认可度极高，校友资源丰富，适合想在西部发展或进入央企的学生</span>
                      </div>
                      <div className="guide-item">
                        <span className="guide-num">5</span>
                        <span className="guide-content"><strong>准备材料：</strong>提前准备自荐信、获奖证书、社会实践证明，关注高校专项计划报名时间</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="research-tools">
              <h4>🛠️ 实用研究工具与资源</h4>
              <div className="tools-grid">
                <div className="tool-card">
                  <div className="tool-icon">🌐</div>
                  <h5>官方渠道</h5>
                  <p>www.xjtu.edu.cn<br/>zsb.xjtu.edu.cn<br/>job.xjtu.edu.cn</p>
                </div>
                <div className="tool-card">
                  <div className="tool-icon">📊</div>
                  <h5>权威排名</h5>
                  <p>软科中国大学排名<br/>QS世界大学排名<br/>ESI学科排名</p>
                </div>
                <div className="tool-card">
                  <div className="tool-icon">🏛️</div>
                  <h5>政府平台</h5>
                  <p>阳光高考平台<br/>教育部学科评估<br/>双一流建设名单</p>
                </div>
                <div className="tool-card">
                  <div className="tool-icon">💬</div>
                  <h5>社交平台</h5>
                  <p>知乎：西安交通大学<br/>B站：西安交大官方<br/>小红书：交大生活</p>
                </div>
                <div className="tool-card">
                  <div className="tool-icon">📱</div>
                  <h5>校园APP</h5>
                  <p>掌上西交<br/>企业微信<br/>今日校园</p>
                </div>
                <div className="tool-card">
                  <div className="tool-icon">🎓</div>
                  <h5>校友网络</h5>
                  <p>西安交大校友总会<br/>LinkedIn校友群<br/>各地校友分会</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderDay1() {
  return (
    <div className="day-content">
      <h2>🏛️ Day 1: 交大历史与西迁精神</h2>
      
      <div className="info-card">
        <h3>一、学校概况</h3>
        <p>西安交通大学是中国最早的高等学府之一，前身是1896年创建于上海的南洋公学，是中国高等教育的重要发源地。</p>
      </div>

      <div className="info-card">
        <h3>二、历史沿革</h3>
        <ul className="timeline">
          <li><strong>1896年</strong>：南洋公学在上海创办，是中国最早的工科大学</li>
          <li><strong>1921年</strong>：更名为交通大学</li>
          <li><strong>1956年</strong>：为响应国家"支援大西北"号召，交通大学主体从上海迁至西安</li>
          <li><strong>1959年</strong>：西安交通大学正式定名，成为全国重点大学</li>
        </ul>
      </div>

      <div className="info-card highlight">
        <h3>三、西迁精神</h3>
        <p>这是西安交大最核心的精神财富！</p>
        <div className="spirit-grid">
          <div className="spirit-item">
            <div className="spirit-icon">🎯</div>
            <div className="spirit-title">胸怀大局</div>
            <div className="spirit-desc">响应国家号召，舍弃繁华都市，扎根西北</div>
          </div>
          <div className="spirit-item">
            <div className="spirit-icon">❤️</div>
            <div className="spirit-title">无私奉献</div>
            <div className="spirit-desc">数千名师生员工，带着家属，举校西迁</div>
          </div>
          <div className="spirit-item">
            <div className="spirit-icon">📜</div>
            <div className="spirit-title">弘扬传统</div>
            <div className="spirit-desc">将上海的办学传统和精神带到西安</div>
          </div>
          <div className="spirit-item">
            <div className="spirit-icon">💪</div>
            <div className="spirit-title">艰苦创业</div>
            <div className="spirit-desc">在西安的田野上建起现代化校园</div>
          </div>
        </div>
      </div>

      <div className="info-card">
        <h3>四、历史意义</h3>
        <blockquote>
          "西迁精神的核心是爱国主义，精髓是听党指挥跟党走，与党和国家、与民族和人民同呼吸、共命运。"
          <footer>—— 习近平总书记</footer>
        </blockquote>
      </div>
    </div>
  );
}

function renderDay2() {
  return (
    <div className="day-content">
      <h2>🎓 Day 2: 交大王牌专业与学科排名</h2>
      
      <div className="info-card">
        <h3>一、国家"双一流"建设学科（8个）</h3>
        <div className="major-grid">
          <div className="major-card top">
            <div className="major-rank">⭐</div>
            <h4>机械工程</h4>
            <p>全国排名第1</p>
            <div className="major-detail">拥有机械制造系统工程国家重点实验室</div>
          </div>
          <div className="major-card top">
            <div className="major-rank">⭐</div>
            <h4>电气工程</h4>
            <p>全国排名第2</p>
            <div className="major-detail">电力设备电气绝缘国家重点实验室</div>
          </div>
          <div className="major-card top">
            <div className="major-rank">⭐</div>
            <h4>管理科学与工程</h4>
            <p>全国排名第1</p>
            <div className="major-detail">中国最早的管理学院之一</div>
          </div>
          <div className="major-card top">
            <div className="major-rank">⭐</div>
            <h4>工商管理</h4>
            <p>全国排名第3</p>
            <div className="major-detail">AACSB认证商学院</div>
          </div>
          <div className="major-card">
            <h4>动力工程及工程热物理</h4>
            <p>全国排名第2</p>
          </div>
          <div className="major-card">
            <h4>数学</h4>
            <p>全国排名前10</p>
          </div>
          <div className="major-card">
            <h4>力学</h4>
            <p>全国排名前10</p>
          </div>
          <div className="major-card">
            <h4>生物医学工程</h4>
            <p>全国排名前10</p>
          </div>
        </div>
      </div>

      <div className="info-card">
        <h3>二、国家重点学科（一级8个，二级3个）</h3>
        <ul className="list-group">
          <li>✓ 机械工程</li>
          <li>✓ 电气工程</li>
          <li>✓ 动力工程及工程热物理</li>
          <li>✓ 管理科学与工程</li>
          <li>✓ 生物医学工程</li>
          <li>✓ 控制科学与工程</li>
          <li>✓ 计算机科学与技术</li>
          <li>✓ 土木工程</li>
        </ul>
      </div>

      <div className="info-card">
        <h3>三、ESI全球排名前1%学科</h3>
        <div className="esi-grid">
          <span className="esi-tag">工程学</span>
          <span className="esi-tag">材料科学</span>
          <span className="esi-tag">计算机科学</span>
          <span className="esi-tag">物理学</span>
          <span className="esi-tag">数学</span>
          <span className="esi-tag">化学</span>
          <span className="esi-tag">临床医学</span>
          <span className="esi-tag">社会科学</span>
        </div>
      </div>
    </div>
  );
}

function renderDay3() {
  return (
    <div className="day-content">
      <h2>📊 Day 3: 交大招生政策与录取分数</h2>
      
      <div className="info-card">
        <h3>一、招生计划</h3>
        <div className="policy-grid">
          <div className="policy-item">
            <div className="policy-value">~4,000</div>
            <div className="policy-label">每年本科招生人数</div>
          </div>
          <div className="policy-item">
            <div className="policy-value">31</div>
            <div className="policy-label">招生省份</div>
          </div>
          <div className="policy-item">
            <div className="policy-value">12%</div>
            <div className="policy-label">农村学生专项计划</div>
          </div>
        </div>
      </div>

      <div className="info-card">
        <h3>二、2024年各省录取分数线（理科/物理类）</h3>
        <div className="score-table">
          <table>
            <thead>
              <tr>
                <th>省份</th>
                <th>最低分</th>
                <th>省排名</th>
                <th>平均分</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>陕西</td><td>635</td><td>2,800</td><td>642</td></tr>
              <tr><td>北京</td><td>645</td><td>3,500</td><td>652</td></tr>
              <tr><td>上海</td><td>568</td><td>3,200</td><td>575</td></tr>
              <tr><td>广东</td><td>640</td><td>7,500</td><td>648</td></tr>
              <tr><td>江苏</td><td>645</td><td>5,200</td><td>650</td></tr>
              <tr><td>浙江</td><td>655</td><td>6,800</td><td>662</td></tr>
              <tr><td>山东</td><td>640</td><td>8,200</td><td>648</td></tr>
              <tr><td>河南</td><td>638</td><td>6,500</td><td>645</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="info-card">
        <h3>三、升学方式</h3>
        <div className="admission-ways">
          <div className="way-card">
            <div className="way-icon">📝</div>
            <h4>普通高考</h4>
            <p>通过全国统一高考录取，占招生总数的85%</p>
          </div>
          <div className="way-card">
            <div className="way-icon">🎖️</div>
            <h4>强基计划</h4>
            <p>针对基础学科拔尖人才，涵盖数学、物理、化学等专业</p>
          </div>
          <div className="way-card">
            <div className="way-icon">🎯</div>
            <h4>高校专项计划</h4>
            <p>面向农村和边远地区优秀学生</p>
          </div>
          <div className="way-card">
            <div className="way-icon">⚽</div>
            <h4>体育特长生</h4>
            <p>招收高水平运动员</p>
          </div>
          <div className="way-card">
            <div className="way-icon">🎨</div>
            <h4>艺术类</h4>
            <p>招收美术、音乐等艺术类考生</p>
          </div>
          <div className="way-card">
            <div className="way-icon">🌍</div>
            <h4>中外合作办学</h4>
            <p>与国外高校合作培养项目</p>
          </div>
        </div>
      </div>

      <div className="info-card">
        <h3>四、专业选考科目要求</h3>
        <div className="subject-requirements">
          <div className="subject-group">
            <h4>首选科目要求</h4>
            <div className="subject-tags">
              <span className="subject-tag required">物理必选</span>
              <span className="subject-tag">历史可选</span>
            </div>
          </div>
          <div className="subject-group">
            <h4>再选科目要求</h4>
            <div className="subject-tags">
              <span className="subject-tag">化学</span>
              <span className="subject-tag">生物</span>
              <span className="subject-tag">思想政治</span>
              <span className="subject-tag">地理</span>
            </div>
          </div>
        </div>
      </div>

      <div className="info-card highlight">
        <h3>五、保底录取策略（最稳妥的上西交途径）</h3>
        
        <div className="safety-section">
          <h4>💰 保底分数参考</h4>
          <div className="safety-scores">
            <div className="safety-item">
              <div className="score-range">630-640分</div>
              <div className="score-desc">理科/物理类保底分数区间（陕西及周边省份）</div>
            </div>
            <div className="safety-item">
              <div className="score-range">全省排名前10%</div>
              <div className="score-desc">建议目标排名，确保录取安全</div>
            </div>
          </div>
        </div>

        <div className="safety-section">
          <h4>🎯 保底途径</h4>
          <ul className="safety-list">
            <li><strong>1. 高校专项计划：</strong>面向农村和边远地区考生，降分幅度通常在20-40分</li>
            <li><strong>2. 国家专项计划：</strong>针对国家指定的贫困地区，有专门的招生名额</li>
            <li><strong>3. 定向培养：</strong>与企业或单位签订定向协议，享受降分优惠</li>
            <li><strong>4. 中外合作办学：</strong>分数相对较低，部分专业可获得双学位</li>
            <li><strong>5. 护理学专业：</strong>相对冷门专业，录取分数通常低10-20分</li>
          </ul>
        </div>

        <div className="safety-section">
          <h4>📚 保底专业推荐</h4>
          <div className="safety-majors">
            <div className="major-item">
              <span className="major-name">护理学</span>
              <span className="major-desc">分数相对较低，就业稳定</span>
            </div>
            <div className="major-item">
              <span className="major-name">公共管理</span>
              <span className="major-desc">文理兼收，适合偏文科学生</span>
            </div>
            <div className="major-item">
              <span className="major-name">工业工程</span>
              <span className="major-desc">交叉学科，就业面广</span>
            </div>
            <div className="major-item">
              <span className="major-name">环境工程</span>
              <span className="major-desc">新兴专业，发展潜力大</span>
            </div>
            <div className="major-item">
              <span className="major-name">材料科学</span>
              <span className="major-desc">学科实力强，分数相对友好</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderDay4() {
  return (
    <div className="day-content">
      <h2>🏫 Day 4: 交大校园与四大校区</h2>
      
      <div className="info-card">
        <h3>一、校区概况</h3>
        <p>西安交通大学拥有四个校区，总占地面积约5000亩，建筑面积约300万平方米。</p>
      </div>

      <div className="info-card">
        <h3>二、四大校区</h3>
        <div className="campus-grid">
          <div className="campus-card main">
            <div className="campus-image">🏛️</div>
            <h4>兴庆校区（主校区）</h4>
            <p className="campus-location">地址：西安市碑林区咸宁西路28号</p>
            <p className="campus-desc">始建于1956年，是西迁后的主校区，拥有标志性的主楼和思源活动中心</p>
            <div className="campus-features">
              <span>🔬 国家重点实验室</span>
              <span>📚 钱学森图书馆</span>
              <span>🏟️ 思源体育馆</span>
            </div>
          </div>
          <div className="campus-card">
            <div className="campus-image">🌆</div>
            <h4>雁塔校区</h4>
            <p className="campus-location">地址：西安市雁塔区雁塔西路74号</p>
            <p className="campus-desc">以医学和生命科学为主，拥有附属医院和医学研究中心</p>
            <div className="campus-features">
              <span>🏥 附属医院</span>
              <span>🧪 医学实验中心</span>
            </div>
          </div>
          <div className="campus-card">
            <div className="campus-image">🌿</div>
            <h4>曲江校区</h4>
            <p className="campus-location">地址：西安市雁塔区雁翔路99号</p>
            <p className="campus-desc">新兴校区，以创新港为核心，聚焦产学研融合</p>
            <div className="campus-features">
              <span>🚀 创新港</span>
              <span>💡 科研孵化器</span>
            </div>
          </div>
          <div className="campus-card">
            <div className="campus-image">🌍</div>
            <h4>中国西部科技创新港</h4>
            <p className="campus-location">地址：西安市西咸新区沣西新城</p>
            <p className="campus-desc">国家级科技创新平台，集科研、教育、产业于一体</p>
            <div className="campus-features">
              <span>🏢 科研基地</span>
              <span>🤝 校企合作</span>
              <span>🌱 创新创业</span>
            </div>
          </div>
        </div>
      </div>

      <div className="info-card">
        <h3>三、校园文化</h3>
        <div className="culture-grid">
          <div className="culture-item">
            <div className="culture-icon">🎭</div>
            <h4>学生社团</h4>
            <p>超过200个学生社团，涵盖学术、文艺、体育等领域</p>
          </div>
          <div className="culture-item">
            <div className="culture-icon">🎵</div>
            <h4>校园活动</h4>
            <p>每年举办校园文化节、科技节、体育节等大型活动</p>
          </div>
          <div className="culture-item">
            <div className="culture-icon">🍽️</div>
            <h4>校园生活</h4>
            <p>10余个学生食堂，提供各地风味美食</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderDay5() {
  return (
    <div className="day-content">
      <h2>🌟 Day 5: 交大知名校友</h2>
      
      <div className="info-card">
        <h3>一、杰出校友概览</h3>
        <p>西安交通大学培养了大批杰出人才，遍布各行各业，为国家和社会做出了重要贡献。</p>
      </div>

      <div className="info-card">
        <h3>二、科学巨匠</h3>
        <div className="alumni-grid">
          <div className="alumni-card nobel">
            <div className="alumni-avatar">👨‍🔬</div>
            <h4>钱学森</h4>
            <p className="alumni-title">中国航天之父</p>
            <p className="alumni-desc">世界著名科学家，中国载人航天奠基人，"两弹一星"功勋奖章获得者</p>
            <div className="alumni-class">1934届机械工程系</div>
          </div>
          <div className="alumni-card">
            <div className="alumni-avatar">👨‍🔬</div>
            <h4>黄旭华</h4>
            <p className="alumni-title">中国核潜艇之父</p>
            <p className="alumni-desc">中国第一代核动力潜艇研制创始人之一，"共和国勋章"获得者</p>
            <div className="alumni-class">1949届造船工程系</div>
          </div>
          <div className="alumni-card">
            <div className="alumni-avatar">👨‍🔬</div>
            <h4>张光斗</h4>
            <p className="alumni-title">中国水利泰斗</p>
            <p className="alumni-desc">著名水利工程专家，参与设计了长江三峡等重大水利工程</p>
            <div className="alumni-class">1934届土木工程系</div>
          </div>
          <div className="alumni-card">
            <div className="alumni-avatar">👨‍🔬</div>
            <h4>徐光宪</h4>
            <p className="alumni-title">稀土之父</p>
            <p className="alumni-desc">著名化学家，中国稀土化学的奠基人，国家最高科学技术奖获得者</p>
            <div className="alumni-class">1944届化学系</div>
          </div>
        </div>
      </div>

      <div className="info-card">
        <h3>三、商界领袖</h3>
        <div className="alumni-grid">
          <div className="alumni-card">
            <div className="alumni-avatar">👔</div>
            <h4>柳传志</h4>
            <p className="alumni-title">联想集团创始人</p>
            <p className="alumni-desc">中国著名企业家，带领联想成为全球知名企业</p>
            <div className="alumni-class">1967届无线电系</div>
          </div>
          <div className="alumni-card">
            <div className="alumni-avatar">👔</div>
            <h4>任正非</h4>
            <p className="alumni-title">华为公司创始人</p>
            <p className="alumni-desc">带领华为成为全球领先的ICT基础设施和智能终端提供商</p>
            <div className="alumni-class">1968届土木建筑系</div>
          </div>
          <div className="alumni-card">
            <div className="alumni-avatar">👔</div>
            <h4>曹德旺</h4>
            <p className="alumni-title">福耀玻璃董事长</p>
            <p className="alumni-desc">著名慈善家，中国首善，累计捐赠超过100亿元</p>
            <div className="alumni-class">荣誉校友</div>
          </div>
        </div>
      </div>

      <div className="info-card">
        <h3>四、学界领袖</h3>
        <div className="alumni-grid">
          <div className="alumni-card">
            <div className="alumni-avatar">🎓</div>
            <h4>周济</h4>
            <p className="alumni-title">中国工程院院长</p>
            <p className="alumni-desc">著名机械工程专家，曾任教育部部长</p>
            <div className="alumni-class">1970届机械工程系</div>
          </div>
          <div className="alumni-card">
            <div className="alumni-avatar">🎓</div>
            <h4>钱七虎</h4>
            <p className="alumni-title">中国工程院院士</p>
            <p className="alumni-desc">著名防护工程专家，国家最高科学技术奖获得者</p>
            <div className="alumni-class">1965届军事工程学院</div>
          </div>
        </div>
      </div>

      <div className="info-card highlight">
        <h3>五、校友发展情况与去向分析</h3>
        
        <div className="alumni-analysis">
          <h4>📊 校友规模</h4>
          <div className="analysis-stats">
            <div className="stat-box">
              <div className="stat-num">30万+</div>
              <div className="stat-text">校友总数</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">150+</div>
              <div className="stat-text">国家和地区分布</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">2000+</div>
              <div className="stat-text">校友组织</div>
            </div>
          </div>
        </div>

        <div className="alumni-analysis">
          <h4>🌍 校友地域分布</h4>
          <div className="location-dist">
            <div className="location-item">
              <span className="location-name">北京</span>
              <div className="location-bar">
                <div className="bar-fill" style={{width: '25%'}}></div>
              </div>
              <span className="location-percent">25%</span>
            </div>
            <div className="location-item">
              <span className="location-name">上海</span>
              <div className="location-bar">
                <div className="bar-fill" style={{width: '20%'}}></div>
              </div>
              <span className="location-percent">20%</span>
            </div>
            <div className="location-item">
              <span className="location-name">陕西/西安</span>
              <div className="location-bar">
                <div className="bar-fill" style={{width: '18%'}}></div>
              </div>
              <span className="location-percent">18%</span>
            </div>
            <div className="location-item">
              <span className="location-name">广东/深圳</span>
              <div className="location-bar">
                <div className="bar-fill" style={{width: '15%'}}></div>
              </div>
              <span className="location-percent">15%</span>
            </div>
            <div className="location-item">
              <span className="location-name">海外</span>
              <div className="location-bar">
                <div className="bar-fill" style={{width: '12%'}}></div>
              </div>
              <span className="location-percent">12%</span>
            </div>
            <div className="location-item">
              <span className="location-name">其他</span>
              <div className="location-bar">
                <div className="bar-fill" style={{width: '10%'}}></div>
              </div>
              <span className="location-percent">10%</span>
            </div>
          </div>
        </div>

        <div className="alumni-analysis">
          <h4>💼 校友职业分布</h4>
          <div className="career-dist">
            <div className="career-item">
              <div className="career-circle">
                <span className="career-percent">35%</span>
              </div>
              <div className="career-label">企业高管/创业者</div>
            </div>
            <div className="career-item">
              <div className="career-circle">
                <span className="career-percent">25%</span>
              </div>
              <div className="career-label">科研院所/高校</div>
            </div>
            <div className="career-item">
              <div className="career-circle">
                <span className="career-percent">20%</span>
              </div>
              <div className="career-label">金融机构</div>
            </div>
            <div className="career-item">
              <div className="career-circle">
                <span className="career-percent">12%</span>
              </div>
              <div className="career-label">政府/事业单位</div>
            </div>
            <div className="career-item">
              <div className="career-circle">
                <span className="career-percent">8%</span>
              </div>
              <div className="career-label">其他</div>
            </div>
          </div>
        </div>

        <div className="alumni-analysis">
          <h4>🎯 校友成就亮点</h4>
          <ul className="achievements-list">
            <li><strong>院士校友：</strong>超过100位校友当选中国科学院、中国工程院院士</li>
            <li><strong>上市公司CEO：</strong>超过200位校友担任上市公司董事长或CEO</li>
            <li><strong>政府高官：</strong>多位校友担任省部级以上领导职务</li>
            <li><strong>科研领军：</strong>在航天、能源、信息等领域担任首席科学家</li>
            <li><strong>创业明星：</strong>创办华为、联想等世界500强企业</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function renderDay6() {
  return (
    <div className="day-content">
      <h2>👔 Day 6: 交大历任校长</h2>
      
      <div className="info-card">
        <h3>一、校长名录</h3>
        <p>西安交通大学自建校以来，历任校长均为学界泰斗，带领学校不断发展壮大。</p>
      </div>

      <div className="info-card">
        <h3>二、历任校长（西安时期）</h3>
        <div className="president-timeline">
          <div className="president-card">
            <div className="president-period">1956-1959</div>
            <div className="president-info">
              <h4>彭康</h4>
              <p>交通大学西迁后的第一任校长，著名教育家</p>
            </div>
          </div>
          <div className="president-card">
            <div className="president-period">1959-1966</div>
            <div className="president-info">
              <h4>彭康</h4>
              <p>继续担任校长，推动学校在西安的发展</p>
            </div>
          </div>
          <div className="president-card">
            <div className="president-period">1978-1984</div>
            <div className="president-info">
              <h4>马文瑞</h4>
              <p>著名革命家，推动学校恢复和发展</p>
            </div>
          </div>
          <div className="president-card">
            <div className="president-period">1984-1989</div>
            <div className="president-info">
              <h4>张鸿</h4>
              <p>著名电机工程专家，推动学科建设</p>
            </div>
          </div>
          <div className="president-card">
            <div className="president-period">1989-1997</div>
            <div className="president-info">
              <h4>蒋德明</h4>
              <p>著名内燃机专家，推动科研创新</p>
            </div>
          </div>
          <div className="president-card">
            <div className="president-period">1997-2003</div>
            <div className="president-info">
              <h4>徐通模</h4>
              <p>著名热能工程专家，推进"211工程"建设</p>
            </div>
          </div>
          <div className="president-card">
            <div className="president-period">2003-2014</div>
            <div className="president-info">
              <h4>郑南宁</h4>
              <p>中国工程院院士，人工智能专家，推进"985工程"建设</p>
            </div>
          </div>
          <div className="president-card">
            <div className="president-period">2014-2023</div>
            <div className="president-info">
              <h4>王树国</h4>
              <p>著名机械工程专家，推动中国西部科技创新港建设</p>
            </div>
          </div>
          <div className="president-card current">
            <div className="president-period">2023-至今</div>
            <div className="president-info">
              <h4>张明</h4>
              <p>现任校长，继续推进"双一流"建设</p>
            </div>
          </div>
        </div>
      </div>

      <div className="info-card">
        <h3>三、现任领导班子</h3>
        <div className="leadership-grid">
          <div className="leader-card">
            <div className="leader-icon">🏛️</div>
            <h4>党委书记</h4>
            <p>卢建军</p>
          </div>
          <div className="leader-card">
            <div className="leader-icon">👔</div>
            <h4>校长</h4>
            <p>张明</p>
          </div>
          <div className="leader-card">
            <div className="leader-icon">👥</div>
            <h4>副校长</h4>
            <p>王铁军、席光、别朝红等</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderDay7() {
  return (
    <div className="day-content">
      <h2>💼 Day 7: 交大就业与深造</h2>
      
      <div className="info-card">
        <h3>一、就业概况</h3>
        <div className="employment-stats">
          <div className="stat-item">
            <div className="stat-value">98%</div>
            <div className="stat-label">就业率</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">15%</div>
            <div className="stat-label">出国深造</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">45%</div>
            <div className="stat-label">国内读研</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">¥18W</div>
            <div className="stat-label">平均起薪</div>
          </div>
        </div>
      </div>

      <div className="info-card">
        <h3>二、就业去向</h3>
        <div className="employment-sectors">
          <div className="sector-card">
            <div className="sector-icon">🏢</div>
            <h4>国有企业</h4>
            <p>占比 35%</p>
            <div className="sector-examples">国家电网、中石油、中航天科工等</div>
          </div>
          <div className="sector-card">
            <div className="sector-icon">💻</div>
            <h4>互联网/IT</h4>
            <p>占比 25%</p>
            <div className="sector-examples">华为、腾讯、阿里巴巴、字节跳动等</div>
          </div>
          <div className="sector-card">
            <div className="sector-icon">🏦</div>
            <h4>金融行业</h4>
            <p>占比 15%</p>
            <div className="sector-examples">银行、证券、保险等</div>
          </div>
          <div className="sector-card">
            <div className="sector-icon">🔬</div>
            <h4>科研院所</h4>
            <p>占比 10%</p>
            <div className="sector-examples">中科院、航天科工集团等</div>
          </div>
          <div className="sector-card">
            <div className="sector-icon">📚</div>
            <h4>教育行业</h4>
            <p>占比 8%</p>
            <div className="sector-examples">高校、中学等</div>
          </div>
          <div className="sector-card">
            <div className="sector-icon">🌍</div>
            <h4>其他</h4>
            <p>占比 7%</p>
          </div>
        </div>
      </div>

      <div className="info-card">
        <h3>三、深造情况</h3>
        <div className="further-study">
          <div className="study-section">
            <h4>国内读研</h4>
            <p>约45%的毕业生选择国内读研，主要去向包括：</p>
            <ul>
              <li>✓ 本校继续深造（约50%）</li>
              <li>✓ 清华、北大等顶尖高校</li>
              <li>✓ 中科院各研究所</li>
            </ul>
          </div>
          <div className="study-section">
            <h4>出国深造</h4>
            <p>约15%的毕业生选择出国深造，主要去向包括：</p>
            <ul>
              <li>✓ 美国：MIT、斯坦福、加州理工等</li>
              <li>✓ 欧洲：剑桥、牛津、ETH等</li>
              <li>✓ 亚洲：东京大学、新加坡国立等</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="info-card highlight">
        <h3>四、一周总结</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-icon">🏛️</div>
            <h4>历史传承</h4>
            <p>128年历史，西迁精神铸就辉煌</p>
          </div>
          <div className="summary-item">
            <div className="summary-icon">🎓</div>
            <h4>学科实力</h4>
            <p>8个双一流学科，多个学科全国排名第一</p>
          </div>
          <div className="summary-item">
            <div className="summary-icon">📊</div>
            <h4>招生录取</h4>
            <p>全国各省分数线稳定在630分以上</p>
          </div>
          <div className="summary-item">
            <div className="summary-icon">💼</div>
            <h4>就业前景</h4>
            <p>98%就业率，平均起薪18万+</p>
          </div>
        </div>
        <div className="summary-conclusion">
          <p>西安交通大学是一所具有深厚历史底蕴和强大学科实力的顶尖高校。无论是学术研究、人才培养还是就业前景，都处于国内领先水平。如果您的孩子有志于投身工程、科学研究或管理领域，西安交大是一个非常理想的选择！</p>
        </div>
      </div>
    </div>
  );
}

export default XiAnJiaotongDetail;