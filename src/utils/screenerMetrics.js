// Catalog of metrics available in the screener.
// Each metric resolves to a number given a history series (closes + timestamps).

const DAY_MS = 86_400_000;

function lastClose(h) {
  return h.closes[h.closes.length - 1];
}

function prevClose(h) {
  return h.closes.length >= 2 ? h.closes[h.closes.length - 2] : null;
}

function sliceByDays(h, days) {
  const cutoff = Date.now() - days * DAY_MS;
  const out = [];
  for (let i = 0; i < h.timestamps.length; i++) {
    if (h.timestamps[i] >= cutoff) out.push(h.closes[i]);
  }
  return out;
}

function smaLast(h, n) {
  const slice = h.closes.slice(-n);
  if (slice.length < n) return null;
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

export const METRIC_GROUPS = [
  {
    label: "Price",
    metrics: [
      { key: "price", label: "Price", unit: "", compute: (h) => lastClose(h) },
      { key: "change_pct_1d", label: "1-day % change", unit: "%", compute: (h) => {
        const p = prevClose(h);
        const c = lastClose(h);
        return p ? ((c - p) / p) * 100 : null;
      } },
    ],
  },
  {
    label: "Moving averages",
    metrics: [
      { key: "ma_20", label: "20-day SMA", unit: "", compute: (h) => smaLast(h, 20) },
      { key: "ma_50", label: "50-day SMA", unit: "", compute: (h) => smaLast(h, 50) },
      { key: "ma_200", label: "200-day SMA", unit: "", compute: (h) => smaLast(h, 200) },
    ],
  },
  {
    label: "Momentum",
    metrics: [
      { key: "rsi_14", label: "14-day RSI", unit: "", compute: (h) => {
        const closes = h.closes;
        if (closes.length < 15) return null;
        let gains = 0, losses = 0;
        for (let i = closes.length - 14; i < closes.length; i++) {
          const d = closes[i] - closes[i - 1];
          if (d >= 0) gains += d; else losses += -d;
        }
        if (losses === 0) return 100;
        const rs = gains / losses;
        return 100 - 100 / (1 + rs);
      } },
    ],
  },
  {
    label: "Highs",
    metrics: [
      { key: "price_max_30", label: "30-day high", unit: "", compute: (h) => {
        const w = sliceByDays(h, 30); return w.length ? Math.max(...w) : null;
      } },
      { key: "price_max_90", label: "90-day high", unit: "", compute: (h) => {
        const w = sliceByDays(h, 90); return w.length ? Math.max(...w) : null;
      } },
      { key: "price_max_180", label: "180-day high", unit: "", compute: (h) => {
        const w = sliceByDays(h, 180); return w.length ? Math.max(...w) : null;
      } },
      { key: "price_max_360", label: "360-day high", unit: "", compute: (h) => {
        const w = sliceByDays(h, 360); return w.length ? Math.max(...w) : null;
      } },
    ],
  },
  {
    label: "Lows",
    metrics: [
      { key: "price_min_30", label: "30-day low", unit: "", compute: (h) => {
        const w = sliceByDays(h, 30); return w.length ? Math.min(...w) : null;
      } },
      { key: "price_min_90", label: "90-day low", unit: "", compute: (h) => {
        const w = sliceByDays(h, 90); return w.length ? Math.min(...w) : null;
      } },
      { key: "price_min_180", label: "180-day low", unit: "", compute: (h) => {
        const w = sliceByDays(h, 180); return w.length ? Math.min(...w) : null;
      } },
    ],
  },
  {
    label: "Distance from extremes",
    metrics: [
      { key: "pct_from_max_180", label: "% off 180-day high", unit: "%", compute: (h) => {
        const w = sliceByDays(h, 180);
        if (!w.length) return null;
        const hi = Math.max(...w);
        return ((lastClose(h) - hi) / hi) * 100;
      } },
      { key: "pct_from_min_180", label: "% above 180-day low", unit: "%", compute: (h) => {
        const w = sliceByDays(h, 180);
        if (!w.length) return null;
        const lo = Math.min(...w);
        return ((lastClose(h) - lo) / lo) * 100;
      } },
    ],
  },
];

export const METRICS = METRIC_GROUPS.flatMap((g) => g.metrics);
export const METRIC_BY_KEY = Object.fromEntries(METRICS.map((m) => [m.key, m]));

export const OPERATORS = [
  { key: "lt", label: "<", apply: (a, b) => a < b },
  { key: "lte", label: "≤", apply: (a, b) => a <= b },
  { key: "gt", label: ">", apply: (a, b) => a > b },
  { key: "gte", label: "≥", apply: (a, b) => a >= b },
  { key: "between", label: "between", apply: (a, b, c) => a >= b && a <= c },
];

export const OPERATOR_BY_KEY = Object.fromEntries(OPERATORS.map((o) => [o.key, o]));

// Compute every metric for a single ticker. Returns { metricKey: value | null }.
export function computeMetrics(history) {
  const out = {};
  for (const m of METRICS) {
    try {
      const v = m.compute(history);
      out[m.key] = Number.isFinite(v) ? v : null;
    } catch {
      out[m.key] = null;
    }
  }
  return out;
}

// Evaluate a single condition against precomputed metrics.
// Right-hand side can be a number or a {metric, factor} reference.
export function evalCondition(cond, metrics) {
  const left = metrics[cond.metric];
  if (left == null) return null;
  const op = OPERATOR_BY_KEY[cond.op];
  if (!op) return null;
  const resolveRhs = (value) => {
    if (value == null || value === "") return null;
    if (typeof value === "number") return value;
    if (typeof value === "object" && value.kind === "metric") {
      const m = metrics[value.metric];
      if (m == null) return null;
      return value.factor != null ? m * value.factor : m;
    }
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };
  if (cond.op === "between") {
    const lo = resolveRhs(cond.value);
    const hi = resolveRhs(cond.value2);
    if (lo == null || hi == null) return null;
    return op.apply(left, lo, hi);
  }
  const rhs = resolveRhs(cond.value);
  if (rhs == null) return null;
  return op.apply(left, rhs);
}
