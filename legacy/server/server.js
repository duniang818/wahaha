const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const axios = require('axios');
const iconv = require('iconv-lite');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, '..', 'src', 'data', 'stock_live.json');

async function fetchFromTencent(code) {
  const url = `https://qt.gtimg.cn/q=${code}`;
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  const text = iconv.decode(res.data, 'gbk');
  const m = text.match(/="(.*)";/);
  if (!m) throw new Error('Unexpected response format');
  const parts = m[1].split('~');
  const name = parts[1] || parts[0];
  const current = parseFloat(parts[3] || parts[5] || NaN);
  const high = parseFloat(parts[33] || NaN);
  const low = parseFloat(parts[34] || NaN);
  const open = parseFloat(parts[5] || NaN);
  const yesterdayClose = parseFloat(parts[4] || NaN);
  return { source: 'tencent_qt', code, name, current, open, yesterdayClose, high, low, raw: parts };
}

async function fetchFromSina(code) {
  const url = `https://hq.sinajs.cn/list=${code}`;
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  const text = iconv.decode(res.data, 'gbk');
  const m = text.match(/="(.*)";/);
  if (!m) throw new Error('Unexpected response format');
  const parts = m[1].split(',');
  const name = parts[0];
  const current = parseFloat(parts[3] || parts[2]);
  const open = parseFloat(parts[1]);
  const yesterdayClose = parseFloat(parts[2]);
  const high = parseFloat(parts[4] || NaN);
  const low = parseFloat(parts[5] || NaN);
  return { source: 'sina_hq', code, name, current, open, yesterdayClose, high, low, raw: parts };
}

async function fetchCombined(code) {
  const out = { code, fetchedAt: new Date().toISOString(), results: {} };
  try { out.results.sina = await fetchFromSina(code); } catch (e) { out.results.sina = { error: e.message }; }
  try { out.results.tencent = await fetchFromTencent(code); } catch (e) { out.results.tencent = { error: e.message }; }
  return out;
}

async function saveData(obj) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(obj, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write data file', e.message);
  }
}

// Watch list persistence
const WATCH_FILE = path.join(__dirname, 'watchlist.json');

function loadWatchList() {
  try {
    if (fs.existsSync(WATCH_FILE)) {
      const raw = fs.readFileSync(WATCH_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to read watchlist', e.message);
  }
  return ['sz002865'];
}

function saveWatchList(list) {
  try {
    fs.writeFileSync(WATCH_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    console.warn('Failed to write watchlist', e.message);
  }
}

let WATCH_LIST = loadWatchList();

// Periodic job: every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('Cron: fetching watch list', new Date().toISOString());
  const aggregated = { fetchedAt: new Date().toISOString(), data: {} };
  for (const code of WATCH_LIST) {
    try {
      const res = await fetchCombined(code);
      aggregated.data[code.toLowerCase()] = res;
    } catch (e) {
      aggregated.data[code.toLowerCase()] = { error: e.message };
    }
  }
  await saveData(aggregated);
});

// Endpoint: get cached or live data
app.get('/api/stock/:code', async (req, res) => {
  const code = req.params.code.toLowerCase();
  // Try read cache first
  try {
    if (fs.existsSync(DATA_PATH)) {
      const raw = fs.readFileSync(DATA_PATH, 'utf8');
      const json = JSON.parse(raw);
      if (json.data && json.data[code]) return res.json(json.data[code]);
    }
  } catch (e) {
    console.warn('Cache read failed', e.message);
  }
  // Fallback: fetch on demand
  try {
    const combined = await fetchCombined(code);
    return res.json(combined);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// Watch list endpoints
app.get('/api/watch', (req, res) => {
  res.json({ watch: WATCH_LIST });
});

app.post('/api/watch', (req, res) => {
  const code = (req.body.code || '').toLowerCase();
  if (!code) return res.status(400).json({ error: 'missing code' });
  if (!WATCH_LIST.includes(code)) {
    WATCH_LIST.push(code);
    saveWatchList(WATCH_LIST);
  }
  res.json({ watch: WATCH_LIST });
});

app.delete('/api/watch/:code', (req, res) => {
  const code = (req.params.code || '').toLowerCase();
  WATCH_LIST = WATCH_LIST.filter(c => c !== code);
  saveWatchList(WATCH_LIST);
  res.json({ watch: WATCH_LIST });
});

// Immediate fetch endpoint
app.post('/api/stock/:code/fetch', async (req, res) => {
  const code = (req.params.code || '').toLowerCase();
  try {
    const combined = await fetchCombined(code);
    // read existing cache
    let cache = { fetchedAt: new Date().toISOString(), data: {} };
    try {
      if (fs.existsSync(DATA_PATH)) cache = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    } catch (e) { /* ignore */ }
    cache.data = cache.data || {};
    cache.data[code] = combined;
    await saveData(cache);
    res.json(combined);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Stock API server running on port ${PORT}`));
