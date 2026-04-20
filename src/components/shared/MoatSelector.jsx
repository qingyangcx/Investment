import { COLORS } from "../../theme/colors";
import { FONT_BODY } from "../../theme/fonts";
import { MOAT_TYPES } from "../../constants/moatTypes";

export function MoatSelector({ selected, onChange }) {
  const toggle = (moat) => {
    onChange(
      selected.includes(moat)
        ? selected.filter((m) => m !== moat)
        : [...selected, moat]
    );
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
      {MOAT_TYPES.map((moat) => {
        const active = selected.includes(moat);
        return (
          <button
            key={moat}
            type="button"
            onClick={() => toggle(moat)}
            style={{
              fontFamily: FONT_BODY,
              fontSize: 12,
              fontWeight: active ? 600 : 400,
              color: active ? COLORS.bg : COLORS.textMuted,
              background: active ? COLORS.gold : COLORS.surfaceLight,
              border: `1px solid ${active ? COLORS.gold : COLORS.border}`,
              borderRadius: 14,
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            {moat}
          </button>
        );
      })}
    </div>
  );
}
