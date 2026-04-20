const YAHOO_URL = "https://query1.finance.yahoo.com/v1/finance/search";
const EASTMONEY_URL = "https://searchapi.eastmoney.com/api/suggest/get";
const CORS_PROXY = "https://corsproxy.io/?url=";

const hasChinese = (s) => /[\u4e00-\u9fff]/.test(s);

// Map East Money search result to Yahoo-compatible ticker
function mapEastMoneyItem(item) {
  const { Code, Name, Classify, JYS, SecurityTypeName } = item;
  if (Classify === "HK") {
    // Yahoo uses 4-digit code, e.g. "00700" -> "0700.HK", "03690" -> "3690.HK"
    const num = parseInt(Code, 10);
    if (!Number.isFinite(num)) return null;
    return {
      symbol: `${String(num).padStart(4, "0")}.HK`,
      name: Name,
      exchange: "Hong Kong",
      type: "EQUITY",
    };
  }
  if (Classify === "UsStock") {
    return {
      symbol: Code,
      name: Name,
      exchange: JYS || "US",
      type: "EQUITY",
    };
  }
  if (Classify === "AShare" || SecurityTypeName?.includes("A股")) {
    // JYS: "0" Shenzhen -> .SZ, "1" Shanghai -> .SS
    const suffix = JYS === "1" ? ".SS" : ".SZ";
    return {
      symbol: `${Code}${suffix}`,
      name: Name,
      exchange: JYS === "1" ? "Shanghai" : "Shenzhen",
      type: "EQUITY",
    };
  }
  return null;
}

async function searchEastMoney(query) {
  const targetUrl = `${EASTMONEY_URL}?input=${encodeURIComponent(
    query
  )}&type=14&token=D43BF722C8E33BDC906FB84D85E326E8&count=10`;
  const res = await fetch(`${CORS_PROXY}${encodeURIComponent(targetUrl)}`);
  if (!res.ok) throw new Error("East Money API error");
  const data = await res.json();
  const items = data?.QuotationCodeTable?.Data || [];
  return items
    .map(mapEastMoneyItem)
    .filter(Boolean)
    // dedupe by symbol
    .filter((v, i, arr) => arr.findIndex((x) => x.symbol === v.symbol) === i);
}

async function searchYahoo(query) {
  const targetUrl = `${YAHOO_URL}?q=${encodeURIComponent(
    query
  )}&quotesCount=8&newsCount=0&listsCount=0`;
  const res = await fetch(`${CORS_PROXY}${encodeURIComponent(targetUrl)}`);
  if (!res.ok) throw new Error("API error");
  const data = await res.json();
  return (data.quotes || [])
    .filter((q) => q.quoteType === "EQUITY" || q.quoteType === "ETF")
    .map((q) => ({
      symbol: q.symbol,
      name: q.shortname || q.longname || q.symbol,
      exchange: q.exchDisp || q.exchange || "",
      type: q.quoteType,
    }));
}

export async function searchStocks(query) {
  if (!query || query.length < 1) return [];
  try {
    if (hasChinese(query)) return await searchEastMoney(query);
    return await searchYahoo(query);
  } catch {
    return [];
  }
}
