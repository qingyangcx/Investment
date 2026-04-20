export function calcDCF(valuation, marginOfSafety = 30) {
  const { currentFCF, growthRate, discountRate, terminalGrowth, yearsProjected } = valuation;
  if (!currentFCF || currentFCF <= 0) return null;

  const g = growthRate / 100;
  const d = discountRate / 100;
  const tg = terminalGrowth / 100;

  let totalPV = 0;
  let fcf = currentFCF;
  for (let i = 1; i <= yearsProjected; i++) {
    fcf *= 1 + g;
    totalPV += fcf / Math.pow(1 + d, i);
  }

  const terminalFCF = fcf * (1 + tg);
  const terminalValue = terminalFCF / (d - tg);
  const pvTerminal = terminalValue / Math.pow(1 + d, yearsProjected);

  const intrinsicValue = Math.round(totalPV + pvTerminal);
  const buyPrice = Math.round(intrinsicValue * (1 - marginOfSafety / 100));
  const sellPrice = Math.round(intrinsicValue * 1.2);

  return { intrinsicValue, buyPrice, sellPrice };
}
