import { useState } from "react";
import { COLORS } from "../theme/colors";
import { FONT_BODY, FONT_HEADING } from "../theme/fonts";
import { SUGGESTED_VARS } from "../utils/exprVariables";

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

export function SignalsView({ rules, onAdd, onUpdate, onDelete }) {
  const [name, setName] = useState("");
  const [expr, setExpr] = useState("");
  const [signal, setSignal] = useState("buy");

  const handleAdd = () => {
    if (!expr.trim()) return;
    onAdd({ name: name.trim() || "Untitled rule", expr: expr.trim(), signal });
    setName("");
    setExpr("");
    setSignal("buy");
  };

  return (
    <div style={{ padding: "0 16px" }}>
      <div
        style={{
          fontFamily: FONT_BODY,
          fontSize: 12,
          color: COLORS.textMuted,
          padding: "0 0 12px",
          lineHeight: 1.5,
        }}
      >
        Define formulas that fire BUY or SELL chips on your watchlist when they
        evaluate true. Examples: <code>rsi_14 &lt; 30</code> (oversold buy),{" "}
        <code>price &gt; price_max_360</code> (52-week breakout).
      </div>

      {/* Add row */}
      <div
        style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 10,
          padding: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rule name, e.g. RSI oversold"
            style={{
              fontFamily: FONT_BODY,
              flex: 1,
              minWidth: 0,
              fontSize: 13,
              color: COLORS.text,
              background: COLORS.surfaceLight,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              padding: "8px 10px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <SignalToggle value={signal} onChange={setSignal} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="formula, e.g. rsi_14 < 30"
            style={{
              fontFamily: MONO,
              flex: 1,
              minWidth: 0,
              fontSize: 13,
              color: COLORS.text,
              background: COLORS.surfaceLight,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              padding: "8px 10px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={handleAdd}
            style={{
              fontFamily: FONT_BODY,
              fontSize: 13,
              fontWeight: 600,
              color: COLORS.bg,
              background: COLORS.gold,
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            Add
          </button>
        </div>
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 10,
            color: COLORS.textDim,
            marginTop: 6,
            lineHeight: 1.5,
          }}
        >
          Vars: {SUGGESTED_VARS.map((v) => v.name).join(", ")}
        </div>
      </div>

      {/* Rules list */}
      <div
        style={{
          fontFamily: FONT_BODY,
          fontSize: 11,
          color: COLORS.textDim,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: 6,
        }}
      >
        Rules ({rules.length})
      </div>

      {rules.length === 0 && (
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 13,
            color: COLORS.textDim,
            textAlign: "center",
            padding: "24px 0",
            border: `1px dashed ${COLORS.border}`,
            borderRadius: 8,
          }}
        >
          No rules yet. Add one above.
        </div>
      )}

      {rules.map((r) => (
        <RuleRow key={r.id} rule={r} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  );
}

function RuleRow({ rule, onUpdate, onDelete }) {
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(rule.name);
  const [editingExpr, setEditingExpr] = useState(false);
  const [exprDraft, setExprDraft] = useState(rule.expr);

  const saveName = () => {
    const n = nameDraft.trim();
    if (n && n !== rule.name) onUpdate(rule.id, { name: n });
    setEditingName(false);
  };
  const saveExpr = () => {
    const e = exprDraft.trim();
    if (e && e !== rule.expr) onUpdate(rule.id, { expr: e });
    setEditingExpr(false);
  };

  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        padding: "10px 12px",
        marginBottom: 6,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {editingName ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => e.key === "Enter" && saveName()}
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
            onClick={() => { setNameDraft(rule.name); setEditingName(true); }}
            style={{
              fontFamily: FONT_HEADING,
              flex: 1,
              fontSize: 14,
              fontWeight: 600,
              color: COLORS.text,
              cursor: "pointer",
            }}
          >
            {rule.name}
          </span>
        )}
        <SignalToggle
          value={rule.signal}
          onChange={(next) => onUpdate(rule.id, { signal: next })}
          size="sm"
        />
        <button
          onClick={() => { if (confirm(`Delete rule "${rule.name}"?`)) onDelete(rule.id); }}
          style={{
            background: "none",
            border: "none",
            color: COLORS.textDim,
            fontSize: 16,
            cursor: "pointer",
            padding: "0 4px",
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
      <div style={{ paddingTop: 6 }}>
        {editingExpr ? (
          <input
            autoFocus
            value={exprDraft}
            onChange={(e) => setExprDraft(e.target.value)}
            onBlur={saveExpr}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveExpr();
              if (e.key === "Escape") {
                setExprDraft(rule.expr);
                setEditingExpr(false);
              }
            }}
            style={{
              fontFamily: MONO,
              width: "100%",
              fontSize: 12,
              color: COLORS.text,
              background: COLORS.surfaceLight,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 6,
              padding: "4px 8px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        ) : (
          <span
            onClick={() => { setExprDraft(rule.expr); setEditingExpr(true); }}
            style={{
              fontFamily: MONO,
              fontSize: 12,
              color: COLORS.gold,
              cursor: "pointer",
            }}
          >
            ƒ {rule.expr}
          </span>
        )}
      </div>
    </div>
  );
}

function SignalToggle({ value, onChange, size = "md" }) {
  const opts = [
    { v: "buy", label: "BUY", color: COLORS.green },
    { v: "sell", label: "SELL", color: COLORS.red },
  ];
  const isSmall = size === "sm";
  return (
    <div style={{ display: "inline-flex", gap: 2, flexShrink: 0 }}>
      {opts.map((o) => {
        const active = value === o.v;
        return (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            style={{
              fontFamily: FONT_BODY,
              fontSize: isSmall ? 10 : 11,
              fontWeight: 700,
              color: active ? COLORS.bg : o.color,
              background: active ? o.color : "transparent",
              border: `1px solid ${active ? o.color : COLORS.border}`,
              borderRadius: 6,
              padding: isSmall ? "2px 8px" : "4px 12px",
              cursor: "pointer",
              letterSpacing: "0.5px",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
