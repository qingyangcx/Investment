import { useMemo, useState } from "react";
import { COLORS } from "../../theme/colors";
import { FONT_BODY, FONT_HEADING } from "../../theme/fonts";
import { METRIC_BY_KEY } from "../../utils/screenerMetrics";

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

function fmtNumber(v, unit) {
  if (v == null || !Number.isFinite(v)) return "—";
  if (unit === "%") return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
  return Math.abs(v) >= 1000 ? v.toFixed(0) : v.toFixed(2);
}

export function ScreenerResults({ results, conditions, existingTickers, onAdd }) {
  const [sortBy, setSortBy] = useState("passedCount"); // "passedCount" | "price" | "ticker"
  const [sortDir, setSortDir] = useState("desc");
  const [onlyPassing, setOnlyPassing] = useState(true);

  const sorted = useMemo(() => {
    const ok = results.filter((r) => r.ok);
    const filtered = onlyPassing
      ? ok.filter((r) => r.allPassed)
      : ok;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      let av, bv;
      if (sortBy === "passedCount") {
        av = a.passedCount;
        bv = b.passedCount;
      } else if (sortBy === "ticker") {
        return dir * a.ticker.localeCompare(b.ticker);
      } else {
        av = a.metrics?.[sortBy] ?? -Infinity;
        bv = b.metrics?.[sortBy] ?? -Infinity;
      }
      return dir * (bv - av);
    });
  }, [results, sortBy, sortDir, onlyPassing]);

  const failures = results.filter((r) => !r.ok);

  const setSort = (key) => {
    if (sortBy === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSortBy(key);
      setSortDir("desc");
    }
  };

  if (results.length === 0) return null;

  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily: FONT_HEADING,
            fontSize: 13,
            color: COLORS.gold,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            fontWeight: 600,
          }}
        >
          Results · {sorted.length}
          {!onlyPassing && (
            <span style={{ color: COLORS.textDim, fontWeight: 400 }}>
              {" "}
              of {results.filter((r) => r.ok).length}
            </span>
          )}
        </span>
        <button
          onClick={() => setOnlyPassing((v) => !v)}
          style={{
            fontFamily: FONT_BODY,
            fontSize: 11,
            color: onlyPassing ? COLORS.bg : COLORS.gold,
            background: onlyPassing ? COLORS.gold : COLORS.surfaceLight,
            border: `1px solid ${onlyPassing ? COLORS.gold : COLORS.border}`,
            borderRadius: 6,
            padding: "4px 10px",
            cursor: "pointer",
          }}
        >
          {onlyPassing ? "✓ Passing only" : "Show all"}
        </button>
      </div>

      <div
        style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 8,
          overflow: "auto",
          marginBottom: 8,
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: FONT_BODY,
            fontSize: 12,
          }}
        >
          <thead>
            <tr style={{ color: COLORS.textDim, background: COLORS.surfaceLight }}>
              <Th onClick={() => setSort("ticker")} active={sortBy === "ticker"} dir={sortDir}>
                Ticker
              </Th>
              <Th onClick={() => setSort("price")} active={sortBy === "price"} dir={sortDir} align="right">
                Price
              </Th>
              <Th
                onClick={() => setSort("change_pct_1d")}
                active={sortBy === "change_pct_1d"}
                dir={sortDir}
                align="right"
              >
                1d %
              </Th>
              {conditions.map((c, i) => (
                <th
                  key={c.id}
                  title={describeCondition(c)}
                  style={thStyleBase}
                >
                  C{i + 1}
                </th>
              ))}
              <Th
                onClick={() => setSort("passedCount")}
                active={sortBy === "passedCount"}
                dir={sortDir}
                align="right"
              >
                Pass
              </Th>
              <th style={thStyleBase} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.ticker} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                <td style={{ ...tdStyle, color: COLORS.gold, fontWeight: 700 }}>
                  {r.ticker}
                </td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  {fmtNumber(r.metrics?.price)}
                </td>
                <td
                  style={{
                    ...tdStyle,
                    textAlign: "right",
                    color:
                      r.metrics?.change_pct_1d == null
                        ? COLORS.textDim
                        : r.metrics.change_pct_1d >= 0
                        ? COLORS.green
                        : COLORS.red,
                  }}
                >
                  {fmtNumber(r.metrics?.change_pct_1d, "%")}
                </td>
                {r.conditionResults.map((cr) => (
                  <td key={cr.id} style={{ ...tdStyle, textAlign: "center" }}>
                    {cr.passed === true ? (
                      <span style={{ color: COLORS.green, fontWeight: 700 }}>✓</span>
                    ) : cr.passed === false ? (
                      <span style={{ color: COLORS.red, fontWeight: 700 }}>×</span>
                    ) : (
                      <span style={{ color: COLORS.textDim }}>·</span>
                    )}
                  </td>
                ))}
                <td
                  style={{
                    ...tdStyle,
                    textAlign: "right",
                    fontWeight: 700,
                    color: r.allPassed ? COLORS.green : COLORS.text,
                  }}
                >
                  {r.passedCount}/{conditions.length}
                </td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  {existingTickers.includes(r.ticker) ? (
                    <span style={{ color: COLORS.textDim, fontSize: 10 }}>★</span>
                  ) : (
                    <button
                      onClick={() => onAdd(r.ticker)}
                      style={{
                        fontFamily: FONT_BODY,
                        fontSize: 10,
                        fontWeight: 600,
                        color: COLORS.gold,
                        background: "none",
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 4,
                        padding: "1px 6px",
                        cursor: "pointer",
                      }}
                    >
                      + Watch
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={4 + conditions.length}
                  style={{
                    ...tdStyle,
                    textAlign: "center",
                    color: COLORS.textDim,
                    padding: "24px 8px",
                  }}
                >
                  No matches.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Condition legend */}
      <div
        style={{
          fontFamily: MONO,
          fontSize: 10,
          color: COLORS.textDim,
          lineHeight: 1.6,
        }}
      >
        {conditions.map((c, i) => (
          <div key={c.id}>
            C{i + 1}: {describeCondition(c)}
          </div>
        ))}
      </div>

      {failures.length > 0 && (
        <div
          style={{
            marginTop: 12,
            fontFamily: FONT_BODY,
            fontSize: 11,
            color: COLORS.textDim,
          }}
        >
          {failures.length} ticker(s) failed to load:{" "}
          {failures.map((f) => f.ticker).join(", ")}
        </div>
      )}
    </div>
  );
}

