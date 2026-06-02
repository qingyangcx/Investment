// User-selectable technical-indicator catalog. Picked metrics are stored by id
// in users/{uid}/metricSettings and surfaced wherever the app needs to render
// indicators (charts, cards, etc.).
//
// Categories are kept open-ended so we can add more without breaking storage.
// Each variant carries the parameters its computation needs.

export const METRIC_CATEGORIES = [
  {
    key: "ma",
    label: "Moving Average",
    description: "Smoothed price trend over a window.",
    variants: [
      { id: "sma_5",   label: "SMA 5",   params: { kind: "sma", period: 5 } },
      { id: "sma_10",  label: "SMA 10",  params: { kind: "sma", period: 10 } },
      { id: "sma_20",  label: "SMA 20",  params: { kind: "sma", period: 20 } },
      { id: "sma_50",  label: "SMA 50",  params: { kind: "sma", period: 50 } },
      { id: "sma_100", label: "SMA 100", params: { kind: "sma", period: 100 } },
      { id: "sma_200", label: "SMA 200", params: { kind: "sma", period: 200 } },
      { id: "ema_12",  label: "EMA 12",  params: { kind: "ema", period: 12 } },
      { id: "ema_26",  label: "EMA 26",  params: { kind: "ema", period: 26 } },
      { id: "ema_50",  label: "EMA 50",  params: { kind: "ema", period: 50 } },
    ],
  },
  {
    key: "rsi",
    label: "Relative Strength Index (RSI)",
    description: "Momentum oscillator, 0–100. Classic thresholds: <30 oversold, >70 overbought.",
    variants: [
      { id: "rsi_6",  label: "RSI 6",  params: { period: 6 } },
      { id: "rsi_14", label: "RSI 14", params: { period: 14 } },
      { id: "rsi_21", label: "RSI 21", params: { period: 21 } },
    ],
  },
  {
    key: "macd",
    label: "MACD",
    description: "Difference of two EMAs plus a signal-line EMA.",
    variants: [
      { id: "macd_12_26_9", label: "MACD 12 / 26 / 9", params: { fast: 12, slow: 26, signal: 9 } },
      { id: "macd_5_35_5",  label: "MACD 5 / 35 / 5",  params: { fast: 5, slow: 35, signal: 5 } },
    ],
  },
  {
    key: "boll",
    label: "Bollinger Bands",
    description: "SMA ± N standard deviations.",
    variants: [
      { id: "boll_20_2",  label: "BOLL 20, 2σ",  params: { period: 20, mult: 2 } },
      { id: "boll_10_2",  label: "BOLL 10, 2σ",  params: { period: 10, mult: 2 } },
      { id: "boll_50_2",  label: "BOLL 50, 2σ",  params: { period: 50, mult: 2 } },
    ],
  },
  {
    key: "rvol",
    label: "Relative Volume (RVOL)",
    description: "Today's volume ÷ average over N sessions.",
    variants: [
      { id: "rvol_10", label: "RVOL 10", params: { period: 10 } },
      { id: "rvol_20", label: "RVOL 20", params: { period: 20 } },
      { id: "rvol_50", label: "RVOL 50", params: { period: 50 } },
    ],
  },
];

// Flat lookup for any variant by id.
export const VARIANT_BY_ID = (() => {
  const out = {};
  for (const cat of METRIC_CATEGORIES) {
    for (const v of cat.variants) {
      out[v.id] = { ...v, categoryKey: cat.key, categoryLabel: cat.label };
    }
  }
  return out;
})();
