import { useState, useRef, useEffect } from "react";
import { COLORS } from "../../theme/colors";
import { FONT_BODY } from "../../theme/fonts";
import { CompanyCard } from "./CompanyCard";
import { EmptyState } from "../shared/EmptyState";

const LONG_PRESS_MS = 400;
const MOVE_CANCEL_PX = 8;

export function CompanyList({ companies, activeGroup, onSelect, quotes = {}, onReorder }) {
  const [search, setSearch] = useState("");
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);

  const containerRef = useRef(null);
  const itemRefs = useRef(new Map());
  const pressRef = useRef(null); // { id, timer, startX, startY, activated, startCenterY }
  const suppressClickRef = useRef(false);

  const filtered = companies.filter((c) => {
    if (activeGroup && !c.groupIds?.includes(activeGroup)) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.ticker.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
    }
    return true;
  });

  const reorderEnabled = !!onReorder && !search && !activeGroup;

  useEffect(() => {
    const onMove = (e) => {
      const p = pressRef.current;
      if (!p) return;
      const point = e.touches ? e.touches[0] : e;
      const dx = point.clientX - p.startX;
      const dy = point.clientY - p.startY;

      if (!p.activated) {
        // cancel long-press if moved too far before activation
        if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) {
          clearTimeout(p.timer);
          pressRef.current = null;
        }
        return;
      }

      // dragging: track finger offset from initial center
      e.preventDefault();
      setDragOffset(point.clientY - p.startCenterY);

      // find which other item the pointer is over, swap ordering
      const items = Array.from(itemRefs.current.entries());
      for (const [id, el] of items) {
        if (id === p.id || !el) continue;
        const rect = el.getBoundingClientRect();
        if (point.clientY >= rect.top && point.clientY <= rect.bottom) {
          // update startCenterY based on the swap so transform stays consistent
          const draggedEl = itemRefs.current.get(p.id);
          const draggedRect = draggedEl?.getBoundingClientRect();
          if (draggedRect) {
            // after swap, dragged item's new DOM position center will be ~ target's current center
            p.startCenterY = rect.top + rect.height / 2;
          }
          onReorder?.(p.id, id);
          break;
        }
      }
    };

    const onUp = () => {
      const p = pressRef.current;
      if (p) {
        clearTimeout(p.timer);
        if (p.activated) {
          setDraggingId(null);
          setDragOffset(0);
          // prevent the trailing click from opening the detail view
          suppressClickRef.current = true;
          setTimeout(() => {
            suppressClickRef.current = false;
          }, 300);
        }
      }
      pressRef.current = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    window.addEventListener("touchcancel", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
      window.removeEventListener("touchcancel", onUp);
    };
  }, [onReorder]);

  const startPress = (e, id) => {
    if (!reorderEnabled) return;
    const point = e.touches ? e.touches[0] : e;
    const el = itemRefs.current.get(id);
    const rect = el?.getBoundingClientRect();
    const startCenterY = rect ? rect.top + rect.height / 2 : point.clientY;
    pressRef.current = {
      id,
      startX: point.clientX,
      startY: point.clientY,
      startCenterY,
      activated: false,
      timer: setTimeout(() => {
        if (pressRef.current) {
          pressRef.current.activated = true;
          setDraggingId(id);
          setDragOffset(point.clientY - startCenterY);
        }
      }, LONG_PRESS_MS),
    };
  };

  const handleClick = (id) => {
    // suppress click if we just finished a drag
    if (suppressClickRef.current || pressRef.current?.activated) return;
    onSelect(id);
  };

  return (
    <div>
      <div style={{ padding: "0 16px 8px" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder=""
          style={{
            fontFamily: FONT_BODY,
            fontSize: 14,
            color: COLORS.text,
            background: COLORS.surfaceLight,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 10,
            padding: "10px 14px",
            width: "100%",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>
      <div ref={containerRef} style={{ padding: "0 16px" }}>
        {filtered.length > 0 && (
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 11,
              color: COLORS.textDim,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "4px 16px 6px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            <span>Company</span>
            <div style={{ display: "flex", gap: 12 }}>
              <span style={{ width: 100, textAlign: "right" }}>Price</span>
              <span style={{ width: 60, textAlign: "center" }}>Change</span>
              <span style={{ width: 90, textAlign: "right" }}>R.Price</span>
            </div>
          </div>
        )}
        {filtered.length === 0 ? (
          <EmptyState message={search ? "No matches found." : "No companies yet. Tap + to add one."} />
        ) : (
          filtered.map((c) => {
            const isDragging = draggingId === c.id;
            return (
              <div
                key={c.id}
                ref={(el) => {
                  if (el) itemRefs.current.set(c.id, el);
                  else itemRefs.current.delete(c.id);
                }}
                onMouseDown={(e) => startPress(e, c.id)}
                onTouchStart={(e) => startPress(e, c.id)}
                style={{
                  position: "relative",
                  zIndex: isDragging ? 500 : 1,
                  opacity: isDragging ? 0.95 : 1,
                  transform: isDragging
                    ? `translateY(${dragOffset}px) scale(1.02)`
                    : "none",
                  boxShadow: isDragging ? "0 12px 28px rgba(0,0,0,0.5)" : "none",
                  transition: isDragging ? "none" : "transform 0.15s, box-shadow 0.15s",
                  touchAction: reorderEnabled ? "none" : "auto",
                  userSelect: isDragging ? "none" : "auto",
                }}
              >
                <CompanyCard
                  company={c}
                  quote={quotes[c.ticker]}
                  onClick={() => handleClick(c.id)}
                />
              </div>
            );
          })
        )}
        {!reorderEnabled && onReorder && filtered.length > 1 && (
          <div
            style={{
              fontFamily: FONT_BODY,
              fontSize: 11,
              color: COLORS.textDim,
              textAlign: "center",
              padding: "8px 0",
            }}
          >
            Clear search and select "All" to reorder
          </div>
        )}
      </div>
    </div>
  );
}