function describeCondition(c) {
  const m = METRIC_BY_KEY[c.metric];
  const left = m?.label || c.metric;
  const opSymbol = { lt: "<", lte: "≤", gt: ">", gte: "≥", between: "between" }[c.op] || c.op;
  let right;
  if (c.op === "between") {
    right = `${c.value} – ${c.value2}`;
  } else if (typeof c.value === "object" && c.value?.kind === "metric") {
    const rm = METRIC_BY_KEY[c.value.metric];
    const factor = c.value.factor ?? 1;
    right = `${factor !== 1 ? factor + " × " : ""}${rm?.label || c.value.metric}`;
  } else {
    right = c.value ?? "?";
  }
  return `${left} ${opSymbol} ${right}`;
}

function Th({ children, onClick, active, dir, align = "left" }) {
  return (
    <th
      onClick={onClick}
      style={{
        ...thStyleBase,
        textAlign: align,
        cursor: "pointer",
        color: active ? COLORS.gold : COLORS.textDim,
        userSelect: "none",
      }}
    >
      {children} {active ? (dir === "desc" ? "▼" : "▲") : ""}
    </th>
  );
}

const thStyleBase = {
  fontFamily: FONT_BODY,
  fontSize: 10,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  padding: "6px 8px",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "6px 8px",
  color: COLORS.text,
  whiteSpace: "nowrap",
};
