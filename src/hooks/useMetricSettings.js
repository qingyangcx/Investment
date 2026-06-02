import { useCallback, useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const DOC_PATH = (userId) => `users/${userId}/preferences/metrics`;

const EMPTY = { enabled: [], updatedAt: null };

export function useMetricSettings(userId) {
  const [settings, setSettings] = useState(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) {
      setSettings(EMPTY);
      setLoaded(true);
      return;
    }
    setLoaded(false);
    const ref = doc(db, DOC_PATH(userId));
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setSettings({ ...EMPTY, ...snap.data() });
      else setSettings(EMPTY);
      setLoaded(true);
    });
    return unsub;
  }, [userId]);

  const save = useCallback(
    (next) => {
      if (!userId) return;
      setDoc(doc(db, DOC_PATH(userId)), {
        ...EMPTY,
        ...next,
        updatedAt: new Date().toISOString(),
      });
    },
    [userId]
  );

  const addMetric = useCallback(
    (variantId) => {
      if (settings.enabled.includes(variantId)) return;
      save({ ...settings, enabled: [...settings.enabled, variantId] });
    },
    [settings, save]
  );

  const removeMetric = useCallback(
    (variantId) => {
      save({ ...settings, enabled: settings.enabled.filter((id) => id !== variantId) });
    },
    [settings, save]
  );

  return { settings, addMetric, removeMetric, loaded };
}
