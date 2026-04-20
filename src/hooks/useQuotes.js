import { useState, useEffect, useRef } from "react";
import { fetchQuotes } from "../utils/stockQuote";

const REFRESH_INTERVAL = 60_000; // 1 minute

export function useQuotes(tickers) {
  const [quotes, setQuotes] = useState({});
  const tickerKey = tickers.sort().join(",");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!tickers.length) return;

    const load = async () => {
      const data = await fetchQuotes(tickers);
      if (Object.keys(data).length > 0) setQuotes(data);
    };

    load();
    intervalRef.current = setInterval(load, REFRESH_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [tickerKey]);

  return quotes;
}
