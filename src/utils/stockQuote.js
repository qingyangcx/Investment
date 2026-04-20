const CORS_PROXY = "https://corsproxy.io/?url=";
const CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart";

async function fetchOne(ticker) {
  const targetUrl = `${CHART_URL}/${encodeURIComponent(ticker)}?range=1d&interval=1d`;
  const res = await fetch(`${CORS_PROXY}${encodeURIComponent(targetUrl)}`);
  if (!res.ok) return null;
  const data = await res.json();
  const meta = data.chart?.result?.[0]?.meta;
  if (!meta) return null;
  const price = meta.regularMarketPrice;
  const prevClose = meta.chartPreviousClose ?? meta.previousClose;
  const change = prevClose ? price - prevClose : null;
  const changePercent = prevClose ? ((price - prevClose) / prevClose) * 100 : null;
  return {
    price,
    change,
    changePercent,
    previousClose: prevClose,
    currency: meta.currency || "USD",
  };
}

export async function fetchQuotes(tickers) {
  if (!tickers.length) return {};
  const results = {};
  const promises = tickers.map(async (ticker) => {
    try {
      const quote = await fetchOne(ticker);
      if (quote) results[ticker] = quote;
    } catch {
      // skip failed tickers
    }
  });
  await Promise.all(promises);
  return results;
}
