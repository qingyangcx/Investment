import { useEffect, useRef, useState } from "react";
import { COLORS } from "../theme/colors";
import { FONT_BODY } from "../theme/fonts";
import { StrategyList } from "../components/screener/StrategyList";
import { StrategyBuilder } from "../components/screener/StrategyBuilder";
import { ScreenerResults } from "../components/screener/ScreenerResults";
import { DEFAULT_UNIVERSE } from "../utils/universe";
import { runScreener } from "../utils/screenerRun";

export function ScreenerView({
  strategies,
  createStrategy,
  updateStrategy,
  deleteStrategy,
  existingTickers,
  onAddToWatch,
}) {
  const [activeId, setActiveId] = useState(null);
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [lastRunAt, setLastRunAt] = useState(null);
  const lastAutoRunRef = useRef(null);

  const activeStrategy = activeId ? strategies.find((s) => s.id === activeId) : null;

  // Auto-run when entering a strategy (if it has conditions). Re-run only when ID changes.
  useEffect(() => {
    if (!activeStrategy) return;
    if (lastAutoRunRef.current === activeStrategy.id) return;
    if (!(activeStrategy.conditions || []).length) return;
    lastAutoRunRef.current = activeStrategy.id;
    runFor(activeStrategy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, strategies.length]);

  // When leaving detail view, clear results
  useEffect(() => {
    if (!activeId) {
      setResults([]);
      setLastRunAt(null);
    }
  }, [activeId]);

  const runFor = async (s) => {
    if (!s || running) return;
    setRunning(true);
    setResults([]);
    const universe = s.universe && s.universe.length > 0 ? s.universe : DEFAULT_UNIVERSE;
    setProgress({ done: 0, total: universe.length });
    try {
      const out = await runScreener(universe, s.conditions || [], (p) => setProgress(p));
      setResults(out);
      setLastRunAt(new Date());
    } finally {
      setRunning(false);
    }
  };

  const handleCreate = (name) => {
    const s = createStrategy({ name });
    if (s) setActiveId(s.id);
  };

  const handleStrategyChange = (next) => {
    if (!activeStrategy) return;
    const { id, ...patch } = next;
    updateStrategy(activeStrategy.id, patch);
  };

  const handleDelete = (id) => {
    deleteStrategy(id);
    if (activeId === id) setActiveId(null);
  };

  if (!activeStrategy) {
    return (
      <div style={{ padding: "0 16px" }}>
        <StrategyList
          strategies={strategies}
          onOpen={(id) => setActiveId(id)}
          onCreate={handleCreate}
          onDelete={handleDelete}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "0 16px" }}>
      <StrategyBuilder
        strategy={activeStrategy}
        defaultUniverse={DEFAULT_UNIVERSE}
        onChange={handleStrategyChange}
        onRun={() => runFor(activeStrategy)}
        onBack={() => setActiveId(null)}
        running={running}
        progress={progress}
      />
      {lastRunAt && !running && (
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 11,
            color: COLORS.textDim,
            marginTop: 8,
            textAlign: "right",
          }}
        >
          Last run: {lastRunAt.toLocaleTimeString()}
        </div>
      )}
      <ScreenerResults
        results={results}
        conditions={activeStrategy.conditions || []}
        existingTickers={existingTickers}
        onAdd={onAddToWatch}
      />
    </div>
  );
}
