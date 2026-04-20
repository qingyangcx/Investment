import { COLORS } from "../../theme/colors";
import { FONT_BODY } from "../../theme/fonts";
import { Field } from "../shared/Field";
import { calcDCF } from "../../utils/dcf";

export function ValuationTab({ form, setField }) {
  const v = form.valuation;

  const setVal = (key, value) => {
    setField("valuation", { ...v, [key]: value });
  };

  const handleCalc = () => {
    const result = calcDCF(v, form.targets.marginOfSafety);
    if (!result) {
      alert("Enter a positive Free Cash Flow to calculate.");
      return;
    }
    setField("valuation", { ...v, intrinsicValue: result.intrinsicValue });
    setField("targets", {
      ...form.targets,
      intrinsicValue: result.intrinsicValue,
      buyPrice: result.buyPrice,
      sellPrice: result.sellPrice,
    });
  };

  return (
    <div>
      <Field
        label="Current Free Cash Flow ($M)"
        type="number"
        value={v.currentFCF || ""}
        onChange={(val) => setVal("currentFCF", Number(val))}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field
          label="Growth Rate (%)"
          type="number"
          value={v.growthRate}
          onChange={(val) => setVal("growthRate", Number(val))}
        />
        <Field
          label="Discount Rate (%)"
          type="number"
          value={v.discountRate}
          onChange={(val) => setVal("discountRate", Number(val))}
        />
        <Field
          label="Terminal Growth (%)"
          type="number"
          value={v.terminalGrowth}
          onChange={(val) => setVal("terminalGrowth", Number(val))}
        />
        <Field
          label="Projection Years"
          type="number"
          value={v.yearsProjected}
          onChange={(val) => setVal("yearsProjected", Number(val))}
        />
      </div>
      <button
        onClick={handleCalc}
        style={{
          fontFamily: FONT_BODY,
          width: "100%",
          padding: "12px",
          fontSize: 14,
          fontWeight: 600,
          color: COLORS.bg,
          background: COLORS.gold,
          border: "none",
          borderRadius: 10,
          cursor: "pointer",
          marginBottom: 14,
        }}
      >
        Calculate Intrinsic Value
      </button>
      {v.intrinsicValue != null && (
        <div
          style={{
            background: COLORS.surfaceLight,
            borderRadius: 10,
            padding: 16,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4, textTransform: "uppercase" }}>
            Estimated Intrinsic Value
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.gold }}>
            ${v.intrinsicValue.toLocaleString()}M
          </div>
        </div>
      )}
    </div>
  );
}
