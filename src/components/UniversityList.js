import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UniversityList.css';

function UniversityList({ universities, title }) {
  const navigate = useNavigate();
  
  return (
    <div className="university-list-page">
      <div className="container">
        <h1 className="page-title">{title}</h1>
        <div className="university-grid">
          {universities.map((university) => (
            <div 
              key={university.id} 
              className="university-card"
              onClick={() => navigate(`/university/${university.id}`)}
            >
              <div className="university-rank">#{university.ranking}</div>
              <h2 className="university-name">{university.name}</h2>
              <p className="university-name-en">{university.nameEn}</p>
              <div className="university-country">
                <span className="flag">🌍</span>
                {university.country}
              </div>
              <p className="university-intro">{university.introduction.substring(0, 100)}...</p>
              <div className="university-stats">
                <div className="stat">
                  <span className="stat-label">优势专业</span>
                  <span className="stat-value">{university.top5Majors.length}个</span>
                </div>
                <div className="stat">
                  <span className="stat-label">知名校友</span>
                  <span className="stat-value">{university.famousAlumni.length}位</span>
                </div>
              </div>
              <button className="view-details-btn">查看详情 →</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UniversityList;
