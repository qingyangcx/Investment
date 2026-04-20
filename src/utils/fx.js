// Free FX rates (base USD). Cached in localStorage for 12h.
const CACHE_KEY = "vl-fx-rates";
const TTL_MS = 12 * 60 * 60 * 1000;
const URL = "https://open.er-api.com/v6/latest/USD";

let inflight = null;

export async function getRates() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.ts < TTL_MS && parsed.rates) return parsed.rates;
    }
  } catch {}

  if (!inflight) {
    inflight = fetch(URL)
      .then((r) => r.json())
      .then((data) => {
        const rates = data?.rates;
        if (!rates) throw new Error("no rates");
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), rates }));
        } catch {}
        return rates;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

// Convert amount from `from` currency to `to` currency using USD-based rates.
export function convert(amount, from, to, rates) {
  if (amount == null || !rates) return amount;
  if (from === to) return amount;
  const rFrom = from === "USD" ? 1 : rates[from];
  const rTo = to === "USD" ? 1 : rates[to];
  if (!rFrom || !rTo) return amount;
  // amount in USD = amount / rFrom; in target = usd * rTo
  return (amount / rFrom) * rTo;
}
