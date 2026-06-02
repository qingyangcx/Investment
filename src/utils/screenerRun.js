import { fetchHistory } from "./stockHistory";
import { computeMetrics, evalCondition } from "./screenerMetrics";

const historyCache = new Map(); // ticker -> { history, fetchedAt }
const TTL_MS = 6 * 60 * 60 * 1000;
const CONCURRENCY = 6;

async function getHistory(ticker) {
  const c = historyCache.get(ticker);
  if (c && Date.now() - c.fetchedAt < TTL_MS) return c.history;
  const h = await fetchHistory(ticker);
  if (h) historyCache.set(ticker, { history: h, fetchedAt: Date.now() });
  return h;
}

async function processTicker(ticker, conditions) {
  try {
    const history = await getHistory(ticker);
    if (!history || !history.closes.length) {
      return { ticker, ok: false, error: "no history" };
    }
    const metrics = computeMetrics(history);
    const conditionResults = conditions.map((c) => ({
      id: c.id,
      passed: evalCondition(c, metrics),
    }));
    const passedCount = conditionResults.filter((r) => r.passed === true).length;
    const failedCount = conditionResults.filter((r) => r.passed === false).length;
    const allPassed = conditions.length > 0 && passedCount === conditions.length;
    return {
      ticker,
      ok: true,
      metrics,
      conditionResults,
      passedCount,
      failedCount,
      allPassed,
    };
  } catch (e) {
    return { ticker, ok: false, error: e.message || "error" };
  }
}

// Run the screener with bounded concurrency. Calls onProgress({done,total}) as tickers complete.
export async function runScreener(universe, conditions, onProgress) {
  const total = universe.length;
  let done = 0;
  const results = [];
  let cursor = 0;

  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= universe.length) return;
      const r = await processTicker(universe[i], conditions);
      results.push(r);
      done++;
      onProgress?.({ done, total });
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, total) }, worker);
  await Promise.all(workers);
  return results;
}
