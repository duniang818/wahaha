import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAll5AAttractions } from '../data/attractions5A';
import './TravelJournal.css';

// 生成小红书风格文案
const formatForXiaohongshu = (journal) => {
  const tags = journal.tags ? journal.tags.split(/[,，]/).map(t => t.trim()).filter(Boolean) : [];
  const defaultTags = ['旅行', '游记', journal.city || '旅行日记'];
  const allTags = [...new Set([...defaultTags, ...tags])];
  const hashtags = allTags.map(t => `#${t}`).join(' ');
  
  return `${journal.title || '我的旅行游记'}

📍 ${journal.city || '未知'} ${journal.attraction ? `| ${journal.attraction}` : ''}
📅 ${journal.date || new Date().toLocaleDateString('zh-CN')}

${journal.content || ''}

${hashtags}

---
来自 名校与旅行导航`;
};

// 生成微信公众号风格文案（纯文本，适合复制到公众号编辑器）
const formatForWeChat = (journal) => {
  return `【${journal.title || '旅行游记'}】

📍 目的地：${journal.city || '未知'} ${journal.attraction ? ` | ${journal.attraction}` : ''}
📅 旅行日期：${journal.date || new Date().toLocaleDateString('zh-CN')}

${journal.content || ''}

---
分享自 名校与旅行导航`;
};

function TravelJournal() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlCity = searchParams.get('city') || '';
  const urlAttraction = searchParams.get('attraction') || '';
  const [journals, setJournals] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: urlAttraction ? `${urlAttraction}游记` : '',
    content: '',
    city: urlCity,
    attraction: urlAttraction,
    date: new Date().toISOString().split('T')[0],
    tags: '旅行,游记'
  });

  // 从URL参数预填表单（从景区详情页跳转时）
  useEffect(() => {
    if (urlCity || urlAttraction) {
      setForm(prev => ({
        ...prev,
        city: urlCity || prev.city,
        attraction: urlAttraction || prev.attraction,
        title: urlAttraction ? `${urlAttraction}游记` : prev.title
      }));
      setIsEditing(true);
    }
  }, [urlCity, urlAttraction]);

  const attractions = getAll5AAttractions();
  const cities = [...new Set(attractions.map(a => a.city))].sort();

  useEffect(() => {
    const saved = localStorage.getItem('travelJournals');
    if (saved) {
      try {
        setJournals(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load journals', e);
      }
    }
  }, []);

  const saveJournals = (newJournals) => {
    setJournals(newJournals);
    localStorage.setItem('travelJournals', JSON.stringify(newJournals));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      alert('请填写标题和正文内容');
      return;
    }
    const newJournal = {
      id: editingId || Date.now(),
      ...form,
      createdAt: editingId ? journals.find(j => j.id === editingId)?.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    let newJournals;
    if (editingId) {
      newJournals = journals.map(j => j.id === editingId ? newJournal : j);
    } else {
      newJournals = [newJournal, ...journals];
    }
    saveJournals(newJournals);
    setForm({ title: '', content: '', city: '', attraction: '', date: new Date().toISOString().split('T')[0], tags: '旅行,游记' });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (journal) => {
    setForm({
      title: journal.title,
      content: journal.content,
      city: journal.city || '',
      attraction: journal.attraction || '',
      date: journal.date || new Date().toISOString().split('T')[0],
      tags: journal.tags || '旅行,游记'
    });
    setEditingId(journal.id);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('确定要删除这篇游记吗？')) {
      saveJournals(journals.filter(j => j.id !== id));
    }
  };

  const handleShare = async (platform, journal) => {
    const text = platform === 'xiaohongshu' ? formatForXiaohongshu(journal) : formatForWeChat(journal);
    try {
      await navigator.clipboard.writeText(text);
      alert(platform === 'xiaohongshu' 
        ? '✅ 已复制到剪贴板！请打开小红书App，新建笔记并粘贴即可发布。' 
        : '✅ 已复制到剪贴板！请打开微信公众号后台，新建图文并粘贴即可发布。');
    } catch (err) {
      // 降级方案
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert(platform === 'xiaohongshu' 
        ? '✅ 已复制到剪贴板！请打开小红书App粘贴发布。' 
        : '✅ 已复制到剪贴板！请打开微信公众号后台粘贴发布。');
    }
  };

  const attractionsInCity = form.city 
    ? attractions.filter(a => a.city === form.city) 
    : [];

  return (
    <div className="travel-journal-page">
      <div className="container">
        <div className="journal-header">
          <h1 className="page-title">✏️ 旅游游记</h1>
          <p className="page-subtitle">记录你的旅行故事，一键分享到小红书、微信公众号</p>
          <button 
            className="new-journal-btn"
            onClick={() => {
              setIsEditing(true);
              setEditingId(null);
              setForm({ title: '', content: '', city: '', attraction: '', date: new Date().toISOString().split('T')[0], tags: '旅行,游记' });
            }}
          >
            ✍️ 写游记
          </button>
        </div>

        {isEditing && (
          <form className="journal-form" onSubmit={handleSubmit}>
            <h2>{editingId ? '编辑游记' : '写新游记'}</h2>
            <div className="form-row">
              <input
                type="text"
                placeholder="游记标题 *"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
                className="form-input"
              />
            </div>
            <div className="form-row">
              <select
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value, attraction: '' })}
                className="form-select"
              >
                <option value="">选择城市（可选）</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <select
                value={form.attraction}
                onChange={e => setForm({ ...form, attraction: e.target.value })}
                className="form-select"
                disabled={!form.city}
              >
                <option value="">选择景区（可选）</option>
                {attractionsInCity.map(a => (
                  <option key={a.id} value={a.name}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="form-input"
              />
              <input
                type="text"
                placeholder="标签，用逗号分隔（如：旅行,武汉,周末游）"
                value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-row">
              <textarea
                placeholder="写下你的旅行故事... *"
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                required
                rows={10}
                className="form-textarea"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn">💾 保存游记</button>
              <button type="button" onClick={() => { setIsEditing(false); setEditingId(null); }} className="cancel-btn">取消</button>
            </div>
          </form>
        )}

        <div className="journals-list">
          <h2>我的游记 ({journals.length})</h2>
          {journals.length === 0 ? (
            <div className="empty-state">
              <p>还没有游记，点击上方「写游记」开始记录吧！</p>
              <p className="hint">写完后可一键复制分享到小红书或微信公众号～</p>
            </div>
          ) : (
            journals.map(journal => (
              <div key={journal.id} className="journal-card">
                <h3>{journal.title}</h3>
                <div className="journal-meta">
                  {journal.city && <span>📍 {journal.city}</span>}
                  {journal.attraction && <span> | {journal.attraction}</span>}
                  <span> | 📅 {journal.date}</span>
                </div>
                <p className="journal-preview">{journal.content.slice(0, 200)}{journal.content.length > 200 ? '...' : ''}</p>
                <div className="journal-actions">
                  <button className="share-btn xiaohongshu" onClick={() => handleShare('xiaohongshu', journal)} title="复制到小红书">
                    📕 分享到小红书
                  </button>
                  <button className="share-btn wechat" onClick={() => handleShare('wechat', journal)} title="复制到公众号">
                    📱 分享到公众号
                  </button>
                  <button className="edit-btn" onClick={() => handleEdit(journal)}>✏️ 编辑</button>
                  <button className="delete-btn" onClick={() => handleDelete(journal.id)}>🗑️ 删除</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default TravelJournal;
export { formatForXiaohongshu, formatForWeChat };
