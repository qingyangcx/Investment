import { useState, useEffect, useCallback } from "react";

export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(defaultValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) setValue(JSON.parse(stored));
    } catch {
      // ignore parse errors
    }
    setLoaded(true);
  }, [key]);

  const set = useCallback(
    (next) => {
      setValue((prev) => {
        const val = typeof next === "function" ? next(prev) : next;
        try {
          localStorage.setItem(key, JSON.stringify(val));
        } catch {
          // ignore quota errors
        }
        return val;
      });
    },
    [key]
  );

  return [value, set, loaded];
}
