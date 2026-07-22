import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { worldUniversities, chineseUniversities } from '../data/universities';
import './UniversityDetail.css';

function UniversityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const allUniversities = [...worldUniversities, ...chineseUniversities];
  const university = allUniversities.find(u => u.id === parseInt(id));
  
  if (!university) {
    return (
      <div className="university-detail-page">
        <div className="container">
          <p>未找到该学校信息</p>
          <button onClick={() => navigate('/')}>返回首页</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="university-detail-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>← 返回</button>
        
        <div className="university-header">
          <div className="university-rank-badge">QS排名 #{university.ranking}</div>
          <h1 className="university-title">{university.name}</h1>
          <p className="university-subtitle">{university.nameEn}</p>
          <div className="university-meta">
            <span className="country-badge">
              <span className="flag">🌍</span>
              {university.country}
            </span>
          </div>
        </div>
        
        <div className="university-intro-section">
          <h2>学校简介</h2>
          <p>{university.introduction}</p>
        </div>
        
        <div className="majors-section">
          <div className="top-majors">
            <h2>🏆 TOP5 优势专业</h2>
            <div className="majors-grid">
              {university.top5Majors.map((major, index) => (
                <div key={index} className="major-card top-major">
                  <div className="major-rank">#{index + 1}</div>
                  <h3>{major.name}</h3>
                  <div className="teacher-info">
                    <strong>知名教授：</strong>{major.teacher}
                  </div>
                  <p className="teacher-desc">{major.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bottom-majors">
            <h2>📚 其他专业</h2>
            <div className="majors-grid">
              {university.bottom5Majors.map((major, index) => (
                <div key={index} className="major-card bottom-major">
                  <h3>{major.name}</h3>
                  <div className="teacher-info">
                    <strong>知名教授：</strong>{major.teacher}
                  </div>
                  <p className="teacher-desc">{major.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="alumni-section">
          <h2>🌟 知名校友</h2>
          <div className="alumni-grid">
            {university.famousAlumni.map((alumni, index) => (
              <div key={index} className="alumni-card">
                <div className="alumni-name">{alumni.name}</div>
                <div className="alumni-achievement">{alumni.achievement}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="admission-section">
          <h2>📋 招生信息</h2>
          
          <div className="admission-card">
            <h3>招生门槛</h3>
            <div className="threshold-badge">{university.admissionRequirements.threshold}</div>
          </div>
          
          <div className="admission-card">
            <h3>进入方式</h3>
            <ul className="entry-ways">
              {university.admissionRequirements.entryWays.map((way, index) => (
                <li key={index}>{way}</li>
              ))}
            </ul>
          </div>
          
          <div className="admission-card">
            <h3>考试科目</h3>
            <ul className="exam-subjects">
              {university.admissionRequirements.exams.map((exam, index) => (
                <li key={index}>{exam}</li>
              ))}
            </ul>
          </div>
          
          <div className="admission-card">
            <h3>考试时间</h3>
            <ul className="exam-dates">
              {university.admissionRequirements.examDates.map((date, index) => (
                <li key={index}>{date}</li>
              ))}
            </ul>
          </div>
          
          <div className="admission-tips">
            <h3>💡 申请建议</h3>
            <p>{university.admissionRequirements.tips}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UniversityDetail;
