import { useState, useRef, useEffect } from "react";
import { COLORS } from "../../theme/colors";
import { FONT_BODY, FONT_HEADING } from "../../theme/fonts";
import { Field } from "../shared/Field";
import { uid } from "../../utils/uid";
import { getRates, convert } from "../../utils/fx";

const TABS = ["TRADE", "Profile"];

const numOrNull = (v) => {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const fmt2 = (n) => (n == null ? "" : Number(n).toFixed(2));
const fmtAmt = (n) => {
  if (n == null) return "";
  const abs = Math.abs(n);
  if (abs >= 10000) return (n / 10000).toFixed(1) + "w";
  return n.toFixed(2);
};

function cellInput({ value, onChange, placeholder }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        fontFamily: FONT_BODY,
        width: "100%",
        background: COLORS.surfaceLight,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 6,
        padding: "6px 8px",
        fontSize: 12,
        color: COLORS.text,
        outline: "none",
        boxSizing: "border-box",
      }}
    />
  );
}

const CURRENCIES = ["USD", "HKD", "CNY", "EUR", "GBP", "JPY", "CAD"];

function PlanSide({
  title,
  totalLabel,
  totalValue,
  onTotalChange,
  rows,
  setRows,
  totalBudget, // for left side: used to compute shares from %
  currency,
  onCurrencyChange,
  stockCurrency,
  fxRate, // stockCurrency -> currency
  currentPrice, // in stock currency
}) {
  const isBuyPlan = totalBudget !== undefined;

  const totalShares = rows.reduce((s, r) => s + (Number(r.shares) || 0), 0);
  const totalAmount = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  // Cost price reported in stock currency: total amount (in account ccy) / shares / fxRate
  const costPrice =
    totalShares > 0 && fxRate ? totalAmount / totalShares / fxRate : null;
  const pnlPerShare =
    currentPrice != null && costPrice != null ? currentPrice - costPrice : null;
  // P&L in account currency (matches Total card)
  const pnl =
    pnlPerShare != null && fxRate ? pnlPerShare * totalShares * fxRate : null;
  const pnlPct =
    pnlPerShare != null && costPrice ? (pnlPerShare / costPrice) * 100 : null;
  const pnlColor =
    pnl == null ? COLORS.textDim : pnl >= 0 ? COLORS.red : COLORS.green;

  const recompute = (row) => {
    const { price, percent, shares } = row;
    // price is in stockCurrency; budget is in account currency
    const priceInAccount = price != null && fxRate ? price * fxRate : null;
    let nextShares = shares;
    if (
      isBuyPlan &&
      percent != null &&
      priceInAccount != null &&
      priceInAccount > 0 &&
      totalBudget != null
    ) {
      nextShares = Math.floor((totalBudget * percent) / 100 / priceInAccount);
    }
    const amount =
      priceInAccount != null && nextShares != null
        ? Number((priceInAccount * nextShares).toFixed(2))
        : null;
    return { ...row, shares: nextShares, amount };
  };

  const updateRow = (id, patch) => {
    setRows(
      rows.map((r) => {
        if (r.id !== id) return r;
        return recompute({ ...r, ...patch });
      })
    );
  };

  const addRow = () => {
    setRows([...rows, { id: uid(), price: null, percent: null, shares: null, amount: null }]);
  };

  const removeRow = (id) => {
    setRows(rows.filter((r) => r.id !== id));
  };

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          fontFamily: FONT_HEADING,
          fontSize: 13,
          fontWeight: 600,
          color: COLORS.gold,
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {title}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            padding: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontFamily: FONT_BODY,
                fontSize: 10,
                color: COLORS.textDim,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {totalLabel}
            </span>
            <select
              value={currency || "USD"}
              onChange={(e) => onCurrencyChange?.(e.target.value)}
              style={{
                fontFamily: FONT_BODY,
                fontSize: 10,
                color: COLORS.gold,
                background: COLORS.surfaceLight,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 4,
                padding: "2px 4px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          {onTotalChange ? (
            cellInput({
              value: totalValue ?? "",
              onChange: (v) => onTotalChange(numOrNull(v)),
              placeholder: "0.00",
            })
          ) : (
            <div style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: COLORS.text }}>
              {fmtAmt(totalValue) || "0.00"}
            </div>
          )}
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            padding: 8,
          }}
        >
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 10,
              color: COLORS.textDim,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 4,
            }}
          >
            Current / Cost
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: COLORS.text }}>
            <span style={{ color: currentPrice != null ? COLORS.text : COLORS.textDim }}>
              {currentPrice != null ? fmt2(currentPrice) : "—"}
            </span>
            <span style={{ color: COLORS.textDim, fontWeight: 400 }}> / </span>
            <span style={{ color: costPrice != null ? COLORS.text : COLORS.textDim }}>
              {costPrice != null ? fmt2(costPrice) : "—"}
            </span>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            padding: 8,
          }}
        >
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 10,
              color: COLORS.textDim,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 4,
            }}
          >
            P&L
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600, color: pnlColor }}>
            {pnl != null ? (
              <>
                {pnl >= 0 ? "+" : ""}
                {fmtAmt(pnl)}
                <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 4 }}>
                  ({pnlPct >= 0 ? "+" : ""}
                  {pnlPct.toFixed(1)}%)
                </span>
              </>
            ) : (
              "—"
            )}
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
          gap: 4,
          fontFamily: FONT_BODY,
          fontSize: 10,
          color: COLORS.textDim,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          padding: "0 4px 4px",
        }}
      >
        <span>Price{stockCurrency ? ` (${stockCurrency})` : ""}</span>
        <span>%</span>
        <span>Shares</span>
        <span>Amount</span>
        <span style={{ width: 16 }} />
      </div>

      {rows.map((r) => (
        <div
          key={r.id}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
            gap: 4,
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          {cellInput({
            value: r.price ?? "",
            onChange: (v) => updateRow(r.id, { price: numOrNull(v) }),
            placeholder: "price",
          })}
          {cellInput({
            value: r.percent ?? "",
            onChange: (v) => updateRow(r.id, { percent: numOrNull(v) }),
            placeholder: "%",
          })}
          {cellInput({
            value: r.shares ?? "",
            onChange: (v) => updateRow(r.id, { shares: numOrNull(v), percent: isBuyPlan ? null : r.percent }),
            placeholder: "shares",
          })}
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 12,
              color: COLORS.text,
              padding: "6px 8px",
              textAlign: "right",
            }}
          >
            {r.amount != null ? fmtAmt(r.amount) : "—"}
          </div>
          <button
            onClick={() => removeRow(r.id)}
            style={{
              background: "none",
              border: "none",
              color: COLORS.textDim,
              fontSize: 16,
              cursor: "pointer",
              padding: "0 4px",
              lineHeight: 1,
            }}
            title="Remove"
          >
            ×
          </button>
        </div>
      ))}

      <button
        onClick={addRow}
        style={{
          fontFamily: FONT_BODY,
          width: "100%",
          background: "none",
          border: `1px dashed ${COLORS.borderLight}`,
          borderRadius: 6,
          padding: "8px",
          color: COLORS.gold,
          fontSize: 12,
          cursor: "pointer",
          marginTop: 4,
        }}
      >
        + Add row
      </button>
    </div>
  );
}

