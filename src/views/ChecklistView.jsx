import { useState } from "react";
import { COLORS } from "../theme/colors";
import { FONT_BODY } from "../theme/fonts";

export function ChecklistView({ items, onAdd, onToggle, onUpdate, onDelete }) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    const text = input.trim();
    if (!text) return;
    onAdd(text);
    setInput("");
  };

  const pending = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);

  return (
    <div style={{ padding: "0 16px" }}>
      {/* Add input */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add a checklist item..."
          style={{
            fontFamily: FONT_BODY,
            flex: 1,
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
          onClick={handleAdd}
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
          Add
        </button>
      </div>

      {/* Pending items */}
      {pending.map((item) => (
        <ChecklistItem
          key={item.id}
          item={item}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}

      {/* Done items */}
      {done.length > 0 && (
        <>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 11,
              color: COLORS.textDim,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              padding: "12px 0 6px",
            }}
          >
            Completed ({done.length})
          </div>
          {done.map((item) => (
            <ChecklistItem
              key={item.id}
              item={item}
              onToggle={onToggle}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </>
      )}

      {items.length === 0 && (
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 14,
            color: COLORS.textDim,
            textAlign: "center",
            padding: "40px 0",
          }}
        >
          No checklist items yet.
        </div>
      )}
    </div>
  );
}

function ChecklistItem({ item, onToggle, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(item.text);

  const save = () => {
    const trimmed = text.trim();
    if (trimmed && trimmed !== item.text) onUpdate(item.id, trimmed);
    setEditing(false);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        marginBottom: 6,
      }}
    >
      {/* Checkbox */}
      <div
        onClick={() => onToggle(item.id)}
        style={{
          width: 20,
          height: 20,
          borderRadius: 5,
          border: `2px solid ${item.done ? COLORS.green : COLORS.borderLight}`,
          background: item.done ? COLORS.green : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        {item.done && (
          <span style={{ color: COLORS.bg, fontSize: 12, fontWeight: 700 }}>✓</span>
        )}
      </div>

      {/* Text */}
      {editing ? (
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === "Enter" && save()}
          style={{
            fontFamily: FONT_BODY,
            flex: 1,
            fontSize: 14,
            color: COLORS.text,
            background: COLORS.surfaceLight,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 6,
            padding: "4px 8px",
            outline: "none",
          }}
        />
      ) : (
        <span
          onClick={() => { setText(item.text); setEditing(true); }}
          style={{
            fontFamily: FONT_BODY,
            flex: 1,
            fontSize: 14,
            color: item.done ? COLORS.textDim : COLORS.text,
            textDecoration: item.done ? "line-through" : "none",
            cursor: "pointer",
            wordBreak: "break-word",
          }}
        >
          {item.text}
        </span>
      )}

      {/* Delete */}
      <button
        onClick={() => onDelete(item.id)}
        style={{
          background: "none",
          border: "none",
          color: COLORS.textDim,
          fontSize: 16,
          cursor: "pointer",
          padding: "0 4px",
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}
