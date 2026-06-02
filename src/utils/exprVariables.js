// Variable resolver for technical formula expressions.
//
// Supported names:
//   price                         latest close
//   price_max_N                   max close over last N calendar days (e.g. price_max_180)
//   price_min_N                   min close over last N calendar days
//   ma_N                          simple moving average of last N trading days (e.g. ma_50)
//   rsi_N                         Cutler's RSI over last N trading days (e.g. rsi_14)

const DAY_MS = 86_400_000;

function sliceByCalendarDays(history, days) {
  if (!history || !history.closes?.length) return [];
  const cutoff = Date.now() - days * DAY_MS;
  const out = [];
  for (let i = 0; i < history.timestamps.length; i++) {
    if (history.timestamps[i] >= cutoff) out.push(history.closes[i]);
  }
  return out;
}

function lastTradingDays(history, n) {
  if (!history || !history.closes?.length) return [];
  return history.closes.slice(-n);
}

export function resolveVariable(name, history) {
  if (!history || !history.closes?.length) return null;
  if (name === "price") return history.closes[history.closes.length - 1];

  let m = name.match(/^price_max_(\d+)$/);
  if (m) {
    const window = sliceByCalendarDays(history, Number(m[1]));
    return window.length ? Math.max(...window) : null;
  }

  m = name.match(/^price_min_(\d+)$/);
  if (m) {
    const window = sliceByCalendarDays(history, Number(m[1]));
    return window.length ? Math.min(...window) : null;
  }

  m = name.match(/^ma_(\d+)$/);
  if (m) {
    const n = Number(m[1]);
    const window = lastTradingDays(history, n);
    if (window.length < n) return null;
    return window.reduce((a, b) => a + b, 0) / window.length;
  }

  m = name.match(/^rsi_(\d+)$/);
  if (m) {
    const n = Number(m[1]);
    const closes = history.closes;
    if (closes.length < n + 1) return null;
    let gains = 0;
    let losses = 0;
    for (let i = closes.length - n; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff >= 0) gains += diff;
      else losses += -diff;
    }
    if (losses === 0) return 100;
    const rs = gains / losses;
    return 100 - 100 / (1 + rs);
  }

  return null;
}

export const SUGGESTED_VARS = [
  { name: "price", desc: "Latest close" },
  { name: "price_max_30", desc: "30-day high" },
  { name: "price_max_90", desc: "90-day high" },
  { name: "price_max_180", desc: "180-day high (half year)" },
  { name: "price_max_360", desc: "360-day high (~1 year)" },
  { name: "price_min_30", desc: "30-day low" },
  { name: "price_min_180", desc: "180-day low" },
  { name: "ma_20", desc: "20-day moving average" },
  { name: "ma_50", desc: "50-day moving average" },
  { name: "ma_200", desc: "200-day moving average" },
  { name: "rsi_14", desc: "14-day RSI" },
];
