import { useMemo } from "react";
import { COLORS } from "../../theme/colors";
import { FONT_BODY, FONT_HEADING } from "../../theme/fonts";
import {
  STATUS_PASS,
  STATUS_FAIL,
  STATUS_NA,
  computeScore,
  scoreColor,
  splitByKind,
  KIND_FUNDAMENTAL,
  KIND_TECHNICAL,
} from "../../utils/scorecard";
import { evalExpr } from "../../utils/exprEval";
import { resolveVariable } from "../../utils/exprVariables";

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

const STATUS_OPTIONS = [
  { value: STATUS_PASS, label: "Pass", color: COLORS.green, bg: COLORS.greenBg },
  { value: STATUS_FAIL, label: "Fail", color: COLORS.red, bg: COLORS.redBg },
  { value: STATUS_NA, label: "N/A", color: COLORS.textMuted, bg: COLORS.surfaceLight },
];

const KIND_LABEL = {
  [KIND_FUNDAMENTAL]: "Fundamental",
  [KIND_TECHNICAL]: "Technical",
};

export function ScorecardTab({ criteria, scorecard, onChange, history, historyLoading, historyError }) {
  const { fundamental, technical } = useMemo(() => splitByKind(criteria), [criteria]);

  // Evaluate formula criteria against the history series.
  const formulaResults = useMemo(() => {
    const map = {};
    for (const c of criteria) {
      if (!c.expr) continue;
      if (!history) {
        map[c.id] = { error: historyLoading ? "Loading price history…" : (historyError || "No price history") };
        continue;
      }
      const seen = {};
      try {
        const value = evalExpr(c.expr, (name) => {
          const v = resolveVariable(name, history);
          if (v != null) seen[name] = v;
          return v;
        });
        map[c.id] = { value, seen };
      } catch (e) {
        map[c.id] = { error: e.message || "Evaluation error", seen };
      }
    }
    return map;
  }, [criteria, history, historyLoading, historyError]);

  // Effective scorecard: formula auto-results override manual entries for criteria with expr.
  const effectiveScorecard = useMemo(() => {
    const merged = { ...(scorecard || {}) };
    for (const c of criteria) {
      if (!c.expr) continue;
      const r = formulaResults[c.id];
      if (!r || r.error != null) continue;
      const status = r.value ? STATUS_PASS : STATUS_FAIL;
      merged[c.id] = { ...(merged[c.id] || {}), status };
    }
    return merged;
  }, [criteria, scorecard, formulaResults]);

  const setStatus = (criterionId, status) => {
    const current = scorecard?.[criterionId] || {};
    const next = { ...(scorecard || {}) };
    if (current.status === status) {
      const { status: _s, ...rest } = current;
      if (rest.note) next[criterionId] = rest;
      else delete next[criterionId];
    } else {
      next[criterionId] = { ...current, status };
    }
    onChange(next);
  };

  const setNote = (criterionId, note) => {
    const current = scorecard?.[criterionId] || {};
    const next = { ...(scorecard || {}) };
    if (!note && !current.status) {
      delete next[criterionId];
    } else {
      next[criterionId] = { ...current, note };
    }
    onChange(next);
  };

  if (criteria.length === 0) {
    return (
      <div
        style={{
          fontFamily: FONT_BODY,
          fontSize: 14,
          color: COLORS.textDim,
          textAlign: "center",
          padding: "40px 20px",
          lineHeight: 1.6,
        }}
      >
        No checklist criteria yet. <br />
        Open the Checklist tab to define your value-investor criteria, then
        return here to score this company.
      </div>
    );
  }

  return (
    <div>
      <KindSection
        kind={KIND_FUNDAMENTAL}
        items={fundamental}
        scorecard={scorecard}
        effectiveScorecard={effectiveScorecard}
        formulaResults={formulaResults}
        onStatus={setStatus}
        onNote={setNote}
      />
      {technical.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <KindSection
            kind={KIND_TECHNICAL}
            items={technical}
            scorecard={scorecard}
            effectiveScorecard={effectiveScorecard}
            formulaResults={formulaResults}
            onStatus={setStatus}
            onNote={setNote}
          />
        </div>
      )}
    </div>
  );
}

