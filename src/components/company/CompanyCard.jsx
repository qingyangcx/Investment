import { COLORS } from "../../theme/colors";
import { FONT_BODY, FONT_HEADING } from "../../theme/fonts";

function formatPrice(price, currency) {
  return `${price.toFixed(2)} ${currency || "USD"}`;
}

export function CompanyCard({ company, quote, onClick }) {
  const price = quote?.price;
  const currency = quote?.currency;
  const changePercent = quote?.changePercent;
  const isUp = changePercent != null && changePercent >= 0;
  const changeColor = changePercent == null ? COLORS.textDim : isUp ? COLORS.red : COLORS.green;

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
