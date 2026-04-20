import { Field } from "../shared/Field";
import { MoatSelector } from "../shared/MoatSelector";
import { SECTORS } from "../../constants/sectors";
import { COLORS } from "../../theme/colors";
import { FONT_BODY } from "../../theme/fonts";

export function ProfileTab({ form, setField, groups, allGroups }) {
  return (
    <div>
      <Field
        label="Ticker"
        value={form.ticker}
        onChange={(v) => setField("ticker", v.toUpperCase())}
        placeholder="AAPL"
      />
      <Field
        label="Company Name"
        value={form.name}
        onChange={(v) => setField("name", v)}
        placeholder="Apple Inc."
      />
      <Field label="Sector" value={form.sector} onChange={(v) => setField("sector", v)} select>
        {SECTORS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </Field>
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            fontFamily: FONT_BODY,
            fontSize: 11,
            fontWeight: 600,
            color: COLORS.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: 6,
            display: "block",
          }}
        >
          Competitive Moats
        </label>
        <MoatSelector selected={form.moats} onChange={(v) => setField("moats", v)} />
      </div>
      {allGroups.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontFamily: FONT_BODY,
              fontSize: 11,
              fontWeight: 600,
              color: COLORS.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 6,
              display: "block",
            }}
          >
            Groups
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {allGroups.map((g) => {
              const active = groups.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() =>
                    setField(
                      "groupIds",
                      active ? groups.filter((id) => id !== g.id) : [...groups, g.id]
                    )
                  }
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: 12,
                    fontWeight: active ? 600 : 400,
                    color: active ? COLORS.bg : COLORS.textMuted,
                    background: active ? COLORS.blue : COLORS.surfaceLight,
                    border: `1px solid ${active ? COLORS.blue : COLORS.border}`,
                    borderRadius: 14,
                    padding: "5px 10px",
                    cursor: "pointer",
                  }}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <Field
        label="Management Quality Notes"
        value={form.managementNotes}
        onChange={(v) => setField("managementNotes", v)}
        placeholder="Notes on leadership, capital allocation..."
        textarea
      />
    </div>
  );
}
