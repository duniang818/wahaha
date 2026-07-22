import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllEthnicGroups, getEthnicGroupById, getEthnicDistribution } from '../data/ethnicGroups';
import './EthnicGroups.css';

function EthnicGroups() {
  const navigate = useNavigate();
  const [selectedEthnicId, setSelectedEthnicId] = useState(null);
  const allEthnicGroups = getAllEthnicGroups();

  // 获取选中的少数民族信息
  const selectedEthnicGroup = useMemo(() => {
    return selectedEthnicId ? getEthnicGroupById(selectedEthnicId) : null;
  }, [selectedEthnicId]);

  // 获取选中少数民族的分布信息
  const selectedEthnicDistribution = useMemo(() => {
    return selectedEthnicId ? getEthnicDistribution(selectedEthnicId) : [];
  }, [selectedEthnicId]);

  // 处理少数民族选择
  const handleEthnicSelect = (ethnicId) => {
    setSelectedEthnicId(ethnicId);
  };

  // 重置选择
  const handleReset = () => {
    setSelectedEthnicId(null);
  };

  return (
    <div className="ethnic-groups-page">
      <div className="container">
        <h1 className="page-title">少数民族分布与习俗</h1>
        <p className="page-subtitle">探索中国各少数民族的分布情况和传统习俗</p>

        <div className="ethnic-groups-layout">
          {/* 侧边栏 - 少数民族列表 */}
          <div className="ethnic-sidebar">
            <div className="sidebar-header">
              <h2>少数民族列表</h2>
              {selectedEthnicId && (
                <button className="reset-btn" onClick={handleReset}>
                  重置筛选
                </button>
              )}
            </div>
            <div className="ethnic-list">
              {allEthnicGroups.map(group => (
                <div
                  key={group.id}
                  className={`ethnic-item ${selectedEthnicId === group.id ? 'selected' : ''}`}
                  onClick={() => handleEthnicSelect(group.id)}
                >
                  <div className="ethnic-info">
                    <h3>{group.name}</h3>
                    <p className="ethnic-population">人口：{group.population}</p>
                    <p className="ethnic-language">语言：{group.language}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 主内容区 */}
          <div className="ethnic-main">
            {/* 总览视图 */}
            {!selectedEthnicId && (
              <div className="ethnic-overview">
                <h2>中国少数民族总览</h2>
                <p>中国是一个多民族国家，共有56个民族，其中汉族人口最多，其他55个民族被称为少数民族。</p>
                <p>少数民族分布广泛，主要集中在西南、西北和东北地区。各民族都有自己独特的文化、语言、风俗习惯和宗教信仰。</p>
                
                <div className="ethnic-stats">
                  <div className="stat-card">
                    <div className="stat-number">55</div>
                    <div className="stat-label">少数民族数量</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">~1.2亿</div>
                    <div className="stat-label">少数民族总人口</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">8</div>
                    <div className="stat-label">主要少数民族</div>
                  </div>
                </div>

                <div className="ethnic-highlights">
                  <h3>主要少数民族分布</h3>
                  <div className="ethnic-highlight-list">
                    {allEthnicGroups.map(group => (
                      <div key={group.id} className="ethnic-highlight-item">
                        <h4>{group.name}</h4>
                        <p>{group.description}</p>
                        <button 
                          className="view-details-btn"
                          onClick={() => handleEthnicSelect(group.id)}
                        >
                          查看详情
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 详细视图 */}
            {selectedEthnicId && selectedEthnicGroup && (
              <div className="ethnic-detail">
                <div className="detail-header">
                  <h2>{selectedEthnicGroup.name}详细信息</h2>
                  <button className="back-btn" onClick={handleReset}>
                    返回总览
                  </button>
                </div>

                <div className="ethnic-basic-info">
                  <h3>基本信息</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">人口：</span>
                      <span className="info-value">{selectedEthnicGroup.population}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">语言：</span>
                      <span className="info-value">{selectedEthnicGroup.language}</span>
                    </div>
                  </div>
                  <p className="ethnic-description">{selectedEthnicGroup.description}</p>
                </div>

                <div className="ethnic-distribution">
                  <h3>分布情况</h3>
                  {selectedEthnicDistribution.length > 0 ? (
                    <div className="distribution-list">
                      {selectedEthnicDistribution.map((region, index) => (
                        <div key={index} className="distribution-item">
                          <div className="distribution-header">
                            <h4>{region.province}</h4>
                            <span className="distribution-percentage">占比：{region.percentage}</span>
                          </div>
                          <div className="distribution-customs">
                            <h5>传统习俗</h5>
                            <ul className="customs-list">
                              {region.customs.map((custom, idx) => (
                                <li key={idx}>{custom}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data">暂无分布数据</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EthnicGroups;