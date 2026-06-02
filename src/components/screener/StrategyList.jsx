import { useState } from "react";
import { COLORS } from "../../theme/colors";
import { FONT_BODY, FONT_HEADING } from "../../theme/fonts";

export function StrategyList({ strategies, onOpen, onCreate, onDelete }) {
  const [newName, setNewName] = useState("");

  const handleCreate = () => {
    const name = newName.trim();
    onCreate(name || "Untitled strategy");
    setNewName("");
  };

  return (
    <div>
      <div
        style={{
          fontFamily: FONT_BODY,
          fontSize: 11,
          color: COLORS.textDim,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: 8,
        }}
      >
        Strategies ({strategies.length})
      </div>

      {strategies.length === 0 && (
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 13,
            color: COLORS.textDim,
            textAlign: "center",
            padding: "24px 0",
            border: `1px dashed ${COLORS.border}`,
            borderRadius: 8,
            marginBottom: 12,
            lineHeight: 1.6,
          }}
        >
          No strategies yet. <br />
          Create one to filter stocks by your conditions.
        </div>
      )}

      {strategies.map((s) => {
        const count = (s.conditions || []).length;
        const universeCount = (s.universe || []).length;
        return (
          <div
            key={s.id}
            onClick={() => onOpen(s.id)}
            style={{
              cursor: "pointer",
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: "12px 14px",
              marginBottom: 6,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: FONT_HEADING,
                  fontSize: 15,
                  fontWeight: 600,
                  color: COLORS.gold,
                  marginBottom: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {s.name || "Untitled"}
              </div>
              <div
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 11,
                  color: COLORS.textMuted,
                }}
              >
                {count} condition{count === 1 ? "" : "s"} ·{" "}
                {universeCount > 0 ? `${universeCount} tickers` : "default universe"}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete strategy "${s.name}"?`)) onDelete(s.id);
              }}
              style={{
                background: "none",
                border: "none",
                color: COLORS.textDim,
                fontSize: 16,
                cursor: "pointer",
                padding: "0 4px",
                lineHeight: 1,
              }}
              title="Delete strategy"
            >
              ×
            </button>
            <span style={{ color: COLORS.textDim, fontSize: 16 }}>›</span>
          </div>
        );
      })}

      {/* New strategy input */}
      <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="New strategy name…"
          style={{
            fontFamily: FONT_BODY,
            flex: 1,
            minWidth: 0,
            fontSize: 14,
            color: COLORS.text,
            background: COLORS.surfaceLight,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 10,
            padding: "10px 14px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={handleCreate}
          style={{
            fontFamily: FONT_BODY,
            fontSize: 14,
            fontWeight: 600,
            color: COLORS.bg,
            background: COLORS.gold,
            border: "none",
            borderRadius: 10,
            padding: "10px 16px",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          + New
        </button>
      </div>
    </div>
  );
}
