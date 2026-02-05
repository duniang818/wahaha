import React from 'react';
import { useNavigate } from 'react-router-dom';
import { worldUniversities, chineseUniversities } from '../data/universities';
import './HistoryList.css';

function HistoryList() {
  const navigate = useNavigate();
  const allUniversities = [...worldUniversities, ...chineseUniversities];
  const startDate = new Date('2024-01-01');
  const today = new Date();
  
  // Calculate days since start
  const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  
  // Generate history data (last 30 days or up to start date)
  const historyData = [];
  // Show last 100 pushes or until start date
  const limit = Math.min(daysDiff + 1, 100); 
  
  for (let i = 0; i < limit; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const daysSinceStart = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
    // Ensure positive index
    if (daysSinceStart < 0) continue;
    
    const index = daysSinceStart % allUniversities.length;
    const university = allUniversities[index];
    
    historyData.push({
      date: date.toISOString().split('T')[0],
      university,
      displayDate: date.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'short'
      })
    });
  }

  return (
    <div className="history-list-page">
      <div className="container">
        <h1 className="page-title">往期推送</h1>
        <div className="history-grid">
          {historyData.map((item) => (
            <div key={item.date} className="history-card" onClick={() => navigate(`/university/${item.university.id}`)}>
              <div className="history-date">{item.displayDate}</div>
              <div className="history-content">
                <h3>{item.university.name}</h3>
                <p>{item.university.nameEn}</p>
                <span className="history-country">{item.university.country}</span>
                <span className="history-rank">QS #{item.university.ranking}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HistoryList;
