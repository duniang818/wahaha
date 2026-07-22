// Simple scraper to fetch stock price from Sina Finance mobile quote page
// Usage: node tools/fetch_stock.js <code>
// Example: node tools/fetch_stock.js sh600519

const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const fs = require('fs');
const path = require('path');

async function fetchFromSina(code) {
  // Sina mobile quote provides a json-like script; using the "hq" API endpoint is simpler
  // URL pattern: https://hq.sinajs.cn/list=sh600519  (sh/sz + code)
  const url = `https://hq.sinajs.cn/list=${code}`;
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    // Response is GBK encoded text like: var hq_str_sh600519="贵州茅台,1835.00,...";
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
  } catch (err) {
    throw err;
  }
}

async function fetchFromTencent(code) {
  // Tencent finance detail page doesn't offer a simple CORS-friendly JSON; but there is an API endpoint
  // We will attempt to call Tencent's stock data API used by their pages.
  // Example endpoint (may change): https://qt.gtimg.cn/q=sh600519
  const url = `https://qt.gtimg.cn/q=${code}`;
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    // Response is GBK encoded; decode to UTF-8
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
  } catch (err) {
    throw err;
  }
}

async function main() {
  const code = process.argv[2];
  if (!code) {
    console.error('请提供股票代码，格式示例：sh600519 或 sz000001');
    process.exit(1);
  }

  const output = { code, fetchedAt: new Date().toISOString(), results: {} };

  try {
    const sina = await fetchFromSina(code);
    output.results.sina = sina;
    console.log('Sina result:', JSON.stringify(sina, null, 2));
  } catch (e) {
    output.results.sina = { error: e.message };
    console.error('Sina fetch failed:', e.message);
  }

  try {
    const tencent = await fetchFromTencent(code);
    output.results.tencent = tencent;
    console.log('Tencent result:', JSON.stringify(tencent, null, 2));
  } catch (e) {
    output.results.tencent = { error: e.message };
    console.error('Tencent fetch failed:', e.message);
  }

  // Save output to src/data/stock_live.json so frontend can read it
  try {
    const outPath = path.join(__dirname, '..', 'src', 'data', 'stock_live.json');
    fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
    console.log('Saved output to', outPath);
  } catch (e) {
    console.error('Failed to write output file:', e.message);
  }
}

main().catch(e => console.error(e));
