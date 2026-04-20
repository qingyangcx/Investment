export function getSignal(targets) {
  if (!targets.currentPrice || !targets.buyPrice || !targets.sellPrice) return null;
  if (targets.currentPrice <= targets.buyPrice) return "BUY";
  if (targets.currentPrice >= targets.sellPrice) return "SELL";
  return "HOLD";
}
