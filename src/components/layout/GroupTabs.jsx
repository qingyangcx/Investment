import { useState } from "react";
import { COLORS } from "../../theme/colors";
import { FONT_BODY } from "../../theme/fonts";

export function GroupTabs({ groups, activeGroup, onSelect, onAddGroup, onDeleteGroup, onSearch }) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    const name = newName.trim();
    if (name) {
      onAddGroup(name);
      setNewName("");
      setAdding(false);
    }
  };

  const tabStyle = (isActive) => ({
    fontFamily: FONT_BODY,
    fontSize: 13,
    fontWeight: isActive ? 600 : 400,
    color: isActive ? COLORS.bg : COLORS.textMuted,
    background: isActive ? COLORS.gold : COLORS.surfaceLight,
    border: "none",
    borderRadius: 16,
    padding: "6px 14px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    flexShrink: 0,
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 52,
        left: 0,
        right: 0,
        background: COLORS.surface,
        borderBottom: `1px solid ${COLORS.border}`,
        padding: "8px 16px",
        display: "flex",
        gap: 8,
        overflowX: "auto",
        zIndex: 99,
        scrollbarWidth: "none",
      }}
    >
      <button style={tabStyle(activeGroup === null)} onClick={() => onSelect(null)}>
        All
      </button>
      {groups.map((g) => (
        <button
          key={g.id}
          style={tabStyle(activeGroup === g.id)}
          onClick={() => onSelect(g.id)}
          onContextMenu={(e) => {
            e.preventDefault();
            if (confirm(`Delete group "${g.name}"?`)) onDeleteGroup(g.id);
          }}
        >
          {g.name}
        </button>
      ))}
      {adding ? (
        <input
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
            if (e.key === "Escape") { setAdding(false); setNewName(""); }
          }}
          onBlur={handleAdd}
          placeholder="Group name"
          style={{
            fontFamily: FONT_BODY,
            fontSize: 13,
            background: COLORS.surfaceLight,
            color: COLORS.text,
            border: `1px solid ${COLORS.borderLight}`,
            borderRadius: 16,
            padding: "6px 12px",
            outline: "none",
            width: 100,
            flexShrink: 0,
          }}
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{
            ...tabStyle(false),
            color: COLORS.gold,
            fontSize: 16,
            padding: "4px 12px",
          }}
        >
          +
        </button>
      )}
      <button
        onClick={onSearch}
        style={{
          background: COLORS.gold,
          color: COLORS.bg,
          border: "none",
          borderRadius: 16,
          width: 32,
          height: 32,
          fontSize: 16,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginLeft: "auto",
        }}
      >
        🔍
      </button>
    </div>
  );
}
