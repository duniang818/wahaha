export const stocks = [
  {
    symbol: 'JDGF',
    name: '钧达股份',
    // 最近30个交易日的模拟数据（日期、开盘、最高、最低、收盘）
    history: [
      { date: '2026-01-05', open: 10.2, high: 10.5, low: 9.8, close: 10.1 },
      { date: '2026-01-06', open: 10.1, high: 10.6, low: 10.0, close: 10.4 },
      { date: '2026-01-07', open: 10.4, high: 10.8, low: 10.2, close: 10.6 },
      { date: '2026-01-08', open: 10.6, high: 10.9, low: 10.3, close: 10.2 },
      { date: '2026-01-09', open: 10.2, high: 10.4, low: 9.9, close: 10.0 },
      { date: '2026-01-12', open: 10.0, high: 10.3, low: 9.7, close: 9.8 },
      { date: '2026-01-13', open: 9.8, high: 10.1, low: 9.6, close: 9.9 },
      { date: '2026-01-14', open: 9.9, high: 10.2, low: 9.8, close: 10.0 },
      { date: '2026-01-15', open: 10.0, high: 10.4, low: 9.9, close: 10.3 },
      { date: '2026-01-16', open: 10.3, high: 10.7, low: 10.1, close: 10.6 },
      { date: '2026-01-19', open: 10.6, high: 11.0, low: 10.4, close: 10.9 },
      { date: '2026-01-20', open: 10.9, high: 11.2, low: 10.7, close: 11.0 },
      { date: '2026-01-21', open: 11.0, high: 11.3, low: 10.8, close: 11.1 },
      { date: '2026-01-22', open: 11.1, high: 11.5, low: 10.9, close: 11.4 },
      { date: '2026-01-23', open: 11.4, high: 11.6, low: 11.0, close: 11.2 },
      { date: '2026-01-26', open: 11.2, high: 11.6, low: 11.1, close: 11.5 },
      { date: '2026-01-27', open: 11.5, high: 11.9, low: 11.3, close: 11.8 },
      { date: '2026-01-28', open: 11.8, high: 12.0, low: 11.6, close: 11.9 },
      { date: '2026-01-29', open: 11.9, high: 12.2, low: 11.7, close: 12.1 },
      { date: '2026-01-30', open: 12.1, high: 12.4, low: 11.9, close: 12.3 },
      { date: '2026-02-02', open: 12.3, high: 12.6, low: 12.0, close: 12.2 },
      { date: '2026-02-03', open: 12.2, high: 12.5, low: 12.0, close: 12.4 },
      { date: '2026-02-04', open: 12.4, high: 12.7, low: 12.2, close: 12.6 },
      { date: '2026-02-05', open: 12.6, high: 12.9, low: 12.4, close: 12.8 },
      { date: '2026-02-06', open: 12.8, high: 13.2, low: 12.6, close: 13.0 },
      { date: '2026-02-09', open: 13.0, high: 13.4, low: 12.8, close: 13.3 },
      { date: '2026-02-10', open: 13.3, high: 13.7, low: 13.1, close: 13.5 },
      { date: '2026-02-11', open: 13.5, high: 13.8, low: 13.2, close: 13.4 },
      { date: '2026-02-12', open: 13.4, high: 13.6, low: 13.0, close: 13.1 }
    ]
  }
];

export function findStockBySymbol(symbol) {
  return stocks.find(s => s.symbol === symbol || s.name === symbol);
}
