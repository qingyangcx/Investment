import { useEffect, useState } from "react";
import { fetchHistory } from "../utils/stockHistory";

// Shared in-memory cache so the same tickers don't refetch across hook instances.
const cache = new Map(); // ticker -> { history, fetchedAt }
const TTL_MS = 6 * 60 * 60 * 1000;
const CONCURRENCY = 4;

async function withConcurrency(items, limit, work) {
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      await work(items[idx]);
    }
  });
  await Promise.all(workers);
}

export function useWatchHistory(tickers) {
  const [histories, setHistories] = useState(() => {
    const out = {};
    for (const t of tickers) {
      const c = cache.get(t);
      if (c && Date.now() - c.fetchedAt < TTL_MS) out[t] = c.history;
    }
    return out;
  });

  const tickerKey = tickers.slice().sort().join(",");

  useEffect(() => {
    if (!tickers.length) {
      setHistories({});
      return;
    }
    let cancelled = false;

    // Hydrate from cache immediately, kick off fetches for the rest.
    const initial = {};
    const missing = [];
    for (const t of tickers) {
      const c = cache.get(t);
      if (c && Date.now() - c.fetchedAt < TTL_MS) initial[t] = c.history;
      else missing.push(t);
    }
    setHistories(initial);
    if (!missing.length) return;

    withConcurrency(missing, CONCURRENCY, async (ticker) => {
      try {
        const h = await fetchHistory(ticker);
        if (cancelled) return;
        if (h) {
          cache.set(ticker, { history: h, fetchedAt: Date.now() });
          setHistories((prev) => ({ ...prev, [ticker]: h }));
        }
      } catch {
        // skip failed tickers
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickerKey]);

  return histories;
}