function InvestPlanTab({ form, setField, stockCurrency, currentPrice }) {
  const buyPlan = form.buyPlan || { totalBudget: null, currency: "USD", rows: [] };
  const actualBuys = form.actualBuys || [];
  const actualCurrency = form.actualCurrency || "USD";

  const [rates, setRates] = useState(null);
  useEffect(() => {
    getRates().then(setRates).catch(() => setRates(null));
  }, []);

  const buyFxRate =
    rates && stockCurrency
      ? convert(1, stockCurrency, buyPlan.currency || "USD", rates)
      : stockCurrency === (buyPlan.currency || "USD")
      ? 1
      : null;
  const actualFxRate =
    rates && stockCurrency
      ? convert(1, stockCurrency, actualCurrency, rates)
      : stockCurrency === actualCurrency
      ? 1
      : null;

  // Recompute amounts when fxRate changes (currency switch)
  const reapplyFx = (rowList, fxRate, withBudget) => {
    if (!fxRate) return rowList;
    return rowList.map((r) => {
      const priceInAccount = r.price != null ? r.price * fxRate : null;
      let nextShares = r.shares;
      if (
        withBudget != null &&
        r.percent != null &&
        priceInAccount != null &&
        priceInAccount > 0
      ) {
        nextShares = Math.floor((withBudget * r.percent) / 100 / priceInAccount);
      }
      const amount =
        priceInAccount != null && nextShares != null
          ? Number((priceInAccount * nextShares).toFixed(2))
          : r.amount;
      return { ...r, shares: nextShares, amount };
    });
  };

  const changeBuyCurrency = (newCurrency) => {
    const oldCurrency = buyPlan.currency || "USD";
    if (oldCurrency === newCurrency) return;
    const newFxRate =
      rates && stockCurrency
        ? convert(1, stockCurrency, newCurrency, rates)
        : stockCurrency === newCurrency
        ? 1
        : null;
    let convertedBudget = buyPlan.totalBudget;
    if (rates && buyPlan.totalBudget != null) {
      convertedBudget = Number(
        convert(buyPlan.totalBudget, oldCurrency, newCurrency, rates).toFixed(2)
      );
    }
    const convertedRows = reapplyFx(buyPlan.rows, newFxRate, convertedBudget);
    setField("buyPlan", {
      ...buyPlan,
      currency: newCurrency,
      totalBudget: convertedBudget,
      rows: convertedRows,
    });
  };

  const changeActualCurrency = (newCurrency) => {
    const oldCurrency = actualCurrency;
    if (oldCurrency === newCurrency) return;
    const newFxRate =
      rates && stockCurrency
        ? convert(1, stockCurrency, newCurrency, rates)
        : stockCurrency === newCurrency
        ? 1
        : null;
    const convertedRows = reapplyFx(actualBuys, newFxRate, null);
    setField("actualCurrency", newCurrency);
    setField("actualBuys", convertedRows);
  };

  const actualTotal = actualBuys.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  return (
    <div>
      <div style={{ maxWidth: 200 }}>
        <Field
          label="Reasonable Price ($)"
          type="number"
          min="0"
          value={form.reasonablePrice ?? ""}
          onChange={(v) => {
            if (!v) return setField("reasonablePrice", null);
            const n = Number(v);
            setField("reasonablePrice", n < 0 ? 0 : n);
          }}
          placeholder="Your target entry price"
        />
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <PlanSide
          title="Buy Plan"
          totalLabel="Total Budget"
          totalValue={buyPlan.totalBudget}
          onTotalChange={(v) => setField("buyPlan", { ...buyPlan, totalBudget: v })}
          rows={buyPlan.rows}
          setRows={(rows) => setField("buyPlan", { ...buyPlan, rows })}
          totalBudget={buyPlan.totalBudget}
          currency={buyPlan.currency || "USD"}
          onCurrencyChange={changeBuyCurrency}
          stockCurrency={stockCurrency}
          fxRate={buyFxRate}
          currentPrice={currentPrice}
        />
        <PlanSide
          title="Actual Buy"
          totalLabel="Total Spent"
          totalValue={actualTotal}
          rows={actualBuys}
          setRows={(rows) => setField("actualBuys", rows)}
          currency={actualCurrency}
          onCurrencyChange={changeActualCurrency}
          stockCurrency={stockCurrency}
          fxRate={actualFxRate}
          currentPrice={currentPrice}
        />
      </div>
    </div>
  );
}

