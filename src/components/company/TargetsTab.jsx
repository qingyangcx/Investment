import { COLORS } from "../../theme/colors";
import { FONT_BODY } from "../../theme/fonts";
import { Field } from "../shared/Field";
import { getSignal } from "../../utils/signal";

export function TargetsTab({ form, setField }) {
  const t = form.targets;
  const signal = getSignal(t);

  const setTarget = (key, value) => {
    setField("targets", { ...t, [key]: Number(value) });
  };

  const signalColors = {
    BUY: { color: COLORS.green, label: "Below Buy Price", icon: "📗" },
    HOLD: { color: COLORS.gold, label: "Hold Zone", icon: "📙" },
    SELL: { color: COLORS.red, label: "Above Sell Price", icon: "📕" },
  };

  return (
    <div>
      <div style={{ maxWidth: 200 }}>
        <Field
          label="Reasonable Price ($)"
          type="number"
          min="0"
          value={form.reasonablePrice ?? ""}
          onChange={(v) => {
            if (!v) return setField("reasonablePrice", null);
            const n = Number(v);
            setField("reasonablePrice", n < 0 ? 0 : n);
          }}
          placeholder="Your target entry price"
        />
      </div>
      <Field
        label="Current Market Price ($)"
        type="number"
        value={t.currentPrice || ""}
        onChange={(v) => setTarget("currentPrice", v)}
      />
      <Field
        label="Intrinsic Value ($)"
        type="number"
        value={t.intrinsicValue || ""}
        onChange={(v) => setTarget("intrinsicValue", v)}
      />
      <Field
        label="Margin of Safety (%)"
        type="number"
        value={t.marginOfSafety}
        onChange={(v) => setTarget("marginOfSafety", v)}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field
          label="Buy Price ($)"
          type="number"
          value={t.buyPrice || ""}
          onChange={(v) => setTarget("buyPrice", v)}
        />
        <Field
          label="Sell Price ($)"
          type="number"
          value={t.sellPrice || ""}
          onChange={(v) => setTarget("sellPrice", v)}
        />
      </div>
      {signal && (
        <div
          style={{
            fontFamily: FONT_BODY,
            background: COLORS.surfaceLight,
            borderRadius: 10,
            padding: 16,
            textAlign: "center",
            marginTop: 8,
          }}
        >
          <div style={{ fontSize: 20, marginBottom: 4 }}>{signalColors[signal].icon}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: signalColors[signal].color }}>
            {signalColors[signal].label}
          </div>
          {t.currentPrice > 0 && t.intrinsicValue > 0 && (
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>
              {t.currentPrice < t.intrinsicValue
                ? `${Math.round((1 - t.currentPrice / t.intrinsicValue) * 100)}% discount to intrinsic`
                : `${Math.round((t.currentPrice / t.intrinsicValue - 1) * 100)}% premium to intrinsic`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
