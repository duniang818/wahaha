import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { stocks } from '../data/stocks';
import './Stocks.css';

const FAVORITES_KEY = 'favorites';

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveFavorites(list) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
}

export default function Stocks() {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  // On mount, try to load server-side watch list, fallback to localStorage
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const resp = await fetch('/api/watch');
        if (!mounted) return;
        if (resp.ok) {
          const j = await resp.json();
          setFavorites(j.watch || []);
          saveFavorites(j.watch || []);
          return;
        }
      } catch (e) {
        // ignore
      }
      // fallback
      setFavorites(loadFavorites());
    }
    load();
    return () => { mounted = false; };
  }, []);

  async function toggleFavorite(symbol) {
    const lower = symbol.toLowerCase();
    if (favorites.includes(symbol)) {
      // remove
      try {
        const resp = await fetch(`/api/watch/${lower}`, { method: 'DELETE' });
        if (resp.ok) {
          const j = await resp.json();
          setFavorites(j.watch || []);
          saveFavorites(j.watch || []);
          return;
        }
      } catch (e) {
        console.warn('remove watch failed', e.message);
      }
      // fallback local
      setFavorites(prev => { const next = prev.filter(s => s !== symbol); saveFavorites(next); return next; });
    } else {
      // add
      try {
        const resp = await fetch('/api/watch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: lower }) });
        if (resp.ok) {
          const j = await resp.json();
          setFavorites(j.watch || []);
          saveFavorites(j.watch || []);
          return;
        }
      } catch (e) {
        console.warn('add watch failed', e.message);
      }
      // fallback local
      setFavorites(prev => { const next = [...prev, symbol]; saveFavorites(next); return next; });
    }
  }

  return (
    <div className="stocks-page container">
      <h2>股票 — 自选与列表</h2>

      <section className="favorites">
        <h3>我的自选</h3>
        {favorites.length === 0 ? (
          <div className="empty">暂无自选。可以添加示例股票：钧达股份</div>
        ) : (
          <ul>
            {favorites.map(sym => {
              const s = stocks.find(x => x.symbol === sym || x.name === sym);
              return (
                <li key={sym}>
                  <button className="link-like" onClick={() => navigate(`/stock/${sym}`)}>{s ? s.name : sym}</button>
                  <button className="small" onClick={() => toggleFavorite(sym)}>移除</button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="all-stocks">
        <h3>全部股票</h3>
        <ul>
          {stocks.map(s => (
            <li key={s.symbol}>
              <button className="link-like" onClick={() => navigate(`/stock/${s.symbol}`)}>{s.name} ({s.symbol})</button>
              <button className="small" onClick={() => toggleFavorite(s.symbol)}>{favorites.includes(s.symbol) ? '从自选移除' : '加入自选'}</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
