import { useState, useEffect, useCallback } from "react";

const FONTS_LINK = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap";

// Load fonts
if (!document.querySelector(`link[href*="Playfair"]`)) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = FONTS_LINK;
  document.head.appendChild(link);
}

const COLORS = {
  bg: "#0b1120",
  surface: "#111827",
  surfaceLight: "#1a2332",
  border: "#1e2d3d",
  borderLight: "#2a3a4d",
  gold: "#c8a44e",
  goldDim: "#9a7d3a",
  text: "#e2e8f0",
  textMuted: "#7a8ba0",
  textDim: "#4a5568",
  green: "#34d399",
  greenBg: "rgba(52,211,153,0.1)",
  red: "#f87171",
  redBg: "rgba(248,113,113,0.1)",
  blue: "#60a5fa",
  blueBg: "rgba(96,165,250,0.1)",
};

const SECTORS = [
  "Technology", "Healthcare", "Financials", "Consumer Discretionary",
  "Consumer Staples", "Energy", "Industrials", "Materials",
  "Real Estate", "Utilities", "Communication Services", "Other"
];

const MOAT_TYPES = [
  "Brand Power", "Network Effects", "Cost Advantages", "Switching Costs",
  "Intangible Assets", "Efficient Scale", "None Identified"
];

const uid = () => Math.random().toString(36).slice(2, 10);

// ── Styles ──
const S = {
  app: {
    fontFamily: "'DM Sans', sans-serif",
    background: COLORS.bg,
    color: COLORS.text,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 24px",
    borderBottom: `1px solid ${COLORS.border}`,
    background: COLORS.surface,
  },
  logo: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 22, fontWeight: 700, color: COLORS.gold, letterSpacing: "0.5px",
  },
  nav: { display: "flex", gap: 4 },
  navBtn: (active) => ({
    padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
    fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
    background: active ? COLORS.gold : "transparent",
    color: active ? COLORS.bg : COLORS.textMuted,
    transition: "all 0.2s",
  }),
  main: { flex: 1, padding: 24, maxWidth: 1200, margin: "0 auto", width: "100%" },
  card: {
    background: COLORS.surface, borderRadius: 12, border: `1px solid ${COLORS.border}`,
    padding: 24, marginBottom: 16,
  },
  cardTitle: {
    fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600,
    marginBottom: 16, color: COLORS.text,
  },
  input: {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: `1px solid ${COLORS.border}`, background: COLORS.surfaceLight,
    color: COLORS.text, fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    outline: "none", boxSizing: "border-box",
  },
  textarea: {
    width: "100%", padding: "10px 14px", borderRadius: 8, minHeight: 100,
    border: `1px solid ${COLORS.border}`, background: COLORS.surfaceLight,
    color: COLORS.text, fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    outline: "none", resize: "vertical", boxSizing: "border-box",
  },
  select: {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: `1px solid ${COLORS.border}`, background: COLORS.surfaceLight,
    color: COLORS.text, fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    outline: "none", boxSizing: "border-box",
  },
  label: {
    fontSize: 12, fontWeight: 600, color: COLORS.textMuted,
    marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.5px",
  },
  btnPrimary: {
    padding: "10px 24px", borderRadius: 8, border: "none", cursor: "pointer",
    background: COLORS.gold, color: COLORS.bg, fontSize: 14, fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif",
  },
  btnSecondary: {
    padding: "10px 24px", borderRadius: 8, border: `1px solid ${COLORS.border}`,
    cursor: "pointer", background: "transparent", color: COLORS.textMuted,
    fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
  },
  btnDanger: {
    padding: "8px 16px", borderRadius: 8, border: `1px solid ${COLORS.red}33`,
    cursor: "pointer", background: COLORS.redBg, color: COLORS.red,
    fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
  },
  tag: (color) => ({
    display: "inline-block", padding: "4px 10px", borderRadius: 6,
    fontSize: 11, fontWeight: 600,
    background: color === "gold" ? `${COLORS.gold}22` : color === "green" ? COLORS.greenBg : color === "blue" ? COLORS.blueBg : `${COLORS.textDim}33`,
    color: color === "gold" ? COLORS.gold : color === "green" ? COLORS.green : color === "blue" ? COLORS.blue : COLORS.textMuted,
  }),
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
  stat: {
    background: COLORS.surfaceLight, borderRadius: 10, padding: 18,
    border: `1px solid ${COLORS.border}`,
  },
  statLabel: { fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 },
  statValue: { fontSize: 24, fontWeight: 700, fontFamily: "'Playfair Display', serif" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 600,
    color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.5px",
    borderBottom: `1px solid ${COLORS.border}`,
  },
  td: {
    padding: "12px 14px", fontSize: 14, borderBottom: `1px solid ${COLORS.border}08`,
  },
  row: {
    cursor: "pointer", transition: "background 0.15s",
  },
  empty: {
    textAlign: "center", padding: 48, color: COLORS.textDim, fontSize: 14,
  },
  modal: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
  },
  modalContent: {
    background: COLORS.surface, borderRadius: 16, border: `1px solid ${COLORS.border}`,
    padding: 32, width: "90%", maxWidth: 600, maxHeight: "85vh", overflowY: "auto",
  },
  tabs: { display: "flex", gap: 2, marginBottom: 24, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 0 },
  tab: (active) => ({
    padding: "10px 20px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    background: "transparent",
    color: active ? COLORS.gold : COLORS.textMuted,
    borderBottom: active ? `2px solid ${COLORS.gold}` : "2px solid transparent",
    marginBottom: -1,
  }),
};

