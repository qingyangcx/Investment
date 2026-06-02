// Starter ticker universe for the Screener. User-extensible.
// Curated to keep network load reasonable on Yahoo's unofficial chart endpoint.

export const DEFAULT_UNIVERSE = [
  // US mega/large cap
  "AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "TSLA", "BRK-B",
  "JPM", "V", "MA", "JNJ", "WMT", "PG", "HD", "BAC",
  "XOM", "CVX", "KO", "PEP", "DIS", "NKE", "NFLX", "ADBE",
  "CRM", "AMD", "ORCL", "INTC", "PFE", "ABBV",
  // China ADRs
  "BABA", "JD", "BIDU", "PDD", "NIO", "LI", "TCOM",
  // HK
  "0700.HK", "9988.HK", "9618.HK", "1810.HK", "3690.HK",
];
