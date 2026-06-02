import { useState } from "react";
import { COLORS } from "../../theme/colors";
import { FONT_BODY, FONT_HEADING } from "../../theme/fonts";
import { uid } from "../../utils/uid";
import {
  METRIC_GROUPS,
  METRIC_BY_KEY,
  OPERATORS,
} from "../../utils/screenerMetrics";

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

function newCondition() {
  return { id: uid(), metric: "price", op: "lt", value: "", value2: "" };
}

export function StrategyBuilder({
  strategy,
  defaultUniverse,
  onChange,
  onRun,
  onBack,
  running,
  progress,
}) {
  const conditions = strategy.conditions || [];
  const [universeText, setUniverseText] = useState(
    (strategy.universe || []).join(", ")
  );
  const [universeEditing, setUniverseEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(strategy.name || "");

  const effectiveUniverse =
    strategy.universe && strategy.universe.length > 0
      ? strategy.universe
      : defaultUniverse;

  const updateCondition = (id, patch) => {
    onChange({
      ...strategy,
      conditions: conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  };

  const addCondition = () => {
    onChange({ ...strategy, conditions: [...conditions, newCondition()] });
  };

  const removeCondition = (id) => {
    onChange({ ...strategy, conditions: conditions.filter((c) => c.id !== id) });
  };

  const saveUniverse = () => {
    const tickers = universeText
      .split(/[,\s]+/)
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean);
    onChange({ ...strategy, universe: tickers });
    setUniverseEditing(false);
  };

  const saveName = () => {
    const trimmed = nameDraft.trim() || "Untitled strategy";
    if (trimmed !== strategy.name) onChange({ ...strategy, name: trimmed });
  };

  return (
    <div>
      {/* Header: back + name */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            style={{
              fontFamily: FONT_BODY,
              fontSize: 13,
              color: COLORS.gold,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 8px 4px 0",
              flexShrink: 0,
            }}
          >
            ← Back
          </button>
        )}
        <input
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={saveName}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          placeholder="Strategy name"
          style={{
            fontFamily: FONT_HEADING,
            fontSize: 18,
            fontWeight: 600,
            color: COLORS.text,
            background: "none",
            border: "none",
            borderBottom: `1px solid ${COLORS.border}`,
            padding: "4px 0",
            flex: 1,
            minWidth: 0,
            outline: "none",
          }}
        />
      </div>
      {/* Universe */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontFamily: FONT_BODY,
              fontSize: 11,
              color: COLORS.textDim,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Universe ({effectiveUniverse.length})
          </span>
          <button
            onClick={() => {
              if (universeEditing) saveUniverse();
              else {
                setUniverseText(effectiveUniverse.join(", "));
                setUniverseEditing(true);
              }
            }}
            style={{
              fontFamily: FONT_BODY,
              fontSize: 11,
              color: COLORS.gold,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {universeEditing ? "Save" : "Edit"}
          </button>
        </div>
        {universeEditing ? (
          <textarea
            value={universeText}
            onChange={(e) => setUniverseText(e.target.value)}
            rows={3}
            style={{
              fontFamily: MONO,
              fontSize: 12,
              width: "100%",
              boxSizing: "border-box",
              color: COLORS.text,
              background: COLORS.surfaceLight,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              padding: "8px 10px",
              outline: "none",
              resize: "vertical",
            }}
          />
        ) : (
          <div
            onClick={() => {
              setUniverseText(effectiveUniverse.join(", "));
              setUniverseEditing(true);
            }}
            style={{
              fontFamily: MONO,
              fontSize: 11,
              color: COLORS.textMuted,
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              padding: "8px 10px",
              cursor: "pointer",
              maxHeight: 60,
              overflow: "hidden",
              lineHeight: 1.5,
            }}
          >
            {effectiveUniverse.join(", ")}
          </div>
        )}
      </div>

      {/* Conditions */}
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
        Conditions (all must pass)
      </div>

      {conditions.length === 0 && (
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 13,
            color: COLORS.textDim,
            textAlign: "center",
            padding: "16px 0",
            border: `1px dashed ${COLORS.border}`,
            borderRadius: 8,
            marginBottom: 8,
          }}
        >
          No conditions yet. Add one below.
        </div>
      )}

      {conditions.map((c) => (
        <ConditionRow
          key={c.id}
          condition={c}
          onChange={(patch) => updateCondition(c.id, patch)}
          onRemove={() => removeCondition(c.id)}
        />
      ))}

      <button
        onClick={addCondition}
        style={{
          fontFamily: FONT_BODY,
          fontSize: 13,
          color: COLORS.gold,
          background: "none",
          border: `1px dashed ${COLORS.borderLight}`,
          borderRadius: 8,
          padding: "8px 12px",
          width: "100%",
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        + Add condition
      </button>

      {/* Run button */}
      <button
        onClick={onRun}
        disabled={running || conditions.length === 0}
        style={{
          fontFamily: FONT_HEADING,
          fontSize: 14,
          fontWeight: 700,
          color: running || conditions.length === 0 ? COLORS.textDim : COLORS.bg,
          background:
            running || conditions.length === 0 ? COLORS.surfaceLight : COLORS.gold,
          border: "none",
          borderRadius: 10,
          padding: "12px 20px",
          cursor: running || conditions.length === 0 ? "not-allowed" : "pointer",
          width: "100%",
          letterSpacing: "0.5px",
        }}
      >
        {running
          ? `Running… ${progress?.done || 0}/${progress?.total || 0}`
          : "Run screener"}
      </button>
    </div>
  );
}

function ConditionRow({ condition, onChange, onRemove }) {
  const metric = METRIC_BY_KEY[condition.metric];
  const op = condition.op;
  const isBetween = op === "between";
  const [rhsKind, setRhsKind] = useState(
    typeof condition.value === "object" && condition.value?.kind === "metric"
      ? "metric"
      : "number"
  );

  const setRhsAsNumber = (v) => onChange({ value: v });
  const setRhsAsMetric = (metricKey, factor) =>
    onChange({ value: { kind: "metric", metric: metricKey, factor } });

  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        padding: 10,
        marginBottom: 6,
      }}
    >
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
        {/* Metric dropdown */}
        <select
          value={condition.metric}
          onChange={(e) => onChange({ metric: e.target.value })}
          style={selectStyle}
        >
          {METRIC_GROUPS.map((g) => (
            <optgroup key={g.label} label={g.label}>
              {g.metrics.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {/* Operator dropdown */}
        <select
          value={condition.op}
          onChange={(e) => onChange({ op: e.target.value })}
          style={{ ...selectStyle, flex: "0 0 auto", width: 90 }}
        >
          {OPERATORS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>

        <button
          onClick={onRemove}
          style={{
            background: "none",
            border: "none",
            color: COLORS.textDim,
            fontSize: 16,
            cursor: "pointer",
            padding: "0 4px",
          }}
          title="Remove condition"
        >
          ×
        </button>
      </div>

      {/* RHS */}
      {!isBetween && (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <select
            value={rhsKind}
            onChange={(e) => {
              const next = e.target.value;
              setRhsKind(next);
              if (next === "number") setRhsAsNumber("");
              else setRhsAsMetric("price_max_180", 1);
            }}
            style={{ ...selectStyle, flex: "0 0 auto", width: 90 }}
          >
            <option value="number">Number</option>
            <option value="metric">Metric</option>
          </select>
          {rhsKind === "number" ? (
            <input
              type="number"
              value={condition.value ?? ""}
              onChange={(e) => setRhsAsNumber(e.target.value)}
              placeholder={metric?.unit === "%" ? "e.g. -10" : "e.g. 100"}
              style={inputStyle}
            />
          ) : (
            <>
              <input
                type="number"
                value={condition.value?.factor ?? 1}
                onChange={(e) =>
                  setRhsAsMetric(
                    condition.value?.metric || "price_max_180",
                    Number(e.target.value)
                  )
                }
                style={{ ...inputStyle, width: 60, flex: "0 0 auto" }}
              />
              <span style={{ color: COLORS.textDim, fontSize: 12 }}>×</span>
              <select
                value={condition.value?.metric || "price_max_180"}
                onChange={(e) =>
                  setRhsAsMetric(e.target.value, condition.value?.factor ?? 1)
                }
                style={selectStyle}
              >
                {METRIC_GROUPS.map((g) => (
                  <optgroup key={g.label} label={g.label}>
                    {g.metrics.map((m) => (
                      <option key={m.key} value={m.key}>
                        {m.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </>
          )}
        </div>
      )}

      {isBetween && (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="number"
            value={condition.value ?? ""}
            onChange={(e) => onChange({ value: e.target.value })}
            placeholder="min"
            style={inputStyle}
          />
          <span style={{ color: COLORS.textDim, fontSize: 12 }}>—</span>
          <input
            type="number"
            value={condition.value2 ?? ""}
            onChange={(e) => onChange({ value2: e.target.value })}
            placeholder="max"
            style={inputStyle}
          />
        </div>
      )}
    </div>
  );
}

const selectStyle = {
  fontFamily: FONT_BODY,
  fontSize: 12,
  color: COLORS.text,
  background: COLORS.surfaceLight,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 6,
  padding: "6px 8px",
  outline: "none",
  cursor: "pointer",
  flex: 1,
  minWidth: 0,
};

const inputStyle = {
  fontFamily: FONT_BODY,
  fontSize: 12,
  color: COLORS.text,
  background: COLORS.surfaceLight,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 6,
  padding: "6px 8px",
  outline: "none",
  flex: 1,
  minWidth: 0,
  boxSizing: "border-box",
};
