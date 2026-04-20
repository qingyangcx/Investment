import { COLORS } from "../../theme/colors";
import { FONT_BODY } from "../../theme/fonts";

const TABS = [
  { key: "company", label: "Company", icon: "◇" },
  { key: "checklist", label: "Checklist", icon: "☑" },
];

export function BottomNav({ active, onSelect }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 56,
        background: COLORS.surface,
        borderTop: `1px solid ${COLORS.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 100,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onSelect(tab.key)}
            style={{
              background: "none",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              cursor: "pointer",
              padding: "6px 16px",
            }}
          >
            <span style={{ fontSize: 20, color: isActive ? COLORS.gold : COLORS.textDim }}>
              {tab.icon}
            </span>
            <span
              style={{
                fontFamily: FONT_BODY,
                fontSize: 11,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? COLORS.gold : COLORS.textDim,
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
