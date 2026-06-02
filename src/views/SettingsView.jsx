import { useState } from "react";
import { COLORS } from "../theme/colors";
import { FONT_BODY, FONT_HEADING } from "../theme/fonts";
import { METRIC_CATEGORIES, VARIANT_BY_ID } from "../utils/metricCatalog";

export function SettingsView({ metricSettings, addMetric, removeMetric }) {
  const [screen, setScreen] = useState(null); // null | "metrics"

  if (screen === "metrics") {
    return (
      <MetricsSettings
        enabled={metricSettings.enabled || []}
        onAdd={addMetric}
        onRemove={removeMetric}
        onBack={() => setScreen(null)}
      />
    );
  }

  return (
    <div style={{ padding: "0 16px" }}>
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
        Settings
      </div>
      <SettingsRow
        label="Metrics"
        sublabel={`${(metricSettings.enabled || []).length} selected`}
        onClick={() => setScreen("metrics")}
      />
    </div>
  );
}

function SettingsRow({ label, sublabel, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        padding: "14px 16px",
        marginBottom: 6,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: FONT_HEADING,
            fontSize: 15,
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          {label}
        </div>
        {sublabel && (
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 11,
              color: COLORS.textMuted,
              marginTop: 2,
            }}
          >
            {sublabel}
          </div>
        )}
      </div>
      <span style={{ color: COLORS.textDim, fontSize: 16, flexShrink: 0 }}>›</span>
    </div>
  );
}

function MetricsSettings({ enabled, onAdd, onRemove, onBack }) {
  const [adding, setAdding] = useState(false);
  const enabledSet = new Set(enabled);

  return (
    <div style={{ padding: "0 16px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
        }}
      >
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
        <span
          style={{
            fontFamily: FONT_HEADING,
            fontSize: 18,
            fontWeight: 600,
            color: COLORS.text,
            flex: 1,
          }}
        >
          Metrics
        </span>
      </div>

      <div
        style={{
          fontFamily: FONT_BODY,
          fontSize: 12,
          color: COLORS.textMuted,
          marginBottom: 12,
          lineHeight: 1.5,
        }}
      >
        Pick technical indicators you want available in this app. Each variant
        is a preset of its parameters (period, multiplier, etc.).
      </div>

      {/* Enabled list */}
      {enabled.length === 0 ? (
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
          }}
        >
          No metrics yet. Tap “+ Add metric” to choose some.
        </div>
      ) : (
        enabled.map((id) => {
          const v = VARIANT_BY_ID[id];
          if (!v) return null;
          return (
            <div
              key={id}
              style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: 14,
                    color: COLORS.text,
                  }}
                >
                  {v.label}
                </div>
                <div
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: 11,
                    color: COLORS.textMuted,
                    marginTop: 2,
                  }}
                >
                  {v.categoryLabel}
                </div>
              </div>
              <button
                onClick={() => onRemove(id)}
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
          );
        })
      )}

      {/* Add metric button or picker */}
      {!adding ? (
        <button
          onClick={() => setAdding(true)}
          style={{
            fontFamily: FONT_BODY,
            fontSize: 13,
            color: COLORS.gold,
            background: "none",
            border: `1px dashed ${COLORS.borderLight}`,
            borderRadius: 8,
            padding: "10px 12px",
            width: "100%",
            cursor: "pointer",
            marginTop: 12,
          }}
        >
          + Add metric
        </button>
      ) : (
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
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
              Choose a metric
            </span>
            <button
              onClick={() => setAdding(false)}
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
              Done
            </button>
          </div>
          {METRIC_CATEGORIES.map((cat) => (
            <div key={cat.key} style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontFamily: FONT_HEADING,
                  fontSize: 12,
                  fontWeight: 600,
                  color: COLORS.gold,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: 4,
                }}
              >
                {cat.label}
              </div>
              <div
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 11,
                  color: COLORS.textMuted,
                  marginBottom: 8,
                  lineHeight: 1.5,
                }}
              >
                {cat.description}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {cat.variants.map((v) => {
                  const isEnabled = enabledSet.has(v.id);
                  return (
                    <button
                      key={v.id}
                      onClick={() => !isEnabled && onAdd(v.id)}
                      disabled={isEnabled}
                      style={{
                        fontFamily: FONT_BODY,
                        fontSize: 12,
                        fontWeight: 600,
                        color: isEnabled ? COLORS.textDim : COLORS.gold,
                        background: isEnabled ? COLORS.surface : COLORS.surfaceLight,
                        border: `1px solid ${isEnabled ? COLORS.border : COLORS.borderLight}`,
                        borderRadius: 8,
                        padding: "6px 12px",
                        cursor: isEnabled ? "default" : "pointer",
                      }}
                    >
                      {v.label}
                      {isEnabled && " ✓"}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
