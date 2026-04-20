import { useState, useEffect, useRef } from "react";
import { COLORS } from "../../theme/colors";
import { FONT_BODY, FONT_HEADING } from "../../theme/fonts";
import { searchStocks } from "../../utils/stockSearch";

export function AddCompany({ onAdd, onClose, existingTickers }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      const data = await searchStocks(query.trim());
      setResults(data);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  const alreadyAdded = (symbol) =>
    existingTickers.some((t) => t.toUpperCase() === symbol.toUpperCase());

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: COLORS.bg,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          borderBottom: `1px solid ${COLORS.border}`,
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
            padding: 0,
            flexShrink: 0,
          }}
        >
          Cancel
        </button>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder=""
          style={{
            fontFamily: FONT_BODY,
            flex: 1,
            fontSize: 15,
            color: COLORS.text,
            background: COLORS.surfaceLight,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 10,
            padding: "10px 14px",
            outline: "none",
          }}
        />
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {loading && (
          <div
            style={{
              fontFamily: FONT_BODY,
              color: COLORS.textDim,
              textAlign: "center",
              padding: "24px",
              fontSize: 13,
            }}
          >
            Searching...
          </div>
        )}
        {!loading && query && results.length === 0 && (
          <div
            style={{
              fontFamily: FONT_BODY,
              color: COLORS.textDim,
              textAlign: "center",
              padding: "24px",
              fontSize: 13,
            }}
          >
            No results found.
          </div>
        )}
        {!loading &&
          results.map((item) => {
            const added = alreadyAdded(item.symbol);
            return (
              <div
                key={item.symbol}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderBottom: `1px solid ${COLORS.border}`,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        fontFamily: FONT_HEADING,
                        fontSize: 15,
                        fontWeight: 700,
                        color: COLORS.gold,
                      }}
                    >
                      {item.symbol}
                    </span>
                    {item.exchange && (
                      <span
                        style={{
                          fontSize: 10,
                          color: COLORS.textDim,
                          background: COLORS.surfaceLight,
                          padding: "2px 6px",
                          borderRadius: 6,
                        }}
                      >
                        {item.exchange}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_BODY,
                      fontSize: 13,
                      color: COLORS.textMuted,
                      marginTop: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.name}
                  </div>
                </div>
                {added ? (
                  <span
                    style={{
                      fontFamily: FONT_BODY,
                      fontSize: 12,
                      color: COLORS.textDim,
                      padding: "6px 12px",
                    }}
                  >
                    Added
                  </span>
                ) : (
                  <button
                    onClick={() => onAdd(item.symbol, item.name)}
                    style={{
                      background: "none",
                      border: `1.5px solid ${COLORS.gold}`,
                      borderRadius: 8,
                      width: 34,
                      height: 34,
                      fontSize: 18,
                      color: COLORS.gold,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginLeft: 12,
                    }}
                  >
                    +
                  </button>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
