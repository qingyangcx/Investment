const CORS_PROXY = "https://corsproxy.io/?url=";
const CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart";

export async function fetchHistory(ticker, range = "1y") {
  const targetUrl = `${CHART_URL}/${encodeURIComponent(ticker)}?range=${range}&interval=1d`;
  const res = await fetch(`${CORS_PROXY}${encodeURIComponent(targetUrl)}`);
  if (!res.ok) return null;
  const data = await res.json();
  const result = data.chart?.result?.[0];
  if (!result) return null;
  const timestamps = result.timestamp || [];
  const closes = result.indicators?.quote?.[0]?.close || [];
  // Filter out null closes (holidays / pre-IPO)
  const series = [];
  for (let i = 0; i < timestamps.length; i++) {
    if (closes[i] != null) series.push({ t: timestamps[i] * 1000, close: closes[i] });
  }
  return {
    timestamps: series.map((p) => p.t),
    closes: series.map((p) => p.close),
  };
}
