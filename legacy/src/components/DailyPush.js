import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { dailyUpdateCategories, scheduleConfig } from '../data/dailyUpdates';
import './DailyPush.css';

function DailyPush() {
  const navigate = useNavigate();
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedCategory, setSelectedCategory] = useState('university');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationContent, setNotificationContent] = useState(null);
  
  const generateUniversityContent = (day) => {
    const universities = [
      { name: '西安交通大学', fact: '中国最早的高等学府之一，前身是1896年创办的南洋公学', highlight: '双一流A类', country: '中国', type: '综合', founded: 1896 },
      { name: '清华大学', fact: '中国顶尖学府，拥有22个A+学科，QS排名亚洲第一', highlight: 'C9联盟', country: '中国', type: '综合', founded: 1911 },
      { name: '北京大学', fact: '中国近代第一所国立综合性大学，拥有18个A+学科', highlight: 'C9联盟', country: '中国', type: '综合', founded: 1898 },
      { name: '复旦大学', fact: '位于上海，综合实力强劲，在人文社科领域尤为突出', highlight: 'C9联盟', country: '中国', type: '综合', founded: 1905 },
      { name: '上海交通大学', fact: '工科实力全国领先，船舶海洋工程专业世界一流', highlight: 'C9联盟', country: '中国', type: '综合', founded: 1896 },
      { name: '浙江大学', fact: '学科门类最齐全的大学之一，拥有11个A+学科', highlight: 'C9联盟', country: '中国', type: '综合', founded: 1897 },
      { name: '南京大学', fact: '百年名校，在物理学、天文学领域处于顶尖水平', highlight: 'C9联盟', country: '中国', type: '综合', founded: 1902 },
      { name: '中国科学技术大学', fact: '以理工科见长，科研实力雄厚，出国深造率高', highlight: 'C9联盟', country: '中国', type: '理工', founded: 1958 },
      { name: '哈尔滨工业大学', fact: '工科强校，航天领域实力突出，被誉为"工程师摇篮"', highlight: 'C9联盟', country: '中国', type: '理工', founded: 1920 },
      { name: '武汉大学', fact: '最美大学之一，法学、测绘等学科全国领先', highlight: '985工程', country: '中国', type: '综合', founded: 1893 },
      { name: '华中科技大学', fact: '工科与医学并重，机械工程全国顶尖', highlight: '985工程', country: '中国', type: '综合', founded: 1952 },
      { name: '中山大学', fact: '华南地区最高学府，医学和经管学科实力强劲', highlight: '985工程', country: '中国', type: '综合', founded: 1924 },
    ];
    return universities[day % universities.length];
  };
  
  const generateEducationContent = (day) => {
    const tips = [
      { title: '高一规划要点', content: '打好数理基础，培养学习习惯，开始探索兴趣方向', tag: '学业规划' },
      { title: '高二关键时期', content: '确定选考科目，参加学科竞赛，开始了解大学专业', tag: '选科指导' },
      { title: '高三冲刺阶段', content: '制定复习计划，模拟考试训练，关注招生政策', tag: '高考冲刺' },
      { title: '志愿填报技巧', content: '遵循"冲稳保"原则，专业优先还是学校优先要权衡', tag: '志愿填报' },
      { title: '强基计划解读', content: '聚焦基础学科，本硕博贯通培养，适合有志于科研的学生', tag: '特殊招生' },
      { title: '综评招生要点', content: '综合评价注重综合素质，高考成绩+校测+面试', tag: '特殊招生' },
      { title: '高校专项计划', content: '面向农村考生，降分幅度大，需提前准备材料', tag: '特殊招生' },
      { title: '转专业攻略', content: '了解目标院校转专业政策，大一保持高绩点', tag: '入学后规划' },
      { title: '保研准备', content: '保持专业排名，积累科研经历，争取发表论文', tag: '升学规划' },
      { title: '出国留学规划', content: '提前准备语言考试，积累科研实习经历', tag: '升学规划' },
      { title: '专业选择指南', content: '结合兴趣、能力和就业前景综合考虑', tag: '专业选择' },
      { title: '地域选择考量', content: '一线城市资源丰富但竞争激烈，二线城市性价比高', tag: '择校建议' },
    ];
    return tips[day % tips.length];
  };
  
  const generateParentingContent = (day) => {
    const tips = [
      { title: '培养学习兴趣', content: '激发孩子好奇心，鼓励探索，让学习变成主动行为', age: '全年龄段' },
      { title: '时间管理能力', content: '帮助孩子制定学习计划，学会合理分配时间', age: '小学-高中' },
      { title: '情绪管理培养', content: '教会孩子认识情绪，学会调节压力和负面情绪', age: '全年龄段' },
      { title: '亲子沟通技巧', content: '学会倾听，平等交流，建立良好的沟通渠道', age: '全年龄段' },
      { title: '阅读习惯养成', content: '从小培养阅读习惯，拓宽知识面和视野', age: '幼儿-初中' },
      { title: '体育锻炼重要性', content: '保证每天运动时间，增强体质，培养毅力', age: '全年龄段' },
      { title: '创造力培养', content: '鼓励孩子动手实践，支持创新性想法', age: '幼儿-高中' },
      { title: '责任感教育', content: '让孩子承担适当家务，培养责任心和独立能力', age: '小学-高中' },
      { title: '目标设定方法', content: '帮助孩子设定短期和长期目标，学会分解任务', age: '初中-高中' },
      { title: '挫折教育', content: '让孩子经历适当挫折，学会面对失败和困难', age: '全年龄段' },
      { title: '财商启蒙教育', content: '从小培养正确的金钱观和理财意识', age: '小学-高中' },
      { title: '安全教育', content: '普及交通安全、网络安全、自我保护知识', age: '全年龄段' },
    ];
    return tips[day % tips.length];
  };
  
  const generateTravelContent = (day) => {
    const tips = [
      { title: '旅行预算规划', content: '提前做好预算，合理分配交通、住宿、餐饮费用', category: '出行准备' },
      { title: '行李打包技巧', content: '按清单打包，注意物品分类，留出应急空间', category: '出行准备' },
      { title: '交通选择指南', content: '综合考虑时间、价格、舒适度选择交通工具', category: '出行准备' },
      { title: '住宿预订要点', content: '提前预订，查看评价，确认取消政策', category: '出行准备' },
      { title: '旅行保险购买', content: '根据行程选择合适的保险，注意免责条款', category: '安全保障' },
      { title: '境外旅行准备', content: '提前办理签证，了解目的地文化和法规', category: '出境游' },
      { title: '自驾游注意事项', content: '检查车辆状况，规划路线，遵守交通规则', category: '自驾游' },
      { title: '旅行摄影技巧', content: '掌握基本构图，善用光线，记录美好瞬间', category: '旅行体验' },
      { title: '亲子旅行攻略', content: '选择适合儿童的景点，合理安排行程节奏', category: '亲子游' },
      { title: '旅行健康贴士', content: '携带常用药品，注意饮食卫生，保持充足睡眠', category: '健康安全' },
      { title: '旅行购物指南', content: '理性消费，注意鉴别商品，保留购物凭证', category: '旅行消费' },
      { title: '旅行后总结', content: '整理照片，记录感受，规划下一次旅行', category: '旅行体验' },
    ];
    return tips[day % tips.length];
  };
  
  const generateAttractionContent = (day) => {
    const attractions = [
      { name: '兵马俑', location: '陕西西安', description: '世界第八大奇迹，秦始皇陵陪葬坑，规模宏大', rating: '5A' },
      { name: '故宫', location: '北京', description: '世界上现存规模最大的木质结构古建筑群', rating: '5A' },
      { name: '西湖', location: '浙江杭州', description: '江南美景代表，四季景色各异，人文底蕴深厚', rating: '5A' },
      { name: '九寨沟', location: '四川阿坝', description: '世界自然遗产，彩池、瀑布、雪山相映成趣', rating: '5A' },
      { name: '张家界', location: '湖南张家界', description: '石英砂岩峰林地貌，电影《阿凡达》取景地', rating: '5A' },
      { name: '黄山', location: '安徽黄山', description: '五岳归来不看山，黄山归来不看岳', rating: '5A' },
      { name: '丽江古城', location: '云南丽江', description: '世界文化遗产，保存完好的少数民族古城', rating: '5A' },
      { name: '桂林山水', location: '广西桂林', description: '山水甲天下，漓江风光美不胜收', rating: '5A' },
      { name: '布达拉宫', location: '西藏拉萨', description: '世界上海拔最高的宫殿群，藏传佛教圣地', rating: '5A' },
      { name: '苏州园林', location: '江苏苏州', description: '中国古典园林艺术的典范，移步换景', rating: '5A' },
      { name: '长城', location: '北京', description: '世界七大奇迹之一，中华民族的象征', rating: '5A' },
      { name: '鼓浪屿', location: '福建厦门', description: '海上花园，中西合璧的建筑风格', rating: '5A' },
    ];
    return attractions[day % attractions.length];
  };
  
  const generateLearningContent = (day) => {
    const learnings = [
      { title: '高效记忆方法', content: '理解记忆优于机械记忆，善用联想和图像化', category: '学习方法' },
      { title: '费曼学习法', content: '用简单的语言向他人讲解，发现知识盲区', category: '学习方法' },
      { title: '思维导图技巧', content: '梳理知识结构，建立知识之间的联系', category: '学习方法' },
      { title: '专注力提升', content: '创造无干扰环境，使用番茄工作法', category: '学习方法' },
      { title: '错题本使用', content: '分类整理错题，定期复习，避免重复犯错', category: '学习方法' },
      { title: '时间管理四象限', content: '区分紧急重要事项，合理安排优先级', category: '时间管理' },
      { title: '目标SMART原则', content: '目标要具体、可衡量、可实现、相关、有时限', category: '目标管理' },
      { title: '刻意练习', content: '专注于薄弱环节，获得及时反馈，持续改进', category: '学习方法' },
      { title: '阅读提速技巧', content: '略读、扫读、精读相结合，提高阅读效率', category: '学习方法' },
      { title: '笔记整理方法', content: '康奈尔笔记法、思维导图笔记、大纲笔记', category: '学习方法' },
      { title: '批判性思维', content: '质疑假设，分析证据，多角度思考', category: '思维能力' },
      { title: '成长型思维', content: '相信能力可以通过努力提升，拥抱挑战', category: '思维能力' },
    ];
    return learnings[day % learnings.length];
  };
  
  const dailyContent = useMemo(() => {
    const date = new Date(selectedDate);
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
    
    const contents = {
      university: generateUniversityContent(dayOfYear),
      education: generateEducationContent(dayOfYear),
      parenting: generateParentingContent(dayOfYear),
      travel: generateTravelContent(dayOfYear),
      attraction: generateAttractionContent(dayOfYear),
      learning: generateLearningContent(dayOfYear),
    };
    
    return contents;
  }, [selectedDate]);
  
  const currentContent = dailyContent[selectedCategory];
  const currentCategory = dailyUpdateCategories.find(c => c.id === selectedCategory);
  
  useEffect(() => {
    const checkNotification = () => {
      const now = new Date();
      const updateTime = scheduleConfig.dailyUpdateTime.split(':');
      const reminderTime = scheduleConfig.reminderTime.split(':');
      
      const updateHour = parseInt(updateTime[0]);
      const updateMinute = parseInt(updateTime[1]);
      const reminderHour = parseInt(reminderTime[0]);
      const reminderMinute = parseInt(reminderTime[1]);
      
      if (now.getHours() === updateHour && now.getMinutes() === updateMinute) {
        showDailyNotification('update');
      } else if (now.getHours() === reminderHour && now.getMinutes() === reminderMinute) {
        showDailyNotification('reminder');
      }
    };
    
    const showDailyNotification = (type) => {
      if (type === 'update') {
        setNotificationContent({
          title: '📢 每日更新已到！',
          message: '今日学习内容已更新，快来看看吧！',
          type: 'update'
        });
      } else {
        setNotificationContent({
          title: '⏰ 学习提醒',
          message: '今天的学习内容看完了吗？记得坚持每天学习！',
          type: 'reminder'
        });
      }
      setShowNotification(true);
      
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    };
    
    const interval = setInterval(checkNotification, 60000);
    return () => clearInterval(interval);
  }, []);
  
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };
  
  const resetToToday = () => {
    setSelectedDate(todayStr);
  };
  
  const renderContent = () => {
    switch(selectedCategory) {
      case 'university':
        return (
          <div className="content-card university">
            <div className="content-header">
              <span className="category-tag" style={{background: currentCategory.color}}>{currentContent.highlight}</span>
              <span className="category-tag secondary">{currentContent.type}</span>
            </div>
            <h2 className="content-title">{currentContent.name}</h2>
            <p className="content-fact">📍 {currentContent.country} | 📅 {currentContent.founded}年建校</p>
            <div className="content-body">
              <p>{currentContent.fact}</p>
            </div>
            <button className="action-btn" onClick={() => navigate('/xjtu')}>
              了解更多 →
            </button>
          </div>
        );
      case 'education':
        return (
          <div className="content-card education">
            <div className="content-header">
              <span className="category-tag" style={{background: currentCategory.color}}>{currentContent.tag}</span>
            </div>
            <h2 className="content-title">{currentContent.title}</h2>
            <div className="content-body">
              <p>{currentContent.content}</p>
            </div>
            <button className="action-btn" onClick={() => navigate('/xjtu')}>
              查看升学规划指南 →
            </button>
          </div>
        );
      case 'parenting':
        return (
          <div className="content-card parenting">
            <div className="content-header">
              <span className="category-tag" style={{background: currentCategory.color}}>适用年龄：{currentContent.age}</span>
            </div>
            <h2 className="content-title">{currentContent.title}</h2>
            <div className="content-body">
              <p>{currentContent.content}</p>
            </div>
            <div className="parenting-tips">
              <h4>💡 具体做法：</h4>
              <ul>
                <li>每天花10分钟与孩子交流学习感受</li>
                <li>鼓励孩子独立完成任务</li>
                <li>及时给予肯定和鼓励</li>
              </ul>
            </div>
          </div>
        );
      case 'travel':
        return (
          <div className="content-card travel">
            <div className="content-header">
              <span className="category-tag" style={{background: currentCategory.color}}>{currentContent.category}</span>
            </div>
            <h2 className="content-title">{currentContent.title}</h2>
            <div className="content-body">
              <p>{currentContent.content}</p>
            </div>
            <button className="action-btn" onClick={() => navigate('/travel')}>
              开始规划旅行 →
            </button>
          </div>
        );
      case 'attraction':
        return (
          <div className="content-card attraction">
            <div className="content-header">
              <span className="category-tag" style={{background: currentCategory.color}}>{currentContent.rating}景区</span>
            </div>
            <h2 className="content-title">{currentContent.name}</h2>
            <p className="content-location">📍 {currentContent.location}</p>
            <div className="content-body">
              <p>{currentContent.description}</p>
            </div>
            <button className="action-btn" onClick={() => navigate('/attractions')}>
              查看更多景点 →
            </button>
          </div>
        );
      case 'learning':
        return (
          <div className="content-card learning">
            <div className="content-header">
              <span className="category-tag" style={{background: currentCategory.color}}>{currentContent.category}</span>
            </div>
            <h2 className="content-title">{currentContent.title}</h2>
            <div className="content-body">
              <p>{currentContent.content}</p>
            </div>
            <div className="learning-steps">
              <h4>📝 实践步骤：</h4>
              <ol>
                <li>理解核心概念</li>
                <li>尝试应用到实际场景</li>
                <li>总结经验教训</li>
              </ol>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="daily-push-page">
      {showNotification && notificationContent && (
        <div className="notification">
          <div>
            <h3>{notificationContent.title}</h3>
            <p>{notificationContent.message}</p>
          </div>
          <button onClick={() => setShowNotification(false)}>✕</button>
        </div>
      )}
      
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">📅 每日更新</h1>
          <p className="page-subtitle">每天一点知识，日积月累成就未来</p>
        </div>
        
        <div className="date-selector">
          <label htmlFor="date-input">选择日期：</label>
          <input 
            type="date" 
            id="date-input"
            value={selectedDate} 
            onChange={handleDateChange}
            max={todayStr}
          />
          <button onClick={resetToToday} className="today-btn">今天</button>
        </div>
        
        <div className="category-tabs">
          {dailyUpdateCategories.map(cat => (
            <button
              key={cat.id}
              className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
              style={{ 
                '--category-color': cat.color,
                backgroundColor: selectedCategory === cat.id ? cat.color : 'transparent',
                color: selectedCategory === cat.id ? 'white' : '#333'
              }}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="tab-icon">{cat.icon}</span>
              <span className="tab-name">{cat.name}</span>
            </button>
          ))}
        </div>
        
        {renderContent()}
        
        <div className="schedule-info">
          <h4>⏰ 更新时间安排</h4>
          <div className="schedule-grid">
            <div className="schedule-item">
              <span className="schedule-time">{scheduleConfig.dailyUpdateTime}</span>
              <span className="schedule-desc">每日更新推送</span>
            </div>
            <div className="schedule-item">
              <span className="schedule-time">{scheduleConfig.reminderTime}</span>
              <span className="schedule-desc">学习提醒</span>
            </div>
            <div className="schedule-item">
              <span className="schedule-time">每周日</span>
              <span className="schedule-desc">学习周报总结</span>
            </div>
          </div>
        </div>
        
        <div className="daily-stats">
          <div className="stat-item">
            <span className="stat-number">6</span>
            <span className="stat-label">学习主题</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">365</span>
            <span className="stat-label">全年更新</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">72</span>
            <span className="stat-label">大学百科</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">12</span>
            <span className="stat-label">景点推荐</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyPush;
