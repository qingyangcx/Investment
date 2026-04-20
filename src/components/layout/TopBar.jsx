import { COLORS } from "../../theme/colors";
import { FONT_BODY } from "../../theme/fonts";

export function TopBar({ onLogout }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 52,
        background: COLORS.surface,
        borderBottom: `1px solid ${COLORS.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 16px",
        zIndex: 100,
      }}
    >
      {onLogout && (
        <button
          onClick={onLogout}
          style={{
            background: "none",
            border: `1px solid ${COLORS.border}`,
            borderRadius: 6,
            color: COLORS.textMuted,
            fontSize: 12,
            padding: "4px 12px",
            cursor: "pointer",
            fontFamily: FONT_BODY,
          }}
        >
          Sign Out
        </button>
      )}
    </div>
  );
}
