import { evalExpr } from "./exprEval";
import { resolveVariable } from "./exprVariables";

// Given a list of signal rules and a ticker's price history, evaluate any rule
// whose formula fires. Each rule shape: { id, name, expr, signal: "buy"|"sell" }.
// Returns { buy: [{rule, vars}], sell: [{rule, vars}] }.
export function computeSignals(rules, history) {
  const buy = [];
  const sell = [];
  if (!history || !history.closes?.length) return { buy, sell };

  for (const r of rules) {
    if (!r.expr || !r.signal) continue;
    const seen = {};
    let passed = false;
    try {
      passed = !!evalExpr(r.expr, (name) => {
        const v = resolveVariable(name, history);
        if (v != null) seen[name] = v;
        return v;
      });
    } catch {
      continue;
    }
    if (!passed) continue;
    const entry = { rule: r, vars: seen };
    if (r.signal === "buy") buy.push(entry);
    else if (r.signal === "sell") sell.push(entry);
  }

  return { buy, sell };
}
