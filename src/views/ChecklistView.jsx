import { useMemo, useState } from "react";
import { COLORS } from "../theme/colors";
import { FONT_BODY, FONT_HEADING } from "../theme/fonts";
import { KIND_FUNDAMENTAL, KIND_TECHNICAL, getKind } from "../utils/scorecard";
import { SUGGESTED_VARS } from "../utils/exprVariables";

const CATEGORIES_BY_KIND = {
  [KIND_FUNDAMENTAL]: ["Business", "Moat", "Management", "Financials", "Valuation", "Risks"],
  [KIND_TECHNICAL]: ["Trend", "Momentum", "Support/Resistance", "Volume", "Pattern"],
};

const KIND_LABEL = {
  [KIND_FUNDAMENTAL]: "Fundamental",
  [KIND_TECHNICAL]: "Technical",
};

export function ChecklistView({ criteria, onAdd, onUpdate, onDelete }) {
  const [activeKind, setActiveKind] = useState(KIND_FUNDAMENTAL);
  const [text, setText] = useState("");
  const [expr, setExpr] = useState("");
  const [category, setCategory] = useState(CATEGORIES_BY_KIND[KIND_FUNDAMENTAL][0]);

  const visible = useMemo(
    () => criteria.filter((c) => getKind(c) === activeKind),
    [criteria, activeKind]
  );

  const grouped = useMemo(() => {
    const map = new Map();
    for (const c of visible) {
      const cat = c.category || "General";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(c);
    }
    return Array.from(map.entries());
  }, [visible]);

  const categories = useMemo(() => {
    const set = new Set(CATEGORIES_BY_KIND[activeKind]);
    visible.forEach((c) => c.category && set.add(c.category));
    return Array.from(set);
  }, [visible, activeKind]);

  const switchKind = (k) => {
    setActiveKind(k);
    setCategory(CATEGORIES_BY_KIND[k][0]);
  };

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const exprTrimmed = expr.trim();
    onAdd({
      text: trimmed,
      category,
      kind: activeKind,
      expr: activeKind === KIND_TECHNICAL && exprTrimmed ? exprTrimmed : null,
    });
    setText("");
    setExpr("");
  };

  return (
    <div style={{ padding: "0 16px" }}>
      {/* Kind toggle */}
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "0 0 12px",
        }}
      >
        {[KIND_FUNDAMENTAL, KIND_TECHNICAL].map((k) => {
          const active = activeKind === k;
          return (
            <button
              key={k}
              onClick={() => switchKind(k)}
              style={{
                fontFamily: FONT_BODY,
                fontSize: 13,
                fontWeight: 600,
                color: active ? COLORS.bg : COLORS.gold,
                background: active ? COLORS.gold : COLORS.surfaceLight,
                border: `1px solid ${active ? COLORS.gold : COLORS.border}`,
                borderRadius: 10,
                padding: "8px 16px",
                cursor: "pointer",
                flex: 1,
              }}
            >
              {KIND_LABEL[k]}
            </button>
          );
        })}
      </div>

      <div
        style={{
          fontFamily: FONT_BODY,
          fontSize: 12,
          color: COLORS.textMuted,
          padding: "0 0 12px",
          lineHeight: 1.5,
        }}
      >
        {activeKind === KIND_FUNDAMENTAL
          ? "Business quality, moat, management, financials — the long-term reasons to own."
          : "Trend, momentum, key levels — the timing signals from price action."}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            fontFamily: FONT_BODY,
            fontSize: 13,
            color: COLORS.gold,
            background: COLORS.surfaceLight,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 10,
            padding: "10px 10px",
            outline: "none",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder={
            activeKind === KIND_FUNDAMENTAL
              ? "e.g. ROE consistently above 15%"
              : "e.g. Price above 200-day moving average"
          }
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

      {activeKind === KIND_TECHNICAL && (
        <div style={{ marginBottom: 12 }}>
          <input
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Optional formula, e.g. price < 0.7 * price_max_180"
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              width: "100%",
              fontSize: 13,
              color: COLORS.text,
              background: COLORS.surfaceLight,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: "8px 12px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 11,
              color: COLORS.textDim,
              marginTop: 6,
              lineHeight: 1.5,
            }}
          >
            Vars: {SUGGESTED_VARS.map((v) => v.name).join(", ")}.
            Operators: <code>+ - * /</code>, <code>&lt; &gt; &lt;= &gt;= == !=</code>.
            Leave blank for a manual Pass/Fail criterion.
            For buy/sell alerts, use the Signals tab instead.
          </div>
        </div>
      )}

      {grouped.length === 0 && (
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 14,
            color: COLORS.textDim,
            textAlign: "center",
            padding: "40px 0",
          }}
        >
          No {KIND_LABEL[activeKind].toLowerCase()} criteria yet. Add your first one above.
        </div>
      )}

      {grouped.map(([cat, items]) => (
        <div key={cat} style={{ marginTop: 16 }}>
          <div
            style={{
              fontFamily: FONT_HEADING,
              fontSize: 11,
              fontWeight: 600,
              color: COLORS.gold,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              padding: "0 0 6px",
            }}
          >
            {cat} <span style={{ color: COLORS.textDim, fontWeight: 400 }}>({items.length})</span>
          </div>
          {items.map((c) => (
            <CriterionRow
              key={c.id}
              criterion={c}
              categories={categories}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function CriterionRow({ criterion, categories, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(criterion.text);
  const [exprEditing, setExprEditing] = useState(false);
  const [exprText, setExprText] = useState(criterion.expr || "");
  const isTechnical = getKind(criterion) === KIND_TECHNICAL;

  const save = () => {
    const trimmed = text.trim();
    if (trimmed && trimmed !== criterion.text) onUpdate(criterion.id, { text: trimmed });
    setEditing(false);
  };

  const saveExpr = () => {
    const trimmed = exprText.trim();
    const next = trimmed || null;
    if (next !== (criterion.expr || null)) onUpdate(criterion.id, { expr: next });
    setExprEditing(false);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "10px 12px",
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        marginBottom: 6,
      }}
    >
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
          onClick={() => { setText(criterion.text); setEditing(true); }}
          style={{
            fontFamily: FONT_BODY,
            flex: 1,
            fontSize: 14,
            color: COLORS.text,
            cursor: "pointer",
            wordBreak: "break-word",
          }}
        >
          {criterion.text}
        </span>
      )}
      <select
        value={criterion.category || "General"}
        onChange={(e) => onUpdate(criterion.id, { category: e.target.value })}
        style={{
          fontFamily: FONT_BODY,
          fontSize: 11,
          color: COLORS.textMuted,
          background: COLORS.surfaceLight,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 6,
          padding: "4px 6px",
          outline: "none",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <button
        onClick={() => {
          if (confirm(`Delete "${criterion.text}"?`)) onDelete(criterion.id);
        }}
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
    {isTechnical && (
      <div style={{ paddingLeft: 0, paddingTop: 2, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {exprEditing ? (
          <input
            autoFocus
            value={exprText}
            onChange={(e) => setExprText(e.target.value)}
            onBlur={saveExpr}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveExpr();
              if (e.key === "Escape") {
                setExprText(criterion.expr || "");
                setExprEditing(false);
              }
            }}
            placeholder="formula, e.g. price < 0.7 * price_max_180"
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
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
            onClick={() => { setExprText(criterion.expr || ""); setExprEditing(true); }}
            style={{
              fontFamily: criterion.expr
                ? "ui-monospace, SFMono-Regular, Menlo, monospace"
                : FONT_BODY,
              fontSize: 11,
              color: criterion.expr ? COLORS.gold : COLORS.textDim,
              cursor: "pointer",
              fontStyle: criterion.expr ? "normal" : "italic",
            }}
          >
            ƒ {criterion.expr || "+ add formula"}
          </span>
        )}
      </div>
    )}
  </div>
  );
}
