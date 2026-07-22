import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { findStockBySymbol } from '../data/stocks';
import './Stocks.css';
import { useEffect, useState } from 'react';

function sma(values, n) {
  if (!values || values.length === 0) return null;
  const res = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - n + 1);
    const slice = values.slice(start, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    res.push(avg);
  }
  return res;
}

export default function StockDetail() {
  const { symbol } = useParams();
  const stock = findStockBySymbol(symbol);
  const navigate = useNavigate();
  const [live, setLive] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchLive() {
      try {
        const code = (symbol || '').toLowerCase();
        const resp = await fetch(`/api/stock/${code}`);
        if (!mounted) return;
        if (resp.ok) setLive(await resp.json());
      } catch (e) {
        console.warn('Live fetch failed', e.message);
      }
    }
    fetchLive();
    const interval = setInterval(fetchLive, 60 * 1000); // refresh every minute
    return () => { mounted = false; clearInterval(interval); };
  }, [symbol]);

  async function triggerFetch() {
    try {
      const code = (symbol || '').toLowerCase();
      const resp = await fetch(`/api/stock/${code}/fetch`, { method: 'POST' });
      if (resp.ok) {
        const j = await resp.json();
        setLive(j);
      } else {
        console.warn('Immediate fetch failed');
      }
    } catch (e) {
      console.warn('Immediate fetch error', e.message);
    }
  }

  const history = stock ? stock.history : [];

  const closes = history.map(h => h.close);

  const analysis = useMemo(() => {
    if (!closes.length) return {};

    const sma5 = sma(closes, 5);
    const sma20 = sma(closes, 20);
    const sma50 = sma(closes, 50);

    const last = closes[closes.length - 1];
    const lastSma5 = sma5[sma5.length - 1];
    const lastSma20 = sma20[sma20.length - 1];
    const lastSma50 = sma50 && sma50.length ? sma50[sma50.length - 1] : null;

    // 次日建议（简单规则）
    let nextDay = '观望';
    if (last > lastSma5 && lastSma5 > lastSma20) nextDay = '建议买入（看短线）';
    else if (last < lastSma5 && lastSma5 < lastSma20) nextDay = '建议卖出（看空）';

    // 短期（5-20日）
    let shortTerm = '观望';
    if (lastSma5 && lastSma20 && lastSma5 > lastSma20) shortTerm = '短期建议：买入/持有';
    if (lastSma5 && lastSma20 && lastSma5 < lastSma20) shortTerm = '短期建议：减仓或观望';

    // 长期（20-50日）
    let longTerm = '观望';
    if (lastSma20 && lastSma50 && lastSma20 > lastSma50) longTerm = '长期建议：买入/持有';
    if (lastSma20 && lastSma50 && lastSma20 < lastSma50) longTerm = '长期建议：卖出或减仓';

    const highest = Math.max(...closes);
    const lowest = Math.min(...closes);

    return { nextDay, shortTerm, longTerm, highest, lowest };
  }, [closes]);

  if (!stock) return <div className="container"><h3>未找到该股票</h3><button onClick={() => navigate('/stocks')}>返回股票列表</button></div>;

  // SVG chart params
  const width = 700; const height = 220; const pad = 30;
  const min = Math.min(...closes); const max = Math.max(...closes);
  const xCount = closes.length;
  const points = closes.map((c, i) => {
    const x = pad + (i * (width - pad * 2) / Math.max(1, xCount - 1));
    const y = pad + (1 - (c - min) / Math.max(1e-6, (max - min))) * (height - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="stock-detail container">
      <button onClick={() => navigate('/stocks')}>← 返回</button>
      <h2>{stock.name} ({stock.symbol})</h2>

      <div className="analysis">
        <h3>交易建议</h3>
        <ul>
          <li><strong>次日：</strong>{analysis.nextDay}</li>
          <li><strong>短期：</strong>{analysis.shortTerm}</li>
          <li><strong>长期：</strong>{analysis.longTerm}</li>
        </ul>
      </div>

      {live && (
        <div className="live-data">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h3>实时行情 ({live.results ? (live.results.tencent ? live.results.tencent.source : 'live') : 'live'})</h3>
            <button className="small" onClick={triggerFetch}>立即刷新</button>
          </div>
          <p>当前价：{live.results && live.results.tencent ? live.results.tencent.current : (live.current || '—')}</p>
          <p>最高：{live.results && live.results.tencent ? live.results.tencent.high : (live.high || '—')}，最低：{live.results && live.results.tencent ? live.results.tencent.low : (live.low || '—')}</p>
          <p>更新时间：{live.fetchedAt || live.results?.tencent?.raw?.[30] || '—'}</p>
        </div>
      )}

      <div className="price-stats">
        <h3>价格区间（最近 {closes.length} 日）</h3>
        <p>最高价：{analysis.highest}，最低价：{analysis.lowest}，区间：{(analysis.highest - analysis.lowest).toFixed(2)}</p>
      </div>

      <div className="chart">
        <svg width={width} height={height}>
          <rect x="0" y="0" width={width} height={height} fill="#fff" />
          <polyline fill="none" stroke="#1976d2" strokeWidth="2" points={points} />
        </svg>
        <div className="chart-footer">日期从 {history[0] && history[0].date} 到 {history[history.length-1] && history[history.length-1].date}</div>
      </div>

      <div className="history-table">
        <h3>最近价格</h3>
        <table>
          <thead>
            <tr><th>日期</th><th>开盘</th><th>最高</th><th>最低</th><th>收盘</th></tr>
          </thead>
          <tbody>
            {history.slice().reverse().map(h => (
              <tr key={h.date}><td>{h.date}</td><td>{h.open}</td><td>{h.high}</td><td>{h.low}</td><td>{h.close}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
