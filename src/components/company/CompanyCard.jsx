import { COLORS } from "../../theme/colors";
import { FONT_BODY, FONT_HEADING } from "../../theme/fonts";
import { computeScoreByKind, scoreColor } from "../../utils/scorecard";

function formatPrice(price, currency) {
  return `${price.toFixed(2)} ${currency || "USD"}`;
}

function SignalChip({ kind, count, title }) {
  const isBuy = kind === "buy";
  const color = isBuy ? COLORS.green : COLORS.red;
  const bg = isBuy ? COLORS.greenBg : COLORS.redBg;
  return (
    <span
      title={title}
      style={{
        fontFamily: FONT_BODY,
        fontSize: 10,
        fontWeight: 800,
        color,
        background: bg,
        border: `1px solid ${color}`,
        borderRadius: 4,
        padding: "1px 6px",
        letterSpacing: "0.5px",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {isBuy ? "BUY" : "SELL"}
      {count > 1 ? ` ×${count}` : ""}
    </span>
  );
}

function ScoreBadge({ letter, score }) {
  if (!score || score.total === 0) return null;
  const answered = score.passed + score.failed;
  if (answered === 0) return null;
  const color = scoreColor(score.ratio, COLORS);
  return (
    <span
      title={`${letter === "F" ? "Fundamental" : "Technical"}: ${score.passed} pass · ${score.failed} fail · ${score.na} N/A · ${score.untouched} to do`}
      style={{
        fontFamily: FONT_BODY,
        fontSize: 10,
        fontWeight: 700,
        color,
        background: COLORS.surfaceLight,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 4,
        padding: "1px 6px",
        letterSpacing: "0.5px",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {letter} {score.passed}/{answered}
    </span>
  );
}

export function CompanyCard({ company, quote, onClick, criteria = [], signals }) {
  const price = quote?.price;
  const currency = quote?.currency;
  const changePercent = quote?.changePercent;
  const isUp = changePercent != null && changePercent >= 0;
  const changeColor = changePercent == null ? COLORS.textDim : isUp ? COLORS.red : COLORS.green;

  const scores = criteria.length > 0 ? computeScoreByKind(criteria, company.scorecard) : null;
  const buyCount = signals?.buy?.length || 0;
  const sellCount = signals?.sell?.length || 0;

  return (
    <div
      onClick={onClick}
      style={{
        fontFamily: FONT_BODY,
        background: COLORS.surface,
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 8,
        cursor: "pointer",
        border: `1px solid ${COLORS.border}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span
            style={{
              fontFamily: FONT_HEADING,
              fontSize: 16,
              fontWeight: 700,
              color: COLORS.gold,
            }}
          >
            {company.ticker || "—"}
          </span>
          {buyCount > 0 && (
            <SignalChip
              kind="buy"
              count={buyCount}
              title={signals.buy.map((s) => s.rule.name).join("\n")}
            />
          )}
          {sellCount > 0 && (
            <SignalChip
              kind="sell"
              count={sellCount}
              title={signals.sell.map((s) => s.rule.name).join("\n")}
            />
          )}
          {scores && (
            <>
              <ScoreBadge letter="F" score={scores.fundamental} />
              <ScoreBadge letter="T" score={scores.technical} />
            </>
          )}
        </div>
        <div
          style={{
            fontSize: 13,
            color: COLORS.textMuted,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {company.name || "Untitled"}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, marginLeft: 12 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: price != null ? COLORS.text : COLORS.textDim,
            textAlign: "right",
            width: 100,
          }}
        >
          {price != null ? formatPrice(price, currency) : "—"}
        </div>
        {changePercent != null ? (
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: changeColor,
              background: isUp ? COLORS.redBg : changePercent < 0 ? COLORS.greenBg : "transparent",
              padding: "4px 8px",
              borderRadius: 6,
              width: 60,
              boxSizing: "border-box",
              textAlign: "center",
            }}
          >
            {isUp ? "+" : ""}
            {changePercent.toFixed(2)}%
          </div>
        ) : (
          <div style={{ width: 60 }} />
        )}
        <div
          style={{
            fontSize: 13,
            color: company.reasonablePrice ? COLORS.text : COLORS.textDim,
            textAlign: "right",
            width: 90,
          }}
        >
          {company.reasonablePrice ? formatPrice(company.reasonablePrice, currency) : "—"}
        </div>
      </div>
    </div>
  );
}
