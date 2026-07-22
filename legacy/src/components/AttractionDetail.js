import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAttractionById as get5AById } from '../data/attractions5A';
import { getAll4AAttractions } from '../data/attractions4A';
import { getAll3AAttractions } from '../data/attractions3A';
import { getAllMuseums } from '../data/museums';
import './AttractionDetail.css';

function AttractionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 从所有数据源查找景区
  const attraction = useMemo(() => {
    // 先尝试5A
    let result = get5AById(id);
    if (result) {
      return { ...result, level: '5A' };
    }
    
    // 尝试4A
    result = getAll4AAttractions().find(a => a.id === id);
    if (result) {
      return { ...result, level: '4A' };
    }
    
    // 尝试3A
    result = getAll3AAttractions().find(a => a.id === id);
    if (result) {
      return { ...result, level: '3A' };
    }
    
    // 尝试博物馆
    result = getAllMuseums().find(m => m.id === id);
    if (result) {
      return { ...result, level: 'museum' };
    }
    
    return null;
  }, [id]);
  
  if (!attraction) {
    return (
      <div className="attraction-detail-page">
        <div className="container">
          <p>未找到该景区信息</p>
          <button onClick={() => navigate('/attractions')}>返回列表</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="attraction-detail-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>← 返回</button>
        
        <div className="attraction-header">
          <div className={`attraction-badge-large ${attraction.level === '5A' ? 'badge-5a' : attraction.level === '4A' ? 'badge-4a' : attraction.level === '3A' ? 'badge-3a' : 'badge-museum'}`}>
            {attraction.level === '5A' ? '5A级景区' : attraction.level === '4A' ? '4A级景区' : attraction.level === '3A' ? '3A级景区' : '博物馆'}
          </div>
          <h1 className="attraction-title">{attraction.name}</h1>
          {attraction.nameEn && (
            <p className="attraction-subtitle">{attraction.nameEn}</p>
          )}
          <div className="attraction-meta">
            <span className="city-badge">
              <span className="flag">🏙️</span>
              {attraction.city}
            </span>
            <span className="type-badge">{attraction.type}</span>
          </div>
        </div>
        
        <div className="attraction-intro-section">
          <h2>景区简介</h2>
          <p>{attraction.description}</p>
        </div>
        
        <div className="price-section">
          <h2>门票信息</h2>
          <div className="price-card">
            <div className="price-status">
              {attraction.isFree ? (
                <div className="free-badge">
                  <span className="free-icon">🆓</span>
                  <span>免费开放</span>
                </div>
              ) : (
                <div className="paid-badge">
                  <span className="paid-icon">💰</span>
                  <span>收费景区</span>
                </div>
              )}
            </div>
            
            <div className="price-info">
              <div className="price-main">
                <span className="price-label">门票价格：</span>
                <span className="price-value">{attraction.price || '请咨询景区'}</span>
              </div>
              
              {attraction.priceDetail && (
                <div className="price-detail">
                  <h3>详细说明</h3>
                  <p>{attraction.priceDetail}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="attraction-info-section">
          <h2>景区信息</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">所在城市</span>
              <span className="info-value">{attraction.city}</span>
            </div>
            <div className="info-item">
              <span className="info-label">景区类型</span>
              <span className="info-value">{attraction.type}</span>
            </div>
            <div className="info-item">
              <span className="info-label">等级</span>
              <span className="info-value">
                {attraction.level === '5A' ? '5A级景区' : attraction.level === '4A' ? '4A级景区' : attraction.level === '3A' ? '3A级景区' : '博物馆'}
              </span>
            </div>
            {attraction.nameEn && (
              <div className="info-item">
                <span className="info-label">英文名称</span>
                <span className="info-value">{attraction.nameEn}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="share-section">
          <h2>📤 一键分享</h2>
          <div className="share-buttons">
            <button
              className="share-btn xiaohongshu"
              onClick={() => {
                const text = `${attraction.name} ${attraction.nameEn ? `| ${attraction.nameEn}` : ''}\n📍 ${attraction.city} · ${attraction.type}\n\n${attraction.description}\n\n💰 门票：${attraction.price}\n\n#${attraction.city} #${attraction.type} #5A景区 #旅行 #名校与旅行导航`;
                navigator.clipboard.writeText(text).then(() => {
                  alert('✅ 已复制到剪贴板！打开小红书App新建笔记并粘贴即可发布。');
                }).catch(() => {
                  const ta = document.createElement('textarea');
                  ta.value = text;
                  document.body.appendChild(ta);
                  ta.select();
                  document.execCommand('copy');
                  document.body.removeChild(ta);
                  alert('✅ 已复制！请打开小红书粘贴发布。');
                });
              }}
            >
              📕 分享到小红书
            </button>
            <button
              className="share-btn wechat"
              onClick={() => {
                const text = `【${attraction.name}】\n\n📍 地址：${attraction.city}\n📌 类型：${attraction.type}\n\n${attraction.description}\n\n💰 门票：${attraction.price}\n\n--- 分享自名校与旅行导航`;
                navigator.clipboard.writeText(text).then(() => {
                  alert('✅ 已复制到剪贴板！打开微信公众号后台新建图文并粘贴即可发布。');
                }).catch(() => {
                  const ta = document.createElement('textarea');
                  ta.value = text;
                  document.body.appendChild(ta);
                  ta.select();
                  document.execCommand('copy');
                  document.body.removeChild(ta);
                  alert('✅ 已复制！请打开公众号后台粘贴发布。');
                });
              }}
            >
              📱 分享到公众号
            </button>
            <button
              className="share-btn write-journal"
              onClick={() => navigate(`/journal?attraction=${encodeURIComponent(attraction.name)}&city=${encodeURIComponent(attraction.city)}`)}
            >
              ✏️ 写游记
            </button>
          </div>
        </div>

        <div className="tips-section">
          <h2>💡 温馨提示</h2>
          <ul className="tips-list">
            <li>门票价格可能因季节、节假日等因素有所调整，建议出行前咨询景区</li>
            <li>学生、老人、残疾人等特殊群体通常有优惠政策，需持有效证件</li>
            <li>部分景区内部分景点或项目需单独购票</li>
            <li>建议提前了解景区的开放时间和预约要求</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AttractionDetail;