// ── Field Component ──
const Field = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={S.label}>{label}</label>
    {children}
  </div>
);

// ── Storage Hook ──
function useStorage() {
  const [data, setData] = useState({ companies: [], portfolio: [] });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await window.storage.get("inv-tracker-data");
        if (res && res.value) {
          setData(JSON.parse(res.value));
        }
      } catch { }
      setLoaded(true);
    };
    load();
  }, []);

  const save = useCallback(async (newData) => {
    setData(newData);
    try {
      await window.storage.set("inv-tracker-data", JSON.stringify(newData));
    } catch (e) {
      console.error("Save failed:", e);
    }
  }, []);

  return { data, save, loaded };
}

// ── Dashboard ──
function Dashboard({ data }) {
  const { companies, portfolio } = data;
  const totalInvested = portfolio.reduce((s, p) => s + (p.shares * p.avgCost), 0);
  const totalCurrent = portfolio.reduce((s, p) => s + (p.shares * (p.currentPrice || p.avgCost)), 0);
  const totalGain = totalCurrent - totalInvested;
  const gainPct = totalInvested > 0 ? (totalGain / totalInvested * 100) : 0;

  const belowBuy = companies.filter(c => c.targets?.buyPrice && c.targets.currentPrice && c.targets.currentPrice <= c.targets.buyPrice);

  return (
    <div>
      <div style={{ ...S.grid3, marginBottom: 24 }}>
        <div style={S.stat}>
          <div style={S.statLabel}>Companies Tracked</div>
          <div style={{ ...S.statValue, color: COLORS.blue }}>{companies.length}</div>
        </div>
        <div style={S.stat}>
          <div style={S.statLabel}>Portfolio Value</div>
          <div style={{ ...S.statValue, color: COLORS.gold }}>${totalCurrent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
        <div style={S.stat}>
          <div style={S.statLabel}>Total Return</div>
          <div style={{ ...S.statValue, color: totalGain >= 0 ? COLORS.green : COLORS.red }}>
            {totalGain >= 0 ? "+" : ""}{gainPct.toFixed(1)}%
          </div>
        </div>
      </div>

      {belowBuy.length > 0 && (
        <div style={S.card}>
          <div style={S.cardTitle}>🎯 Below Buy Price</div>
          {belowBuy.map(c => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}08` }}>
              <div>
                <span style={{ fontWeight: 600 }}>{c.ticker}</span>
                <span style={{ color: COLORS.textMuted, marginLeft: 8, fontSize: 13 }}>{c.name}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ color: COLORS.green, fontWeight: 600 }}>${c.targets.currentPrice}</span>
                <span style={{ color: COLORS.textDim, fontSize: 12, marginLeft: 8 }}>buy @ ${c.targets.buyPrice}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={S.card}>
        <div style={S.cardTitle}>Recent Activity</div>
        {companies.length === 0 ? (
          <div style={S.empty}>Start by adding your first company to track</div>
        ) : (
          <div>
            {companies.slice(-5).reverse().map(c => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${COLORS.border}08` }}>
                <span style={S.tag("gold")}>{c.ticker}</span>
                <span style={{ fontSize: 14 }}>{c.name}</span>
                <span style={{ ...S.tag("default"), marginLeft: "auto" }}>{c.sector}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Company Form Modal ──
function CompanyModal({ company, onSave, onClose }) {
  const [form, setForm] = useState(company || {
    id: uid(), ticker: "", name: "", sector: "Technology",
    moats: [], managementNotes: "", risks: "", generalNotes: "",
    valuation: { method: "dcf", discountRate: 10, growthRate: 8, terminalGrowth: 3, currentFCF: 0, yearsProjected: 10, intrinsicValue: null },
    targets: { intrinsicValue: 0, marginOfSafety: 30, buyPrice: 0, sellPrice: 0, currentPrice: 0 },
    createdAt: new Date().toISOString(),
  });

  const [tab, setTab] = useState("profile");

  const update = (path, value) => {
    setForm(f => {
      const newF = { ...f };
      if (path.includes(".")) {
        const [a, b] = path.split(".");
        newF[a] = { ...newF[a], [b]: value };
      } else {
        newF[path] = value;
      }
      return newF;
    });
  };

  const toggleMoat = (moat) => {
    setForm(f => ({
      ...f,
      moats: f.moats?.includes(moat) ? f.moats.filter(m => m !== moat) : [...(f.moats || []), moat],
    }));
  };

  // DCF calculation
  const calcDCF = () => {
    const v = form.valuation;
    if (!v.currentFCF || v.currentFCF <= 0) return;
    let totalPV = 0;
    const dr = v.discountRate / 100;
    const gr = v.growthRate / 100;
    const tg = v.terminalGrowth / 100;

    for (let y = 1; y <= v.yearsProjected; y++) {
      const fcf = v.currentFCF * Math.pow(1 + gr, y);
      totalPV += fcf / Math.pow(1 + dr, y);
    }
    const terminalFCF = v.currentFCF * Math.pow(1 + gr, v.yearsProjected) * (1 + tg);
    const terminalValue = terminalFCF / (dr - tg);
    const pvTerminal = terminalValue / Math.pow(1 + dr, v.yearsProjected);
    const intrinsic = Math.round(totalPV + pvTerminal);

    const mos = form.targets.marginOfSafety / 100;
    update("valuation.intrinsicValue", intrinsic);
    update("targets.intrinsicValue", intrinsic);
    update("targets.buyPrice", Math.round(intrinsic * (1 - mos)));
    update("targets.sellPrice", Math.round(intrinsic * 1.2));
  };

  const handleSave = () => {
    if (!form.ticker.trim() || !form.name.trim()) return;
    onSave({ ...form, updatedAt: new Date().toISOString() });
  };

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.modalContent} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, margin: 0 }}>
            {company ? "Edit Company" : "Add Company"}
          </h2>
          <button onClick={onClose} style={{ ...S.btnSecondary, padding: "6px 12px" }}>✕</button>
        </div>

        <div style={S.tabs}>
          {["profile", "valuation", "targets", "notes"].map(t => (
            <button key={t} style={S.tab(tab === t)} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === "profile" && (
          <div>
            <div style={S.grid2}>
              <Field label="Ticker">
                <input style={S.input} value={form.ticker} onChange={e => update("ticker", e.target.value.toUpperCase())} placeholder="AAPL" />
              </Field>
              <Field label="Company Name">
                <input style={S.input} value={form.name} onChange={e => update("name", e.target.value)} placeholder="Apple Inc." />
              </Field>
            </div>
            <Field label="Sector">
              <select style={S.select} value={form.sector} onChange={e => update("sector", e.target.value)}>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Competitive Moats">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {MOAT_TYPES.map(m => (
                  <button key={m} onClick={() => toggleMoat(m)} style={{
                    ...S.tag(form.moats?.includes(m) ? "gold" : "default"),
                    cursor: "pointer", border: "none", padding: "6px 14px", fontSize: 12,
                  }}>{m}</button>
                ))}
              </div>
            </Field>
            <Field label="Management Quality Notes">
              <textarea style={S.textarea} value={form.managementNotes || ""} onChange={e => update("managementNotes", e.target.value)}
                placeholder="Capital allocation track record, insider ownership, alignment with shareholders..." />
            </Field>
          </div>
        )}

        {tab === "valuation" && (
          <div>
            <div style={{ background: COLORS.surfaceLight, borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8, fontWeight: 600 }}>DCF VALUATION MODEL</div>
              <div style={S.grid2}>
                <Field label="Current Free Cash Flow ($M)">
                  <input style={S.input} type="number" value={form.valuation?.currentFCF || ""} onChange={e => update("valuation.currentFCF", parseFloat(e.target.value) || 0)} />
                </Field>
                <Field label="Growth Rate (%)">
                  <input style={S.input} type="number" value={form.valuation?.growthRate || ""} onChange={e => update("valuation.growthRate", parseFloat(e.target.value) || 0)} />
                </Field>
                <Field label="Discount Rate (%)">
                  <input style={S.input} type="number" value={form.valuation?.discountRate || ""} onChange={e => update("valuation.discountRate", parseFloat(e.target.value) || 0)} />
                </Field>
                <Field label="Terminal Growth (%)">
                  <input style={S.input} type="number" value={form.valuation?.terminalGrowth || ""} onChange={e => update("valuation.terminalGrowth", parseFloat(e.target.value) || 0)} />
                </Field>
                <Field label="Projection Years">
                  <input style={S.input} type="number" value={form.valuation?.yearsProjected || ""} onChange={e => update("valuation.yearsProjected", parseInt(e.target.value) || 10)} />
                </Field>
              </div>
              <button style={S.btnPrimary} onClick={calcDCF}>Calculate Intrinsic Value</button>
            </div>
            {form.valuation?.intrinsicValue && (
              <div style={{ ...S.stat, textAlign: "center" }}>
                <div style={S.statLabel}>Estimated Intrinsic Value</div>
                <div style={{ ...S.statValue, color: COLORS.gold, fontSize: 32 }}>
                  ${form.valuation.intrinsicValue.toLocaleString()}M
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "targets" && (
          <div>
            <div style={S.grid2}>
              <Field label="Current Market Price ($)">
                <input style={S.input} type="number" value={form.targets?.currentPrice || ""} onChange={e => update("targets.currentPrice", parseFloat(e.target.value) || 0)} />
              </Field>
              <Field label="Intrinsic Value ($)">
                <input style={S.input} type="number" value={form.targets?.intrinsicValue || ""} onChange={e => update("targets.intrinsicValue", parseFloat(e.target.value) || 0)} />
              </Field>
              <Field label="Margin of Safety (%)">
                <input style={S.input} type="number" value={form.targets?.marginOfSafety || ""} onChange={e => {
                  const mos = parseFloat(e.target.value) || 0;
                  update("targets.marginOfSafety", mos);
                  if (form.targets?.intrinsicValue) {
                    update("targets.buyPrice", Math.round(form.targets.intrinsicValue * (1 - mos / 100)));
                  }
                }} />
              </Field>
              <Field label="Buy Price ($)">
                <input style={S.input} type="number" value={form.targets?.buyPrice || ""} onChange={e => update("targets.buyPrice", parseFloat(e.target.value) || 0)} />
              </Field>
              <Field label="Sell Price ($)">
                <input style={S.input} type="number" value={form.targets?.sellPrice || ""} onChange={e => update("targets.sellPrice", parseFloat(e.target.value) || 0)} />
              </Field>
            </div>
            {form.targets?.currentPrice > 0 && form.targets?.intrinsicValue > 0 && (
              <div style={{ ...S.stat, marginTop: 16, textAlign: "center" }}>
                <div style={S.statLabel}>Price vs Intrinsic Value</div>
                <div style={{
                  ...S.statValue,
                  color: form.targets.currentPrice <= form.targets.buyPrice ? COLORS.green : form.targets.currentPrice >= form.targets.sellPrice ? COLORS.red : COLORS.gold,
                  fontSize: 28,
                }}>
                  {form.targets.currentPrice <= form.targets.buyPrice ? "📗 BELOW BUY PRICE" : form.targets.currentPrice >= form.targets.sellPrice ? "📕 ABOVE SELL PRICE" : "📙 HOLD ZONE"}
                </div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 8 }}>
                  {((1 - form.targets.currentPrice / form.targets.intrinsicValue) * 100).toFixed(1)}% {form.targets.currentPrice < form.targets.intrinsicValue ? "discount" : "premium"} to intrinsic value
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "notes" && (
          <div>
            <Field label="Key Risks">
              <textarea style={S.textarea} value={form.risks || ""} onChange={e => update("risks", e.target.value)}
                placeholder="Regulatory risks, competitive threats, cyclicality, debt levels..." />
            </Field>
            <Field label="General Research Notes">
              <textarea style={{ ...S.textarea, minHeight: 180 }} value={form.generalNotes || ""} onChange={e => update("generalNotes", e.target.value)}
                placeholder="Annual report insights, earnings call takeaways, industry observations..." />
            </Field>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
          <button style={S.btnSecondary} onClick={onClose}>Cancel</button>
          <button style={S.btnPrimary} onClick={handleSave}>Save Company</button>
        </div>
      </div>
    </div>
  );
}

// ── Companies View ──
function Companies({ data, onSave, onEdit, onDelete }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = data.companies.filter(c =>
    c.ticker.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (c) => { setEditing(c); setShowModal(true); };
  const handleSave = (company) => {
    const newCompanies = editing
      ? data.companies.map(c => c.id === company.id ? company : c)
      : [...data.companies, company];
    onSave({ ...data, companies: newCompanies });
    setShowModal(false);
    setEditing(null);
  };
  const handleDelete = (id) => {
    onSave({ ...data, companies: data.companies.filter(c => c.id !== id), portfolio: data.portfolio.filter(p => p.companyId !== id) });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <input style={{ ...S.input, maxWidth: 300 }} placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)} />
        <button style={S.btnPrimary} onClick={() => { setEditing(null); setShowModal(true); }}>+ Add Company</button>
      </div>

      {filtered.length === 0 ? (
        <div style={{ ...S.card, ...S.empty }}>
          {data.companies.length === 0 ? "No companies yet — add your first research target" : "No matches found"}
        </div>
      ) : (
        <div style={S.card}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Ticker</th>
                <th style={S.th}>Company</th>
                <th style={S.th}>Sector</th>
                <th style={S.th}>Moats</th>
                <th style={S.th}>Buy Target</th>
                <th style={S.th}>Current</th>
                <th style={S.th}>Signal</th>
                <th style={S.th}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const signal = c.targets?.currentPrice > 0 && c.targets?.buyPrice > 0
                  ? c.targets.currentPrice <= c.targets.buyPrice ? "BUY" : c.targets.currentPrice >= (c.targets.sellPrice || Infinity) ? "SELL" : "HOLD"
                  : "—";
                return (
                  <tr key={c.id} style={S.row} onMouseEnter={e => e.currentTarget.style.background = COLORS.surfaceLight} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ ...S.td, fontWeight: 700, color: COLORS.gold }}>{c.ticker}</td>
                    <td style={S.td}>{c.name}</td>
                    <td style={S.td}><span style={S.tag("default")}>{c.sector}</span></td>
                    <td style={S.td}>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {(c.moats || []).slice(0, 2).map(m => <span key={m} style={S.tag("blue")}>{m}</span>)}
                        {(c.moats || []).length > 2 && <span style={S.tag("default")}>+{c.moats.length - 2}</span>}
                      </div>
                    </td>
                    <td style={S.td}>{c.targets?.buyPrice ? `$${c.targets.buyPrice}` : "—"}</td>
                    <td style={S.td}>{c.targets?.currentPrice ? `$${c.targets.currentPrice}` : "—"}</td>
                    <td style={S.td}>
                      <span style={S.tag(signal === "BUY" ? "green" : signal === "SELL" ? "gold" : "default")}>{signal}</span>
                    </td>
                    <td style={{ ...S.td, textAlign: "right" }}>
                      <button style={{ ...S.btnSecondary, padding: "4px 12px", fontSize: 12, marginRight: 6 }} onClick={() => handleEdit(c)}>Edit</button>
                      <button style={{ ...S.btnDanger, padding: "4px 12px", fontSize: 12 }} onClick={() => handleDelete(c.id)}>✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <CompanyModal company={editing} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null); }} />}
    </div>
  );
}

// ── Portfolio View ──
function Portfolio({ data, onSave }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ companyId: "", shares: "", avgCost: "", currentPrice: "" });

  const holdings = data.portfolio.map(p => {
    const company = data.companies.find(c => c.id === p.companyId);
    const marketVal = p.shares * (p.currentPrice || 0);
    const costBasis = p.shares * p.avgCost;
    const gain = marketVal - costBasis;
    const gainPct = costBasis > 0 ? (gain / costBasis * 100) : 0;
    return { ...p, company, marketVal, costBasis, gain, gainPct };
  });

  const totalValue = holdings.reduce((s, h) => s + h.marketVal, 0);
  const totalCost = holdings.reduce((s, h) => s + h.costBasis, 0);
  const totalGain = totalValue - totalCost;

  const addHolding = () => {
    if (!form.companyId || !form.shares || !form.avgCost) return;
    const newPortfolio = [...data.portfolio, {
      id: uid(), companyId: form.companyId,
      shares: parseFloat(form.shares), avgCost: parseFloat(form.avgCost),
      currentPrice: parseFloat(form.currentPrice) || 0,
      addedAt: new Date().toISOString(),
    }];
    onSave({ ...data, portfolio: newPortfolio });
    setForm({ companyId: "", shares: "", avgCost: "", currentPrice: "" });
    setShowAdd(false);
  };

  const removeHolding = (id) => {
    onSave({ ...data, portfolio: data.portfolio.filter(p => p.id !== id) });
  };

  const updatePrice = (id, price) => {
    const newPortfolio = data.portfolio.map(p => p.id === id ? { ...p, currentPrice: parseFloat(price) || 0 } : p);
    onSave({ ...data, portfolio: newPortfolio });
  };

  return (
    <div>
      <div style={{ ...S.grid3, marginBottom: 24 }}>
        <div style={S.stat}>
          <div style={S.statLabel}>Total Invested</div>
          <div style={S.statValue}>${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
        <div style={S.stat}>
          <div style={S.statLabel}>Market Value</div>
          <div style={{ ...S.statValue, color: COLORS.gold }}>${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
        <div style={S.stat}>
          <div style={S.statLabel}>Unrealized P&L</div>
          <div style={{ ...S.statValue, color: totalGain >= 0 ? COLORS.green : COLORS.red }}>
            {totalGain >= 0 ? "+" : ""}${totalGain.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button style={S.btnPrimary} onClick={() => setShowAdd(!showAdd)}>+ Add Holding</button>
      </div>

      {showAdd && (
        <div style={{ ...S.card, marginBottom: 16 }}>
          <div style={S.grid2}>
            <Field label="Company">
              <select style={S.select} value={form.companyId} onChange={e => setForm(f => ({ ...f, companyId: e.target.value }))}>
                <option value="">Select...</option>
                {data.companies.map(c => <option key={c.id} value={c.id}>{c.ticker} — {c.name}</option>)}
              </select>
            </Field>
            <Field label="Shares">
              <input style={S.input} type="number" value={form.shares} onChange={e => setForm(f => ({ ...f, shares: e.target.value }))} />
            </Field>
            <Field label="Avg Cost ($)">
              <input style={S.input} type="number" value={form.avgCost} onChange={e => setForm(f => ({ ...f, avgCost: e.target.value }))} />
            </Field>
            <Field label="Current Price ($)">
              <input style={S.input} type="number" value={form.currentPrice} onChange={e => setForm(f => ({ ...f, currentPrice: e.target.value }))} />
            </Field>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button style={S.btnSecondary} onClick={() => setShowAdd(false)}>Cancel</button>
            <button style={S.btnPrimary} onClick={addHolding}>Add</button>
          </div>
        </div>
      )}

      {holdings.length === 0 ? (
        <div style={{ ...S.card, ...S.empty }}>No holdings yet — add companies first, then track your positions here</div>
      ) : (
        <div style={S.card}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Ticker</th>
                <th style={S.th}>Shares</th>
                <th style={S.th}>Avg Cost</th>
                <th style={S.th}>Current</th>
                <th style={S.th}>Market Value</th>
                <th style={S.th}>P&L</th>
                <th style={S.th}>Return</th>
                <th style={S.th}></th>
              </tr>
            </thead>
            <tbody>
              {holdings.map(h => (
                <tr key={h.id}>
                  <td style={{ ...S.td, fontWeight: 700, color: COLORS.gold }}>{h.company?.ticker || "?"}</td>
                  <td style={S.td}>{h.shares}</td>
                  <td style={S.td}>${h.avgCost.toFixed(2)}</td>
                  <td style={S.td}>
                    <input style={{ ...S.input, width: 90, padding: "4px 8px" }} type="number" value={h.currentPrice || ""}
                      onChange={e => updatePrice(h.id, e.target.value)} placeholder="Price" />
                  </td>
                  <td style={S.td}>${h.marketVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td style={{ ...S.td, color: h.gain >= 0 ? COLORS.green : COLORS.red, fontWeight: 600 }}>
                    {h.gain >= 0 ? "+" : ""}${h.gain.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td style={{ ...S.td, color: h.gainPct >= 0 ? COLORS.green : COLORS.red, fontWeight: 600 }}>
                    {h.gainPct >= 0 ? "+" : ""}{h.gainPct.toFixed(1)}%
                  </td>
                  <td style={{ ...S.td, textAlign: "right" }}>
                    <button style={{ ...S.btnDanger, padding: "4px 10px", fontSize: 12 }} onClick={() => removeHolding(h.id)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalValue > 0 && (
        <div style={S.card}>
          <div style={S.cardTitle}>Allocation</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {holdings.filter(h => h.marketVal > 0).map(h => {
              const pct = (h.marketVal / totalValue * 100);
              return (
                <div key={h.id} style={{ flex: `${pct} 0 0`, minWidth: 60 }}>
                  <div style={{ height: 8, borderRadius: 4, background: COLORS.gold, marginBottom: 6, opacity: 0.4 + pct / 100 * 0.6 }} />
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{h.company?.ticker}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted }}>{pct.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Export / Import ──
function DataManager({ data, onSave }) {
  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `investment-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (imported.companies && imported.portfolio) {
          onSave(imported);
        }
      } catch { alert("Invalid file format"); }
    };
    reader.readAsText(file);
  };

  return (
    <div style={S.card}>
      <div style={S.cardTitle}>Data Management</div>
      <p style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 16 }}>
        Export your data as JSON backup or import from a previous export.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <button style={S.btnPrimary} onClick={exportData}>Export JSON</button>
        <label style={{ ...S.btnSecondary, display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
          Import JSON
          <input type="file" accept=".json" onChange={importData} style={{ display: "none" }} />
        </label>
      </div>
    </div>
  );
}

// ── Main App ──
export default function App() {
  const { data, save, loaded } = useStorage();
  const [view, setView] = useState("dashboard");

  if (!loaded) {
    return (
      <div style={{ ...S.app, alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: COLORS.gold }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={S.app}>
      <div style={S.header}>
        <div style={S.logo}>◆ Value Ledger</div>
        <nav style={S.nav}>
          {[
            ["dashboard", "Dashboard"],
            ["companies", "Companies"],
            ["portfolio", "Portfolio"],
            ["data", "Backup"],
          ].map(([key, label]) => (
            <button key={key} style={S.navBtn(view === key)} onClick={() => setView(key)}>
              {label}
            </button>
          ))}
        </nav>
      </div>
      <div style={S.main}>
        {view === "dashboard" && <Dashboard data={data} />}
        {view === "companies" && <Companies data={data} onSave={save} />}
        {view === "portfolio" && <Portfolio data={data} onSave={save} />}
        {view === "data" && <DataManager data={data} onSave={save} />}
      </div>
      <div style={{ padding: "16px 24px", textAlign: "center", fontSize: 11, color: COLORS.textDim, borderTop: `1px solid ${COLORS.border}` }}>
        Value Ledger — Built for the patient investor
      </div>
    </div>
  );
}
