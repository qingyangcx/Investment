import { useEffect, useState } from "react";
import { fetchHistory } from "../utils/stockHistory";

// In-memory cache: ticker -> { history, fetchedAt }
const cache = new Map();
const TTL_MS = 6 * 60 * 60 * 1000; // 6 hours; daily closes don't move much intraday

export function useHistory(ticker) {
  const [history, setHistory] = useState(() => {
    const c = cache.get(ticker);
    return c && Date.now() - c.fetchedAt < TTL_MS ? c.history : null;
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ticker) {
      setHistory(null);
      setError(null);
      return;
    }
    const cached = cache.get(ticker);
    if (cached && Date.now() - cached.fetchedAt < TTL_MS) {
      setHistory(cached.history);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchHistory(ticker)
      .then((h) => {
        if (cancelled) return;
        if (h) {
          cache.set(ticker, { history: h, fetchedAt: Date.now() });
          setHistory(h);
        } else {
          setError("Could not load price history");
          setHistory(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message || "History fetch failed");
          setHistory(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ticker]);

  return { history, error, loading };
}
