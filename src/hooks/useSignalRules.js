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

export function useSignalRules(userId) {
  const [rules, setRules] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) {
      setRules([]);
      setLoaded(true);
      return;
    }
    setLoaded(false);
    const q = query(
      collection(db, `users/${userId}/signalRules`),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setRules(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoaded(true);
    });
    return unsub;
  }, [userId]);

  const addRule = useCallback(
    ({ name, expr, signal = "buy", category = "General", id }) => {
      if (!userId) return null;
      const trimmedName = (name || "").trim() || "Untitled rule";
      const trimmedExpr = (expr || "").trim();
      if (!trimmedExpr) return null;
      const ruleId = id || uid();
      const now = new Date().toISOString();
      const rule = {
        id: ruleId,
        name: trimmedName,
        expr: trimmedExpr,
        signal: signal === "sell" ? "sell" : "buy",
        category: category || "General",
        createdAt: now,
        updatedAt: now,
      };
      setDoc(doc(db, `users/${userId}/signalRules`, ruleId), rule);
      return rule;
    },
    [userId]
  );

  const updateRule = useCallback(
    (id, patch) => {
      if (!userId) return;
      updateDoc(doc(db, `users/${userId}/signalRules`, id), {
        ...patch,
        updatedAt: new Date().toISOString(),
      });
    },
    [userId]
  );

  const deleteRule = useCallback(
    (id) => {
      if (!userId) return;
      deleteDoc(doc(db, `users/${userId}/signalRules`, id));
    },
    [userId]
  );

  return { rules, addRule, updateRule, deleteRule, loaded };
}
