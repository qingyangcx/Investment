import { COLORS } from "../../theme/colors";
import { FONT_BODY } from "../../theme/fonts";

const SIGNAL_STYLES = {
  BUY: { color: COLORS.green, bg: COLORS.greenBg },
  SELL: { color: COLORS.red, bg: COLORS.redBg },
  HOLD: { color: COLORS.gold, bg: "rgba(200,164,78,0.1)" },
};

export function SignalBadge({ signal }) {
  if (!signal) return <span style={{ color: COLORS.textDim, fontSize: 12 }}>—</span>;
  const s = SIGNAL_STYLES[signal];
  return (
    <span
      style={{
        fontFamily: FONT_BODY,
        fontSize: 11,
        fontWeight: 600,
        color: s.color,
        background: s.bg,
        padding: "3px 8px",
        borderRadius: 10,
      }}
    >
      {signal}
    </span>
  );
}