function ProfileTab({ form, setField, allGroups }) {
  const groupIds = form.groupIds || [];
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const toggle = (gid) => {
    setField(
      "groupIds",
      groupIds.includes(gid) ? groupIds.filter((id) => id !== gid) : [...groupIds, gid]
    );
  };

  const selectedGroups = allGroups.filter((g) => groupIds.includes(g.id));
  const label =
    selectedGroups.length === 0
      ? "Select groups..."
      : selectedGroups.map((g) => g.name).join(", ");

  return (
    <div>
      <div
        style={{
          fontFamily: FONT_BODY,
          fontSize: 12,
          color: COLORS.textDim,
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Groups
      </div>
      {allGroups.length === 0 ? (
        <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: COLORS.textDim, padding: "20px 0" }}>
          No groups yet. Create groups from the main screen.
        </div>
      ) : (
        <div ref={ref} style={{ position: "relative" }}>
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              fontFamily: FONT_BODY,
              width: "100%",
              textAlign: "left",
              background: COLORS.surfaceLight,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 14,
              color: selectedGroups.length ? COLORS.text : COLORS.textDim,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {label}
            </span>
            <span style={{ color: COLORS.textDim, fontSize: 10, flexShrink: 0 }}>
              {open ? "▲" : "▼"}
            </span>
          </button>
          {open && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                right: 0,
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 10,
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                zIndex: 10,
                maxHeight: 280,
                overflow: "auto",
              }}
            >
              {allGroups.map((g) => {
                const active = groupIds.includes(g.id);
                return (
                  <div
                    key={g.id}
                    onClick={() => toggle(g.id)}
                    style={{
                      fontFamily: FONT_BODY,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 14px",
                      fontSize: 14,
                      color: COLORS.text,
                      cursor: "pointer",
                      borderBottom: `1px solid ${COLORS.border}`,
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        border: `1.5px solid ${active ? COLORS.gold : COLORS.borderLight}`,
                        background: active ? COLORS.gold : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {active && (
                        <span style={{ color: COLORS.bg, fontSize: 12, fontWeight: 700, lineHeight: 1 }}>
                          ✓
                        </span>
                      )}
                    </div>
                    <span>{g.name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CompanyDetail({ company, quote, onSave, onDelete, onClose, allGroups }) {
  const [form, setForm] = useState({ ...company });
  const [activeTab, setActiveTab] = useState("TRADE");
  const firstRenderRef = useRef(true);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Auto-save: debounce form changes
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    if (!form.ticker?.trim()) return;
    const t = setTimeout(() => {
      onSave(form);
    }, 400);
    return () => clearTimeout(t);
  }, [form, onSave]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: COLORS.bg,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: `1px solid ${COLORS.border}`,
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          style={{
            fontFamily: FONT_BODY,
            background: "none",
            border: "none",
            color: COLORS.gold,
            fontSize: 14,
            cursor: "pointer",
            padding: "4px 0",
          }}
        >
          ← Back
        </button>
        <span
          style={{
            fontFamily: FONT_HEADING,
            fontSize: 16,
            fontWeight: 600,
            color: COLORS.text,
          }}
        >
          {form.ticker || "New Company"}
        </span>
        <div style={{ width: 48 }} />
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: `1px solid ${COLORS.border}`,
          flexShrink: 0,
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              fontFamily: FONT_BODY,
              flex: 1,
              padding: "10px 0",
              fontSize: 13,
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? COLORS.gold : COLORS.textMuted,
              background: "none",
              border: "none",
              borderBottom: activeTab === tab ? `2px solid ${COLORS.gold}` : "2px solid transparent",
              cursor: "pointer",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        {activeTab === "TRADE" && <InvestPlanTab form={form} setField={setField} stockCurrency={quote?.currency || "USD"} currentPrice={quote?.price ?? null} />}
        {activeTab === "Profile" && <ProfileTab form={form} setField={setField} allGroups={allGroups} />}
      </div>

      {/* Actions */}
      {company.id && (
        <div
          style={{
            padding: "12px 16px",
            borderTop: `1px solid ${COLORS.border}`,
            display: "flex",
            flexShrink: 0,
            paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
          }}
        >
          <button
            onClick={() => {
              if (confirm("Delete this company?")) onDelete(company.id);
            }}
            style={{
              fontFamily: FONT_BODY,
              padding: "12px 16px",
              fontSize: 14,
              fontWeight: 600,
              color: COLORS.red,
              background: COLORS.redBg,
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
