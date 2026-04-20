import { COLORS } from "../../theme/colors";
import { FONT_BODY } from "../../theme/fonts";

const labelStyle = {
  fontFamily: FONT_BODY,
  fontSize: 11,
  fontWeight: 600,
  color: COLORS.textMuted,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: 6,
  display: "block",
};

const inputStyle = {
  fontFamily: FONT_BODY,
  fontSize: 14,
  color: COLORS.text,
  background: COLORS.surfaceLight,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  padding: "10px 12px",
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
};

export function Field({ label, type = "text", value, onChange, placeholder, textarea, select, children, ...rest }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={labelStyle}>{label}</label>}
      {select ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...inputStyle, appearance: "auto" }}
          {...rest}
        >
          {children}
        </select>
      ) : textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
          {...rest}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
          {...rest}
        />
      )}
    </div>
  );
}
