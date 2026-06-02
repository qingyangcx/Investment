import { useCallback, useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { uid } from "../utils/uid";

export function useCriteria(userId) {
  const [criteria, setCriteria] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) {
      setCriteria([]);
      setLoaded(true);
      return;
    }
    setLoaded(false);
    const q = query(
      collection(db, `users/${userId}/criteria`),
      orderBy("order", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setCriteria(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoaded(true);
    });
    return unsub;
  }, [userId]);

  const addCriterion = useCallback(
    ({ text, category = "General", kind = "fundamental", expr = null, signal = null }) => {
      if (!userId) return;
      const trimmed = text.trim();
      if (!trimmed) return;
      const id = uid();
      const maxOrder = criteria.reduce(
        (m, c) => (c.order != null && c.order > m ? c.order : m),
        0
      );
      setDoc(doc(db, `users/${userId}/criteria`, id), {
        id,
        text: trimmed,
        category: category || "General",
        kind,
        expr: expr || null,
        signal: signal || null,
        order: maxOrder + 1,
        createdAt: new Date().toISOString(),
      });
    },
    [userId, criteria]
  );

  const updateCriterion = useCallback(
    (id, patch) => {
      if (!userId) return;
      updateDoc(doc(db, `users/${userId}/criteria`, id), patch);
    },
    [userId]
  );

  const deleteCriterion = useCallback(
    (id) => {
      if (!userId) return;
      deleteDoc(doc(db, `users/${userId}/criteria`, id));
    },
    [userId]
  );

  return { criteria, addCriterion, updateCriterion, deleteCriterion, loaded };
}