function KindSection({ kind, items, scorecard, effectiveScorecard, formulaResults, onStatus, onNote }) {
  const score = computeScore(items, effectiveScorecard);
  const ratioColor = scoreColor(score.ratio, COLORS);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const c of items) {
      const cat = c.category || "General";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(c);
    }
    return Array.from(map.entries());
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div>
      <div
        style={{
          fontFamily: FONT_HEADING,
          fontSize: 13,
          fontWeight: 600,
          color: COLORS.gold,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: 8,
        }}
      >
        {KIND_LABEL[kind]}
      </div>
      {/* Summary */}
      <div
        style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 10,
          padding: "12px 14px",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 10,
              color: COLORS.textDim,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 2,
            }}
          >
            Pass rate
          </div>
          <div
            style={{
              fontFamily: FONT_HEADING,
              fontSize: 22,
              fontWeight: 700,
              color: ratioColor,
            }}
          >
            {score.ratio == null ? "—" : `${Math.round(score.ratio * 100)}%`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, fontFamily: FONT_BODY, fontSize: 12 }}>
          <Stat label="Pass" value={score.passed} color={COLORS.green} />
          <Stat label="Fail" value={score.failed} color={COLORS.red} />
          <Stat label="N/A" value={score.na} color={COLORS.textMuted} />
          <Stat label="To do" value={score.untouched} color={COLORS.textDim} />
        </div>
      </div>

      {grouped.map(([cat, group]) => (
        <div key={cat} style={{ marginBottom: 12 }}>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 10,
              fontWeight: 600,
              color: COLORS.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              padding: "0 0 6px",
            }}
          >
            {cat}
          </div>
          {group.map((c) => {
            const entry = scorecard?.[c.id] || {};
            const fr = c.expr ? formulaResults?.[c.id] : null;
            const formulaPassed = fr && fr.error == null ? !!fr.value : null;
            const showManual = !c.expr || (fr && fr.error != null);
            return (
              <div
                key={c.id}
                style={{
                  background: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 10,
                  padding: "12px",
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: 14,
                    color: COLORS.text,
                    marginBottom: 8,
                    lineHeight: 1.4,
                  }}
                >
                  {c.text}
                </div>

                {c.expr && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <code
                      style={{
                        fontFamily: MONO,
                        fontSize: 12,
                        color: COLORS.gold,
                        background: COLORS.surfaceLight,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 6,
                        padding: "2px 8px",
                      }}
                    >
                      ƒ {c.expr}
                    </code>
                    {fr && fr.error == null && (
                      <span
                        style={{
                          fontFamily: FONT_BODY,
                          fontSize: 12,
                          fontWeight: 700,
                          color: formulaPassed ? COLORS.green : COLORS.red,
                          background: formulaPassed ? COLORS.greenBg : COLORS.redBg,
                          border: `1px solid ${formulaPassed ? COLORS.green : COLORS.red}`,
                          borderRadius: 6,
                          padding: "2px 10px",
                        }}
                      >
                        {formulaPassed ? "PASS" : "FAIL"}
                      </span>
                    )}
                    {fr && fr.error != null && (
                      <span
                        style={{
                          fontFamily: FONT_BODY,
                          fontSize: 11,
                          color: COLORS.red,
                          background: COLORS.redBg,
                          border: `1px solid ${COLORS.red}`,
                          borderRadius: 6,
                          padding: "2px 8px",
                        }}
                      >
                        ⚠ {fr.error}
                      </span>
                    )}
                  </div>
                )}

                {c.expr && fr && Object.keys(fr.seen || {}).length > 0 && (
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 11,
                      color: COLORS.textMuted,
                      marginBottom: 8,
                      lineHeight: 1.5,
                    }}
                  >
                    {Object.entries(fr.seen).map(([k, v]) => (
                      <span key={k} style={{ marginRight: 12, whiteSpace: "nowrap" }}>
                        {k} = {Number(v).toFixed(2)}
                      </span>
                    ))}
                  </div>
                )}

                {showManual && (
                  <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                    {STATUS_OPTIONS.map((opt) => {
                      const active = entry.status === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => onStatus(c.id, opt.value)}
                          style={{
                            fontFamily: FONT_BODY,
                            fontSize: 12,
                            fontWeight: 600,
                            color: active ? COLORS.bg : opt.color,
                            background: active ? opt.color : opt.bg,
                            border: `1px solid ${active ? opt.color : COLORS.border}`,
                            borderRadius: 8,
                            padding: "6px 12px",
                            cursor: "pointer",
                            flex: 1,
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                )}
                <input
                  value={entry.note || ""}
                  onChange={(e) => onNote(c.id, e.target.value)}
                  placeholder="Note (optional)"
                  style={{
                    fontFamily: FONT_BODY,
                    width: "100%",
                    fontSize: 12,
                    color: COLORS.text,
                    background: COLORS.surfaceLight,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 6,
                    padding: "6px 10px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ color, fontWeight: 700, fontSize: 16 }}>{value}</div>
      <div
        style={{
          color: COLORS.textDim,
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </div>
    </div>
  );
}
