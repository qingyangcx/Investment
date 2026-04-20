import { COLORS } from "../../theme/colors";
import { FONT_BODY } from "../../theme/fonts";

export function EmptyState({ message = "No companies yet. Tap + to add one." }) {
  return (
    <div
      style={{
        fontFamily: FONT_BODY,
        color: COLORS.textDim,
        textAlign: "center",
        padding: "60px 20px",
        fontSize: 14,
      }}
    >
      {message}
    </div>
  );
}
